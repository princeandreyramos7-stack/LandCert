<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Payment;
use App\Models\Request as ApplicationRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPaymentShowTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that admin can view payment details page.
     */
    public function test_admin_can_view_payment_details(): void
    {
        // Create an admin user
        $admin = User::factory()->create([
            'user_type' => 'admin',
            'email' => 'admin@test.com',
        ]);

        // Create a request
        $request = ApplicationRequest::factory()->create([
            'applicant_name' => 'Test Applicant',
            'status' => 'approved',
        ]);

        // Create a payment
        $payment = Payment::factory()->create([
            'request_id' => $request->id,
            'amount' => 500.00,
            'payment_method' => 'cash',
            'receipt_number' => 'OR-2026-12345',
            'payment_date' => now(),
            'payment_status' => 'verified',
            'verified_by' => $admin->id,
            'verified_at' => now(),
        ]);

        // Act as admin and visit the payment details page
        $response = $this->actingAs($admin)->get(route('admin.payments.show', $payment->id));

        // Assert the page loads successfully
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/Show')
            ->has('payment')
            ->where('payment.id', $payment->id)
            ->where('payment.receipt_number', 'OR-2026-12345')
        );
    }

    /**
     * Test that non-admin users cannot view payment details page.
     */
    public function test_non_admin_cannot_view_payment_details(): void
    {
        // Create a regular user
        $user = User::factory()->create([
            'user_type' => 'user',
            'email' => 'user@test.com',
        ]);

        // Create a request
        $request = ApplicationRequest::factory()->create();

        // Create a payment
        $payment = Payment::factory()->create([
            'request_id' => $request->id,
        ]);

        // Act as regular user and try to visit the payment details page
        $response = $this->actingAs($user)->get(route('admin.payments.show', $payment->id));

        // Assert access is forbidden
        $response->assertStatus(403);
    }

    /**
     * Test that payment details include related request information.
     */
    public function test_payment_details_include_request_information(): void
    {
        // Create an admin user
        $admin = User::factory()->create([
            'user_type' => 'admin',
        ]);

        // Create a request with specific data
        $request = ApplicationRequest::factory()->create([
            'applicant_name' => 'Juan Dela Cruz',
            'project_type' => 'Zoning Clearance',
        ]);

        // Create a payment
        $payment = Payment::factory()->create([
            'request_id' => $request->id,
            'amount' => 750.50,
        ]);

        // Act as admin and visit the payment details page
        $response = $this->actingAs($admin)->get(route('admin.payments.show', $payment->id));

        // Assert the page includes request information
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/Show')
            ->has('payment.request')
            ->where('payment.request.applicant_name', 'Juan Dela Cruz')
            ->where('payment.request.project_type', 'Zoning Clearance')
        );
    }

    /**
     * Test that verified payment details include verifier information.
     */
    public function test_verified_payment_includes_verifier_info(): void
    {
        // Create an admin user
        $admin = User::factory()->create([
            'user_type' => 'admin',
            'name' => 'Admin Verifier',
        ]);

        // Create a request
        $request = ApplicationRequest::factory()->create();

        // Create a verified payment
        $payment = Payment::factory()->create([
            'request_id' => $request->id,
            'payment_status' => 'verified',
            'verified_by' => $admin->id,
            'verified_at' => now(),
        ]);

        // Act as admin and visit the payment details page
        $response = $this->actingAs($admin)->get(route('admin.payments.show', $payment->id));

        // Assert verifier information is included
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Payments/Show')
            ->has('payment.verifiedByUser')
            ->where('payment.verifiedByUser.name', 'Admin Verifier')
        );
    }
}
