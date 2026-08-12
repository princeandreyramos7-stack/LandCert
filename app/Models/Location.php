<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'street_address',
        'barangay',
        'city_municipality',
        'province',
        'postal_code',
        'district',
    ];

    /**
     * Get the request that owns the location.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    /**
     * Get the full address as a formatted string.
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->street_address,
            $this->barangay,
            $this->city_municipality,
            $this->province,
            $this->postal_code,
        ]);

        return implode(', ', $parts);
    }
}
