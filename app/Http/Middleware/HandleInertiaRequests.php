<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Every page served to a signed-out visitor throws away the key the
     * browser's page history is encrypted with (see config/inertia.php), so
     * whatever an earlier session left in that history - a dashboard, an
     * applicant's file - can no longer be redrawn with the Back button. Back
     * then has to ask the server, and the server answers as it should for
     * someone who is not signed in.
     */
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user()) {
            Inertia::clearHistory();
        }

        return parent::handle($request, $next);
    }

    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'user_type' => $request->user()->user_type,
                    'roles' => $request->user()->roles,
                    'avatar_url' => $request->user()->avatar_url,
                ] : null,
            ],
            /*
             | What the server will actually accept in one upload.
             |
             | A POST larger than post_max_size is discarded before PHP sees it,
             | and on this host the connection is reset rather than answered — so
             | the browser reports only "Failed to fetch" and the applicant loses
             | a completed form with no idea why. Sharing the real numbers lets
             | the form say which file is too big before it sends anything.
             */
            'uploadLimits' => [
                'postMaxBytes' => self::iniBytes('post_max_size'),
                'fileMaxBytes' => self::iniBytes('upload_max_filesize'),
                'maxFiles' => (int) ini_get('max_file_uploads'),
            ],
            // Add flash messages
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
    /**
     * A php.ini size such as "40M" as a plain byte count.
     */
    private static function iniBytes(string $directive): int
    {
        $value = trim((string) ini_get($directive));

        if ($value === "") {
            return 0;
        }

        $number = (int) $value;
        $unit = strtolower(substr($value, -1));

        return match ($unit) {
            "g" => $number * 1024 * 1024 * 1024,
            "m" => $number * 1024 * 1024,
            "k" => $number * 1024,
            default => $number,
        };
    }
}
