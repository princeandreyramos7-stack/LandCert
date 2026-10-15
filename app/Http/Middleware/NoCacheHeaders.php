<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
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
        // Decided before the page renders, not after: the nonce the policy
        // below allows has to be written into the page's own <script> tags
        // too (see app.blade.php), and those are rendered inside $next.
        $enforceCsp = !app()->environment('local');
        if ($enforceCsp) {
            Vite::useCspNonce();
        }

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

        /*
         * Do not leak the address of a page to anywhere it is linked.
         *
         * The addresses in this system carry meaning - /verify/{code} is
         * a document's verification code, and a full Referer would hand
         * that code to any site linked from the page. Same-origin keeps
         * the path for our own navigation and sends only the bare origin
         * outward.
         */
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        /*
         * Nothing here needs a camera, a microphone or a location, so
         * nothing here may ask for one. This closes the door on anything
         * injected into a page trying to.
         */
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
        );

        /*
         * Once a browser has reached the site over HTTPS, never let it
         * try plain HTTP again - a request over HTTP would carry the
         * session cookie in the clear for anyone on the same network to
         * read. Sent only on a secure request: asserting it over plain
         * HTTP is ignored by browsers, and sending it in local
         * development would pin localhost to HTTPS in the developer's
         * browser for a year.
         *
         * Not preloaded: that is a one-way commitment for the whole
         * domain and belongs to whoever administers it, not to this
         * middleware.
         */
        if ($request->secure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        /*
         * A last line of defence against XSS beyond React's own output
         * escaping: even if something slipped an inline <script> or a
         * foreign <script src> into a response, the browser would refuse to
         * run it.
         *
         * Skipped in local development: Vite's dev server serves the bundle
         * (and its hot-reload websocket) from its own origin, http://localhost:5173,
         * which a same-origin script-src would block outright, and a
         * relaxed-enough-for-Vite policy would not be the policy production
         * actually runs under. Everything this app itself loads - the built
         * JS, its own API calls, and the one external font stylesheet - is
         * covered below in every other environment.
         *
         * The one inline <script> the app does have is Ziggy's @routes,
         * which defines route() for every page. It is let through by a
         * fresh per-response nonce rather than 'unsafe-inline' (which would
         * undo the point of the policy) or a hash (which would change with
         * every route added). Without it route() is undefined and every
         * page that calls it fails to render.
         */
        if ($enforceCsp) {
            $response->headers->set('Content-Security-Policy', implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'nonce-" . Vite::cspNonce() . "'",
                // Tailwind/React inline style attributes and the chart
                // library's own inline <style>/style= output need this.
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
                "font-src 'self' https://fonts.bunny.net",
                // blob: for the picture previewed before it is uploaded - a
                // new avatar, e-signature or signatory signature is shown
                // from URL.createObjectURL() until it is saved.
                "img-src 'self' data: blob:",
                "connect-src 'self'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'self'",
            ]));
        }

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
