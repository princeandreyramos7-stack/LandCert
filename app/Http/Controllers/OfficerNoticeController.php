<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\OfficerNotice;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The Zoning Administrator notifies the Zoning Officers. Each officer gets
 * an in-app notification (the bell, and "From the Zoning Administrator" on
 * their dashboard); the notice itself is kept for her history. Every route
 * here is in the super-admin group, and the /officer-notices page is
 * registered for the super_admin role only (CleanPageController).
 */
class OfficerNoticeController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('SuperAdmin/OfficerNotices', [
            'officers' => User::where('user_type', 'admin')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
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
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'message' => ['required', 'string', 'max:1000'],
            'is_important' => ['boolean'],
            'recipients' => ['required', Rule::in(['all', 'selected'])],
            // Officers only: an id of anyone else is refused, not quietly dropped.
            'user_ids' => ['required_if:recipients,selected', 'array'],
            'user_ids.*' => ['integer', Rule::exists('users', 'id')->where('user_type', 'admin')],
        ]);

        $officers = User::where('user_type', 'admin')
            ->when($validated['recipients'] === 'selected', fn ($q) => $q->whereIn('id', $validated['user_ids'] ?? []))
            ->orderBy('name')
            ->get(['id', 'name']);

        if ($officers->isEmpty()) {
            return back()->withErrors(['recipients' => 'There is no Zoning Officer to send this to.']);
        }

        $title = trim($validated['title']);
        $message = trim($validated['message']);
        $important = (bool) ($validated['is_important'] ?? false);

        $notice = DB::transaction(function () use ($request, $officers, $title, $message, $important) {
            $notice = OfficerNotice::create([
                'sent_by' => $request->user()->id,
                'title' => $title,
                'message' => $message,
                'is_important' => $important,
                'recipients' => $officers->pluck('name')->all(),
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

        AuditLogService::logCreate(
            'OfficerNotice',
            $notice->id,
            $notice->toArray(),
            "Notified {$officers->count()} Zoning Officer(s): {$title}"
        );

        return back()->with('success', 'Sent to ' . $officers->count() . ' Zoning Officer' . ($officers->count() === 1 ? '' : 's') . '.');
    }
}
