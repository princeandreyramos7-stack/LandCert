<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * At most one signed-in session per account at a time. A fresh sign-in (see
 * App\Support\SingleSession::claim) stamps a token onto both the account
 * and that one session; if this session's own token no longer matches what
 * is on the account, a later sign-in elsewhere replaced it, and this
 * session is signed out here rather than left to act as if it were still
 * the active one.
 *
 * A session that has no token of its own yet - one from before this feature
 * existed, or one whose account has never signed in since - is left alone:
 * strict equality means null only ever matches null, so two such sessions
 * can briefly coexist, but the moment either account signs in for real
 * again it claims a token and the other is caught on its very next request.
 */
class EnsureSingleSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = $request->user();

            if ($request->session()->get('device_session_id') !== $user->current_session_id) {
                return $this->signOut($request);
            }
        }

        return $next($request);
    }

    private function signOut(Request $request): Response
    {
        $message = 'You have been signed out because this account was signed in on another device.';

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson() && !$request->header('X-Inertia')) {
            return response()->json(['message' => $message], 401);
        }

        $redirect = redirect()->route('login')->with('status', $message);

        // An Inertia navigation needs to be told to reload the document
        // rather than render this response as if it were the page it asked
        // for - same as a normal logout (AuthenticatedSessionController::destroy).
        if ($request->header('X-Inertia')) {
            $redirect->headers->set('X-Inertia-Location', route('login'));
        }

        return $redirect;
    }
}
