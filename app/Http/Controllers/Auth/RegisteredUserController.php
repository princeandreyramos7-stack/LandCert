<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Rules\LowercaseEmailDomain;
use App\Mail\UserRegistrationWelcome;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Only trim. The `lowercase` rule that used to sit on this field
        // rejected "JuanDelaCruz@gmail.com" outright, which is a perfectly good
        // address — the name half is the mailbox owner's to capitalise. The
        // domain half is held to lowercase by LowercaseEmailDomain instead.
        $request->merge([
            'email' => is_string($request->input('email'))
                ? trim($request->input('email'))
                : $request->input('email'),
        ]);

        // The address is picked from the PSGC, not typed. It is optional at
        // sign-up - an account is useful without one - but half an address is
        // worse than none, so once any part of it is given the rest is
        // required and has to hang together.
        $startedAddress = collect(\App\Support\PhilippineAddress::PARTS)
            ->contains(fn ($part) => filled($request->input("address_{$part}")));

        $validated = $request->validate(array_merge([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', new LowercaseEmailDomain, 'unique:'.User::class],
            'contact_number' => 'nullable|string|regex:/^09[0-9]{9}$/|size:11',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], \App\Support\PhilippineAddress::rules('address', $startedAddress)), [
            'contact_number.regex' => 'Contact number must start with 09 and be exactly 11 digits.',
            'contact_number.size' => 'Contact number must be exactly 11 digits.',
        ], \App\Support\PhilippineAddress::attributes('address', ''));

        if ($startedAddress) {
            $chain = \Illuminate\Support\Facades\Validator::make($request->all(), []);
            \App\Support\PhilippineAddress::checkChain($chain, 'address');
            if ($chain->errors()->isNotEmpty()) {
                throw \Illuminate\Validation\ValidationException::withMessages($chain->errors()->toArray());
            }
        }

        // Composed here from the codes, never taken from the browser.
        $address = \App\Support\PhilippineAddress::resolve($validated, 'address');

        $user = User::create(\App\Support\PhilippineAddress::columns($address, 'address') + [
            'name' => $request->name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        // Send welcome email immediately
        try {
            Mail::to($user->email)->send(new UserRegistrationWelcome($user));
            Log::info('Welcome email sent successfully for user: ' . $user->email, [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'timestamp' => now()
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email for user: ' . $user->email, [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'timestamp' => now()
            ]);
            // Continue with registration even if email fails
        }

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
