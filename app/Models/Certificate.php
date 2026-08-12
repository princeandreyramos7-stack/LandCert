<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Certificate extends Model
{
    protected $fillable = [
        'request_id',
        'application_id',
        'payment_id',
        'user_id',
        'certificate_number',
        'certificate_file_path',
        'issued_by',
        'issued_at',
        'valid_until',
        'status',
        'notes',
        'ready_at',
        'released_at',
        'released_by',
        'released_to_name',
        'released_to_id_type',
        'released_to_id_number',
        'release_signature_path',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'valid_until' => 'date',
        'ready_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    /**
     * Get the user who owns this certificate (applicant).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the request that owns the certificate.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Get the payment associated with the certificate.
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Get the user who issued the certificate.
     */
    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * Get the user who released the certificate.
     */
    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }

    /**
     * Get the release record for this certificate.
     */
    public function release(): HasOne
    {
        return $this->hasOne(CertificateRelease::class);
    }
}
