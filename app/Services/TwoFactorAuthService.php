<?php

namespace App\Services;

use App\Events\TwoFactorCodeIssued;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * The SMS one-time code a brand-new account confirms before it exists at
 * all - proof the phone number just typed into the registration form is one
 * the applicant actually holds. A plain sign-in with the right password no
 * longer goes through this UNLESS the account never finished that code
 * (see AuthenticatedSessionController::store) - an applicant who abandoned
 * registration gets sent straight back into it on their next attempt to
 * sign in, the same challenge either way.
 *
 * Two shapes of "pending", both cache-only, nothing on a migration:
 *
 *  - A brand-new registration (RegisteredUserController::store) has no
 *    `users` row yet. The whole would-be row - name, email, hashed
 *    password, address, consent - sits in the cache next to the code's
 *    hash, keyed by a random token, and is only ever written to the table
 *    once the code is confirmed (TwoFactorChallengeController::store). An
 *    abandoned registration this way leaves nothing behind at all, not a
 *    row, not even a token anyone could look up.
 *  - An existing-but-unverified account (the applicant-only branch of
 *    AuthenticatedSessionController::store) already has a row; only the
 *    code itself is cached, keyed by that row's id, same as it always was.
 *
 * Either way a leaked cache entry is a 6-digit guess behind a 5-attempt
 * lock (see TwoFactorChallengeController), not a lasting secret.
 */
class TwoFactorAuthService
{
    private const CODE_TTL_MINUTES = 5;

    public function __construct(private SmsService $sms)
    {
    }

    private function cacheKey(int $userId): string
    {
        return "two_factor_code:{$userId}";
    }

    private function pendingCacheKey(string $token): string
    {
        return "two_factor_pending:{$token}";
    }

    /**
     * Generate a fresh code, text it to the account's number, and remember
     * its hash. Returns false - storing nothing - when there is no number
     * to send it to, or the SMS itself could not be sent; the caller
     * decides what the applicant is told in either case.
     */
    public function issue(User $user): bool
    {
        $phone = $this->sms->resolvePhone($user);
        if (!$phone) {
            return false;
        }

        $code = $this->sendCode($phone, "user #{$user->id} ({$user->email})");
        if ($code === null) {
            return false;
        }

        Cache::put($this->cacheKey($user->id), Hash::make($code), now()->addMinutes(self::CODE_TTL_MINUTES));

        event(new TwoFactorCodeIssued($user, $code, $user->email));

        return true;
    }

    /**
     * Check a submitted code against the one on file. A right code is
     * consumed - it cannot be reused for a second sign-in.
     */
    public function verify(User $user, string $code): bool
    {
        $hash = Cache::get($this->cacheKey($user->id));
        if (!$hash || !Hash::check($code, $hash)) {
            return false;
        }

        Cache::forget($this->cacheKey($user->id));

        return true;
    }

    /**
     * Starts the challenge for an EXISTING account that signed in correctly
     * but never finished verifying its phone - see
     * AuthenticatedSessionController::store. For a brand-new registration
     * that has no row yet, use beginRegistration() instead.
     */
    public function beginChallenge(Request $request, User $user, bool $remember = false): RedirectResponse
    {
        if (!$this->issue($user)) {
            // Whatever came before was fine - only the code could not be
            // delivered - so the account is not left signed in on the
            // strength of that alone.
            Log::error('Could not send the two-factor code', ['user_id' => $user->id]);

            throw ValidationException::withMessages([
                'email' => 'We could not send your verification code. Please contact the CPDO office.',
            ]);
        }

        $request->session()->put('two_factor.user_id', $user->id);
        $request->session()->put('two_factor.remember', $remember);

        return redirect()->route('two-factor.challenge');
    }

    /**
     * Starts the challenge for a registration that has NOT been written to
     * the users table yet - $userData is exactly what
     * RegisteredUserController::store would otherwise have passed straight
     * to User::create(). Nothing is persisted here; the whole array sits in
     * the cache next to the code until TwoFactorChallengeController::store
     * confirms it and creates the row for real.
     */
    public function beginRegistration(Request $request, array $userData, bool $remember = false): RedirectResponse
    {
        $phone = $userData['contact_number'] ?? null;
        $email = $userData['email'] ?? null;

        $code = $phone ? $this->sendCode($phone, "pending registration ({$email})") : null;
        if ($code === null) {
            Log::error('Could not send the two-factor code', ['email' => $email]);

            throw ValidationException::withMessages([
                'email' => 'We could not send your verification code. Please contact the CPDO office.',
            ]);
        }

        $token = Str::random(40);

        Cache::put($this->pendingCacheKey($token), [
            'data' => $userData,
            'code' => Hash::make($code),
        ], now()->addMinutes(self::CODE_TTL_MINUTES));

        event(new TwoFactorCodeIssued(null, $code, $email));

        $request->session()->put('two_factor.pending_token', $token);
        $request->session()->put('two_factor.remember', $remember);

        return redirect()->route('two-factor.challenge');
    }

    /**
     * Checks a submitted code against a pending registration's. Returns the
     * $userData array it was started with on success (and consumes the
     * cache entry - it cannot be reused), or null on a wrong or expired code.
     */
    public function verifyPending(string $token, string $code): ?array
    {
        $cached = Cache::get($this->pendingCacheKey($token));
        if (!$cached || !Hash::check($code, $cached['code'])) {
            return null;
        }

        Cache::forget($this->pendingCacheKey($token));

        return $cached['data'];
    }

    /** The email a pending registration's code was sent for, or null once it has expired/gone. */
    public function pendingEmail(string $token): ?string
    {
        return Cache::get($this->pendingCacheKey($token))['data']['email'] ?? null;
    }

    /** Sends a new code for a still-pending registration, replacing whichever one was live before it. */
    public function resendPending(string $token): bool
    {
        $cached = Cache::get($this->pendingCacheKey($token));
        if (!$cached) {
            return false;
        }

        $phone = $cached['data']['contact_number'] ?? null;
        $code = $phone ? $this->sendCode($phone, "pending registration ({$cached['data']['email']})") : null;
        if ($code === null) {
            return false;
        }

        Cache::put($this->pendingCacheKey($token), [
            'data' => $cached['data'],
            'code' => Hash::make($code),
        ], now()->addMinutes(self::CODE_TTL_MINUTES));

        event(new TwoFactorCodeIssued(null, $code, $cached['data']['email']));

        return true;
    }

    /**
     * Generates a code and sends it to $phone, logging it instead when SMS
     * delivery is off (local development). Returns null - sending nothing -
     * only when SMS is on and the send itself failed.
     */
    private function sendCode(string $phone, string $logSubject): ?string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        if ($this->sms->isEnabled()) {
            if (!$this->sms->sendTwoFactorCode($phone, $code)) {
                return null;
            }
        } else {
            // SMS_ENABLED=false, as it is for local development: the code
            // still has to be typed in to finish signing in, so it goes to
            // the log instead of a phone that would never receive it.
            // Production keeps SMS_ENABLED=true, so this branch never runs
            // there.
            Log::info("[2FA] SMS delivery is off - verification code for {$logSubject}: {$code}");
        }

        return $code;
    }

    /** The number the code went to, with everything but the ends starred out. */
    public function maskedPhone(User $user): ?string
    {
        return $this->maskPhone($this->sms->resolvePhone($user));
    }

    /** Same as maskedPhone(), for a pending registration's number instead of an account's. */
    public function maskedPendingPhone(string $token): ?string
    {
        $phone = Cache::get($this->pendingCacheKey($token))['data']['contact_number'] ?? null;

        return $phone ? $this->maskPhone($phone) : null;
    }

    private function maskPhone(?string $phone): ?string
    {
        if (!$phone || strlen($phone) < 7) {
            return $phone;
        }

        return substr($phone, 0, 4) . str_repeat('•', strlen($phone) - 7) . substr($phone, -3);
    }
}
