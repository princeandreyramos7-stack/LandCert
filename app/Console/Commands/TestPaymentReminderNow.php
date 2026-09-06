<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request as RequestModel;
use App\Models\Reminder;
use App\Services\ReminderService;
use App\Mail\PaymentDueReminder;
use Illuminate\Support\Facades\Mail;

class TestPaymentReminderNow extends Command
{
    protected $signature = 'test:payment-reminder-now {request_id?}';
    protected $description = 'Test payment reminder email by sending it immediately';

    public function handle()
    {
        $this->info('🧪 Testing Payment Reminder Email (Immediate Send)...');
        $this->newLine();

        $requestId = $this->argument('request_id');
        
        if (!$requestId) {
            // Find an approved request. Reports link straight to the request
            // now, so this no longer has to match applicants by name.
            $request = RequestModel::whereNotNull('user_id')
                ->whereHas('report', fn ($q) => $q->where('evaluation', 'approved'))
                ->with('user')
                ->first();
                
            if (!$request) {
                $this->error('❌ No approved requests found. Please approve a request first.');
                return 1;
            }
            
            $requestId = $request->id;
        } else {
            $request = RequestModel::with('user')->find($requestId);
            if (!$request) {
                $this->error("❌ Request #{$requestId} not found.");
                return 1;
            }
        }

        $this->info("📋 Request ID: #{$requestId}");
        $this->info("👤 Applicant: {$request->applicant_name}");
        $this->info("📧 Email: {$request->user->email}");
        $this->newLine();

        // Create a test reminder (scheduled for now)
        try {
            $reminder = Reminder::create([
                'user_id' => $request->user_id,
                'type' => 'payment_due',
                'related_id' => $request->id,
                'related_type' => 'App\Models\Request',
                'scheduled_at' => now(),
                'message' => 'Your payment is due. Please submit your payment receipt.',
                'metadata' => ['days' => 3],
                'status' => 'pending',
            ]);

            $this->info('✅ Test reminder created');
            $this->newLine();

            // Send the email
            $this->info('📧 Sending email...');
            Mail::to($request->user->email)->send(new PaymentDueReminder($reminder));
            
            // Mark as sent
            $reminder->markAsSent();
            
            $this->newLine();
            $this->info('✅ Email sent successfully!');
            $this->newLine();
            
            $this->table(
                ['Field', 'Value'],
                [
                    ['Reminder ID', $reminder->id],
                    ['Recipient', $request->user->name],
                    ['Email', $request->user->email],
                    ['Subject', 'Payment Due Reminder - Action Required'],
                    ['Status', 'Sent'],
                    ['Sent At', $reminder->sent_at->format('Y-m-d H:i:s')],
                ]
            );
            
            $this->newLine();
            $this->info('📬 Check the recipient\'s email inbox!');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to send email: ' . $e->getMessage());
            $this->error('Stack trace: ' . $e->getTraceAsString());
            return 1;
        }
    }
}
