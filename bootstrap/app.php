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
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\NoCacheHeaders::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'prevent.back' => \App\Http\Middleware\PreventBackHistory::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
