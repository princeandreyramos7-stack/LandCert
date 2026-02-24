<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PropertyLocation extends Model
{
    protected $fillable = [
        'request_id',
        'latitude',
        'longitude',
        'address',
        'barangay',
        'district',
        'zoning_rule_id',
        'lot_area',
        'lot_number',
        'title_number',
        'boundaries',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'lot_area' => 'decimal:2',
        'boundaries' => 'array',
    ];

    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }

    public function zoningRule(): BelongsTo
    {
        return $this->belongsTo(ZoningRule::class);
    }

    public function dssEvaluations(): HasMany
    {
        return $this->hasMany(DssEvaluation::class);
    }

    public function getCoordinatesAttribute(): array
    {
        return [
            'lat' => (float) $this->latitude,
            'lng' => (float) $this->longitude,
        ];
    }
}
