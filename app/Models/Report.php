<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    protected $primaryKey = 'report_id';

    protected $fillable = [
        'request_id',
        'description',
        'date_certified',
        'amount',
        'evaluation',
        'date_reported',
        'issued_by',
        'reviewed_by',
        'payment_amount',
        'requirements',
        'admin_notes',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'date_certified' => 'date',
        'date_reported' => 'datetime',
        'amount' => 'decimal:2',
        'requirements' => 'array',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the request that owns the report (using normalized structure).
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class, 'request_id', 'id');
    }

    /**
     * The staff account that reviewed/evaluated this application. This is what
     * decides whose e-signature is stamped on the certificate and clearance.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Resolve the reviewing officer for signing purposes.
     *
     * Prefers the reviewed_by FK. Falls back to matching the legacy issued_by
     * name against a staff account (older reports predate the FK), and finally
     * to a bare name object so the document still prints a name — just without
     * a signature.
     */
    public function resolveReviewer(): ?object
    {
        if ($this->reviewed_by && ($user = User::find($this->reviewed_by))) {
            return $user;
        }

        $name = trim((string) $this->issued_by);
        if ($name === '') {
            return null;
        }

        $match = User::whereIn('user_type', ['admin', 'super_admin'])
            ->whereRaw('LOWER(TRIM(name)) = ?', [mb_strtolower($name)])
            ->first();

        return $match ?: (object) ['name' => $name, 'signature_url' => null];
    }

    /**
     * Alias for request() relationship for compatibility.
     */
    public function requestModel(): BelongsTo
    {
        return $this->belongsTo(Request::class, 'request_id', 'id');
    }
}
