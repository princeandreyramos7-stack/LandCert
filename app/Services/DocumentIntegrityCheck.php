<?php

namespace App\Services;

use App\Models\RequirementDocument;

/**
 * Run after a requirement document is stored on disk. Never blocks an
 * upload and never throws - an unreadable file or a missing PHP extension
 * just means "no flag", not a failed submission. Two independent checks:
 *
 * 1. Duplicate: does this exact file (by content hash) already exist under
 *    a DIFFERENT application? Reusing one file across two requirement slots
 *    on the SAME application is normal and not flagged.
 * 2. Possible editing: a soft, informational signal for staff, built from
 *    EXIF metadata alone (no pixel-level analysis) - a known editing tool's
 *    signature in the Software tag, or no EXIF at all on a file claiming to
 *    be a camera JPEG. JPEG-only: exif_read_data() has nothing to read on
 *    PNG/GIF/WEBP, so applying this to them would flag nearly every scanned
 *    image as suspicious.
 */
class DocumentIntegrityCheck
{
    private const EXIF_READABLE_MIMES = ['image/jpeg', 'image/pjpeg'];

    private const EDITING_SOFTWARE_MARKERS = [
        'photoshop', 'gimp', 'lightroom', 'affinity photo', 'paint.net',
        'snapseed', 'picsart', 'canva', 'pixlr',
    ];

    public function inspect(string $absolutePath, string $mimeType, int $requestId): DocumentIntegrityResult
    {
        $hash = @hash_file('sha256', $absolutePath) ?: null;

        $duplicateOfId = null;
        if ($hash !== null) {
            $duplicateOfId = RequirementDocument::query()
                ->where('file_hash', $hash)
                ->where('request_id', '!=', $requestId)
                ->oldest('id')
                ->value('id');
        }

        [$flag, $reason] = $this->checkEditing($absolutePath, $mimeType);

        return new DocumentIntegrityResult($hash, $duplicateOfId, $flag, $reason);
    }

    /** @return array{0: bool, 1: ?string} */
    private function checkEditing(string $path, string $mimeType): array
    {
        if (!function_exists('exif_read_data') || !in_array($mimeType, self::EXIF_READABLE_MIMES, true)) {
            return [false, null];
        }

        $exif = @exif_read_data($path, null, true);
        if ($exif === false) {
            return [true, 'No camera metadata found in this photo.'];
        }

        $software = $exif['IFD0']['Software'] ?? $exif['EXIF']['Software'] ?? null;
        if (is_string($software)) {
            foreach (self::EDITING_SOFTWARE_MARKERS as $marker) {
                if (stripos($software, $marker) !== false) {
                    return [true, "Edited with {$software}."];
                }
            }
        }

        return [false, null];
    }
}
