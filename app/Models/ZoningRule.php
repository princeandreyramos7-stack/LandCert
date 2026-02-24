<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ZoningRule extends Model
{
    protected $fillable = [
        'zone_code',
        'zone_name',
        'zone_type',
        'description',
        'allowed_uses',
        'min_lot_area',
        'max_lot_area',
        'max_building_height',
        'max_floor_area_ratio',
        'min_setback_front',
        'min_setback_rear',
        'min_setback_side',
        'distance_restrictions',
        'environmental_restrictions',
        'is_active',
    ];

    protected $casts = [
        'allowed_uses' => 'array',
        'distance_restrictions' => 'array',
        'environmental_restrictions' => 'array',
        'is_active' => 'boolean',
        'min_lot_area' => 'decimal:2',
        'max_lot_area' => 'decimal:2',
        'max_building_height' => 'decimal:2',
        'max_floor_area_ratio' => 'decimal:2',
    ];

    public function propertyLocations(): HasMany
    {
        return $this->hasMany(PropertyLocation::class);
    }

    public function isAllowedUse(string $use): bool
    {
        return in_array($use, $this->allowed_uses ?? []);
    }

    public function validateLotArea(float $area): bool
    {
        if ($this->min_lot_area && $area < $this->min_lot_area) {
            return false;
        }
        if ($this->max_lot_area && $area > $this->max_lot_area) {
            return false;
        }
        return true;
    }
}
