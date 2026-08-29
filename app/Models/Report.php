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
     * Alias for request() relationship for compatibility.
     */
    public function requestModel(): BelongsTo
    {
        return $this->belongsTo(Request::class, 'request_id', 'id');
    }
}
