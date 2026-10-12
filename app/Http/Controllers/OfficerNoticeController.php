<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\OfficerNotice;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\SmsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The Zoning Administrator notifies the Zoning Officers. Each officer gets
 * an in-app notification (the bell, and "From the Zoning Administrator" on
 * their dashboard) and, when she ticks it, the same notice as a text message
 * - this page took over "SMS to Officers", so everything she sends the
 * officers is in one place and one history. Every route here is in the
 * super-admin group, and the /officer-notices page is registered for the
 * super_admin role only (CleanPageController).
 */
class OfficerNoticeController extends Controller
{
    /** A text longer than this is sent in more parts than it is worth; the full notice is in the app. */
    public const SMS_MAX = 320;

    public function index(Request $request): Response
    {
        // Resolved here: CleanPageController calls index() with the request only.
        $sms = app(SmsService::class);

        return Inertia::render('SuperAdmin/OfficerNotices', [
            'officers' => User::where('user_type', 'admin')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'contact_number'])
                // Whether a text can reach them, not the number itself.
                ->map(fn (User $officer) => [
                    'id' => $officer->id,
                    'name' => $officer->name,
                    'email' => $officer->email,
                    'has_phone' => filled($sms->resolvePhone($officer)),
                ]),
            'sms' => [
                'enabled' => $sms->isEnabled(),
                'sender' => config('services.sms.sender_name'),
                'max' => self::SMS_MAX,
            ],
            'notices' => OfficerNotice::with('sender:id,name')
                ->latest('id')
                ->take(50)
                ->get()
                ->map(fn (OfficerNotice $notice) => [
                    'id' => $notice->id,
                    'title' => $notice->title,
                    'message' => $notice->message,
                    'is_important' => $notice->is_important,
                    'recipients' => $notice->recipients ?? [],
                    'sent_by' => $notice->sender?->name,
                    'sent_at' => $notice->created_at?->toIso8601String(),
                    'via_sms' => $notice->via_sms,
                    'sms_sent' => $notice->sms_sent,
                    'sms_failed' => $notice->sms_failed,
                    'sms_skipped' => $notice->sms_skipped,
                ]),
        ]);
    }

    public function store(Request $request, SmsService $sms): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:1000'],
            'is_important' => ['boolean'],
            'send_sms' => ['boolean'],
            'recipients' => ['required', Rule::in(['all', 'selected'])],
            // Officers only: an id of anyone else is refused, not quietly dropped.
            'user_ids' => ['required_if:recipients,selected', 'array'],
            'user_ids.*' => ['integer', Rule::exists('users', 'id')->where('user_type', 'admin')],
        ]);

        $officers = User::where('user_type', 'admin')
            ->when($validated['recipients'] === 'selected', fn ($q) => $q->whereIn('id', $validated['user_ids'] ?? []))
            ->orderBy('name')
            ->get(['id', 'name', 'contact_number']);

        if ($officers->isEmpty()) {
            return back()->withErrors(['recipients' => 'There is no Zoning Officer to send this to.']);
        }

        $title = trim($validated['title']);
        $message = trim($validated['message']);
        $important = (bool) ($validated['is_important'] ?? false);
        $viaSms = (bool) ($validated['send_sms'] ?? false);

        $notice = DB::transaction(function () use ($request, $officers, $title, $message, $important, $viaSms) {
            $notice = OfficerNotice::create([
                'sent_by' => $request->user()->id,
                'title' => $title,
                'message' => $message,
                'is_important' => $important,
                'recipients' => $officers->pluck('name')->all(),
                'via_sms' => $viaSms,
            ]);

            foreach ($officers as $officer) {
                Notification::createForUser(
                    $officer->id,
                    OfficerNotice::TYPE,
                    $title,
                    $message,
                    '/dashboard-panel',
                    ['notice_id' => $notice->id, 'important' => $important, 'from' => $request->user()->name]
                );
            }

            return $notice;
        });

        // Texted after the notice is saved: the in-app copy must not depend on
        // the SMS gateway answering.
        $smsSummary = '';
        if ($viaSms) {
            $text = self::smsText($title, $message, $important);
            $sent = $failed = $skipped = 0;
            foreach ($officers as $officer) {
                $phone = $sms->resolvePhone($officer);
                if (! filled($phone)) {
                    $skipped++;
                    continue;
                }
                try {
                    $sms->send($phone, $text) ? $sent++ : $failed++;
                } catch (\Throwable $e) {
                    $failed++;
                    Log::error('[Notify Officers SMS] ' . $e->getMessage());
                }
            }
            $notice->update(['sms_sent' => $sent, 'sms_failed' => $failed, 'sms_skipped' => $skipped]);
            $smsSummary = " Texted {$sent}" . ($failed ? ", {$failed} failed" : '') . ($skipped ? ", {$skipped} with no mobile number" : '') . '.';
        }

        AuditLogService::logCreate(
            'OfficerNotice',
            $notice->id,
            $notice->fresh()->toArray(),
            "Notified {$officers->count()} Zoning Officer(s)" . ($viaSms ? ' in-app and by SMS' : '') . ": {$title}"
        );

        return back()->with('success', 'Sent to ' . $officers->count() . ' Zoning Officer' . ($officers->count() === 1 ? '' : 's') . '.' . $smsSummary);
    }

    /** The notice as one text: who it is from, the title, then as much of the message as fits. */
    public static function smsText(string $title, string $message, bool $important = false): string
    {
        $text = ($important ? 'IMPORTANT - ' : '') . "CPDO Notice: {$title}\n{$message}";
        if (mb_strlen($text) <= self::SMS_MAX) {
            return $text;
        }
        $tail = '... (full notice on your CPDO dashboard)';

        return rtrim(mb_substr($text, 0, self::SMS_MAX - mb_strlen($tail))) . $tail;
    }
}
