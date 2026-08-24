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

    /**
     * Get the requirement documents for this request.
     */
    public function requirementDocuments(): HasMany
    {
        return $this->hasMany(RequirementDocument::class);
    }

    /**
     * Generate a unique CPD control number in the format CPD-XXX-0.
     * Should be called right after the request record is created.
     *
     * @return string  e.g. CPD-001-0
     */
    public static function generateControlNumber(): string
    {
        $attempt = 0;
        do {
            // Find the highest existing sequence number among CPD-NNN-0 style numbers
            $last = self::whereNotNull('control_number')
                ->where('control_number', 'like', 'CPD-%-0')
                ->orderByRaw("CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(control_number, '-', 2), '-', -1) AS UNSIGNED) DESC")
                ->value('control_number');

            $nextSeq = 1 + $attempt;
            if ($last) {
                preg_match('/CPD-(\d+)-/', $last, $matches);
                $nextSeq = isset($matches[1]) ? (int) $matches[1] + 1 + $attempt : 1 + $attempt;
            }

            $candidate = sprintf('CPD-%03d-0', $nextSeq);
            $attempt++;
        } while (self::where('control_number', $candidate)->exists());

        return $candidate;
    }
}
