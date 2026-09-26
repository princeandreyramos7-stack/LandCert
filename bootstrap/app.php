<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Keep the .env values in $_ENV and $_SERVER only, never putenv(). On a
// threaded web server (Apache on Windows, as in XAMPP) putenv() writes the
// process environment that every thread shares, and PHP clears a request's
// putenv() values when that request ends - so under load a request could
// boot while another was finishing and find no .env at all: the wrong
// database, the wrong session driver, debug off. A process-per-request
// server is unaffected, and reading env() is the same either way.
\Illuminate\Support\Env::disablePutenv();

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // The site sits behind the host's reverse proxy, which terminates TLS
        // and forwards plain HTTP. Without trusting it, Laravel sees every
        // request as insecure: generated URLs come out http://, and the
        // secure-cookie flag is judged against the wrong scheme.
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            // Checked before anything else assumes a signed-in request is
            // still the account's active one - see App\Support\SingleSession
            // for where a session actually earns that status.
            \App\Http\Middleware\EnsureSingleSession::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\NoCacheHeaders::class,
            // When each signed-in user was last here, for the dashboards' live view.
            \App\Http\Middleware\TrackPresence::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'prevent.back' => \App\Http\Middleware\PreventBackHistory::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Custom error handling for production
        $exceptions->render(function (\Throwable $e, $request) {
            // Only what Laravel itself would answer with a 500. A refused
            // form (422), an expired session (401, 419), a missing page
            // (404), a rate limit (429) and the like carry their own status
            // and message, which the browser code acts on; answered as 500s
            // every one of them read as the system failing - a mistyped
            // password was "An error occurred", and the log filled with
            // "Application error" for each of them.
            if ($e instanceof \Illuminate\Validation\ValidationException
                || $e instanceof \Illuminate\Auth\AuthenticationException
                || $e instanceof \Illuminate\Auth\Access\AuthorizationException
                || $e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                return null;
            }

            // Never expose stack traces or internal details in production
            if (!config('app.debug')) {
                // Log the full error for debugging
                \Log::error('Application error', [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                    'url' => $request->fullUrl(),
                    'user_id' => auth()->id(),
                ]);

                // Return user-friendly error without exposing internals
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'An error occurred. Please try again or contact support if the problem persists.',
                    ], 500);
                }

                // For Inertia requests, show a clean error page
                if ($request->header('X-Inertia')) {
                    return \Inertia\Inertia::render('Error', [
                        'status' => 500,
                        'message' => 'An unexpected error occurred. Our team has been notified.',
                    ])->toResponse($request)->setStatusCode(500);
                }

                // For regular requests, use Laravel's default error view
                return response()->view('errors.500', [], 500);
            }

            // In debug mode, let Laravel show detailed errors
            return null;
        });
    })->create();
