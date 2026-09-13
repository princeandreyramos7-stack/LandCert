<?php

namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * A stored file, streamed to the browser with a short private cache life.
 *
 * The scans behind this are shown in several places at once - the applicant
 * report's preview, its printed pack and its PDF all draw the same picture -
 * so the browser is told it may keep its copy for a few minutes rather than
 * fetch it again for each, and given an ETag so a later check is answered with
 * a 304 instead of the bytes. Private, because each is one applicant's
 * document, served to one signed-in viewer.
 */
class CachedFileResponse
{
    private const MAX_AGE = 300;

    public static function make(Filesystem $disk, string $path, ?string $name = null): StreamedResponse
    {
        $modified = $disk->lastModified($path);
        $etag = '"' . md5($path . '|' . $disk->size($path) . '|' . $modified) . '"';

        $response = $disk->response($path, $name, [
            'Cache-Control' => 'private, max-age=' . self::MAX_AGE,
            'ETag' => $etag,
            'Last-Modified' => gmdate('D, d M Y H:i:s', $modified) . ' GMT',
        ]);

        // A browser holding a copy asks whether it is still current; when it
        // is, the answer is a 304 with no body and the stream is never opened.
        $response->isNotModified(request());

        return $response;
    }
}
