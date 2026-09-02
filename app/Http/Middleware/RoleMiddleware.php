<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (!$user) {
            // A guest is unauthenticated, not forbidden. Aborting with 403 here
            // surfaced as "403 Forbidden" the moment a session ended: the
            // live-refresh poll (see useLiveData) re-requests the current page
            // on a timer, so logging out of a role-protected page fired one
            // last request as a guest and got a hard 403 instead of being sent
            // to the login screen. Match what `auth` middleware does.
            if ($request->expectsJson()) {
                abort(401, 'Unauthenticated.');
            }

            return redirect()->guest(route('login'));
        }

        // `user_type` is the single source of truth for authorization.
        // Spatie roles are kept in sync with it automatically (see User::booted())
        // and are used only for granular permission checks elsewhere, not as a
        // second independent authorization path here.

        // Check if user has the exact role required
        if ($user->user_type === $role) {
            return $next($request);
        }
        
        // Super admin can access admin routes, but not vice versa
        if ($role === 'admin' && $user->user_type === 'super_admin') {
            return $next($request);
        }

        abort(403, 'Unauthorized access.');
    }
}
