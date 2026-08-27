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
        'application_number',
        'decision_number',
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
     * Generate a unique Application Number in the format TPZ-MM-YY-NNNN.
     * Increments per applicant, creating a unique application number for each applicant.
     * 
     * @param int $applicantId The ID of the applicant
     * @return string e.g. TPZ-03-26-9627
     */
    public static function generateApplicationNumber(int $applicantId): string
    {
        $date = now();
        $month = $date->format('m');
        $year = $date->format('y');
        $prefix = 'TPZ';
        
        // Find the highest sequence number for this applicant
        $lastRequest = self::where('applicant_id', $applicantId)
            ->whereNotNull('application_number')
            ->orderByRaw("CAST(SUBSTRING_INDEX(application_number, '-', -1) AS UNSIGNED) DESC")
            ->value('application_number');
        
        $nextSeq = 1;
        if ($lastRequest) {
            preg_match('/-(\d+)$/', $lastRequest, $matches);
            $nextSeq = isset($matches[1]) ? (int) $matches[1] + 1 : 1;
        }
        
        // Ensure uniqueness
        $attempt = 0;
        do {
            $candidate = sprintf('%s-%s-%s-%04d', $prefix, $month, $year, $nextSeq + $attempt);
            $attempt++;
        } while (self::where('application_number', $candidate)->exists());
        
        return $candidate;
    }

    /**
     * Generate a unique Decision Number in the format XXX-MM-YY-NNNN-NNNN.
     * The prefix XXX is determined by the permit type set by admin.
     * If no permit type is set, it defaults to 'CPDO'.
     * 
     * @param string|null $permitType The type of permit (e.g., 'Certificate of Zoning Compliance')
     * @return string e.g. CZC-02-26-3114-5151 or CPDO-02-26-3114-5151
     */
    public static function generateDecisionNumber(?string $permitType = null): string
    {
        $date = now();
        $month = $date->format('m');
        $year = $date->format('y');
        
        // Determine prefix based on permit type
        $prefix = 'CPDO'; // Default prefix
        
        if ($permitType) {
            // Map permit types to their prefixes
            $permitTypePrefixes = [
                'Certificate of Zoning Compliance' => 'CZC',
                'Locational Clearance' => 'LC',
                'Development Permit' => 'DP',
                'Zoning Certificate' => 'ZC',
                'Building Permit' => 'BP',
                'Occupancy Permit' => 'OP',
                // Add more permit type mappings as needed
            ];
            
            $prefix = $permitTypePrefixes[$permitType] ?? 'CPDO';
        }
        
        // Find the highest sequence number for decision numbers with this prefix
        $lastDecision = self::whereNotNull('decision_number')
            ->where('decision_number', 'like', $prefix . '-%')
            ->orderByRaw("
                CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(decision_number, '-', -2), '-', 1) AS UNSIGNED) DESC,
                CAST(SUBSTRING_INDEX(decision_number, '-', -1) AS UNSIGNED) DESC
            ")
            ->value('decision_number');
        
        $seq1 = 1;
        $seq2 = 1;
        
        if ($lastDecision) {
            // Extract the last two sequence numbers
            preg_match('/-(\d+)-(\d+)$/', $lastDecision, $matches);
            if (isset($matches[1]) && isset($matches[2])) {
                $seq1 = (int) $matches[1];
                $seq2 = (int) $matches[2] + 1;
                
                // If seq2 exceeds 9999, increment seq1 and reset seq2
                if ($seq2 > 9999) {
                    $seq1++;
                    $seq2 = 1;
                }
            }
        }
        
        // Ensure uniqueness
        $attempt = 0;
        do {
            $currentSeq2 = $seq2 + $attempt;
            $currentSeq1 = $seq1;
            
            if ($currentSeq2 > 9999) {
                $currentSeq1 = $seq1 + floor($currentSeq2 / 10000);
                $currentSeq2 = $currentSeq2 % 10000;
                if ($currentSeq2 === 0) {
                    $currentSeq2 = 1;
                }
            }
            
            $candidate = sprintf('%s-%s-%s-%04d-%04d', $prefix, $month, $year, $currentSeq1, $currentSeq2);
            $attempt++;
        } while (self::where('decision_number', $candidate)->exists());
        
        return $candidate;
    }
}
