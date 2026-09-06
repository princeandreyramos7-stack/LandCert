<?php

namespace App\Console\Commands;

use App\Models\Applicant;
use App\Models\Location;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Request as RequestModel;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;

/**
 * Command to verify payment notification functionality
 * This demonstrates that the notification system works correctly per FR8.1 and FR8.2
 */
class VerifyPaymentNotification extends Command
{
    protected $signature = 'verify:payment-notification';
    protected $description = 'Verify that payment notifications are created correctly with all required details';

    public function handle()
    {
        $this->info('=== Payment Notification Verification (Task 6.3) ===');
        $this->newLine();

        // Get any request with an applicant
        $request = RequestModel::with(['user', 'applicant'])
            ->whereHas('user')
            ->whereHas('applicant')
            ->first();
        
        if (!$request) {
            $this->error('No requests found with applicant data. Please seed the database first.');
            return 1;
        }

        $applicant = $request->user;

        $this->info('Using applicant: ' . $applicant->name);
        $this->info('Request ID: ' . $request->id);
        $this->newLine();

        // Create a test payment
        $payment = new Payment([
            'request_id' => $request->id,
            'amount' => 500.00,
            'payment_method' => 'cash',
            'receipt_number' => 'OR-VERIFY-' . time(),
            'payment_date' => now()->format('Y-m-d'),
            'payment_status' => 'verified',
        ]);

        $admin = User::where('user_type', 'admin')->first();
        
        $this->info('Creating notification using NotificationService::paymentVerified()...');
        $this->newLine();

        // Call the notification service
        NotificationService::paymentVerified($request, $payment, $admin);

        // Retrieve the created notification
        $notification = Notification::where('user_id', $applicant->id)
            ->where('type', 'payment_verified')
            ->latest()
            ->first();

        if ($notification) {
            $this->info('✅ SUCCESS: Notification created successfully!');
            $this->newLine();
            
            $this->table(
                ['Field', 'Value'],
                [
                    ['User ID', $notification->user_id],
                    ['Type', $notification->type],
                    ['Title', $notification->title],
                    ['Message', $notification->message],
                    ['Link', $notification->link],
                    ['Read', $notification->read ? 'Yes' : 'No'],
                ]
            );
            
            $this->newLine();
            $this->info('📋 FR8.2 Validation - Required Details in Message:');
            
            $message = $notification->message;
            $hasOR = str_contains($message, 'OR:');
            $hasAmount = str_contains($message, '₱') || str_contains($message, 'Amount:');
            $hasDate = str_contains($message, 'Date:');
            $hasNextSteps = str_contains($message, 'certificate will be processed');
            
            $this->line('  ✓ OR Number: ' . ($hasOR ? 'PRESENT' : 'MISSING'));
            $this->line('  ✓ Amount: ' . ($hasAmount ? 'PRESENT' : 'MISSING'));
            $this->line('  ✓ Date: ' . ($hasDate ? 'PRESENT' : 'MISSING'));
            $this->line('  ✓ Next Steps: ' . ($hasNextSteps ? 'PRESENT' : 'MISSING'));
            
            $this->newLine();
            $this->info('📦 Notification Data Array:');
            foreach ($notification->data as $key => $value) {
                $this->line("  - {$key}: {$value}");
            }
            
            $this->newLine();
            
            if ($hasOR && $hasAmount && $hasDate && $hasNextSteps) {
                $this->info('✅ All FR8.2 requirements met!');
            } else {
                $this->error('❌ Some FR8.2 requirements are missing!');
            }
            
            return 0;
        } else {
            $this->error('❌ FAILED: Notification was not created!');
            return 1;
        }
    }
}
