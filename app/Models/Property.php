<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'lot_area_sqm',
        'bldg_improvement_sqm',
        'lot_number',
        'title_number',
        'right_over_land',
        'existing_land_use',
    ];

    protected $casts = [
        'lot_area_sqm' => 'decimal:2',
        'bldg_improvement_sqm' => 'decimal:2',
    ];

    /**
     * Get the request that owns the property.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }
}
