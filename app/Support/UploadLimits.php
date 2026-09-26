<?php

namespace App\Support;

/**
 * The one place the applicant-facing per-file upload size lives, so every
 * validation rule that enforces it - the wizard's Step 4, its own no-save
 * check, the post-submission re-upload, and the notarized-form upload - can
 * never drift apart the way project_location_number and lot_number once did.
 *
 * 100MB is well past any real phone photo (those run 3-15MB even at full
 * resolution); it exists so a high-resolution scan or a combined multi-page
 * PDF is never the blocker. See public/.htaccess for the matching
 * upload_max_filesize/post_max_size/memory_limit - raising this alone does
 * nothing if PHP itself still discards anything larger before Laravel ever
 * sees it.
 */
class UploadLimits
{
    public const MAX_FILE_KB = 102400;
}
