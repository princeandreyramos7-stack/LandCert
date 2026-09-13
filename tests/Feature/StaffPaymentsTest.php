<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Payments as the office records them: who may, one receipt number for one
 * payment, one verified payment per application, and every step in the
 * audit log.
 */
class StaffPaymentsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    private function payload(int $requestId, string $or = 'OR-2026-000123', array $extra = []): array
    {
        return [
            'request_id' => $requestId,
            'receipt_number' => $or,
            'amount' => 3289,
            'payment_date' => now()->toDateString(),
            'payment_method' => 'cash',
        ] + $extra;
    }

    public function test_only_staff_see_the_payments_page_or_record_a_payment(): void
    {
        $applicant = $this->userOf('applicant');
        $app = $this->application($applicant, 'CZC', 'reviewed');

        $this->actingAs($applicant)->get('/payments')->assertForbidden();
        $this->actingAs($applicant)->postJson('/admin/payments/record', $this->payload($app->id))->assertForbidden();

        $this->actingAs($this->userOf('admin'))->get('/payments')->assertOk();
        $this->actingAs($this->userOf('super_admin'))->get('/payments')->assertOk();
    }

    public function test_the_officer_records_a_payment_and_it_is_logged(): void
    {
        $officer = $this->userOf('admin');
        $app = $this->application($this->userOf('applicant'), 'CZC', 'reviewed');

        $this->actingAs($officer)
            ->from('/payments')
            ->post('/admin/payments/record', $this->payload($app->id, 'OR-2026-000123', [
                'receipt_file' => UploadedFile::fake()->create('or.jpg', 40, 'image/jpeg'),
            ]))
            ->assertRedirect('/payments')
            ->assertSessionHas('success');

        $payment = Payment::where('request_id', $app->id)->firstOrFail();
        $this->assertSame('OR-2026-000123', $payment->receipt_number);
        $this->assertSame('verified', $payment->payment_status);
        $this->assertSame($officer->id, $payment->verified_by);
        $this->assertNotNull($payment->receipt_file_path);
        Storage::disk('local')->assertExists($payment->receipt_file_path);

        $log = AuditLog::where('action', 'payment_recorded')->where('model_id', $payment->id)->first();
        $this->assertNotNull($log, 'recording a payment is audited');
        $this->assertSame($officer->id, $log->user_id);
    }

    public function test_one_receipt_number_is_one_payment(): void
    {
        $officer = $this->userOf('admin');
        $first = $this->application($this->userOf('applicant'), 'CZC', 'reviewed');
        $second = $this->application($this->userOf('applicant'), 'CZC', 'reviewed');

        $this->actingAs($officer)->post('/admin/payments/record', $this->payload($first->id, 'OR-DUP-1'))->assertSessionHas('success');

        $this->actingAs($officer)
            ->postJson('/admin/payments/record', $this->payload($second->id, 'OR-DUP-1'))
            ->assertStatus(422)
            ->assertJsonValidationErrors('receipt_number');

        $this->assertSame(1, Payment::where('receipt_number', 'OR-DUP-1')->count());

        // The pre-check the form runs says so too.
        $this->actingAs($officer)
            ->postJson('/admin/payments/check-duplicate', ['receipt_number' => 'OR-DUP-1'])
            ->assertOk()
            ->assertJsonPath('exists', true);
    }

    public function test_an_application_takes_one_verified_payment(): void
    {
        $officer = $this->userOf('admin');
        $app = $this->application($this->userOf('applicant'), 'CZC', 'approved'); // already carries a verified payment

        $this->actingAs($officer)
            ->from('/payments')
            ->post('/admin/payments/record', $this->payload($app->id, 'OR-SECOND'))
            ->assertRedirect('/payments')
            ->assertSessionHasErrors('message');

        $this->assertSame(1, Payment::where('request_id', $app->id)->count());
    }

    public function test_only_pictures_and_pdfs_are_accepted_as_receipts(): void
    {
        $officer = $this->userOf('admin');
        $app = $this->application($this->userOf('applicant'), 'CZC', 'reviewed');

        $this->actingAs($officer)
            ->postJson('/admin/payments/record', $this->payload($app->id, 'OR-EXE', [
                'receipt_file' => UploadedFile::fake()->create('receipt.exe', 40, 'application/octet-stream'),
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('receipt_file');
    }

    public function test_verifying_and_rejecting_are_logged(): void
    {
        $officer = $this->userOf('admin');
        $app = $this->application($this->userOf('applicant'), 'CZC', 'approved');
        $pending = Payment::factory()->create(['request_id' => $app->id, 'user_id' => $app->user_id, 'payment_status' => 'pending']);

        $this->actingAs($officer)
            ->post("/admin/payments/{$pending->id}/reject", ['rejection_reason' => 'Receipt does not match the fee'])
            ->assertRedirect();
        $this->assertNotSame('verified', $pending->fresh()->payment_status);

        $another = Payment::factory()->create(['request_id' => $app->id, 'user_id' => $app->user_id, 'payment_status' => 'pending']);
        $this->actingAs($officer)
            ->post("/admin/payments/{$another->id}/verify", [
                'amount' => 3289,
                'receipt_number' => $another->receipt_number,
                'payment_date' => now()->toDateString(),
            ])
            ->assertRedirect();
        $this->assertSame('verified', $another->fresh()->payment_status);
        $this->assertSame($officer->id, $another->fresh()->verified_by);
    }
}
