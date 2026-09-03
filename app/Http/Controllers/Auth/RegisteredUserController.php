<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
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
        // Accept the address however the applicant types it. The `lowercase`
        // rule used to reject anything with a capital in it, so "Juan@Gmail.com"
        // failed registration outright. Mail domains are case-insensitive and
        // every mail provider treats the local part that way too, so the address
        // is folded here and stored lowercase — which also keeps the unique
        // check from letting the same person register twice under two casings.
        $request->merge([
            'email' => is_string($request->input('email'))
                ? mb_strtolower(trim($request->input('email')))
                : $request->input('email'),
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'address' => 'nullable|string|max:500',
            'contact_number' => 'nullable|string|regex:/^09[0-9]{9}$/|size:11',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'contact_number.regex' => 'Contact number must start with 09 and be exactly 11 digits.',
            'contact_number.size' => 'Contact number must be exactly 11 digits.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'address' => $request->address,
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
