<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\Payment;
use App\Models\Request as RequestModel;
use App\Models\RequirementDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * One applicant, asking for another applicant's things.
 *
 * The pages never offer these addresses - but an address does not have to
 * be offered to be typed, and an application number is a small integer. So
 * every place that takes an id is asked for a record belonging to somebody
 * else, by an account that is perfectly valid and simply has no business
 * with it. Anything that answers 200 here is a record leak.
 *
 * The same probe is run upwards: an applicant asking for the office's
 * screens and actions, and an officer asking for the Administrator's.
 */
class CrossTenantAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $stranger;
    private User $officer;
    private RequestModel $application;
    private RequirementDocument $scan;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->owner = $this->userOf('applicant', ['email' => 'owner@example.com']);
        $this->stranger = $this->userOf('applicant', ['email' => 'stranger@example.com']);
        $this->officer = $this->userOf('admin', ['name' => 'Mary Jane P. Bulauan']);

        $this->application = $this->application($this->owner, 'CZC', 'approved', $this->officer);
        $this->scan = $this->requirementScan($this->application, 13, 'Transfer Certificate of Title');
    }

    /** Every answer that is not a leak. */
    private function assertRefused($response, string $what): void
    {
        $this->assertContains(
            $response->getStatusCode(),
            [301, 302, 401, 403, 404, 405, 419],
            "{$what} answered {$response->getStatusCode()} to somebody it does not belong to",
        );
    }

    public function test_a_stranger_cannot_open_another_applicants_application(): void
    {
        $id = $this->application->id;

        foreach ([
            "/my-applications/{$id}",
            "/my-applications/{$id}/print-form",
            "/my-applications/{$id}/print-certificate",
            "/my-applications/{$id}/print-clearance",
            "/my-applications/{$id}/order-of-payment",
            "/my-applications/{$id}/upload-receipt",
            "/requests/{$id}",
            "/admin/requests/{$id}",
            "/admin/requests/{$id}/view-application",
            "/super-admin/requests/{$id}",
        ] as $path) {
            $this->assertRefused(
                $this->actingAs($this->stranger)->get($path),
                $path,
            );
        }
    }

    public function test_a_stranger_cannot_read_another_applicants_uploaded_scan(): void
    {
        foreach ([
            "/documents/{$this->scan->id}",
            "/documents/{$this->scan->id}/download",
            "/requirement-documents/{$this->scan->id}",
        ] as $path) {
            $this->assertRefused(
                $this->actingAs($this->stranger)->get($path),
                $path,
            );
        }
    }

    public function test_a_stranger_cannot_read_another_applicants_receipt(): void
    {
        $payment = Payment::where('request_id', $this->application->id)->first();

        if ($payment === null) {
            $this->markTestSkipped('no payment on the fixture');
        }

        $this->assertRefused(
            $this->actingAs($this->stranger)->get("/payments/{$payment->id}/receipt"),
            'receipt',
        );
    }

    public function test_an_applicant_cannot_reach_the_offices_screens(): void
    {
        foreach ([
            '/dashboard-panel',
            '/applications',
            '/payments',
            '/certificates',
            '/users',
            '/audit-logs',
            '/reports',
            '/sms-broadcast',
            '/admin/requests',
            '/super-admin/requests',
            '/super-admin/users',
        ] as $path) {
            $this->assertRefused(
                $this->actingAs($this->stranger)->get($path),
                $path,
            );
        }
    }

    public function test_an_applicant_cannot_decide_an_application(): void
    {
        $id = $this->application->id;

        foreach ([
            ['post', '/admin/review-application', ['request_id' => $id, 'action' => 'approved']],
            ['post', '/super-admin/review-application', ['request_id' => $id, 'action' => 'approved']],
            ['post', '/admin/save-requirement-verification', ['request_id' => $id, 'verified_requirements' => [13 => true]]],
        ] as [$verb, $path, $payload]) {
            $this->assertRefused(
                $this->actingAs($this->stranger)->{$verb}($path, $payload),
                "{$verb} {$path}",
            );
        }

        // And nothing moved.
        $this->assertDatabaseHas('requests', [
            'id' => $id,
            'status' => 'approved',
        ]);
    }

    public function test_an_applicant_cannot_record_a_payment_for_anybody(): void
    {
        $this->assertRefused(
            $this->actingAs($this->stranger)->post('/admin/payments', [
                'request_id' => $this->application->id,
                'amount' => 1,
                'or_number' => 'FAKE-1',
            ]),
            'record payment',
        );
    }

    public function test_an_applicant_cannot_read_or_change_accounts(): void
    {
        $victim = $this->owner;

        foreach ([
            ['get', "/super-admin/users/{$victim->id}/edit", []],
            ['put', "/super-admin/users/{$victim->id}", ['name' => 'Taken Over']],
            ['delete', "/super-admin/users/{$victim->id}", []],
        ] as [$verb, $path, $payload]) {
            $this->assertRefused(
                $this->actingAs($this->stranger)->{$verb}($path, $payload),
                "{$verb} {$path}",
            );
        }

        $this->assertDatabaseHas('users', [
            'id' => $victim->id,
            'name' => $victim->name,
        ]);
    }

    public function test_a_guest_is_turned_away_from_everything_that_is_not_published(): void
    {
        $id = $this->application->id;

        foreach ([
            '/dashboard',
            '/my-applications',
            "/my-applications/{$id}",
            '/applications',
            '/dashboard-panel',
            '/users',
            '/audit-logs',
            "/documents/{$this->scan->id}",
        ] as $path) {
            $this->assertRefused($this->get($path), $path);
        }
    }

    public function test_the_published_pages_stay_open_to_a_guest(): void
    {
        // The other half of the check above: the notices and the document
        // verification page have to work without an account, or the office
        // cannot be checked by the bank holding one of its certificates.
        foreach (['/legal/privacy', '/legal/terms', '/legal/cookies', '/legal/refund', '/verify', '/login', '/register'] as $path) {
            $this->get($path)->assertOk();
        }
    }

    public function test_a_verification_code_reveals_only_what_is_printed_on_the_paper(): void
    {
        $certificate = Certificate::where('request_id', $this->application->id)->first();

        if ($certificate === null || blank($certificate->verification_code)) {
            $this->markTestSkipped('no issued certificate on the fixture');
        }

        $response = $this->get("/verify/{$certificate->verification_code}");
        $response->assertOk();

        // Nothing that is not on the face of the document.
        $body = $response->getContent();
        $this->assertStringNotContainsString($this->owner->email, $body);
        $this->assertStringNotContainsString($this->owner->contact_number ?? 'no-number', $body);
    }
}
