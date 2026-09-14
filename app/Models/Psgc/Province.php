<?php

namespace App\Models\Psgc;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A province, or the thing standing in its place: one of Metro Manila's four
 * districts, or a city that reports straight to its region. `kind` says which.
 */
class Province extends Model
{
    protected $table = 'psgc_provinces';
    protected $primaryKey = 'code';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class, 'region_code', 'code');
    }

    public function cities(): HasMany
    {
        return $this->hasMany(CityMunicipality::class, 'province_code', 'code');
    }
}
