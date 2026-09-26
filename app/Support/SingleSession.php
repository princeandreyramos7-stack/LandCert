<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * At most one signed-in session per account at a time.
 *
 * claim() is called from the one place in this app a session actually
 * becomes trusted (TwoFactorChallengeController::store, after the password
 * and the texted code both check out): it mints a fresh random token, keeps
 * it on the account, and stamps this session with the same value. Any other
 * session still carrying the previous token is signed out the next time it
 * is seen - see App\Http\Middleware\EnsureSingleSession, which is the other
 * half of this and does the actual comparing.
 *
 * Deliberately not hooked to Laravel's generic Login event: that event also
 * fires for this app's own password-only step before the texted code is
 * confirmed (see AuthenticatedSessionController::store, which immediately
 * undoes that login again) - claiming there would let a correct password
 * alone, without the code, sign out whoever actually holds the account.
 */
class SingleSession
{
    public static function claim(User $user, Request $request): void
    {
        $token = Str::random(64);

        $user->forceFill(['current_session_id' => $token])->save();
        $request->session()->put('device_session_id', $token);
    }

    /** Nothing else can ever match a token this account no longer has on file. */
    public static function release(User $user): void
    {
        $user->forceFill(['current_session_id' => null])->save();
    }
}
