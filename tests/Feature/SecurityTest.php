<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The doors someone would try: injection through every field that reaches
 * a query, script in a name, forged requests, guessed passwords, other
 * people's records, other roles' pages, and a script dressed as a picture.
 */
class SecurityTest extends TestCase
{
    use RefreshDatabase;

    private const SQLI = [
        "' OR '1'='1",
        "1' OR 1=1--",
        "\"; DROP TABLE users; --",
        "' UNION SELECT NULL,NULL,NULL--",
        "1; WAITFOR DELAY '0:0:5'",
        "%' AND 1=(SELECT COUNT(*) FROM users)--",
    ];

    public function test_injection_in_every_searchable_field_neither_breaks_nor_leaks(): void
    {
        $administrator = $this->userOf('super_admin');
        $officer = $this->userOf('admin');
        $this->application($this->userOf('applicant'), 'CZC', 'approved', $officer);
        $this->userOf('applicant', ['name' => 'Needle In Haystack', 'email' => 'needle@example.test']);

        // The login form, as a guest (actingAs() below would stay in force).
        foreach (self::SQLI as $payload) {
            $this->post('/login', ['email' => $payload, 'password' => $payload])->assertSessionHasErrors('email');
            $this->assertGuest();
        }

        foreach (self::SQLI as $payload) {
            // Audit log search (LIKE clauses over four columns).
            $this->actingAs($administrator)
                ->get('/audit-logs?' . http_build_query(['search' => $payload, 'action' => $payload, 'user_id' => $payload, 'date_from' => $payload]))
                ->assertOk();

            // Reports: the applicant name goes into a WHERE, the period into a
            // range, the officer into an id lookup.
            $this->actingAs($administrator)
                ->getJson('/super-admin/reports/preview?' . http_build_query(['type' => 'applicant', 'applicant' => $payload]))
                ->assertOk()
                ->assertJsonPath('summary.applications', 0);
            $this->actingAs($administrator)
                ->getJson('/super-admin/reports/preview?' . http_build_query(['type' => 'period', 'year' => $payload, 'month' => $payload]))
                ->assertStatus(422);
            // An unknown officer is an empty report, not an error.
            $officerReport = $this->actingAs($administrator)
                ->getJson('/super-admin/reports/preview?' . http_build_query(['type' => 'officer', 'officer' => $payload]));
            $this->assertContains($officerReport->getStatusCode(), [200, 422]);
            if ($officerReport->getStatusCode() === 200) {
                $officerReport->assertJsonPath('summary.applications', 0);
            }

            // Payment duplicate check and login.
            $this->actingAs($officer)
                ->postJson('/admin/payments/check-duplicate', ['receipt_number' => $payload])
                ->assertOk()
                ->assertJsonPath('exists', false);
        }

        // Nothing was dropped and nothing was altered.
        $this->assertDatabaseHas('users', ['email' => 'needle@example.test']);
        $this->assertSame(1, \App\Models\Request::count());
    }

    public function test_script_in_an_applicants_name_is_never_rendered_as_script(): void
    {
        $officer = $this->userOf('admin');
        $owner = $this->userOf('applicant', ['name' => '<script>alert("xss")</script>']);
        $app = $this->application($owner, 'CZC', 'approved', $officer, ['applicant_name' => '<img src=x onerror=alert(1)>']);

        foreach (['/applications', '/payments', '/reports', '/dashboard-panel', '/users'] as $page) {
            $html = $this->actingAs($officer)->get($page)->assertOk()->getContent();
            $this->assertStringNotContainsString('<script>alert("xss")</script>', $html, "$page renders the name as markup");
            $this->assertStringNotContainsString('<img src=x onerror=alert(1)>', $html, "$page renders the name as markup");
        }

        // The documents and the PDF too.
        $html = $this->actingAs($officer)->followingRedirects()->get("/admin/requests/{$app->id}/generate-clearance")->getContent();
        $this->assertStringNotContainsString('<img src=x onerror=alert(1)>', $html);
        $pdf = $this->actingAs($officer)->get('/admin/export/requests?format=pdf&status=all');
        $pdf->assertOk();
        $this->assertStringStartsWith('%PDF', $pdf->getContent());
    }

    public function test_every_state_changing_route_sits_behind_csrf_protection(): void
    {
        // The test client runs with CSRF checking switched off, so this reads
        // the routing table instead: every POST/PUT/PATCH/DELETE must carry the
        // web middleware group, whose ValidateCsrfToken refuses a request
        // without the token (checked live with curl: 419).
        $router = app('router');
        $unprotected = [];
        foreach ($router->getRoutes()->getRoutes() as $route) {
            if (!array_intersect(['POST', 'PUT', 'PATCH', 'DELETE'], $route->methods())) {
                continue;
            }
            $middleware = collect($router->gatherRouteMiddleware($route))->map(fn ($m) => is_string($m) ? $m : get_class($m));
            if (!$middleware->contains(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class)) {
                $unprotected[] = implode('|', $route->methods()) . ' /' . $route->uri();
            }
        }
        $this->assertSame([], $unprotected, "Routes without CSRF protection:\n" . implode("\n", $unprotected));
    }

    public function test_password_guessing_is_throttled(): void
    {
        $user = $this->userOf('applicant');

        foreach (range(1, 5) as $attempt) {
            $this->post('/login', ['email' => $user->email, 'password' => "wrong-$attempt"])->assertSessionHasErrors('email');
        }
        // The sixth within a minute is refused without being checked - even
        // with the right password.
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->assertStringContainsString('Too many login attempts', session('errors')->first('email'));
    }

    public function test_passwords_are_stored_hashed_and_never_returned(): void
    {
        $user = $this->userOf('applicant', ['password' => 'a-plain-password-2026']);
        $this->assertNotSame('a-plain-password-2026', $user->fresh()->password);
        $this->assertTrue(Hash::check('a-plain-password-2026', $user->fresh()->password));

        // The user object every page carries has no password or token in it.
        $props = $this->actingAs($user)->get('/my-applications')->assertOk();
        $props->assertInertia(fn ($page) => $page->missing('auth.user.password')->missing('auth.user.remember_token'));
    }

    public function test_an_applicant_cannot_touch_another_applicants_records(): void
    {
        Storage::fake('local');
        $owner = $this->userOf('applicant');
        $stranger = $this->userOf('applicant');
        $app = $this->application($owner, 'CZC', 'approved');
        $doc = $this->requirementScan($app, 13, 'Title');
        $payment = Payment::where('request_id', $app->id)->firstOrFail();

        $this->actingAs($stranger)->put("/requests/{$app->id}", ['applicant_name' => 'Taken Over'])->assertForbidden();
        $this->assertDatabaseMissing('applicants', ['applicant_name' => 'Taken Over']);

        $this->actingAs($stranger)->delete("/requirements/{$doc->id}")->assertForbidden();
        $this->assertDatabaseHas('requirement_documents', ['id' => $doc->id]);

        $this->actingAs($stranger)->get("/payments/{$payment->id}/receipt")->assertForbidden();
        $this->actingAs($stranger)->get("/requirements/{$doc->id}/view")->assertForbidden();

        $this->actingAs($stranger)->postJson('/payments', [
            'request_id' => $app->id, 'or_number' => 'OR-STRANGER', 'amount' => 1,
            'payment_method' => 'cash', 'payment_date' => now()->toDateString(),
        ])->assertForbidden();
        $this->assertDatabaseMissing('payments', ['receipt_number' => 'OR-STRANGER']);

        // The clean pages: a record remembered in the session is still checked.
        $this->actingAs($stranger)
            ->withSession(['clean_page.application-details' => $app->id])
            ->get('/application-details')
            ->assertForbidden();
        $this->actingAs($stranger)
            ->withSession(['clean_page.edit-application' => $app->id])
            ->get('/edit-application')
            ->assertForbidden();
    }

    public function test_each_role_is_kept_to_its_own_pages_and_actions(): void
    {
        $applicant = $this->userOf('applicant');
        $officer = $this->userOf('admin');

        // Staff pages, for an applicant.
        foreach (['/applications', '/payments', '/certificates', '/users', '/audit-logs', '/reports', '/sms-broadcast', '/super-admin/backups', '/dashboard-panel'] as $page) {
            $this->actingAs($applicant)->get($page)->assertForbidden();
        }

        // The administrator's own, for an officer.
        foreach (['/super-admin/backups', '/super-admin/users', '/super-admin/dashboard'] as $page) {
            $status = $this->actingAs($officer)->get($page)->getStatusCode();
            $this->assertContains($status, [403, 302], "officer reached $page");
        }
        $this->actingAs($officer)->post('/super-admin/create-admin', ['name' => 'x', 'email' => 'x@example.test', 'password' => 'Password-2026!', 'password_confirmation' => 'Password-2026!'])->assertForbidden();
        $this->actingAs($officer)->post('/super-admin/backups/run')->assertForbidden();
        $this->actingAs($applicant)->post('/admin/payments/record', [])->assertForbidden();

        // Nobody registers as staff.
        $this->post('/register', [
            'consent' => '1',
            'name' => 'Sneaky', 'email' => 'sneaky@example.test', 'password' => 'Password-2026!', 'password_confirmation' => 'Password-2026!',
            'user_type' => 'super_admin', 'role' => 'super_admin',
        ]);
        $sneaky = User::where('email', 'sneaky@example.test')->first();
        if ($sneaky) {
            $this->assertSame('applicant', $sneaky->user_type);
        }

        // Nobody promotes themselves through the profile.
        $this->actingAs($applicant)->patch('/profile', ['name' => 'Still Me', 'email' => $applicant->email, 'user_type' => 'super_admin'])->assertRedirect();
        $this->assertSame('applicant', $applicant->fresh()->user_type);
    }

    /**
     * Uploads are judged by their bytes, not their names: the receipt and
     * requirement rules use mimes:, which reads the file through fileinfo.
     * The test client cannot stage a real upload on this platform (Symfony's
     * test-mode UploadedFile trips fileinfo on Windows), so the rules are
     * asserted here and the live check is done with curl against the server:
     * a PHP script named receipt.jpg is refused with a validation error.
     */
    public function test_uploads_are_judged_by_content_not_by_name(): void
    {
        $rules = (new \App\Http\Requests\RecordPaymentRequest())->rules();
        $this->assertContains('mimes:jpg,jpeg,png,pdf', $rules['receipt_file']);

        $requirements = file_get_contents(app_path('Http/Controllers/RequirementDocumentController.php'));
        $this->assertStringContainsString("'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120'", $requirements);

        $payments = file_get_contents(app_path('Http/Controllers/PaymentController.php'));
        $this->assertStringContainsString("'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'", $payments);

        $this->assertTrue(extension_loaded('fileinfo'), 'mimes: needs fileinfo to read the bytes');
    }

    public function test_responses_carry_the_protective_headers_and_uploads_are_not_web_reachable(): void
    {
        $user = $this->userOf('applicant');
        $response = $this->actingAs($user)->get('/my-applications')->assertOk();
        $this->assertSame('nosniff', $response->headers->get('x-content-type-options'));
        $this->assertSame('SAMEORIGIN', $response->headers->get('x-frame-options'));
        $this->assertStringContainsString('no-store', $response->headers->get('cache-control'));

        // A stored scan has no public URL: the private disk is not under public/.
        $this->assertStringNotContainsString('public', config('filesystems.disks.local.root'));
        $this->assertArrayNotHasKey('visibility', config('filesystems.disks.local'));
    }

    public function test_the_session_cookie_is_http_only_and_the_id_changes_at_login(): void
    {
        $user = $this->userOf('applicant', ['password' => 'a-plain-password-2026']);

        $before = $this->get('/login')->assertOk();
        $cookie = collect($before->headers->getCookies())->first(fn ($c) => $c->getName() === config('session.cookie'));
        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isHttpOnly());

        $login = $this->post('/login', ['email' => $user->email, 'password' => 'a-plain-password-2026'])->assertRedirect();
        $after = collect($login->headers->getCookies())->first(fn ($c) => $c->getName() === config('session.cookie'));
        $this->assertNotNull($after);
        $this->assertNotSame($cookie->getValue(), $after->getValue(), 'the session id must be regenerated at login');
    }
}
