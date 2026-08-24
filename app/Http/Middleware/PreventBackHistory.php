<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to prevent authenticated pages from being accessible via browser back button after logout.
 * 
 * This middleware:
 * 1. Enforces strict no-cache headers on authenticated pages
 * 2. Validates authentication on every request
 * 3. Handles Inertia.js requests properly
 * 4. Prevents browser history caching of sensitive pages
 */
class PreventBackHistory
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check authentication before processing the request
        if (!Auth::check()) {
            // If Inertia request, return proper redirect
            if ($request->inertia()) {
                return redirect()->route('login');
            }
            
            // For regular requests, redirect to login
            return redirect()->route('login');
        }

        // Process the request
        $response = $next($request);

        // Apply strict cache-control headers to prevent browser caching
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');
        
        // Additional security headers
        $response->headers->set('Last-Modified', gmdate('D, d M Y H:i:s') . ' GMT');
        
        // Prevent page from being stored in browser cache
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        return $response;
    }
}
