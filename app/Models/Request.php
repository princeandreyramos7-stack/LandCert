<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Request extends Model
{
    protected $fillable = [
        // Core request fields
        'control_number',
        'user_id',
        'applicant_id',
        
        // Previous applications info
        'has_written_notice',
        'notice_officer_name',
        'notice_dates',
        'has_similar_application',
        'similar_application_offices',
        'similar_application_dates',
        
        // Release preferences
        'preferred_release_mode',
        'release_address',
        
        // Status
        'status',
    ];

    protected $casts = [
        'notice_dates' => 'date',
        'similar_application_dates' => 'date',
    ];

    /**
     * Get the user that owns the request.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the application for this request.
     */
    public function application()
    {
        return $this->hasOne(Application::class, 'applicant_name', 'applicant_name')
            ->where('applicant_address', $this->applicant_address);
    }

    /**
     * Get the payments for this request.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the certificates for this request.
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /**
     * Get the applicant for this request (normalized).
     */
    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    /**
     * Get the project details (normalized).
     */
    public function project(): HasOne
    {
        return $this->hasOne(NormalizedProject::class);
    }

    /**
     * Get the property details (normalized).
     */
    public function property(): HasOne
    {
        return $this->hasOne(Property::class);
    }

    /**
     * Get the location details (normalized).
     */
    public function location(): HasOne
    {
        return $this->hasOne(Location::class);
    }

    /**
     * Get the reports for this request.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
