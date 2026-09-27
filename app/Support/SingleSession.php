<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * At most one signed-in session per account at a time.
 *
 * claim() is called from both places in this app a session becomes trusted:
 * AuthenticatedSessionController::store (a plain sign-in) and
 * TwoFactorChallengeController::store (after registration's texted code is
 * confirmed). It mints a fresh random token, keeps it on the account, and
 * stamps this session with the same value. Any other session still carrying
 * the previous token is signed out the next time it is seen - see
 * App\Http\Middleware\EnsureSingleSession, which is the other half of this
 * and does the actual comparing.
 *
 * Deliberately not hooked to Laravel's generic Login event: that event also
 * fires for Auth::attempt() itself, one line before this runs, and calling
 * claim() twice for the same sign-in would mint a second token that
 * immediately invalidates the first.
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
