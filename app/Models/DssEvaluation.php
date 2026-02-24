<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DssEvaluation extends Model
{
    protected $fillable = [
        'request_id',
        'property_location_id',
        'recommendation',
        'compliance_score',
        'risk_score',
        'validation_results',
        'violations',
        'warnings',
        'ai_suggestion',
        'evaluated_by',
        'evaluated_at',
    ];

    protected $casts = [
        'validation_results' => 'array',
        'violations' => 'array',
        'warnings' => 'array',
        'evaluated_at' => 'datetime',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    public function propertyLocation(): BelongsTo
    {
        return $this->belongsTo(PropertyLocation::class);
    }

    public function evaluatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluated_by');
    }

    public function riskFactors(): BelongsToMany
    {
        return $this->belongsToMany(RiskFactor::class, 'evaluation_risk_assessments')
            ->withPivot('is_present', 'severity', 'notes')
            ->withTimestamps();
    }

    public function isApprovalRecommended(): bool
    {
        return $this->recommendation === 'approve';
    }

    public function hasViolations(): bool
    {
        return !empty($this->violations);
    }
}
