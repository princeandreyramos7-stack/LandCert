<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Representative extends Model
{
    use HasFactory;

    protected $fillable = [
        'applicant_id',
        'representative_name',
        'representative_address',
        // The PSGC selections the address line above was composed from.
        'address_region_code',
        'address_province_code',
        'address_city_code',
        'address_barangay_code',
        'address_street',
        'representative_email',
        'representative_contact',
        'authorization_letter_path',
        'relationship',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Get the applicant that owns the representative.
     */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
