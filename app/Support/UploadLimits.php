<?php

namespace App\Support;

/**
 * The one place EVERY requirement-document upload's per-file size limit
 * lives - the applicant wizard's Step 4, its own no-save readability check,
 * the post-submission re-upload, the notarized-form upload, and both
 * staff-side upload endpoints - so a validation rule can never quietly drift
 * from the rest the way project_location_number and lot_number once did.
 *
 * 20MB is well past a real phone photo or a single scanned document (those
 * run a few MB even at full resolution); kept deliberately tighter than PHP
 * itself allows (see public/.htaccess's upload_max_filesize/post_max_size)
 * so the ceiling here, not php.ini, is what actually bounds storage and
 * abuse exposure across every upload path at once.
 */
class UploadLimits
{
    public const MAX_FILE_KB = 20480;
}
