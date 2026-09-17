<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

/**
 * Notes when a signed-in user was last here and on what page, for the
 * dashboards' "who is using the system" view (App\Support\Presence).
 *
 * One small update per user per minute at most - a page open with the live
 * poller running keeps the user "online", which is what the office means by
 * it. Written straight to the table so it never touches updated_at or fires
 * model events, and a failure here never breaks the request.
 */
class TrackPresence
{
    public const EVERY_SECONDS = 60;

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $request->isMethod('GET')) {
            $stale = !$user->last_seen_at || $user->last_seen_at->lt(now()->subSeconds(self::EVERY_SECONDS));
            $path = '/' . ltrim($request->path(), '/');
            if ($stale || $user->last_seen_path !== $path) {
                try {
                    DB::table('users')->where('id', $user->id)->update([
                        'last_seen_at' => now(),
                        'last_seen_path' => mb_substr($path, 0, 190),
                    ]);
                } catch (\Throwable $e) {
                    // Presence is a nicety; the page is not.
                }
            }
        }

        return $next($request);
    }
}
