<?php

namespace App\Models\Psgc;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One of the country's seventeen regions. Reference data from the PSGC:
 * read-only as far as the application is concerned, refilled by PsgcSeeder.
 */
class Region extends Model
{
    protected $table = 'psgc_regions';
    protected $primaryKey = 'code';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    public function provinces(): HasMany
    {
        return $this->hasMany(Province::class, 'region_code', 'code');
    }
}
