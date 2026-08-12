<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Applicant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'applicant_name',
        'applicant_address',
        'applicant_contact',
        'applicant_type',
    ];

    protected $casts = [
        'applicant_type' => 'string',
    ];

    /**
     * Get the user that owns the applicant.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the corporation associated with the applicant.
     */
    public function corporation(): HasOne
    {
        return $this->hasOne(NormalizedCorporation::class);
    }

    /**
     * Get the representatives for the applicant.
     */
    public function representatives(): HasMany
    {
        return $this->hasMany(Representative::class);
    }

    /**
     * Get the primary representative.
     */
    public function primaryRepresentative(): HasOne
    {
        return $this->hasOne(Representative::class)->where('is_primary', true);
    }

    /**
     * Get the requests submitted by this applicant.
     */
    public function requests(): HasMany
    {
        return $this->hasMany(Request::class);
    }

    /**
     * Check if this is a corporate applicant.
     */
    public function isCorporate(): bool
    {
        return $this->applicant_type === 'corporate';
    }

    /**
     * Check if this is an individual applicant.
     */
    public function isIndividual(): bool
    {
        return $this->applicant_type === 'individual';
    }
}
