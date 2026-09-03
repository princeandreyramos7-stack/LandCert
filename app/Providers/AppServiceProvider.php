<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Request as RequestModel;
use App\Models\Report;
use App\Observers\RequestObserver;
use App\Observers\ReportObserver;

class AppServiceProvider extends ServiceProvider
{
    /** Longest idle window a session may have, whatever the environment says. */
    private const MAX_SESSION_LIFETIME_MINUTES = 15;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->enforceSessionSecurity();
    }

    /**
     * Pin the session's expiry rules at runtime.
     *
     * These are set in config/session.php too, but a server running with a
     * cached config (bootstrap/cache/config.php) keeps serving the values that
     * were frozen into it, and a deploy alone does not refresh that — the live
     * site went on issuing an 8-hour persistent cookie after the config change
     * had shipped. Anyone who had ever signed in on a machine stayed signed in
     * across closing the browser, so a copied admin URL opened straight into
     * the panel in another browser.
     *
     * Applying it here, before the session middleware builds the cookie, means
     * the rule holds whether or not the config cache has been cleared. Left as
     * env-overridable so a developer can still relax it locally.
     */
    private function enforceSessionSecurity(): void
    {
        config([
            // No Max-Age on the cookie: the browser drops it when it closes.
            'session.expire_on_close' => filter_var(
                env('SESSION_EXPIRE_ON_CLOSE', true),
                FILTER_VALIDATE_BOOLEAN
            ),
            // Idle backstop. The browser signs an idle user out at 10 minutes
            // and an active one pings every 4, so this only reaps sessions
            // nobody is using — including one whose cookie a browser restored.
            //
            // Capped rather than simply read: the deployed .env still carries
            // the old 480, and an eight-hour idle window is not something a
            // stale environment file should be able to reinstate. A shorter
            // value is honoured; a longer one is not.
            'session.lifetime' => min(
                (int) env('SESSION_LIFETIME', self::MAX_SESSION_LIFETIME_MINUTES),
                self::MAX_SESSION_LIFETIME_MINUTES
            ),
        ]);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Set timezone for Carbon
        \Carbon\Carbon::setLocale('en');
        date_default_timezone_set('Asia/Manila');
        
        // Register observers for cache invalidation
        RequestModel::observe(RequestObserver::class);
        Report::observe(ReportObserver::class);
    }
}
