<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Where a freshly trusted session goes next - shared by the plain sign-in
 * and the two-factor challenge, since either one may be the request that
 * finishes a login.
 */
class PostLoginRedirect
{
    /**
     * Staff always land on their dashboard. `intended()` is deliberately
     * not used for them: it replays whatever page bounced them to the login
     * screen (typically the requests list), which is not where a fresh
     * session should start.
     */
    public static function for(User $user, Request $request): RedirectResponse
    {
        if ($user->user_type === 'super_admin') {
            $request->session()->forget('url.intended');
            return redirect()->route('super-admin.dashboard');
        }

        if ($user->user_type === 'admin') {
            $request->session()->forget('url.intended');
            return redirect()->route('admin.dashboard');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
