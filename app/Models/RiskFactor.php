<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RiskFactor extends Model
{
    protected $fillable = [
        'factor_name',
        'category',
        'description',
        'weight',
        'criteria',
        'is_active',
    ];

    protected $casts = [
        'criteria' => 'array',
        'is_active' => 'boolean',
    ];

    public function dssEvaluations(): BelongsToMany
    {
        return $this->belongsToMany(DssEvaluation::class, 'evaluation_risk_assessments')
            ->withPivot('is_present', 'severity', 'notes')
            ->withTimestamps();
    }
}
