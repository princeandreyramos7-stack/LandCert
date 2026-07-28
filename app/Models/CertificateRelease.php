<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CertificateRelease extends Model
{
    protected $fillable = [
        'certificate_id',
        'released_by',
        'collected_by_name',
        'release_date',
        'release_time',
        'valid_id_type',
        'valid_id_number',
        'relationship_to_applicant',
        'remarks',
    ];

    protected $casts = [
        'release_date' => 'date',
    ];

    /**
     * Get the certificate that was released.
     */
    public function certificate(): BelongsTo
    {
        return $this->belongsTo(Certificate::class);
    }

    /**
     * Get the user who released the certificate.
     */
    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by');
    }
}
