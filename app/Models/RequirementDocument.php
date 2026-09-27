<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequirementDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'requirement_id',
        'requirement_name',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size',
        'file_hash',
        'duplicate_of_id',
        'possible_editing_flag',
        'possible_editing_reason',
    ];

    protected $casts = [
        'possible_editing_flag' => 'boolean',
    ];

    /**
     * Get the request that owns the document
     */
    public function request(): BelongsTo
    {
        return $this->belongsTo(Request::class, 'request_id');
    }

    /** The earlier document (on a different application) with the same file hash, if any. */
    public function duplicateOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'duplicate_of_id');
    }
}
