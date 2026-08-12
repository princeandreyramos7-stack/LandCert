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
