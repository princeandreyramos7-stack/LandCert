<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NormalizedCorporation extends Model
{
    use HasFactory;

    protected $table = 'normalized_corporations';

    protected $fillable = [
        'applicant_id',
        'corporation_name',
        'corporation_address',
        'registration_number',
        'tin',
    ];

    /**
     * Get the applicant that owns the corporation.
     */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
