<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Location;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Request as RequestModel;
use App\Models\User;
use App\Services\NotificationService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test suite for payment notification functionality
 * Validates FR8.1 and FR8.2: In-app notifications for payment confirmation
 */
class PaymentNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $applicant;
    protected RequestModel $request;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::factory()->create([
            'user_type' => 'admin',
            'name' => 'Test Admin',
            'email' => 'admin@test.com',
        ]);

        // Create applicant user
        $this->applicant = User::factory()->create([
            'user_type' => 'applicant',
            'name' => 'Test Applicant',
            'email' => 'applicant@test.com',
        ]);

        // Create related models
        $applicantModel = Applicant::factory()->create([
            'user_id' => $this->applicant->id,
            'applicant_name' => 'Test Applicant Name',
        ]);

        $project = Project::factory()->create([
            'user_id' => $this->applicant->id,
            'project_type' => 'Zoning Clearance',
        ]);

        $location = Location::factory()->create([
            'user_id' => $this->applicant->id,
        ]);

        // Create approved request
        $this->request = RequestModel::factory()->create([
            'user_id' => $this->applicant->id,
            'applicant_id' => $applicantModel->id,
            'project_id' => $project->id,
            'location_id' => $location->id,
            'status' => 'approved',
        ]);
    }

    /**
     * Test that in-app notification is created when payment is verified
     * Validates FR8.1: In-app notification sent to applicant
     */
    public function test_in_app_notification_created_on_payment_verification(): void
    {
        $this->actingAs($this->admin);

        // Create payment
        $payment = Payment::factory()->create([
            'request_id' => $this->request->id,
            'amount' => 500.00,
            'payment_method' => 'cash',
            'receipt_number' => 'OR-2026-12345',
            'payment_date' => now()->format('Y-m-d'),
            'payment_status' => 'verified',
            'verified_by' => $this->admin->id,
            'verified_at' => now(),
        ]);

        // Call the notification service directly
        NotificationService::paymentVerified($this->request, $payment, $this->admin);

        // Assert notification was created for the applicant
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->applicant->id,
            'type' => 'payment_verified',
            'title' => 'Payment Confirmed ✓',
        ]);

        // Get the notification and verify the content
        $notification = Notification::where('user_id', $this->applicant->id)
            ->where('type', 'payment_verified')
            ->first();

        $this->assertNotNull($notification);
        $this->assertStringContainsString('OR-2026-12345', $notification->message);
        $this->assertStringContainsString('500.00', $notification->message);
        $this->assertEquals('/my-applications', $notification->link);
    }

    /**
     * Test that notification includes all required details
     * Validates FR8.2: Notification includes OR Number, Amount, Date, Next steps
     */
    public function test_notification_includes_all_required_payment_details(): void
    {
        $this->actingAs($this->admin);

        $paymentDate = '2026-08-13';
        
        // Create payment with specific details
        $payment = Payment::factory()->create([
            'request_id' => $this->request->id,
            'amount' => 750.50,
            'payment_method' => 'bank_transfer',
            'receipt_number' => 'OR-2026-99999',
            'payment_date' => $paymentDate,
            'payment_status' => 'verified',
            'verified_by' => $this->admin->id,
            'verified_at' => now(),
        ]);

        // Call the notification service
        NotificationService::paymentVerified($this->request, $payment, $this->admin);

        // Get the notification
        $notification = Notification::where('user_id', $this->applicant->id)
            ->where('type', 'payment_verified')
            ->first();

        $this->assertNotNull($notification);

        // FR8.2: Verify OR Number is in message
        $this->assertStringContainsString('OR-2026-99999', $notification->message);

        // FR8.2: Verify Amount is in message
        $this->assertStringContainsString('750.50', $notification->message);

        // FR8.2: Verify Date is in message
        $this->assertStringContainsString($paymentDate, $notification->message);

        // FR8.2: Verify Next steps information is in message
        $this->assertStringContainsString('certificate will be processed', $notification->message);

        // Verify data array includes all details
        $this->assertEquals($this->request->id, $notification->data['application_id']);
        $this->assertEquals($payment->id, $notification->data['payment_id']);
        $this->assertEquals('OR-2026-99999', $notification->data['receipt_number']);
        $this->assertEquals(750.50, $notification->data['amount']);
        $this->assertEquals($paymentDate, $notification->data['payment_date']);
        $this->assertEquals('Test Admin', $notification->data['verified_by']);
    }

    /**
     * Test that PaymentService calls NotificationService correctly
     * Validates the integration between services
     */
    public function test_payment_service_creates_notification_on_record_payment(): void
    {
        $this->actingAs($this->admin);

        // Ensure no notifications exist initially
        $this->assertEquals(0, Notification::count());

        // Use PaymentService to record payment
        $paymentService = new PaymentService();
        $payment = $paymentService->recordPayment($this->request, [
            'amount' => 500.00,
            'payment_method' => 'cash',
            'receipt_number' => 'OR-TEST-123',
            'payment_date' => now()->format('Y-m-d'),
            'notes' => 'Test payment',
        ]);

        // Assert notification was created
        $this->assertDatabaseHas('notifications', [
            'user_id' => $this->applicant->id,
            'type' => 'payment_verified',
        ]);

        // Verify notification count
        $this->assertEquals(1, Notification::where('user_id', $this->applicant->id)->count());
    }

    /**
     * Test that notification is marked as unread initially
     */
    public function test_notification_is_unread_initially(): void
    {
        $this->actingAs($this->admin);

        $payment = Payment::factory()->create([
            'request_id' => $this->request->id,
            'amount' => 500.00,
            'receipt_number' => 'OR-TEST-456',
            'payment_status' => 'verified',
        ]);

        NotificationService::paymentVerified($this->request, $payment, $this->admin);

        $notification = Notification::where('user_id', $this->applicant->id)->first();

        $this->assertFalse($notification->read);
        $this->assertNull($notification->read_at);
    }

    /**
     * Test notification with null verified_by user
     */
    public function test_notification_with_null_verified_by(): void
    {
        $payment = Payment::factory()->create([
            'request_id' => $this->request->id,
            'amount' => 500.00,
            'receipt_number' => 'OR-TEST-789',
            'payment_status' => 'verified',
        ]);

        // Call without verified_by user
        NotificationService::paymentVerified($this->request, $payment, null);

        $notification = Notification::where('user_id', $this->applicant->id)->first();

        $this->assertNotNull($notification);
        $this->assertStringContainsString('Admin', $notification->message);
        $this->assertEquals('Admin', $notification->data['verified_by']);
    }
}
