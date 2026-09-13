<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoCacheHeaders
{
    /**
     * Handle an incoming request.
     *
     * Prevents browser caching of authenticated pages for security.
     * This ensures that after logout, users cannot access authenticated
     * pages via browser back/forward buttons.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Add comprehensive no-cache headers to prevent browser caching -
        // unless the response has set a cache life of its own (a stored
        // scan streamed to the browser, say), which is deliberate.
        if (!self::declaresOwnCacheLife($response)) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT');
        }
        
        // Additional security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        return $response;
    }

    /**
     * True when a controller has given the response a positive max-age. Pages
     * never do - they must not survive a logout in the back/forward cache - but
     * a file that the same viewer is about to ask for several times over may.
     */
    public static function declaresOwnCacheLife(Response $response): bool
    {
        return $response->headers->hasCacheControlDirective('max-age')
            && (int) $response->headers->getCacheControlDirective('max-age') > 0;
    }
}
