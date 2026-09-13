<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Every GET route in the application, visited as a guest, an applicant, a
 * Zoning Officer and the Zoning Administrator, with a full application on
 * file. Nothing may answer with a server error; the role checks must hold.
 *
 * It does not say a page is right - only that it is not broken, for every
 * page at once, which is what a change somewhere else tends to break.
 */
class RouteSweepTest extends TestCase
{
    use RefreshDatabase;

    /** Routes that are not pages: they act, download, or need a token. */
    private const SKIP = [
        'logout', 'verification.verify', 'verification.send', 'password.reset',
        'sanctum.csrf-cookie', 'storage.local', 'ignition', 'telescope', 'horizon', 'pulse',
    ];

    public function test_every_get_route_answers_without_a_server_error(): void
    {
        Storage::fake('local');

        $applicant = $this->userOf('applicant');
        $officer = $this->userOf('admin', ['name' => 'Mary Jane P. Bulauan']);
        $administrator = $this->userOf('super_admin', ['name' => 'Crisanta D. Concepcion', 'signature_path' => 'images/none.png']);

        $app = $this->application($applicant, 'CZC', 'approved', $officer);
        $doc = $this->requirementScan($app, 13, 'Title');
        $payment = Payment::where('request_id', $app->id)->firstOrFail();
        $certificate = Certificate::create([
            'request_id' => $app->id,
            'certificate_number' => 'CPDO-2026-000001',
            'status' => 'preparing',
            'issued_at' => now(),
            'issued_by' => $officer->id,
        ]);

        $params = [
            'id' => $app->id, 'request' => $app->id, 'requestId' => $app->id,
            'payment' => $payment->id, 'certificate' => $certificate->id,
            'document' => $doc->id, 'user' => $applicant->id, 'notification' => 1,
            'template' => 1, 'log' => 1, 'reminder' => 1,
        ];

        $failures = [];
        $visited = 0;

        foreach (app('router')->getRoutes()->getRoutes() as $route) {
            /** @var Route $route */
            if (!in_array('GET', $route->methods(), true)) {
                continue;
            }
            $name = $route->getName() ?? '';
            $uri = $route->uri();
            if ($this->skipped($name, $uri)) {
                continue;
            }

            // Fill the route's parameters from the fixtures; skip what we cannot fill.
            $missing = false;
            foreach ($route->parameterNames() as $parameter) {
                if (!array_key_exists($parameter, $params)) {
                    $missing = true;
                    break;
                }
                $uri = preg_replace('/\{' . preg_quote($parameter, '/') . '\??\}/', (string) $params[$parameter], $uri);
            }
            if ($missing) {
                continue;
            }
            $uri = preg_replace('/\{[^}]+\?\}/', '', $uri);

            foreach ([null, $applicant, $officer, $administrator] as $user) {
                $response = $user
                    ? $this->actingAs($user)->get('/' . ltrim($uri, '/'))
                    : $this->get('/' . ltrim($uri, '/'));
                $visited++;

                $status = $response->getStatusCode();
                $who = $user ? $user->user_type : 'guest';

                if ($status >= 500) {
                    $failures[] = "$who GET /$uri -> $status";
                    continue;
                }
                // A guest never sees anything behind auth.
                if (!$user && $status === 200 && $route->gatherMiddleware() && in_array('auth', $route->gatherMiddleware(), true)) {
                    $failures[] = "guest GET /$uri -> 200 on an auth route";
                }
                // Clean pages remember a record; walk through the bounce too.
                if ($status === 302 && $user && str_starts_with((string) $response->headers->get('location'), config('app.url'))) {
                    $target = parse_url($response->headers->get('location'), PHP_URL_PATH) ?: '/';
                    $second = $this->actingAs($user)->get($target);
                    if ($second->getStatusCode() >= 500) {
                        $failures[] = "$who GET /$uri -> $target -> {$second->getStatusCode()}";
                    }
                }
                // The next role starts signed out, with a clean session. (Not
                // refreshApplication(): that leaves the test's database
                // transaction behind on the old connection and unsettles the
                // tests that follow.)
                $this->app['auth']->forgetGuards();
                $this->flushSession();
            }
        }

        $this->assertGreaterThan(40, $visited, 'the sweep should have covered the site');
        $this->assertSame([], $failures, "Routes answering with a server error:\n" . implode("\n", $failures));
    }

    private function skipped(string $name, string $uri): bool
    {
        foreach (self::SKIP as $needle) {
            if ($needle !== '' && (str_contains($name, $needle) || str_contains($uri, $needle))) {
                return true;
            }
        }

        // Framework and vendor routes.
        return str_starts_with($uri, '_') || str_starts_with($uri, 'up') || str_starts_with($uri, 'storage/');
    }
}
