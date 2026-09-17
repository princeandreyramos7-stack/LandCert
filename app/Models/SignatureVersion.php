<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One setting of a staff member's e-signature and printed position, from a
 * date. Documents are signed with the version in force on the day they were
 * issued (App\Support\Signatories), so a certificate from last year keeps
 * last year's signature and title when the office's staff change.
 */
class SignatureVersion extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'signature_path', 'position', 'effective_from', 'set_by', 'note', 'created_at'];

    protected $casts = ['effective_from' => 'datetime', 'created_at' => 'datetime'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function setBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'set_by');
    }

    /** Public URL of this version's signature image, or null when the file is gone. */
    public function signatureUrl(): ?string
    {
        if (!empty($this->signature_path) && file_exists(public_path($this->signature_path))) {
            return '/' . ltrim($this->signature_path, '/');
        }
        return null;
    }
}
