<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected $apiKey;
    protected $senderName;
    protected $enabled;
    protected $provider;
    
    public function __construct()
    {
        $this->apiKey = config('services.sms.api_key');
        $this->senderName = config('services.sms.sender_name');
        $this->enabled = config('services.sms.enabled', false);
        $this->provider = config('services.sms.provider', 'semaphore');
    }
    
    /**
     * Send SMS via Semaphore API
     */
    public function send(string $phoneNumber, string $message): bool
    {
        if (!$this->enabled) {
            Log::info('SMS sending is disabled', [
                'phone' => $phoneNumber,
                'message' => $message
            ]);
            return false;
        }
        
        if (empty($this->apiKey)) {
            Log::error('SMS API key not configured');
            return false;
        }
        
        try {
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);
            
            if ($this->provider === 'semaphore') {
                return $this->sendViaSemaphore($formattedPhone, $message);
            }
            
            Log::error('Unsupported SMS provider: ' . $this->provider);
            return false;
            
        } catch (\Exception $e) {
            Log::error('SMS sending failed: ' . $e->getMessage(), [
                'phone' => $phoneNumber,
                'message' => $message,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Send SMS via Semaphore API
     */
    protected function sendViaSemaphore(string $phoneNumber, string $message): bool
    {
        $response = Http::asForm()->post('https://api.semaphore.co/api/v4/messages', [
            'apikey' => $this->apiKey,
            'number' => $phoneNumber,
            'message' => $message,
            'sendername' => $this->senderName
        ]);
        
        if ($response->successful()) {
            $data = $response->json();
            Log::info('SMS sent successfully', [
                'phone' => $phoneNumber,
                'response' => $data
            ]);
            return true;
        }
        
        Log::error('Semaphore API error', [
            'status' => $response->status(),
            'response' => $response->body()
        ]);
        
        return false;
    }
    
    /**
     * Format phone number to Philippine format
     */
    protected function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove all non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        // If starts with 0, replace with +63
        if (substr($phone, 0, 1) === '0') {
            $phone = '63' . substr($phone, 1);
        }
        
        // If doesn't start with 63, add it
        if (substr($phone, 0, 2) !== '63') {
            $phone = '63' . $phone;
        }
        
        return $phone;
    }
    
    /**
     * Send application submitted notification
     */
    public function sendApplicationSubmitted(string $phoneNumber, string $applicantName, int $requestId): bool
    {
        $message = "CPDO: Hello {$applicantName}! Your land certification application (#{$requestId}) has been submitted successfully. We will review it and notify you of the status.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send application approved notification
     */
    public function sendApplicationApproved(string $phoneNumber, string $applicantName, int $requestId): bool
    {
        $message = "CPDO: Good news {$applicantName}! Your application (#{$requestId}) has been APPROVED. Please proceed to CPDO office for payment and document submission.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send application rejected notification
     */
    public function sendApplicationRejected(string $phoneNumber, string $applicantName, int $requestId, string $reason = ''): bool
    {
        $message = "CPDO: {$applicantName}, your application (#{$requestId}) has been rejected.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }
        $message .= " Please contact our office for more details.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send payment due reminder
     */
    public function sendPaymentReminder(string $phoneNumber, string $applicantName, int $requestId, int $daysRemaining = 0): bool
    {
        if ($daysRemaining > 0) {
            $message = "CPDO: Reminder for {$applicantName}. Your payment for application #{$requestId} is due in {$daysRemaining} days. Please visit our office to complete payment.";
        } else {
            $message = "CPDO: Reminder for {$applicantName}. Your payment for application #{$requestId} is now due. Please visit our office to complete payment.";
        }
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send payment verified notification
     */
    public function sendPaymentVerified(string $phoneNumber, string $applicantName, int $requestId, float $amount): bool
    {
        $formattedAmount = number_format($amount, 2);
        $message = "CPDO: {$applicantName}, your payment of PHP {$formattedAmount} for application #{$requestId} has been verified. You may now collect your certificate at our office.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send payment rejected notification
     */
    public function sendPaymentRejected(string $phoneNumber, string $applicantName, int $requestId, string $reason = ''): bool
    {
        $message = "CPDO: {$applicantName}, your payment receipt for application #{$requestId} was rejected.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }
        $message .= " Please resubmit or contact our office.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send document pending reminder
     */
    public function sendDocumentReminder(string $phoneNumber, string $applicantName, int $requestId): bool
    {
        $message = "CPDO: Reminder for {$applicantName}. Please submit the required documents for your application #{$requestId}. Visit our office during office hours.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send certificate ready for pickup
     */
    public function sendCertificateReady(string $phoneNumber, string $applicantName, int $requestId, string $certificateNumber): bool
    {
        $message = "CPDO: {$applicantName}, your land use certificate (#{$certificateNumber}) for application #{$requestId} is ready for pickup at our office. Bring valid ID.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send certificate preparing notification
     */
    public function sendCertificatePreparing(string $phoneNumber, string $applicantName, string $certificateNumber): bool
    {
        $message = "CPDO: {$applicantName}, your certificate (#{$certificateNumber}) is being prepared. You will be notified when it's ready for pickup at our office.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send general status update
     */
    public function sendStatusUpdate(string $phoneNumber, string $applicantName, int $requestId, string $oldStatus, string $newStatus): bool
    {
        $message = "CPDO: {$applicantName}, your application #{$requestId} status has been updated from '{$oldStatus}' to '{$newStatus}'. Check your account for details.";
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Send custom message
     */
    public function sendCustomMessage(string $phoneNumber, string $message): bool
    {
        // Prepend sender name if not already present
        if (strpos($message, 'CPDO:') !== 0) {
            $message = 'CPDO: ' . $message;
        }
        return $this->send($phoneNumber, $message);
    }
    
    /**
     * Check if SMS is enabled
     */
    public function isEnabled(): bool
    {
        return $this->enabled;
    }
}
