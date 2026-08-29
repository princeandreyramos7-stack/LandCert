<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected string $apiKey;
    protected string $senderName;
    protected bool   $enabled;
    protected string $provider;

    public function __construct()
    {
        $this->apiKey     = config('services.sms.api_key', '');
        $this->senderName = config('services.sms.sender_name', 'Matcare');
        $this->enabled    = (bool) config('services.sms.enabled', false);
        $this->provider   = config('services.sms.provider', 'semaphore');
    }

    /* ─────────────────────────────────────────────────────────────
     * Core send
     * ───────────────────────────────────────────────────────────── */

    /**
     * Send an SMS. Returns true on success, false on failure.
     */
    public function send(string $phoneNumber, string $message): bool
    {
        if (!$this->enabled) {
            Log::info('[SMS] Sending disabled — skipped', ['phone' => $phoneNumber, 'msg' => $message]);
            return false;
        }

        if (empty($this->apiKey)) {
            Log::error('[SMS] API key not configured');
            return false;
        }

        try {
            $phone = $this->formatPhoneNumber($phoneNumber);

            if ($this->provider === 'semaphore') {
                return $this->sendViaSemaphore($phone, $message);
            }

            Log::error('[SMS] Unsupported provider: ' . $this->provider);
            return false;

        } catch (\Exception $e) {
            Log::error('[SMS] Exception: ' . $e->getMessage(), [
                'phone' => $phoneNumber,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /* ─────────────────────────────────────────────────────────────
     * Semaphore transport
     * ───────────────────────────────────────────────────────────── */

    protected function sendViaSemaphore(string $phoneNumber, string $message): bool
    {
        $response = Http::timeout(15)->asForm()->post('https://api.semaphore.co/api/v4/messages', [
            'apikey'     => $this->apiKey,
            'number'     => $phoneNumber,
            'message'    => $message,
            'sendername' => $this->senderName,
        ]);

        if ($response->successful()) {
            Log::info('[SMS] Sent successfully', ['phone' => $phoneNumber, 'resp' => $response->json()]);
            return true;
        }

        Log::error('[SMS] Semaphore API error', [
            'status' => $response->status(),
            'body'   => $response->body(),
        ]);
        return false;
    }

    /* ─────────────────────────────────────────────────────────────
     * Phone formatting (Philippine numbers)
     * ───────────────────────────────────────────────────────────── */

    protected function formatPhoneNumber(string $phoneNumber): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phoneNumber);

        if (str_starts_with($phone, '0')) {
            $phone = '63' . substr($phone, 1);
        } elseif (!str_starts_with($phone, '63')) {
            $phone = '63' . $phone;
        }

        return $phone;
    }

    /* ─────────────────────────────────────────────────────────────
     * Resolve the contact number from a user model
     * Handles both `contact_number` and `phone` columns.
     * ───────────────────────────────────────────────────────────── */

    public function resolvePhone($user): ?string
    {
        return $user->contact_number ?? $user->phone ?? null;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    /* ─────────────────────────────────────────────────────────────
     * Template-driven send helpers
     * These read from the sms_templates table so admins can edit.
     * ───────────────────────────────────────────────────────────── */

    protected function sendTemplate(string $eventKey, string $phone, array $vars): bool
    {
        $tpl = \App\Models\SmsTemplate::forEvent($eventKey);

        if (!$tpl) {
            // Fallback: log and skip (template disabled or missing)
            Log::warning("[SMS] Template '{$eventKey}' not found or disabled, skipping.");
            return false;
        }

        return $this->send($phone, $this->truncate($tpl->render($vars)));
    }

    /* ─────────────────────────────────────────────────────────────
     * Pre-built message templates
     * All messages are kept under ~155 chars for single-segment SMS.
     * ───────────────────────────────────────────────────────────── */

    public function sendApplicationSubmitted(string $phone, string $name, string $applicationNumber): bool
    {
        return $this->sendTemplate('application_submitted', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
        ]);
    }

    public function sendApplicationReviewed(string $phone, string $name, string $applicationNumber): bool
    {
        return $this->sendTemplate('application_reviewed', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
        ]);
    }

    public function sendRequirementsSubmitted(string $phone, string $name, string $applicationNumber): bool
    {
        return $this->sendTemplate('requirements_submitted', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
        ]);
    }

    public function sendApplicationApprovedWithNextSteps(string $phone, string $name, string $applicationNumber, float $amount): bool
    {
        return $this->sendTemplate('application_approved_next_steps', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
            '{amount}'             => number_format($amount, 2),
        ]);
    }

    public function sendCertificateReleased(string $phone, string $name, string $certNumber): bool
    {
        return $this->sendTemplate('certificate_released', $phone, [
            '{name}'        => $name,
            '{cert_number}' => $certNumber,
        ]);
    }

    public function sendApplicationApproved(string $phone, string $name, string $applicationNumber): bool
    {
        return $this->sendTemplate('application_approved', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
        ]);
    }

    public function sendApplicationRejected(string $phone, string $name, string $applicationNumber, string $reason = ''): bool
    {
        return $this->sendTemplate('application_rejected', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
            '{reason}'             => $reason ?: 'Please contact CPDO office',
        ]);
    }

    public function sendPaymentReminder(string $phone, string $name, string $applicationNumber, int $daysRemaining = 0): bool
    {
        return $this->sendTemplate('payment_reminder', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
            '{days_remaining}'     => $daysRemaining > 0 ? "in {$daysRemaining} day(s)" : 'now',
        ]);
    }

    public function sendPaymentVerified(string $phone, string $name, string $applicationNumber, float $amount): bool
    {
        return $this->sendTemplate('payment_verified', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
            '{amount}'             => number_format($amount, 2),
        ]);
    }

    public function sendPaymentRejected(string $phone, string $name, string $applicationNumber, string $reason = ''): bool
    {
        return $this->sendTemplate('payment_rejected', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
            '{reason}'             => $reason ?: 'Please contact CPDO office',
        ]);
    }

    public function sendDocumentReminder(string $phone, string $name, string $applicationNumber): bool
    {
        // Reuse payment_reminder template or send custom
        $msg = "Reminder: {$name}, please submit required documents for application {$applicationNumber} at the CPDO office.";
        return $this->send($phone, $this->truncate($msg));
    }

    public function sendCertificatePreparing(string $phone, string $name, string $certNumber): bool
    {
        return $this->sendTemplate('certificate_preparing', $phone, [
            '{name}'        => $name,
            '{cert_number}' => $certNumber,
        ]);
    }

    public function sendCertificateReady(string $phone, string $name, string $applicationNumber, string $certNumber): bool
    {
        return $this->sendTemplate('certificate_ready', $phone, [
            '{name}'               => $name,
            '{application_number}' => $applicationNumber,
            '{cert_number}'        => $certNumber,
        ]);
    }

    public function sendStatusUpdate(string $phone, string $name, string $applicationNumber, string $oldStatus, string $newStatus): bool
    {
        $msg = "{$name}, application {$applicationNumber} status updated: {$oldStatus} → {$newStatus}. Log in for details.";
        return $this->send($phone, $this->truncate($msg));
    }

    public function sendCustomMessage(string $phone, string $message): bool
    {
        return $this->send($phone, $this->truncate($message));
    }

    /* ─────────────────────────────────────────────────────────────
     * Helpers
     * ───────────────────────────────────────────────────────────── */

    /**
     * Truncate to 160 chars (single SMS segment) to avoid extra charges.
     * If > 160 chars the Semaphore API splits into multiple segments automatically,
     * but truncating keeps costs predictable.
     */
    protected function truncate(string $message, int $limit = 160): string
    {
        if (mb_strlen($message) <= $limit) {
            return $message;
        }
        return mb_substr($message, 0, $limit - 3) . '...';
    }
}
