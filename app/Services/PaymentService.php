<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Request as RequestModel;
use App\Models\User;
use App\Mail\PaymentConfirmed;
use App\Services\CertificateService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PaymentService
{
    /**
     * Get pending payments (approved requests without verified payment)
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getPendingPayments()
    {
        return RequestModel::with([
            'applicant',
            'project',
            'location',
            'user'
        ])
        ->where('status', 'approved')
        ->whereDoesntHave('payments', function($query) {
            $query->where('payment_status', 'verified');
        })
        ->orderBy('updated_at', 'desc')
        ->get()
        ->map(function($request) {
            // Calculate days waiting since approval
            $daysWaiting = $request->updated_at->diffInDays(now());
            
            return [
                'request_id' => $request->id,
                'application_number' => $request->application_number ?? 'N/A',
                'applicant_name' => $request->applicant->applicant_name ?? 'Unknown',
                'expected_amount' => $this->getExpectedAmount($request->project_type),
                'approved_at' => $request->updated_at->format('Y-m-d'),
                'days_waiting' => $daysWaiting,
                'project_type' => $request->project->project_type ?? 'N/A',
                'payment_order_number' => "PO-{$request->id}",
            ];
        });
    }

    /**
     * Record a payment with transaction handling
     * Task 9.2: Includes audit logging
     * Task 9.3: Secure file upload handling
     * 
     * @param RequestModel $request
     * @param array $data
     * @return Payment
     * @throws \Exception
     */
    public function recordPayment(RequestModel $request, array $data)
    {
        return DB::transaction(function () use ($request, $data) {
            // Create payment record
            $payment = Payment::create([
                'request_id' => $request->id,
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'receipt_number' => $data['receipt_number'],
                'payment_date' => $data['payment_date'],
                'payment_status' => 'verified',
                'verified_by' => auth()->id(),
                'verified_at' => now(),
                'notes' => $data['notes'] ?? null,
            ]);

            // Task 9.3: Handle file upload securely if present
            if (isset($data['receipt_file']) && $data['receipt_file']) {
                $file = $data['receipt_file'];
                
                // Generate unique filename to prevent overwrites
                $extension = $file->getClientOriginalExtension();
                $uniqueFilename = 'receipt_' . $payment->id . '_' . time() . '_' . uniqid() . '.' . $extension;
                
                // Store on the private disk (not publicly web-accessible)
                $path = $file->storeAs('receipts', $uniqueFilename, 'local');
                $payment->update(['receipt_file_path' => $path]);
            }

            // Update request status
            $request->update(['status' => 'payment_confirmed']);

            // Auto-create certificate after payment
            try {
                $certificateService = app(CertificateService::class);
                $certificate = $certificateService->autoCreateFromPayment($payment);
                Log::info("Certificate auto-created", [
                    'certificate_id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'payment_id' => $payment->id,
                ]);
            } catch (\Exception $e) {
                // Log error but don't fail the payment transaction
                Log::error("Failed to auto-create certificate", [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            // Send notifications to applicant
            $this->notifyApplicant($request, $payment);

            // Task 9.2: Log activity with user, timestamp, IP address
            AuditLogService::log(
                'payment_recorded',
                "Payment recorded for request #{$request->id}. OR: {$payment->receipt_number}, Amount: ₱{$payment->amount}",
                'Payment',
                $payment->id,
                null,
                [
                    'request_id' => $request->id,
                    'receipt_number' => $payment->receipt_number,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'payment_date' => $payment->payment_date,
                    'verified_by' => auth()->id(),
                    'verified_at' => now(),
                ]
            );

            Log::info("Payment recorded successfully", [
                'payment_id' => $payment->id,
                'request_id' => $request->id,
                'receipt_number' => $payment->receipt_number,
                'amount' => $payment->amount,
                'user_id' => auth()->id(),
                'ip_address' => request()->ip(),
            ]);

            return $payment;
        });
    }

    /**
     * Check if receipt number already exists (duplicate validation)
     * 
     * @param string $receiptNumber
     * @return Payment|null
     */
    public function checkDuplicate(string $receiptNumber)
    {
        return Payment::with(['request.applicant'])
            ->where('receipt_number', $receiptNumber)
            ->first();
    }

    /**
     * Send notification to applicant after payment confirmation
     * 
     * @param RequestModel $request
     * @param Payment $payment
     * @return void
     */
    private function notifyApplicant(RequestModel $request, Payment $payment)
    {
        try {
            // Ensure relationships are loaded
            if (!$request->relationLoaded('applicant')) {
                $request->load('applicant');
            }
            if (!$request->relationLoaded('user')) {
                $request->load('user');
            }

            $applicantName = $request->applicant->applicant_name ?? 'Applicant';
            $user = $request->user;

            // Send email notification
            if ($user && $user->email) {
                Mail::to($user->email)->send(
                    new PaymentConfirmed($payment, $request)
                );
                Log::info("Payment confirmation email sent", [
                    'payment_id' => $payment->id,
                    'recipient' => $user->email
                ]);
            }

            // Send SMS notification if enabled
            $smsService = app(SmsService::class);
            $phone = $smsService->resolvePhone($user);
            if ($smsService->isEnabled() && $user && $phone) {
                $smsService->sendPaymentVerified(
                    $phone,
                    $user->name ?? $applicantName,
                    $request->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($request->id, 4, '0', STR_PAD_LEFT),
                    (float) $payment->amount
                );
                Log::info("Payment confirmation SMS sent", [
                    'payment_id' => $payment->id,
                    'recipient' => $phone
                ]);
            }

            // Create in-app notification
            NotificationService::paymentVerified($request, $payment, auth()->user());

        } catch (\Exception $e) {
            // Log error but don't fail the transaction
            Log::error("Failed to send payment notification", [
                'payment_id' => $payment->id,
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get expected payment amount based on project type
     */
    private function getExpectedAmount(?string $projectType): float
    {
        if (!$projectType) {
            return 500.00; // Default amount
        }

        return match (strtoupper(trim($projectType))) {
            'SUP', 'SPECIAL USE PERMIT' => 750.00,
            'TUP', 'TEMPORARY USE PERMIT' => 350.00,
            'CZC', 'CERTIFICATE OF ZONING COMPLIANCE', 'ZONING CLEARANCE', 'LOCATIONAL CLEARANCE', 'ZONING' => 500.00,
            default => 500.00, // Default for any other type
        };
    }
}
