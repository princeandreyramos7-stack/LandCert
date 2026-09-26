<?php

namespace App\Services;

use App\Events\TwoFactorCodeIssued;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * The SMS one-time code every sign-in confirms before its session is
 * trusted. Nothing about a pending code lives on the user row or needs a
 * migration - it sits in the cache, keyed to the account, for exactly as
 * long as it is good for. A leaked cache entry is a 6-digit guess behind a
 * 5-attempt lock (see TwoFactorChallengeController), not a lasting secret.
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

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        if ($this->sms->isEnabled()) {
            if (!$this->sms->sendTwoFactorCode($phone, $code)) {
                return false;
            }
        } else {
            // SMS_ENABLED=false, as it is for local development: the code
            // still has to be typed in to finish signing in, so it goes to
            // the log instead of a phone that would never receive it.
            // Production keeps SMS_ENABLED=true, so this branch never runs
            // there.
            Log::info("[2FA] SMS delivery is off - verification code for user #{$user->id} ({$user->email}): {$code}");
        }

        Cache::put($this->cacheKey($user->id), Hash::make($code), now()->addMinutes(self::CODE_TTL_MINUTES));

        event(new TwoFactorCodeIssued($user, $code));

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
     * Starts the challenge for an account that just cleared whatever comes
     * before it - a right password, or a brand-new registration - so both
     * callers require exactly the same second factor. The account must not
     * be signed in yet: the challenge only finishes the sign-in once the
     * code is confirmed.
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

    /** The number the code went to, with everything but the ends starred out. */
    public function maskedPhone(User $user): ?string
    {
        $phone = $this->sms->resolvePhone($user);
        if (!$phone || strlen($phone) < 7) {
            return $phone;
        }

        return substr($phone, 0, 4) . str_repeat('•', strlen($phone) - 7) . substr($phone, -3);
    }
}
