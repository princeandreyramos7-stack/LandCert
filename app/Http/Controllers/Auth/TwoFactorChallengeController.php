<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\TwoFactorAuthService;
use App\Support\PostLoginRedirect;
use App\Support\SingleSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The SMS code every sign-in confirms between a right password and a
 * trusted session. AuthenticatedSessionController leaves the pending
 * account's id in the session for this to pick up; it is cleared the
 * moment the code is checked, right or wrong, so nothing here is ever left
 * over for a later, unrelated visit to find.
 */
class TwoFactorChallengeController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    /** Whichever account is mid-login, or null for a direct visit with none pending. */
    private function pendingUser(Request $request): ?User
    {
        $id = $request->session()->get('two_factor.user_id');

        return $id ? User::find($id) : null;
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $this->pendingUser($request);
        if (!$user) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge', [
            'maskedPhone' => app(TwoFactorAuthService::class)->maskedPhone($user),
            'status' => session('status'),
        ]);
    }

    private function throttleKey(User $user, Request $request): string
    {
        return 'two-factor:' . $user->id . '|' . $request->ip();
    }

    public function store(Request $request, TwoFactorAuthService $twoFactor): RedirectResponse
    {
        $user = $this->pendingUser($request);
        if (!$user) {
            return redirect()->route('login');
        }

        $request->validate(['code' => ['required', 'string']]);

        $key = $this->throttleKey($user, $request);

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($key);
            // Locked out: back to the start, not stuck on a challenge it
            // cannot pass. A fresh password check earns a fresh code.
            $request->session()->forget('two_factor.user_id');
            $request->session()->forget('two_factor.remember');

            throw ValidationException::withMessages([
                'code' => 'Too many wrong codes. Please sign in again in ' . ceil($seconds / 60) . ' minute(s).',
            ]);
        }

        if (!$twoFactor->verify($user, (string) $request->input('code'))) {
            RateLimiter::hit($key, 300);
            AuditLogService::logTwoFactorFailed($user->id, $user->email, RateLimiter::attempts($key), self::MAX_ATTEMPTS);

            throw ValidationException::withMessages([
                'code' => 'That code is incorrect or has expired.',
            ]);
        }

        RateLimiter::clear($key);

        $remember = (bool) $request->session()->pull('two_factor.remember', false);
        $request->session()->forget('two_factor.user_id');

        Auth::login($user, $remember);
        $request->session()->regenerate();

        // At most one signed-in session for this account from here on - see
        // App\Support\SingleSession and its middleware counterpart.
        SingleSession::claim($user, $request);

        // A fresh session gets a fresh history key: the pages the browser
        // remembers from before this sign-in cannot be brought back with
        // the Back button. (Moved here from the password step, since that
        // step no longer finishes the sign-in.)
        Inertia::clearHistory();

        AuditLogService::logLogin();

        return PostLoginRedirect::for($user, $request);
    }

    /** Sends a new code, replacing whichever one was live before it. */
    public function resend(Request $request, TwoFactorAuthService $twoFactor): RedirectResponse
    {
        $user = $this->pendingUser($request);
        if (!$user) {
            return redirect()->route('login');
        }

        if (!$twoFactor->issue($user)) {
            throw ValidationException::withMessages([
                'code' => 'We could not resend your code. Please contact the CPDO office.',
            ]);
        }

        return back()->with('status', 'A new code has been sent.');
    }
}
