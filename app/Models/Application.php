<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    protected $fillable = [
        'corp_id',
        'project_id',
        'applicant_name',
        'applicant_address',
        'authorized_representative',
        'representative_address',
        'authorization_letter_path',
        'preffered_release',
    ];

    /**
     * Get the corporation that owns the application.
     */
    public function corporation(): BelongsTo
    {
        return $this->belongsTo(Corporation::class, 'corp_id');
    }

    /**
     * Get the project that owns the application.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    /**
     * Get the report for the application.
     */
    public function report(): HasOne
    {
        return $this->hasOne(Report::class, 'app_id', 'id');
    }

    /**
     * Get the land use information for the application.
     */
    public function landUseInformation(): HasOne
    {
        return $this->hasOne(LandUseInformation::class, 'application_id', 'id');
    }

    /**
     * Get all uploaded documents for the application.
     */
    public function uploadedDocuments(): HasMany
    {
        return $this->hasMany(UploadedDocument::class, 'application_id', 'id');
    }

    /**
     * Get all evaluations for the application.
     */
    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'application_id', 'id');
    }

    /**
     * Get the latest evaluation for the application.
     */
    public function latestEvaluation(): HasOne
    {
        return $this->hasOne(Evaluation::class, 'application_id', 'id')->latestOfMany('evaluation_date');
    }
}
