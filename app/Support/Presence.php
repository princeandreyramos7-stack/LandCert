<?php

namespace App\Support;

use App\Models\User;

/**
 * Who is using the system right now, for the staff dashboards: everyone
 * seen in the last few minutes (TrackPresence), with their role and the
 * page they are on, plus how many different people were in today.
 */
class Presence
{
    /** Seen within this many minutes counts as online. */
    public const ONLINE_MINUTES = 5;

    /** Pages, as the dashboard names them, by the start of their path. */
    private const PAGES = [
        '/dashboard-panel' => 'Dashboard',
        '/dashboard' => 'Dashboard',
        '/applications' => 'Applications',
        '/application-details' => 'Application details',
        '/view-application' => 'Viewing an application',
        '/document-verification' => 'Document verification',
        '/review-application' => 'Reviewing an application',
        '/my-applications' => 'My Applications',
        '/request' => 'New application form',
        '/edit-application' => 'Editing an application',
        '/payments' => 'Payments',
        '/payment-details' => 'Payment details',
        '/receipt' => 'Uploading a receipt',
        '/certificates' => 'Certificates',
        '/generate-certificate' => 'Certificate',
        '/generate-clearance' => 'Clearance',
        '/order-of-payment' => 'Order of Payment',
        '/print-form' => 'Application form',
        '/reports' => 'Reports',
        '/users' => 'User Management',
        '/audit-logs' => 'Audit Logs',
        '/sms-broadcast' => 'SMS',
        '/notifications' => 'Notifications',
        '/profile' => 'Profile',
        '/super-admin/profile' => 'Profile',
        '/admin/profile' => 'Profile',
        '/verify' => 'Certificate verification',
    ];

    /** Whether users.last_seen_at exists yet (one schema check per request). */
    public static function available(): bool
    {
        static $available = null;

        return $available ??= \Illuminate\Support\Facades\Schema::hasColumn('users', 'last_seen_at');
    }

    public static function pageLabel(?string $path): string
    {
        $path = '/' . ltrim((string) $path, '/');
        foreach (self::PAGES as $prefix => $label) {
            if ($path === $prefix || str_starts_with($path, $prefix . '/') || str_starts_with($path, $prefix . '?')) {
                return $label;
            }
        }
        $last = trim(basename($path), '/');
        return $last === '' ? 'Home' : ucfirst(str_replace(['-', '_'], ' ', $last));
    }

    /**
     * @return array{online: int, by_role: array<string,int>, today: int, users: list<array>, window_minutes: int}
     */
    public static function snapshot(): array
    {
        // Until the presence migration has run on this database there is
        // nothing to report - the dashboard must still open.
        if (!self::available()) {
            return ['online' => 0, 'by_role' => ['super_admin' => 0, 'admin' => 0, 'applicant' => 0], 'today' => 0, 'window_minutes' => self::ONLINE_MINUTES, 'users' => [], 'unavailable' => true];
        }

        $since = now()->subMinutes(self::ONLINE_MINUTES);

        $online = User::query()
            ->whereNotNull('last_seen_at')
            ->where('last_seen_at', '>=', $since)
            ->orderByDesc('last_seen_at')
            ->get(['id', 'name', 'email', 'user_type', 'avatar_path', 'last_seen_at', 'last_seen_path']);

        $byRole = ['super_admin' => 0, 'admin' => 0, 'applicant' => 0];
        foreach ($online as $user) {
            $byRole[$user->user_type] = ($byRole[$user->user_type] ?? 0) + 1;
        }

        return [
            'online' => $online->count(),
            'by_role' => $byRole,
            'today' => User::whereDate('last_seen_at', today())->count(),
            'window_minutes' => self::ONLINE_MINUTES,
            'users' => $online->take(50)->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'user_type' => $user->user_type,
                'avatar_url' => $user->avatar_url,
                'last_seen_at' => $user->last_seen_at?->toIso8601String(),
                'page' => self::pageLabel($user->last_seen_path),
            ])->values()->all(),
        ];
    }
}
