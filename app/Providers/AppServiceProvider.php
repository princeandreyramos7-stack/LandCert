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
    /**
     * Longest idle window a session may have, whatever the environment says.
     *
     * The real control is the browser signing an idle user out at 10 minutes;
     * this only reaps sessions nobody is using, including one whose cookie a
     * browser restored after a restart. Kept above that figure on purpose:
     * at 15 there was no margin, and a missed keep-alive ping while someone
     * filled in the application form expired their session and lost the lot
     * to a 401 on submit.
     */
    private const MAX_SESSION_LIFETIME_MINUTES = 30;

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->enforceSessionSecurity();
        $this->enforceDebugSecurity();
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

        // config/session.php reads SESSION_SECURE_COOKIE with no default, so
        // an unset or false value in the deployed .env (this has happened to
        // this exact site before) ships the session cookie without the
        // Secure flag - readable by anyone on the same network the moment
        // the site is ever reached over plain HTTP. Production here is
        // always meant to be HTTPS (see NoCacheHeaders' HSTS header), so
        // this is not a setting a production .env should be able to opt out
        // of by omission.
        if ($this->app->environment('production')) {
            config(['session.secure' => true]);
        }
    }

    /**
     * A production .env with APP_DEBUG left on (or restored from a stale
     * backup) turns every unhandled error into a page showing the stack
     * trace, the full SQL query, and the environment's own values to
     * whoever triggered it - this has happened to this exact deployment
     * before (see the 2026-09-16 pre-deployment audit). bootstrap/app.php's
     * exception handler already checks config('app.debug') to decide what
     * an error page shows, so forcing it off here - the same
     * cache-cannot-override-this technique enforceSessionSecurity() uses
     * for the session lifetime - closes the gap regardless of what the
     * deployed file says, and the log line means it gets noticed and fixed
     * at the source rather than silently relied on forever.
     */
    private function enforceDebugSecurity(): void
    {
        if ($this->app->environment('production') && config('app.debug')) {
            config(['app.debug' => false]);

            report(new \RuntimeException(
                'APP_DEBUG is true in the production environment - forced off at runtime. Fix the .env on the host.'
            ));
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        /*
         * Vite::prefetch() is deliberately not called here.
         *
         * It fetches every chunk in the build after the page loads, so
         * that later navigations are instant. Measured on this build
         * that is 177 files and 4.4 MB on the first page - including
         * the 958 KB PDF library that six pages use and the 619 KB
         * reports workspace that one does - against 37 files and
         * 578 KB for the page actually asked for.
         *
         * On the office LAN that trade is free. On an applicant's
         * mobile connection it is most of a minute of downloading
         * before anything they came for is usable, and it competes for
         * the same bandwidth as the page itself. A government service
         * is judged by the worst connection that has to use it.
         *
         * What replaces it: the build output is now cached for a year
         * (public/.htaccess - every filename carries a content hash,
         * so it is safe), and a page whose chunk has not been fetched
         * yet shows the shape of itself while it arrives rather than
         * sitting still (Components/PageSkeleton). The cost of not
         * prefetching is one small request the first time each kind of
         * page is opened after a deploy.
         */


        // See App\Mail\Transport\DeferredTransport: mail is sent once the
        // response is out, through whichever transport MAIL_MAILER names.
        \Illuminate\Support\Facades\Mail::extend('deferred', function (array $config) {
            $inner = $config['mailer'] ?? 'smtp';
            if ($inner === 'deferred') {
                $inner = 'smtp';
            }

            return new \App\Mail\Transport\DeferredTransport(
                \Illuminate\Support\Facades\Mail::mailer($inner)->getSymfonyTransport(),
                defer: !$this->app->runningInConsole()
            );
        });

        // The Backups page reads how the last run went; the scheduler has no
        // other way to report back, since its notifications go by mail.
        \Illuminate\Support\Facades\Event::listen(\Spatie\Backup\Events\BackupWasSuccessful::class, function () {
            if (!app()->runningInConsole() || app()->runningUnitTests()) return;
            \App\Support\BackupSchedule::recordRun(true, 'Backup completed');
        });
        \Illuminate\Support\Facades\Event::listen(\Spatie\Backup\Events\BackupHasFailed::class, function ($event) {
            if (!app()->runningInConsole() || app()->runningUnitTests()) return;
            \App\Support\BackupSchedule::recordRun(false, $event->exception->getMessage());
        });
        
        // Set timezone for Carbon
        \Carbon\Carbon::setLocale('en');
        date_default_timezone_set('Asia/Manila');
        
        // Register observers for cache invalidation
        RequestModel::observe(RequestObserver::class);
        Report::observe(ReportObserver::class);
    }
}
