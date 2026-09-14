<?php

namespace App\Models\Psgc;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Barangay extends Model
{
    protected $table = 'psgc_barangays';
    protected $primaryKey = 'code';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    public function city(): BelongsTo
    {
        return $this->belongsTo(CityMunicipality::class, 'city_code', 'code');
    }
}
