<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One account's in-progress New Application, saved so it can be picked back
 * up later - on this device or another one. See the migration for what this
 * does and does not keep (no attached files).
 */
class ApplicationDraft extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'data',
        'current_step',
        'completed_steps',
        'has_representative',
    ];

    protected $casts = [
        'data' => 'array',
        'completed_steps' => 'array',
        'has_representative' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
