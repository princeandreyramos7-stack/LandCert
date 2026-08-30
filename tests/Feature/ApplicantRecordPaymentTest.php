<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Payment;
use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * From "For Payment" (reviewed) the applicant can record their Treasury payment:
 * the fee is fixed by the officer, and the applicant supplies the OR number.
 */
class ApplicantRecordPaymentTest extends TestCase
{
    use RefreshDatabase;

    private function reviewedApplication(User $owner, float $fee = 7200): RequestModel
    {
        $applicant = Applicant::create([
            'applicant_name' => 'Test Applicant',
            'applicant_address' => '1 Test Street',
            'applicant_type' => 'individual',
        ]);

        $request = RequestModel::create([
            'user_id' => $owner->id,
            'applicant_id' => $applicant->id,
            'status' => 'reviewed',
            'application_number' => 'TPZ-TEST-0001',
        ]);

        Report::create([
            'request_id' => $request->id,
            'evaluation' => 'reviewed',
            'payment_amount' => $fee,
        ]);

        return $request;
    }

    public function test_applicant_records_payment_with_or_number_at_for_payment(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $request = $this->reviewedApplication($user, 7200);

        $this->actingAs($user)
            ->postJson('/payments', [
                'request_id' => $request->id,
                'or_number' => 'OR-2026-004521',
                'amount' => 1, // deliberately wrong — the officer fee must win
                'payment_method' => 'cash',
                'payment_date' => now()->toDateString(),
                'receipt' => UploadedFile::fake()->create('receipt.jpg', 40, 'image/jpeg'),
            ])
            ->assertCreated();

        $payment = Payment::where('request_id', $request->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame('OR-2026-004521', $payment->receipt_number);
        $this->assertEquals(7200, (float) $payment->amount);
        $this->assertSame('pending', $payment->payment_status);
        $this->assertSame($user->id, $payment->user_id);
    }

    public function test_or_number_is_required(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $request = $this->reviewedApplication($user);

        $this->actingAs($user)
            ->postJson('/payments', [
                'request_id' => $request->id,
                'payment_method' => 'cash',
                'payment_date' => now()->toDateString(),
                'receipt' => UploadedFile::fake()->create('receipt.jpg', 40, 'image/jpeg'),
            ])
            ->assertJsonValidationErrors('or_number');
    }

    public function test_cannot_record_payment_before_review(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $request = $this->reviewedApplication($user);
        $request->update(['status' => 'pending']);

        $this->actingAs($user)
            ->postJson('/payments', [
                'request_id' => $request->id,
                'or_number' => 'OR-1',
                'payment_method' => 'cash',
                'payment_date' => now()->toDateString(),
                'receipt' => UploadedFile::fake()->create('receipt.jpg', 40, 'image/jpeg'),
            ])
            ->assertStatus(403);

        $this->assertDatabaseCount('payments', 0);
    }
}
