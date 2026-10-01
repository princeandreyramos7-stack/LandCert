<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\UserRegistrationWelcome;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\TwoFactorAuthService;
use App\Support\PostLoginRedirect;
use App\Support\SingleSession;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The SMS code a sign-in confirms before it finishes - in two shapes:
 *
 *  - A brand-new registration (the common case): RegisteredUserController
 *    leaves a random token in the session, the would-be account sitting in
 *    the cache next to the code (TwoFactorAuthService::beginRegistration).
 *    The row is created here, for the first time, only once the code is
 *    right.
 *  - An existing account that signed in correctly but never finished this
 *    step (AuthenticatedSessionController::store, applicant accounts only):
 *    the row already exists; only its phone_verified_at is set here.
 *
 * Either way the session key is cleared the moment the code is checked,
 * right or wrong, so nothing here is ever left over for a later, unrelated
 * visit to find.
 */
class TwoFactorChallengeController extends Controller
{
    private const MAX_ATTEMPTS = 5;

    private function pendingToken(Request $request): ?string
    {
        return $request->session()->get('two_factor.pending_token');
    }

    /** Whichever EXISTING account is mid-login, or null. Never set for a brand-new registration. */
    private function pendingUser(Request $request): ?User
    {
        $id = $request->session()->get('two_factor.user_id');

        return $id ? User::find($id) : null;
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $twoFactor = app(TwoFactorAuthService::class);

        if ($token = $this->pendingToken($request)) {
            $maskedPhone = $twoFactor->maskedPendingPhone($token);
            if (!$maskedPhone) {
                // The code expired (5 minutes) before it was ever entered -
                // nothing was written anywhere, so there is nothing to
                // clean up, only a fresh registration to start.
                $request->session()->forget(['two_factor.pending_token', 'two_factor.remember']);

                return redirect()->route('register')->withErrors([
                    'email' => 'Your verification code expired. Please register again.',
                ]);
            }

            return Inertia::render('Auth/TwoFactorChallenge', [
                'maskedPhone' => $maskedPhone,
                'status' => session('status'),
            ]);
        }

        $user = $this->pendingUser($request);
        if (!$user) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge', [
            'maskedPhone' => $twoFactor->maskedPhone($user),
            'status' => session('status'),
        ]);
    }

    public function store(Request $request, TwoFactorAuthService $twoFactor): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        if ($token = $this->pendingToken($request)) {
            return $this->storePending($request, $twoFactor, $token);
        }

        $user = $this->pendingUser($request);
        if (!$user) {
            return redirect()->route('login');
        }

        $key = 'two-factor:' . $user->id . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($key);
            // Locked out: back to the start, not stuck on a challenge it
            // cannot pass. A fresh password check earns a fresh code.
            $request->session()->forget(['two_factor.user_id', 'two_factor.remember']);

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

        // Marks this account as no longer one a plain sign-in can be
        // refused for - see AuthenticatedSessionController::store, which
        // only sends an applicant back here while this is still unset.
        if (!$user->phone_verified_at) {
            $user->forceFill(['phone_verified_at' => now()])->save();
        }

        return $this->finishSignIn($request, $user, $remember);
    }

    private function storePending(Request $request, TwoFactorAuthService $twoFactor, string $token): RedirectResponse
    {
        // Unique per registration attempt (the token is random), so unlike
        // the existing-account key above, this one can never be shared with
        // an unrelated attempt - nothing to clear between tests or between
        // two people who mistype the same number of times by coincidence.
        $key = 'two-factor:' . $token . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($key);
            $request->session()->forget(['two_factor.pending_token', 'two_factor.remember']);

            throw ValidationException::withMessages([
                'code' => 'Too many wrong codes. Please register again in ' . ceil($seconds / 60) . ' minute(s).',
            ]);
        }

        $userData = $twoFactor->verifyPending($token, (string) $request->input('code'));
        if ($userData === null) {
            RateLimiter::hit($key, 300);
            AuditLogService::logTwoFactorFailed(
                null,
                $twoFactor->pendingEmail($token) ?? 'unknown',
                RateLimiter::attempts($key),
                self::MAX_ATTEMPTS
            );

            throw ValidationException::withMessages([
                'code' => 'That code is incorrect or has expired.',
            ]);
        }

        RateLimiter::clear($key);

        $remember = (bool) $request->session()->pull('two_factor.remember', false);
        $request->session()->forget('two_factor.pending_token');

        // Written for the first time here, not a moment before - see
        // TwoFactorAuthService::beginRegistration and the class docblock.
        // phone_verified_at is deliberately not mass-assignable (a system
        // fact, not something a form should ever set), hence the separate
        // forceFill - same as the existing-account path just above.
        $user = User::create($userData);
        $user->forceFill(['phone_verified_at' => now()])->save();

        event(new Registered($user));
        $this->sendWelcomeEmail($user);

        return $this->finishSignIn($request, $user, $remember);
    }

    /** Sends a new code, replacing whichever one was live before it - for either shape of pending challenge. */
    public function resend(Request $request, TwoFactorAuthService $twoFactor): RedirectResponse
    {
        if ($token = $this->pendingToken($request)) {
            if (!$twoFactor->resendPending($token)) {
                throw ValidationException::withMessages([
                    'code' => 'We could not resend your code. Please register again.',
                ]);
            }

            return back()->with('status', 'A new code has been sent.');
        }

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

    /** The tail both challenge shapes share, once the account is confirmed and real: sign it in for real. */
    private function finishSignIn(Request $request, User $user, bool $remember): RedirectResponse
    {
        Auth::login($user, $remember);
        $request->session()->regenerate();

        // At most one signed-in session for this account from here on - see
        // App\Support\SingleSession and its middleware counterpart.
        SingleSession::claim($user, $request);

        // A fresh session gets a fresh history key: the pages the browser
        // remembers from before this sign-in cannot be brought back with
        // the Back button.
        Inertia::clearHistory();

        AuditLogService::logLogin();

        return PostLoginRedirect::for($user, $request);
    }

    /** Moved from RegisteredUserController: only sent once the account is real, not on a registration that may never be confirmed. */
    private function sendWelcomeEmail(User $user): void
    {
        try {
            Mail::to($user->email)->send(new UserRegistrationWelcome($user));
            Log::info('Welcome email sent successfully for user: ' . $user->email, [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'timestamp' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email for user: ' . $user->email, [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'timestamp' => now(),
            ]);
            // Continue - the account is already created and signed in;
            // a failed welcome email is not a reason to undo either.
        }
    }
}
