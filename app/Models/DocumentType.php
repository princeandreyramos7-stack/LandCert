<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentType extends Model
{
    protected $primaryKey = 'document_type_id';

    protected $fillable = [
        'document_name',
        'description',
        'is_required',
        'max_file_size',
        'allowed_extensions',
        'is_active',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_active' => 'boolean',
        'max_file_size' => 'integer',
    ];

    /**
     * Get all uploaded documents of this type.
     */
    public function uploadedDocuments(): HasMany
    {
        return $this->hasMany(UploadedDocument::class, 'document_type_id', 'document_type_id');
    }

    /**
     * Scope to get only active document types.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only required document types.
     */
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    /**
     * Get allowed extensions as an array.
     */
    public function getAllowedExtensionsArray(): array
    {
        return explode(',', $this->allowed_extensions);
    }

    /**
     * Check if a file extension is allowed.
     */
    public function isExtensionAllowed(string $extension): bool
    {
        return in_array(strtolower($extension), $this->getAllowedExtensionsArray());
    }
}
