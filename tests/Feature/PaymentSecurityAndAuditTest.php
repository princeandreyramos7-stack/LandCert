<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Payment;
use App\Models\Request as ApplicationRequest;
use App\Models\Applicant;
use App\Models\Project;
use App\Models\Location;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Test Suite for Tasks 9.1, 9.2, 9.3:
 * - Task 9.1: Authorization checks for payment routes
 * - Task 9.2: Audit trail for payment actions
 * - Task 9.3: Secure file upload handling
 */
class PaymentSecurityAndAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $superAdmin;
    protected User $regularUser;
    protected ApplicationRequest $testRequest;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->admin = User::factory()->create([
            'user_type' => 'admin',
            'role' => 'admin'
        ]);

        $this->superAdmin = User::factory()->create([
            'user_type' => 'super_admin',
            'role' => 'super_admin'
        ]);

        $this->regularUser = User::factory()->create([
            'user_type' => 'user',
            'role' => 'user'
        ]);

        // Create test data
        $applicant = Applicant::factory()->create();
        $project = Project::factory()->create();
        $location = Location::factory()->create();

        $this->testRequest = ApplicationRequest::factory()->create([
            'applicant_id' => $applicant->id,
            'project_id' => $project->id,
            'location_id' => $location->id,
            'user_id' => $this->regularUser->id,
            'status' => 'approved'
        ]);

        Storage::fake('local');
    }

    // ========================================
    // Task 9.1: Authorization Tests
    // ========================================

    /** @test */
    public function test_regular_user_cannot_access_pending_payments_route()
    {
        $this->actingAs($this->regularUser);

        $response = $this->get(route('admin.payments.pending'));

        $response->assertStatus(403);
        $response->assertSee('Unauthorized action');
    }

    /** @test */
    public function test_admin_can_access_pending_payments_route()
    {
        $this->actingAs($this->admin);

        $response = $this->get(route('admin.payments.pending'));

        $response->assertStatus(200);
    }

    /** @test */
    public function test_super_admin_can_access_pending_payments_route()
    {
        $this->actingAs($this->superAdmin);

        $response = $this->get(route('super-admin.payments.pending'));

        $response->assertStatus(200);
    }

    /** @test */
    public function test_regular_user_cannot_record_payment()
    {
        $this->actingAs($this->regularUser);

        $response = $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-12345',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function test_admin_can_record_payment()
    {
        $this->actingAs($this->admin);

        $response = $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-12345',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
            'notes' => 'Test payment recording'
        ]);

        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
    }

    /** @test */
    public function test_regular_user_cannot_check_duplicate_payments()
    {
        $this->actingAs($this->regularUser);

        $response = $this->postJson(route('admin.payments.check-duplicate'), [
            'receipt_number' => 'OR-2026-12345'
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function test_admin_can_check_duplicate_payments()
    {
        $this->actingAs($this->admin);

        $response = $this->postJson(route('admin.payments.check-duplicate'), [
            'receipt_number' => 'OR-2026-12345'
        ]);

        $response->assertStatus(200);
    }

    /** @test */
    public function test_regular_user_cannot_access_payment_history()
    {
        $this->actingAs($this->regularUser);

        $response = $this->get(route('admin.payments.history'));

        $response->assertStatus(403);
    }

    /** @test */
    public function test_admin_can_access_payment_history()
    {
        $this->actingAs($this->admin);

        $response = $this->get(route('admin.payments.history'));

        $response->assertStatus(200);
    }

    /** @test */
    public function test_regular_user_cannot_view_payment_details()
    {
        $payment = Payment::factory()->create([
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-TEST',
            'amount' => 500.00,
            'payment_status' => 'verified'
        ]);

        $this->actingAs($this->regularUser);

        $response = $this->get(route('admin.payments.show', $payment->id));

        $response->assertStatus(403);
    }

    /** @test */
    public function test_admin_can_view_payment_details()
    {
        $payment = Payment::factory()->create([
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-TEST',
            'amount' => 500.00,
            'payment_status' => 'verified'
        ]);

        $this->actingAs($this->admin);

        $response = $this->get(route('admin.payments.show', $payment->id));

        $response->assertStatus(200);
    }

    // ========================================
    // Task 9.2: Audit Logging Tests
    // ========================================

    /** @test */
    public function test_payment_recording_creates_audit_log()
    {
        $this->actingAs($this->admin);

        $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-AUDIT',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
            'notes' => 'Audit log test'
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payment_recorded',
            'user_id' => $this->admin->id,
            'model_type' => 'Payment',
        ]);

        $log = AuditLog::where('action', 'payment_recorded')
            ->where('user_id', $this->admin->id)
            ->latest()
            ->first();

        $this->assertNotNull($log);
        $this->assertStringContainsString('OR-2026-AUDIT', $log->description);
        $this->assertNotNull($log->ip_address);
        $this->assertNotNull($log->user_agent);
    }

    /** @test */
    public function test_payment_verification_creates_audit_log()
    {
        $payment = Payment::factory()->create([
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-VERIFY',
            'amount' => 500.00,
            'payment_status' => 'pending'
        ]);

        $this->actingAs($this->admin);

        $this->post(route('admin.payments.verify', $payment->id));

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payment_verified',
            'user_id' => $this->admin->id,
            'model_id' => $payment->id,
            'model_type' => 'Payment',
        ]);
    }

    /** @test */
    public function test_payment_denial_creates_audit_log()
    {
        $payment = Payment::factory()->create([
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-DENY',
            'amount' => 500.00,
            'payment_status' => 'pending'
        ]);

        $this->actingAs($this->admin);

        $this->post(route('admin.payments.reject', $payment->id), [
            'rejection_reason' => 'Invalid receipt'
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payment_rejected',
            'user_id' => $this->admin->id,
            'model_id' => $payment->id,
            'model_type' => 'Payment',
        ]);

        $log = AuditLog::where('action', 'payment_rejected')
            ->where('model_id', $payment->id)
            ->latest()
            ->first();

        $this->assertStringContainsString('Invalid receipt', $log->description);
    }

    /** @test */
    public function test_audit_log_includes_ip_address_and_timestamp()
    {
        $this->actingAs($this->admin);

        $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-IP',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
        ]);

        $log = AuditLog::where('action', 'payment_recorded')->latest()->first();

        $this->assertNotNull($log->ip_address);
        $this->assertNotNull($log->created_at);
        $this->assertIsString($log->ip_address);
    }

    // ========================================
    // Task 9.3: Secure File Upload Tests
    // ========================================

    /** @test */
    public function test_only_allowed_file_types_can_be_uploaded()
    {
        $this->actingAs($this->admin);

        // Test valid file types
        $validFiles = ['jpg', 'jpeg', 'png', 'pdf'];
        foreach ($validFiles as $extension) {
            $file = UploadedFile::fake()->create("receipt.$extension", 100);
            
            $response = $this->postJson(route('admin.payments.record'), [
                'request_id' => $this->testRequest->id,
                'receipt_number' => "OR-2026-$extension",
                'amount' => 500.00,
                'payment_date' => now()->format('Y-m-d'),
                'payment_method' => 'cash',
                'receipt_file' => $file
            ]);

            $response->assertStatus(200);
        }

        // Test invalid file type
        $invalidFile = UploadedFile::fake()->create('receipt.exe', 100);
        
        $response = $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-INVALID',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
            'receipt_file' => $invalidFile
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('receipt_file');
    }

    /** @test */
    public function test_file_size_limit_is_enforced()
    {
        $this->actingAs($this->admin);

        // Test file exceeding 2MB limit
        $largeFile = UploadedFile::fake()->create('receipt.pdf', 3000); // 3MB

        $response = $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-LARGE',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
            'receipt_file' => $largeFile
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('receipt_file');
    }

    /** @test */
    public function test_uploaded_files_have_unique_filenames()
    {
        $this->actingAs($this->admin);

        $file1 = UploadedFile::fake()->image('receipt.jpg');
        $file2 = UploadedFile::fake()->image('receipt.jpg');

        // Upload first file
        $response1 = $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-UNIQUE-1',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
            'receipt_file' => $file1
        ]);

        $payment1 = Payment::where('receipt_number', 'OR-2026-UNIQUE-1')->first();

        // Upload second file
        $response2 = $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-UNIQUE-2',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
            'receipt_file' => $file2
        ]);

        $payment2 = Payment::where('receipt_number', 'OR-2026-UNIQUE-2')->first();

        // Verify filenames are unique
        $this->assertNotEquals($payment1->receipt_file_path, $payment2->receipt_file_path);
        $this->assertStringContainsString('receipt_', $payment1->receipt_file_path);
        $this->assertStringContainsString('receipt_', $payment2->receipt_file_path);
    }

    /** @test */
    public function test_files_are_stored_in_receipts_directory()
    {
        $this->actingAs($this->admin);

        $file = UploadedFile::fake()->image('receipt.jpg');

        $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-STORAGE',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
            'receipt_file' => $file
        ]);

        $payment = Payment::where('receipt_number', 'OR-2026-STORAGE')->first();

        $this->assertNotNull($payment->receipt_file_path);
        $this->assertStringStartsWith('receipts/', $payment->receipt_file_path);
        Storage::disk('local')->assertExists($payment->receipt_file_path);
    }

    /** @test */
    public function test_payment_can_be_recorded_without_file_upload()
    {
        $this->actingAs($this->admin);

        $response = $this->postJson(route('admin.payments.record'), [
            'request_id' => $this->testRequest->id,
            'receipt_number' => 'OR-2026-NO-FILE',
            'amount' => 500.00,
            'payment_date' => now()->format('Y-m-d'),
            'payment_method' => 'cash',
        ]);

        $response->assertStatus(200);

        $payment = Payment::where('receipt_number', 'OR-2026-NO-FILE')->first();
        $this->assertNull($payment->receipt_file_path);
    }
}
