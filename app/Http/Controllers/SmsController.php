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

    /**
     * Who this account may text, as audience key => user_type.
     *
     * The Zoning Administrator can also reach the Zoning Officers; an officer
     * gets applicants only. Enforced here rather than in the page, so hiding a
     * tab is not the only thing standing between a role and a broadcast.
     */
    private function audiences(): array
    {
        $audiences = ['applicants' => 'applicant'];

        if (auth()->user()?->user_type === 'super_admin') {
            $audiences['officers'] = 'admin';
        }

        return $audiences;
    }

    public function index(Request $request): Response
    {
        $audiences = $this->audiences();
        $types = array_values($audiences);

        $users = User::whereNotNull('contact_number')
            ->where('contact_number', '!=', '')
            ->whereIn('user_type', $types)
            ->select('id', 'name', 'email', 'contact_number', 'user_type')
            ->orderBy('name')
            ->get();

        $stats = [
            'total_users' => User::whereIn('user_type', $types)->count(),
            'with_phone'  => $users->count(),
            'sms_enabled' => $this->sms->isEnabled(),
            'sender'      => config('services.sms.sender_name'),
            // Counted per audience so the screen can say how many it is about
            // to reach, rather than quoting one total for a list it filters.
            'with_phone_by_audience' => collect($audiences)
                ->map(fn ($type) => $users->where('user_type', $type)->count())
                ->all(),
            'total_by_audience' => collect($audiences)
                ->map(fn ($type) => User::where('user_type', $type)->count())
                ->all(),
        ];

        return Inertia::render('Admin/Sms/Index', [
            'users'         => $users,
            'stats'         => $stats,
            'audiences'     => array_keys($audiences),
            'broadcastTpls' => $this->broadcastTemplatesByAudience(),
            // Only super-admins receive the editable auto-templates
            'autoTemplates' => auth()->user()?->user_type === 'super_admin'
                ? SmsTemplate::orderBy('id')->get()
                : [],
        ]);
    }

    /* ── Broadcast send ──────────────────────────────────────── */

    public function send(Request $request)
    {
        $audiences = $this->audiences();

        $validated = $request->validate([
            'recipients' => 'required|in:all,selected',
            'audience'   => 'nullable|in:' . implode(',', array_keys($audiences)),
            'user_ids'   => 'required_if:recipients,selected|array',
            'user_ids.*' => 'integer|exists:users,id',
            'message'    => 'required|string|min:3|max:320',
        ]);

        // The audience decides which user_type a broadcast may reach, and the
        // same restriction is applied to a hand-picked list: "selected" used to
        // accept any id at all, so the recipients were whatever the page chose
        // to offer rather than whatever this role is allowed to text.
        $audience = $validated['audience'] ?? 'applicants';
        $type = $audiences[$audience] ?? 'applicant';

        $users = User::whereNotNull('contact_number')
            ->where('contact_number', '!=', '')
            ->where('user_type', $type)
            ->when(
                $validated['recipients'] === 'selected',
                fn ($query) => $query->whereIn('id', $validated['user_ids'])
            )
            ->get();

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

    /**
     * Ready-made messages, per audience.
     *
     * An applicant is being told about their own application; a Zoning Officer
     * is being told about the office's caseload. Addressing an officer with
     * "your application is approved, please pay at the Treasury" would be
     * nonsense, so the two sets are kept apart and the page swaps between them
     * with the audience.
     */
    private function broadcastTemplatesByAudience(): array
    {
        $sets = ['applicants' => $this->getBroadcastTemplates()];

        if (array_key_exists('officers', $this->audiences())) {
            $sets['officers'] = $this->getOfficerBroadcastTemplates();
        }

        return $sets;
    }

    /**
     * Messages the Zoning Administrator sends to the Zoning Officers. All about
     * the work in front of them: what is waiting, what is overdue, what needs
     * releasing.
     */
    private function getOfficerBroadcastTemplates(): array
    {
        return [
            ['label' => 'Applications for Review',     'message' => 'Hi {name}! There are applications awaiting your review at CPDO LC. Please check the Applications page and act on them today. - Zoning Administrator'],
            ['label' => 'Pending Review Follow-up',    'message' => 'Hi {name}! Some applications assigned to you have been pending review for several days. Please prioritise them. - Zoning Administrator'],
            ['label' => 'Returned for Correction',     'message' => 'Hi {name}! An application you reviewed has been returned for correction. Please check the remarks and resubmit your evaluation. - Zoning Administrator'],
            ['label' => 'Set the Treasury Fee',        'message' => 'Hi {name}! An application is waiting for the Treasury fee to be set before it can be approved. Please complete the review. - Zoning Administrator'],
            ['label' => 'Payments to Verify',          'message' => 'Hi {name}! There are payments waiting to be verified at the counter. Please check the Payments page. - Zoning Administrator'],
            ['label' => 'Certificates for Release',    'message' => 'Hi {name}! There are certificates ready for release. Please prepare them for the applicants to collect. - Zoning Administrator'],
            ['label' => 'Office Reminder',             'message' => 'Hi {name}! Reminder from the Zoning Administrator: please keep application records updated before the end of the day. - Zoning Administrator'],
            ['label' => 'Custom Message',              'message' => ''],
        ];
    }

    private function getBroadcastTemplates(): array
    {
        return [
            ['label' => 'Application Reminder',       'message' => 'Hi {name}! This is a reminder from CPDO LC regarding your locational clearance application. Please log in to check your status. - CPDO LC'],
            ['label' => 'Payment Reminder',            'message' => 'Hi {name}! Your approved application has a pending payment. Please pay at the City Treasury Office and bring your Official Receipt to the CPDO office (Mon-Fri 8AM-5PM). - CPDO LC'],
            ['label' => 'Document Submission',         'message' => 'Hi {name}! Please submit the required documents for your application at CPDO office. Bring all requirements. - CPDO LC'],
            ['label' => 'Office Announcement',         'message' => 'CPDO LC announcement: Please bring all required documents for walk-in transactions. Office hours: Mon-Fri 8AM-5PM. - CPDO LC'],
            ['label' => 'Certificate Ready for Pickup','message' => 'Hi {name}! Your certificate is ready for pickup at CPDO office. Bring a valid government-issued ID. Office hours: Mon-Fri 8AM-5PM. - CPDO LC'],
            ['label' => 'Payment Instructions',        'message' => 'Hi {name}! Your application is approved. Please pay the required fee at the City Treasury Office and bring the Official Receipt to the CPDO office to proceed. - CPDO LC'],
            ['label' => 'General Reminder',            'message' => 'Hi {name}! This is a reminder from CPDO LC. Please log in to your account or visit our office for more information. Office hours: Mon-Fri 8AM-5PM. - CPDO LC'],
            ['label' => 'Custom Message',              'message' => ''],
        ];
    }

    private function defaultMessages(): array
    {
        return [
            'application_submitted' => 'Hi {name}! Your application #{application_number} has been submitted. We will review it and notify you. - CPDO LC',
            'application_approved'  => 'Good news {name}! Application #{application_number} is APPROVED. Visit CPDO office to process payment and submit documents. - CPDO LC',
            'application_rejected'  => '{name}, application #{application_number} was DENIED. Reason: {reason}. Contact CPDO for details. - CPDO LC',
            'payment_verified'      => '{name}, payment of PHP {amount} for application #{application_number} is VERIFIED. Certificate will be prepared. - CPDO LC',
            'payment_rejected'      => '{name}, your payment for application #{application_number} was DENIED. Reason: {reason}. Please resubmit or contact CPDO. - CPDO LC',
            'certificate_preparing' => '{name}, certificate #{cert_number} is being prepared. You will be notified when ready for pickup. - CPDO LC',
            'certificate_ready'     => '{name}, certificate #{cert_number} (App #{application_number}) is READY for pickup. Bring valid ID. - CPDO LC',
            'payment_reminder'      => 'Reminder: {name}, payment for application #{application_number} is due. Visit CPDO office. - CPDO LC',
            'requirements_submitted'=> 'Hi {name}! Your requirements for application #{application_number} were submitted successfully. Please wait while our staff reviews your application. - CPDO LC',
        ];
    }
}
