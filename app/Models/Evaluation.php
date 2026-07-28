<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model
{
    protected $primaryKey = 'evaluation_id';

    protected $fillable = [
        'application_id',
        'staff_id',
        'recommendation',
        'remarks',
        'evaluation_date',
    ];

    protected $casts = [
        'evaluation_date' => 'datetime',
    ];

    /**
     * Get the application that was evaluated.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'application_id', 'id');
    }

    /**
     * Get the staff member who performed the evaluation.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id', 'id');
    }

    /**
     * Check if the recommendation is to approve.
     */
    public function isApprovalRecommended(): bool
    {
        return $this->recommendation === 'approve';
    }

    /**
     * Check if the recommendation is to reject.
     */
    public function isRejectionRecommended(): bool
    {
        return $this->recommendation === 'reject';
    }

    /**
     * Check if the recommendation is to revise.
     */
    public function isRevisionRequested(): bool
    {
        return $this->recommendation === 'revise';
    }

    /**
     * Get a human-readable recommendation label.
     */
    public function getRecommendationLabelAttribute(): string
    {
        return match($this->recommendation) {
            'approve' => 'Approve',
            'reject' => 'Reject',
            'revise' => 'Request Revision',
            default => 'Unknown',
        };
    }
}
