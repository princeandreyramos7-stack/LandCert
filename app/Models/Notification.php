<?php

namespace App\Models;

use App\Notifications\PushNotification;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;
use Throwable;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'link',
        'data',
        'read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read' => 'boolean',
        'read_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): void
    {
        $this->update([
            'read' => true,
            'read_at' => now(),
        ]);
    }

    public static function createForUser(int $userId, string $type, string $title, string $message, ?string $link = null, ?array $data = null): self
    {
        $notification = self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'link' => $link,
            'data' => $data,
        ]);

        self::pushToApplicant($userId, $title, $message, $link);

        return $notification;
    }

    /**
     * Every in-app notification for an applicant is mirrored as a browser
     * push, for whichever of their devices opted in on the Profile page.
     * Staff are not included - this is the "applicants only" scope agreed
     * for the feature, since staff already work from the dashboard itself.
     *
     * Best-effort: a push failure (no subscription, an expired one, the
     * push service being unreachable) must never break the in-app
     * notification this rides along with.
     */
    private static function pushToApplicant(int $userId, string $title, string $message, ?string $link): void
    {
        try {
            $user = User::find($userId);

            if (!$user || $user->user_type !== 'applicant' || !$user->pushSubscriptions()->exists()) {
                return;
            }

            $user->notify(new PushNotification($title, $message, $link));
        } catch (Throwable $e) {
            Log::warning('Push notification dispatch failed', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
