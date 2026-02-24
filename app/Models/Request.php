<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Request extends Model
{
    protected $fillable = [
        // Page 1: Applicant Information
        'applicant_name',
        'corporation_name',
        'applicant_address',
        'corporation_address',
        'authorized_representative_name',
        'authorized_representative_address',
        'authorized_representative_email',
        
        // Page 2: Project Details
        'project_type',
        'project_nature',
        'project_location_number',
        'project_location_street',
        'project_location_barangay',
        'project_location_city',
        'project_location_municipality',
        'project_location_province',
        'project_area_sqm',
        'lot_area_sqm',
        'bldg_improvement_sqm',
        'right_over_land',
        'project_nature_duration',
        'project_nature_years',
        'project_cost',
        
        // Page 3: Land Uses
        'existing_land_use',
        'has_written_notice',
        'notice_officer_name',
        'notice_dates',
        'has_similar_application',
        'similar_application_offices',
        'similar_application_dates',
        'preferred_release_mode',
        'release_address',
        
        // Status
        'status',
        'user_id',
    ];

    protected $casts = [
        'project_area_sqm' => 'decimal:2',
        'lot_area_sqm' => 'decimal:2',
        'bldg_improvement_sqm' => 'decimal:2',
        'project_nature_years' => 'integer',
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
    public function payments()
    {
        return $this->hasMany(Payment::class, 'request_id');
    }

    /**
     * Get the certificates for this request.
     */
    public function certificates()
    {
        return $this->hasMany(Certificate::class, 'request_id');
    }

    /**
     * Get the property location for this request.
     */
    public function propertyLocation(): HasOne
    {
        return $this->hasOne(PropertyLocation::class);
    }

    /**
     * Get the DSS evaluations for this request.
     */
    public function dssEvaluations(): HasMany
    {
        return $this->hasMany(DssEvaluation::class);
    }

    /**
     * Get the latest DSS evaluation.
     */
    public function latestDssEvaluation(): HasOne
    {
        return $this->hasOne(DssEvaluation::class)->latestOfMany();
    }
}
