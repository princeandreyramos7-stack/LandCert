<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A notification the Zoning Administrator sent the Zoning Officers. Each
 * officer received it as an in-app Notification of type TYPE.
 */
class OfficerNotice extends Model
{
    /** The type of each officer's in-app copy. */
    public const TYPE = 'administrator_notice';

    protected $fillable = ['sent_by', 'title', 'message', 'is_important', 'recipients'];

    protected $casts = [
        'is_important' => 'boolean',
        'recipients' => 'array',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
