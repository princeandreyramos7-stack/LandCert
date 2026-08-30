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
 * Flow rule: the Zoning Officer reviewing an application is NOT enough to pay.
 * The Zoning Administrator must approve first.
 *
 *   pending  -> officer reviews -> reviewed  (waiting for approval, CANNOT pay)
 *            -> administrator approves -> approved (CAN pay)
 */
class PaymentRequiresApprovalTest extends TestCase
{
    use RefreshDatabase;

    private function applicationWithStatus(User $owner, string $status, float $fee = 7200): RequestModel
    {
        $applicant = Applicant::create([
            'applicant_name' => 'Flow Test',
            'applicant_address' => '1 Test Street',
            'applicant_type' => 'individual',
        ]);

        $request = RequestModel::create([
            'user_id' => $owner->id,
            'applicant_id' => $applicant->id,
            'status' => $status,
            'application_number' => 'TPZ-FLOW-0001',
        ]);

        Report::create([
            'request_id' => $request->id,
            'evaluation' => $status === 'approved' ? 'approved' : 'reviewed',
            'payment_amount' => $fee,
        ]);

        return $request;
    }

    private function payload(RequestModel $request): array
    {
        return [
            'request_id' => $request->id,
            'or_number' => 'OR-2026-0001',
            'payment_method' => 'cash',
            'payment_date' => now()->toDateString(),
            'receipt' => UploadedFile::fake()->create('receipt.jpg', 40, 'image/jpeg'),
        ];
    }

    public function test_reviewed_application_cannot_be_paid(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $request = $this->applicationWithStatus($user, 'reviewed');

        $this->actingAs($user)
            ->postJson('/payments', $this->payload($request))
            ->assertStatus(403);

        $this->assertDatabaseCount('payments', 0);
    }

    public function test_approved_application_can_be_paid(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $request = $this->applicationWithStatus($user, 'approved');

        $this->actingAs($user)
            ->postJson('/payments', $this->payload($request))
            ->assertCreated();

        $payment = Payment::where('request_id', $request->id)->first();
        $this->assertNotNull($payment);
        $this->assertSame('pending', $payment->payment_status);
        $this->assertEquals(7200, (float) $payment->amount);
    }

    public function test_record_payment_page_is_blocked_while_awaiting_approval(): void
    {
        $user = User::factory()->create(['user_type' => 'applicant']);
        $request = $this->applicationWithStatus($user, 'reviewed');

        $this->actingAs($user)
            ->get("/receipt/upload/{$request->id}")
            ->assertRedirect(route('my-applications'))
            ->assertSessionHas('error');
    }

    public function test_order_of_payment_is_blocked_while_awaiting_approval(): void
    {
        $user = User::factory()->create(['user_type' => 'applicant']);
        $request = $this->applicationWithStatus($user, 'reviewed');

        $this->actingAs($user)
            ->from(route('my-applications'))
            ->get("/my-applications/{$request->id}/order-of-payment")
            ->assertRedirect()
            ->assertSessionHas('error');
    }

    public function test_order_of_payment_is_available_once_approved(): void
    {
        $user = User::factory()->create(['user_type' => 'applicant']);
        $request = $this->applicationWithStatus($user, 'approved');

        $this->actingAs($user)
            ->get("/my-applications/{$request->id}/order-of-payment")
            ->assertOk();
    }
}
