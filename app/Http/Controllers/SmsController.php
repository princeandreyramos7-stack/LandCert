<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SmsTemplate;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SmsController extends Controller
{
    protected SmsService $sms;

    public function __construct(SmsService $sms)
    {
        $this->sms = $sms;
    }

    /* ── Broadcast page ──────────────────────────────────────── */

    public function index(Request $request): Response
    {
        $users = User::whereNotNull('contact_number')
            ->where('contact_number', '!=', '')
            ->where('user_type', 'applicant')
            ->select('id', 'name', 'email', 'contact_number', 'user_type')
            ->orderBy('name')
            ->get();

        $stats = [
            'total_users' => User::where('user_type', 'applicant')->count(),
            'with_phone'  => $users->count(),
            'sms_enabled' => $this->sms->isEnabled(),
            'sender'      => config('services.sms.sender_name'),
        ];

        return Inertia::render('Admin/Sms/Index', [
            'users'         => $users,
            'stats'         => $stats,
            'broadcastTpls' => $this->getBroadcastTemplates(),
            // Only super-admins receive the editable auto-templates
            'autoTemplates' => auth()->user()?->user_type === 'super_admin'
                ? SmsTemplate::orderBy('id')->get()
                : [],
        ]);
    }

    /* ── Broadcast send ──────────────────────────────────────── */

    public function send(Request $request)
    {
        $validated = $request->validate([
            'recipients' => 'required|in:all,selected',
            'user_ids'   => 'required_if:recipients,selected|array',
            'user_ids.*' => 'integer|exists:users,id',
            'message'    => 'required|string|min:3|max:320',
        ]);

        if ($validated['recipients'] === 'all') {
            $users = User::whereNotNull('contact_number')
                ->where('contact_number', '!=', '')
                ->where('user_type', 'applicant')
                ->get();
        } else {
            $users = User::whereIn('id', $validated['user_ids'])
                ->whereNotNull('contact_number')
                ->where('contact_number', '!=', '')
                ->get();
        }

        if ($users->isEmpty()) {
            return back()->with('error', 'No users with valid phone numbers found.');
        }

        $sent = $failed = $skipped = 0;

        foreach ($users as $user) {
            $phone = $this->sms->resolvePhone($user);
            if (!$phone) { $skipped++; continue; }

            $message = $this->personalise($validated['message'], $user);
            try {
                $this->sms->send($phone, $message) ? $sent++ : $failed++;
            } catch (\Exception $e) {
                $failed++;
                Log::error('[SMS Broadcast] ' . $e->getMessage());
            }
        }

        $summary = "Sent: {$sent}";
        if ($failed)  $summary .= ", Failed: {$failed}";
        if ($skipped) $summary .= ", Skipped (no phone): {$skipped}";

        // Audit log the broadcast
        \App\Services\AuditLogService::log(
            'sms_broadcast',
            "SMS broadcast sent. {$summary}. Recipients: " . ($validated['recipients'] === 'all' ? 'All users' : 'Selected ' . count($validated['user_ids'] ?? []) . ' users') . '. Message preview: ' . mb_substr($validated['message'], 0, 100),
            'SmsBroadcast',
            null,
            null,
            ['recipients' => $validated['recipients'], 'sent' => $sent, 'failed' => $failed, 'skipped' => $skipped],
            ['message_length' => strlen($validated['message']), 'total_recipients' => $sent + $failed + $skipped]
        );

        return back()->with('success', "Broadcast complete. {$summary}");
    }

    /* ── Auto-template update ────────────────────────────────── */

    public function updateTemplate(Request $request, int $id)
    {
        $tpl = SmsTemplate::findOrFail($id);

        $validated = $request->validate([
            'message' => 'required|string|min:5|max:320',
            'enabled' => 'required|boolean',
        ]);

        $oldMessage = $tpl->message;
        $oldEnabled = $tpl->enabled;

        $tpl->update($validated);
        $tpl->clearCache();

        // Audit log the template change
        \App\Services\AuditLogService::logUpdate(
            'SmsTemplate',
            $tpl->id,
            ['message' => $oldMessage, 'enabled' => $oldEnabled],
            ['message' => $validated['message'], 'enabled' => $validated['enabled']],
            "SMS template \"{$tpl->event_label}\" ({$tpl->event_key}) updated"
        );

        return back()->with('success', "Template \"{$tpl->event_label}\" updated.");
    }

    /* ── Reset template to default ───────────────────────────── */

    public function resetTemplate(int $id)
    {
        $tpl = SmsTemplate::findOrFail($id);

        $defaults = $this->defaultMessages();
        if (isset($defaults[$tpl->event_key])) {
            $oldMessage = $tpl->message;
            $tpl->update(['message' => $defaults[$tpl->event_key], 'enabled' => true]);
            $tpl->clearCache();

            // Audit log
            \App\Services\AuditLogService::logUpdate(
                'SmsTemplate',
                $tpl->id,
                ['message' => $oldMessage],
                ['message' => $defaults[$tpl->event_key]],
                "SMS template \"{$tpl->event_label}\" reset to default"
            );
        }

        return back()->with('success', "Template \"{$tpl->event_label}\" reset to default.");
    }

    /* ── Helpers ─────────────────────────────────────────────── */

    private function personalise(string $template, User $user): string
    {
        return str_replace(
            ['{name}', '{email}', '{phone}'],
            [$user->name, $user->email, $user->contact_number ?? ''],
            $template
        );
    }

    private function getBroadcastTemplates(): array
    {
        return [
            ['label' => 'Application Reminder',       'message' => 'Hi {name}! This is a reminder from CPDO LandCert regarding your land use permit application. Please log in to check your status. - CPDO LandCert'],
            ['label' => 'Payment Reminder',            'message' => 'Hi {name}! Your approved application has a pending payment. Please pay at the City Treasury Office and bring your Official Receipt to the CPDO office (Mon-Fri 8AM-5PM). - CPDO LandCert'],
            ['label' => 'Document Submission',         'message' => 'Hi {name}! Please submit the required documents for your application at CPDO office. Bring all requirements. - CPDO LandCert'],
            ['label' => 'Office Announcement',         'message' => 'CPDO LandCert announcement: Please bring all required documents for walk-in transactions. Office hours: Mon-Fri 8AM-5PM. - CPDO LandCert'],
            ['label' => 'Certificate Ready for Pickup','message' => 'Hi {name}! Your certificate is ready for pickup at CPDO office. Bring a valid government-issued ID. Office hours: Mon-Fri 8AM-5PM. - CPDO LandCert'],
            ['label' => 'Payment Instructions',        'message' => 'Hi {name}! Your application is approved. Please pay the required fee at the City Treasury Office and bring the Official Receipt to the CPDO office to proceed. - CPDO LandCert'],
            ['label' => 'General Reminder',            'message' => 'Hi {name}! This is a reminder from CPDO LandCert. Please log in to your account or visit our office for more information. Office hours: Mon-Fri 8AM-5PM. - CPDO LandCert'],
            ['label' => 'Custom Message',              'message' => ''],
        ];
    }

    private function defaultMessages(): array
    {
        return [
            'application_submitted' => 'Hi {name}! Your application #{request_id} has been submitted. We will review it and notify you. - CPDO LandCert',
            'application_approved'  => 'Good news {name}! Application #{request_id} is APPROVED. Visit CPDO office to process payment and submit documents. - CPDO LandCert',
            'application_rejected'  => '{name}, application #{request_id} was REJECTED. Reason: {reason}. Contact CPDO for details. - CPDO LandCert',
            'payment_verified'      => '{name}, payment of PHP {amount} for application #{request_id} is VERIFIED. Certificate will be prepared. - CPDO LandCert',
            'payment_rejected'      => '{name}, your payment for application #{request_id} was REJECTED. Reason: {reason}. Please resubmit or contact CPDO. - CPDO LandCert',
            'certificate_preparing' => '{name}, certificate #{cert_number} is being prepared. You will be notified when ready for pickup. - CPDO LandCert',
            'certificate_ready'     => '{name}, certificate #{cert_number} (App #{request_id}) is READY for pickup. Bring valid ID. - CPDO LandCert',
            'payment_reminder'      => 'Reminder: {name}, payment for application #{request_id} is due. Visit CPDO office. - CPDO LandCert',
        ];
    }
}
