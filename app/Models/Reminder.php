<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Reminder extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'related_id',
        'related_type',
        'scheduled_at',
        'sent_at',
        'status',
        'message',
        'metadata',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that should receive this reminder
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related model (Request, Payment, Certificate, etc.)
     */
    public function related(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope to get pending reminders
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get sent reminders
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope to get failed reminders
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope to get reminders scheduled before a certain time
     */
    public function scopeScheduledBefore($query, $datetime)
    {
        return $query->where('scheduled_at', '<=', $datetime);
    }

    /**
     * Scope to get reminders by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get reminders for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Schedule a reminder to pay, $days from now.
     *
     * Both metadata keys are written on purpose: the email mailable reads
     * `days` and the SMS path reads `days_remaining`, and a reminder that goes
     * out by one channel but not the other is worse than none.
     */
    public static function schedulePaymentReminder(int $requestId, int $userId, int $days = 3): self
    {
        return self::create([
            'user_id'      => $userId,
            'type'         => 'payment_due',
            'related_id'   => $requestId,
            'related_type' => Request::class,
            'scheduled_at' => now()->addDays($days),
            'status'       => 'pending',
            'message'      => "Payment for your application is due in {$days} day(s).",
            'metadata'     => ['days' => $days, 'days_remaining' => $days],
        ]);
    }

    /**
     * Schedule a reminder that requirements are still outstanding.
     */
    public static function scheduleDocumentReminder(int $requestId, int $userId, int $days = 7): self
    {
        return self::create([
            'user_id'      => $userId,
            'type'         => 'document_pending',
            'related_id'   => $requestId,
            'related_type' => Request::class,
            'scheduled_at' => now()->addDays($days),
            'status'       => 'pending',
            'message'      => 'Some requirements for your application are still outstanding.',
            'metadata'     => ['days' => $days],
        ]);
    }

    /**
     * Schedule a certificate-expiry reminder $days before it lapses.
     *
     * Returns null when the certificate has no expiry on file — there is
     * nothing to count down to, and a reminder with no date would just be noise.
     */
    public static function scheduleCertificateExpiryReminder(int $certificateId, int $userId, int $days = 30): ?self
    {
        $certificate = Certificate::find($certificateId);

        if (!$certificate || !$certificate->valid_until) {
            return null;
        }

        $scheduledAt = $certificate->valid_until->copy()->subDays($days);

        if ($scheduledAt->isPast()) {
            return null;
        }

        return self::create([
            'user_id'      => $userId,
            'type'         => 'certificate_expiry',
            'related_id'   => $certificateId,
            'related_type' => Certificate::class,
            'scheduled_at' => $scheduledAt,
            'status'       => 'pending',
            'message'      => "Certificate {$certificate->certificate_number} expires in {$days} day(s).",
            'metadata'     => [
                'days'               => $days,
                'certificate_number' => $certificate->certificate_number,
            ],
        ]);
    }

    /**
     * Mark reminder as sent
     */
    public function markAsSent()
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark reminder as failed
     */
    public function markAsFailed()
    {
        $this->update([
            'status' => 'failed',
        ]);
    }

    /**
     * Check if reminder is due to be sent
     */
    public function isDue(): bool
    {
        return $this->status === 'pending' && $this->scheduled_at <= now();
    }
}
