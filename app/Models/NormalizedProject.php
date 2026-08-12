<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NormalizedProject extends Model
{
    use HasFactory;

    protected $table = 'normalized_projects';

    protected $fillable = [
        'request_id',
        'project_type',
        'project_nature',
        'project_nature_duration',
        'project_nature_years',
        'project_cost',
        'project_description',
    ];

    protected $casts = [
        'project_cost' => 'decimal:2',
        'project_nature_years' => 'integer',
    ];

    /**
     * Get the request that owns the project.
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class);
    }
}
