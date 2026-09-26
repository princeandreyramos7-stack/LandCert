<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Certificate;
use App\Models\Payment;
use App\Services\ApplicationDocuments;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Public verification of an issued document.
 *
 * Every certificate carries a random code, printed as a QR on the sheet, that
 * opens /verify/{code} - no sign-in - and says whether the paper is genuine
 * and still in force. The office can revoke a certificate; the page then says
 * so, with the reason.
 */
class CertificateVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function issued(string $type = 'CZC', array $attributes = []): Certificate
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, $type, 'released', $officer);
        $payment = Payment::where('request_id', $request->id)->firstOrFail();

        return Certificate::create($attributes + [
            'request_id' => $request->id,
            'payment_id' => $payment->id,
            'user_id' => $applicant->id,
            'certificate_number' => 'CERT-2026-00001',
            'status' => 'released',
            'issued_at' => '2026-09-01 09:00:00',
            'valid_until' => '2027-09-01',
            'issued_by' => $officer->id,
        ]);
    }

    public function test_every_certificate_gets_an_unguessable_code_on_creation(): void
    {
        $certificate = $this->issued();

        $this->assertMatchesRegularExpression('/^[A-HJ-NP-Z2-9]{12}$/', $certificate->verification_code);
        $this->assertSame(url("/verify/{$certificate->verification_code}"), $certificate->verificationUrl());
    }

    public function test_a_valid_certificate_verifies_as_valid_for_a_guest(): void
    {
        $certificate = $this->issued();

        $this->get("/verify/{$certificate->verification_code}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Verify/Certificate')
                ->where('code', $certificate->verification_code)
                ->where('result.status', 'valid')
                ->where('result.certificate_number', 'CERT-2026-00001')
                ->where('result.issued_to', 'Juan Dela Cruz')
                ->where('result.project_type', 'CZC')
                ->where('result.barangay', 'Alibagu')
                ->where('result.issued_at', '2026-09-01')
                ->where('result.valid_until', '2027-09-01')
                // Only what is printed on the paper: no address, no receipt.
                ->missing('result.applicant_address')
                ->missing('result.receipt_number'));
    }

    public function test_the_code_may_be_typed_in_any_case_with_dashes_or_spaces(): void
    {
        $certificate = $this->issued();
        $code = $certificate->verification_code;
        $sloppy = strtolower(substr($code, 0, 4) . '-' . substr($code, 4, 4) . ' ' . substr($code, 8));

        $this->get("/verify/{$sloppy}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('result.status', 'valid'));

        $this->post('/verify', ['code' => $sloppy])
            ->assertRedirect("/verify/{$code}");
    }

    public function test_an_unknown_code_is_reported_not_found_rather_than_erroring(): void
    {
        $this->get('/verify/NOPE12345678')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('code', 'NOPE12345678')
                ->where('result.status', 'not_found')
                ->missing('result.issued_to'));

        $this->get('/verify')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('result', null));
    }

    public function test_an_expired_certificate_says_so(): void
    {
        $certificate = $this->issued('CZC', ['valid_until' => now()->subDay()->toDateString()]);

        $this->get("/verify/{$certificate->verification_code}")
            ->assertInertia(fn (Assert $page) => $page->where('result.status', 'expired'));
    }

    public function test_the_officer_can_revoke_and_the_page_then_says_revoked_with_the_reason(): void
    {
        $certificate = $this->issued();
        $officer = $this->userOf('admin');

        $this->actingAs($officer)
            ->post("/admin/certificates/{$certificate->id}/revoke", ['reason' => 'Issued against a falsified tax declaration'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $certificate->refresh();
        $this->assertNotNull($certificate->revoked_at);
        $this->assertSame($officer->id, $certificate->revoked_by);
        $this->assertSame('revoked', $certificate->verificationStatus());
        $this->assertTrue(AuditLog::where('action', 'certificate_revoked')->where('model_id', $certificate->id)->exists());

        $this->get("/verify/{$certificate->verification_code}")
            ->assertInertia(fn (Assert $page) => $page
                ->where('result.status', 'revoked')
                ->where('result.revocation_reason', 'Issued against a falsified tax declaration'));

        // And back again.
        $this->actingAs($officer)
            ->post("/admin/certificates/{$certificate->id}/reinstate")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertNull($certificate->fresh()->revoked_at);
        $this->get("/verify/{$certificate->verification_code}")
            ->assertInertia(fn (Assert $page) => $page->where('result.status', 'valid'));
    }

    public function test_revoking_needs_a_reason_and_staff(): void
    {
        $certificate = $this->issued();

        // A guest first: actingAs() sticks for the rest of the test.
        $this->post("/admin/certificates/{$certificate->id}/revoke", ['reason' => 'x'])
            ->assertRedirect('/login');

        $this->actingAs($this->userOf('applicant'))
            ->post("/admin/certificates/{$certificate->id}/revoke", ['reason' => 'x'])
            ->assertForbidden();

        $this->actingAs($this->userOf('admin'))
            ->from('/certificates')
            ->post("/admin/certificates/{$certificate->id}/revoke", [])
            ->assertRedirect('/certificates')
            ->assertSessionHasErrors('reason');

        $this->assertNull($certificate->fresh()->revoked_at);
    }

    public function test_the_administrator_can_revoke_too(): void
    {
        $certificate = $this->issued();

        $this->actingAs($this->userOf('super_admin'))
            ->post("/super-admin/certificates/{$certificate->id}/revoke", ['reason' => 'Superseded'])
            ->assertRedirect();

        $this->assertNotNull($certificate->fresh()->revoked_at);
    }

    public function test_the_printed_sheet_carries_the_code_once_the_certificate_exists(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'approved', $officer);

        // Approved but not yet paid: no certificate, so nothing to print as a QR.
        $this->assertNull(ApplicationDocuments::issuance($request->fresh())['verification']);

        $certificate = Certificate::create([
            'request_id' => $request->id,
            'certificate_number' => 'CERT-2026-00002',
            'status' => 'ready_for_pickup',
            'issued_at' => now(),
            'valid_until' => now()->addYear(),
        ]);

        $verification = ApplicationDocuments::issuance($request->fresh())['verification'];
        $this->assertSame($certificate->verification_code, $verification['code']);
        $this->assertSame($certificate->verificationUrl(), $verification['url']);
        $this->assertSame(now()->addYear()->toDateString(), $verification['valid_until']);

        // The officer's Generate Certificate page and the applicant's own copy both carry it.
        $this->actingAs($officer)
            ->withSession(['clean_page.generate-certificate' => $request->id])
            ->get('/generate-certificate')
            ->assertInertia(fn (Assert $page) => $page
                ->where('application.verification.code', $certificate->verification_code));

        $request->update(['released_to_applicant_at' => now()]);
        $this->actingAs($applicant)->get("/my-applications/{$request->id}/print-certificate")
            ->assertInertia(fn (Assert $page) => $page
                ->where('application.verification.code', $certificate->verification_code));
    }

    public function test_recording_a_payment_sets_the_validity_period(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'approved', $officer);
        $payment = Payment::where('request_id', $request->id)->firstOrFail();

        $certificate = $this->actingAs($officer)
            ->app->make(\App\Services\CertificateService::class)
            ->autoCreateFromPayment($payment);

        $this->assertNotNull($certificate->verification_code);
        $this->assertSame(now()->addMonths(12)->toDateString(), $certificate->valid_until->toDateString());
    }

    /**
     * Regression: autoCreateFromPayment used to read "no certificate yet"
     * and generate the next number outside any lock, so two calls for the
     * same request racing each other could both pass that check and both
     * insert - one certificate silently orphaned, or a 500 from the unique
     * certificate_number index. Certificate::underIssuanceLock now wraps the
     * whole read-then-write section; calling it twice in a row (the
     * sequential case a single PHPUnit process can actually exercise) must
     * return the same certificate, not create a second one.
     */
    public function test_autocreating_a_certificate_twice_for_the_same_request_is_idempotent(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'approved', $officer);
        $payment = Payment::where('request_id', $request->id)->firstOrFail();

        $service = $this->actingAs($officer)->app->make(\App\Services\CertificateService::class);
        $first = $service->autoCreateFromPayment($payment);
        $second = $service->autoCreateFromPayment($payment->fresh());

        $this->assertSame($first->id, $second->id);
        $this->assertSame($first->certificate_number, $second->certificate_number);
        $this->assertSame(1, Certificate::where('request_id', $request->id)->count());
    }
}
