<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LandUseInformation extends Model
{
    protected $table = 'land_use_information';
    protected $primaryKey = 'land_use_id';

    protected $fillable = [
        'application_id',
        'existing_land_use',
        'written_notice',
        'notice_officer_name',
        'notice_dates',
        'similar_application',
        'similar_application_offices',
        'similar_application_dates',
    ];

    protected $casts = [
        'notice_dates' => 'date',
        'similar_application_dates' => 'date',
    ];

    /**
     * Get the application that owns this land use information.
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'application_id', 'id');
    }

    /**
     * Check if written notice was given.
     */
    public function hasWrittenNotice(): bool
    {
        return $this->written_notice === 'yes';
    }

    /**
     * Check if there was a similar application.
     */
    public function hasSimilarApplication(): bool
    {
        return $this->similar_application === 'yes';
    }
}
