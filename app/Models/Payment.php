<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'request_id',
        'user_id',
        'amount',
        'payment_method',
        'receipt_number',
        'receipt_file_path',
        'payment_date',
        'payment_status',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'notes',
        // Online-payment readiness columns - unused while every payment is
        // 'manual' (the default). See PaymentGatewayService.
        'payment_channel',
        'gateway_provider',
        'gateway_reference',
        'gateway_status',
        'gateway_paid_at',
        'gateway_response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
        'verified_at' => 'datetime',
        'gateway_paid_at' => 'datetime',
        'gateway_response' => 'array',
    ];

    /**
     * Get the request that owns the payment.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Get the user who verified the payment.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Alias for verifiedBy relationship (for consistency with controller usage)
     */
    public function verifiedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the certificates for this payment.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Get the certificate for this payment (singular - one-to-one).
     */
    public function certificate()
    {
        return $this->hasOne(Certificate::class);
    }
}
