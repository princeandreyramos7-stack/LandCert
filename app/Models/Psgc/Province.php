<?php

namespace App\Models\Psgc;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A province, or the thing standing in its place: one of Metro Manila's four
 * districts, or a city that reports straight to its region. `kind` says which.
 *
 * The region is carried here as a name rather than kept in a table of its
 * own: nothing selects a region, but the name still labels a province in the
 * dropdown and stands in for it in a written Metro Manila address.
 */
class Province extends Model
{
    protected $table = 'psgc_provinces';
    protected $primaryKey = 'code';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    public function cities(): HasMany
    {
        return $this->hasMany(CityMunicipality::class, 'province_code', 'code');
    }
}
