<?php

namespace App\Services;

use App\Models\Reminder;
use App\Models\User;
use App\Mail\PaymentDueReminder;
use App\Mail\DocumentPendingReminder;
use App\Mail\CertificateExpiryReminder;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ReminderService
{
    /**
     * Send all pending reminders
     */
    public function sendPendingReminders(): int
    {
        $reminders = Reminder::where('status', 'pending')
            ->where('scheduled_at', '<=', now())
            ->with('user')
            ->get();

        $sent = 0;

        foreach ($reminders as $reminder) {
            try {
                $this->sendReminder($reminder);
                $reminder->markAsSent();
                $sent++;
            } catch (\Exception $e) {
                $reminder->markAsFailed();
                Log::error('Reminder failed', [
                    'reminder_id' => $reminder->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $sent;
    }

    /**
     * Send a specific reminder
     */
    private function sendReminder(Reminder $reminder): void
    {
        $mailable = $this->getMailable($reminder);
        
        if ($mailable) {
            Mail::to($reminder->user->email)->send($mailable);
            
            // Send SMS notification
            if ($reminder->user->contact_number) {
                $this->sendSmsReminder($reminder);
            }
        }
    }
    
    /**
     * Send SMS reminder based on type
     */
    private function sendSmsReminder(Reminder $reminder): void
    {
        $smsService = app(SmsService::class);
        $user = $reminder->user;
        
        switch ($reminder->type) {
            case 'payment_due':
                $metadata = $reminder->metadata ?? [];
                $daysRemaining = $metadata['days_remaining'] ?? 0;
                $smsService->sendPaymentReminder(
                    $user->contact_number,
                    $user->name,
                    $reminder->related_id,
                    $daysRemaining
                );
                break;
                
            case 'document_pending':
                $smsService->sendDocumentReminder(
                    $user->contact_number,
                    $user->name,
                    $reminder->related_id
                );
                break;
                
            case 'certificate_expiry':
                $metadata = $reminder->metadata ?? [];
                $certificateNumber = $metadata['certificate_number'] ?? '';
                if ($certificateNumber) {
                    $message = "{$user->name}, your certificate #{$certificateNumber} will expire soon. Please visit CPDO office for renewal.";
                    $smsService->sendCustomMessage($user->contact_number, $message);
                }
                break;
        }
    }

    /**
     * Get the appropriate mailable for the reminder type
     */
    private function getMailable(Reminder $reminder)
    {
        switch ($reminder->type) {
            case 'payment_due':
                return new PaymentDueReminder($reminder);
            case 'document_pending':
                return new DocumentPendingReminder($reminder);
            case 'certificate_expiry':
                return new CertificateExpiryReminder($reminder);
            default:
                return null;
        }
    }

    /**
     * Schedule payment reminder
     */
    public function schedulePaymentReminder($requestId, $userId, $days = 3): Reminder
    {
        return Reminder::schedulePaymentReminder($requestId, $userId, $days);
    }

    /**
     * Schedule document reminder
     */
    public function scheduleDocumentReminder($requestId, $userId, $days = 7): Reminder
    {
        return Reminder::scheduleDocumentReminder($requestId, $userId, $days);
    }

    /**
     * Schedule certificate expiry reminder
     */
    public function scheduleCertificateExpiryReminder($certificateId, $userId, $days = 30): ?Reminder
    {
        return Reminder::scheduleCertificateExpiryReminder($certificateId, $userId, $days);
    }

    /**
     * Cancel reminders for a specific entity
     */
    public function cancelReminders($relatedId, $relatedType): int
    {
        return Reminder::where('related_id', $relatedId)
            ->where('related_type', $relatedType)
            ->where('status', 'pending')
            ->delete();
    }

    /**
     * Get pending reminders count for a user
     */
    public function getPendingCount($userId): int
    {
        return Reminder::where('user_id', $userId)
            ->where('status', 'pending')
            ->count();
    }
}
