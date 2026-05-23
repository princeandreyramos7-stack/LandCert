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
            abort(403, 'Unauthorized access.');
        }
        
        // Check if user has the exact role required
        if ($user->user_type === $role) {
            return $next($request);
        }
        
        // Super admin can access admin routes, but not vice versa
        if ($role === 'admin' && $user->user_type === 'super_admin') {
            return $next($request);
        }
        
        // Check if user has the required role using Spatie
        if ($user->hasRole($role)) {
            return $next($request);
        }

        abort(403, 'Unauthorized access.');
    }
}
