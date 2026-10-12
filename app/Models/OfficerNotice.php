<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A notification the Zoning Administrator sent the Zoning Officers. Each
 * officer received it as an in-app Notification of type TYPE, and - when
 * via_sms is set - as a text message too.
 */
class OfficerNotice extends Model
{
    /** The type of each officer's in-app copy. */
    public const TYPE = 'administrator_notice';

    protected $fillable = ['sent_by', 'title', 'message', 'is_important', 'recipients', 'via_sms', 'sms_sent', 'sms_failed', 'sms_skipped'];

    protected $casts = [
        'is_important' => 'boolean',
        'via_sms' => 'boolean',
        'recipients' => 'array',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
