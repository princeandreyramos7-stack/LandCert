<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Http\UploadedFile;

/**
 * Catches a requirement scan that would only cause trouble later - a blank
 * page, a corrupt file, or a photo too small or too blurred for anyone to
 * read - at the moment it is uploaded, while the applicant can still pick a
 * better one, instead of an officer discovering it during review.
 *
 * This is a set of cheap pixel-level heuristics, not OCR: it cannot tell a
 * sharp photo of the wrong document from the right one, or confirm the text
 * is actually recognisable - only that the photo has visible, in-focus
 * content large enough to plausibly be read. The blur check is tiled (see
 * TILE_* below) specifically so a blurred block of text cannot pass by
 * sitting next to something sharp elsewhere in the same frame - a hand, a
 * table edge, a stapled corner.
 *
 * SAMPLE_WIDTH and the TILE_* thresholds were first tuned against synthetic
 * fixtures only, and that measured wrong: a real 1044px-wide form (normal
 * printed text, not the bold synthetic bars used to stand in for it) was
 * downsampled to the original SAMPLE_WIDTH of 220 and lost enough real
 * detail in the process to read as blurry, rejecting a legible submission.
 * The numbers here were redone directly against that real form and
 * artificially blurred copies of it, at several blur levels, to find where
 * genuine sharp-vs-blurry separation actually sits - not just against
 * synthetic stand-ins. Still not a large labelled set, so keep watching for
 * false positives.
 */
class ReadableDocument implements ValidationRule
{
    /**
     * Below this on either side, an image is too small to read once printed.
     * Was 400 - too strict for a legitimately smaller but still readable
     * photo of a small document. 150 still catches a genuine postage-stamp
     * thumbnail while no longer rejecting a modest one.
     */
    private const MIN_DIMENSION = 150;

    /** Grayscale standard deviation below this reads as a blank/near-blank page. */
    private const MIN_CONTRAST = 12.0;

    /**
     * The side GD samples down to before measuring contrast/sharpness.
     * Was 220 - fine for the bold synthetic fixtures it was first tested
     * against, but that aggressively downsampled a real document's normal-
     * sized printed text into looking blurry before the sharpness check
     * ever ran. 500 keeps enough real detail to judge fairly while still
     * being cheap: ~330ms measured against a 1044x1507 real form.
     */
    private const SAMPLE_WIDTH = 500;

    /**
     * Sharpness is judged tile by tile, not as one average over the whole
     * photo. A single sharp element elsewhere in frame - a hand, a table
     * edge, a stapled corner - used to be enough to pull a blurry page's
     * *average* above the threshold even though the actual text was
     * illegible. Tiling catches that: each square of the sample is judged
     * on its own, so a blurred text block cannot hide behind a sharp
     * border sitting in a few other tiles.
     */
    private const TILE_SIZE = 55;

    /** Below this, a tile reads as blank margin - not part of the verdict either way. */
    private const TILE_MIN_CONTRAST = 10.0;

    /**
     * Edge-response variance below this reads as an out-of-focus tile.
     * Calibrated at this tile size against a real 1044x1507 submitted form
     * and copies of it blurred by 1/2/3/8 Gaussian passes: the real sharp
     * form's tiles measured mostly 1,600-15,500 (90% of its content tiles
     * cleared 1,600); a barely-softened copy (1 pass - the kind of subtle
     * softness an ordinary phone photo has) stayed similar; by 2-3 passes -
     * distinctly blurred - most tiles fell under 1,200. 2,000 sits between
     * "subtle softness, still legible" and "distinctly blurred," not at
     * the edge of either.
     */
    private const TILE_MIN_SHARPNESS = 2000.0;

    /** At least this share of content tiles (not blank margin) must be sharp. */
    private const MIN_SHARP_CONTENT_FRACTION = 0.6;

    /**
     * A scanned PDF is checked by pulling its embedded photos back out and
     * running them through the same checks a standalone photo gets (see
     * checkPdfImages). A combined multi-page submission could embed many;
     * this bounds the work to something that stays fast regardless.
     */
    private const MAX_PDF_IMAGES_CHECKED = 15;

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value instanceof UploadedFile || !$value->isValid()) {
            return; // Other rules (required/file) already say what is wrong.
        }

        $mime = (string) $value->getMimeType();

        if ($mime === 'application/pdf') {
            $this->checkPdf($value, $fail);
            return;
        }

        if (!str_starts_with($mime, 'image/')) {
            return; // Not an image or PDF - not ours to judge.
        }

        $this->checkImage($value, $fail);
    }

    /**
     * A scanned PDF page can be just as blank or blurry as a photo. Fully
     * rasterising a PDF page to check it needs Imagick + Ghostscript, which
     * this server does not have - but a scanned page is usually nothing
     * more than a scanner or "photo to PDF" app wrapping one photo per
     * page, so pulling those embedded photos back out (see checkPdfImages)
     * and running the same checks on them catches the common case without
     * needing either. First, though, that the file is a real, intact PDF at
     * all - not empty, not truncated, not something else wearing a .pdf
     * extension.
     */
    private function checkPdf(UploadedFile $file, Closure $fail): void
    {
        $header = @file_get_contents($file->getRealPath(), false, null, 0, 5);

        if ($header !== '%PDF-' || $file->getSize() < 200) {
            $fail('The :attribute could not be read. Please resubmit a valid, undamaged PDF.');
            return;
        }

        $this->checkPdfImages($file, $fail);
    }

    /**
     * Not every PDF can be judged this way, and that is fine: a genuinely
     * digital PDF (typed, not scanned) has no embedded photo to check in
     * the first place, an encrypted or unusually structured one may not
     * parse at all, and an embedded image encoded as a raw bitmap stream
     * rather than a standard JPEG/PNG is not something GD can open either.
     * All three are skipped rather than failed - the same as a standalone
     * image GD itself cannot open.
     */
    private function checkPdfImages(UploadedFile $file, Closure $fail): void
    {
        try {
            $document = (new \Smalot\PdfParser\Parser())->parseFile($file->getRealPath());
            $images = $document->getObjectsByType('XObject', 'Image');
        } catch (\Throwable $e) {
            return;
        }

        $checked = 0;
        $failed = false;
        // A second bad page would otherwise add a second near-identical
        // message to the same field - one is enough to say the PDF needs
        // to be redone; it does not need to be said once per page.
        $reportOnce = function (string $message) use ($fail, &$failed) {
            if ($failed) {
                return;
            }
            $failed = true;
            $fail($message);
        };

        foreach ($images as $xobject) {
            if ($failed || $checked >= self::MAX_PDF_IMAGES_CHECKED) {
                return;
            }

            $bytes = (string) $xobject->getContent();
            if ($bytes === '') {
                continue;
            }

            $info = @getimagesizefromstring($bytes);
            if (!$info) {
                continue; // A raw bitmap stream, most likely - not ours to judge.
            }

            $checked++;
            $this->checkImageBytes($bytes, $info[0], $info[1], $reportOnce);
        }
    }

    private function checkImage(UploadedFile $file, Closure $fail): void
    {
        $path = $file->getRealPath();
        $info = @getimagesize($path);

        if (!$info) {
            $fail('The :attribute is not a readable image. Please resubmit a clearer photo or scan.');
            return;
        }

        [$width, $height, $type] = $info;

        if ($width < self::MIN_DIMENSION || $height < self::MIN_DIMENSION) {
            $fail("The :attribute is too small to read ({$width}\u{00d7}{$height}px). Please resubmit a clearer, higher-resolution photo or scan.");
            return;
        }

        if (!$this->withinMemoryBudget($width, $height)) {
            // Too large to safely decode alongside the rest of this request
            // on a constrained host. Not a reason to block a genuine upload -
            // only the checks that need the full image are skipped.
            return;
        }

        $source = $this->decode($path, $type);
        if (!$source) {
            return; // An oddity GD cannot open; the mimes/extension rule already vets the type.
        }

        $this->checkDecodedImage($source, $fail);
    }

    /**
     * Shared by a standalone photo and a photo pulled out of a PDF page:
     * everything past "the bytes are open in GD" is identical either way.
     */
    private function checkImageBytes(string $bytes, int $width, int $height, Closure $fail): void
    {
        if ($width < self::MIN_DIMENSION || $height < self::MIN_DIMENSION) {
            // Silently too small, not reported: a PDF often carries a tiny
            // embedded icon or logo alongside the real scanned page, and
            // naming "an embedded image" is not something the applicant, who
            // never saw individual images, only the PDF, can act on the way
            // they can act on a message naming their own attached photo.
            return;
        }

        if (!$this->withinMemoryBudget($width, $height)) {
            return;
        }

        $source = @imagecreatefromstring($bytes);
        if (!$source) {
            return;
        }

        $this->checkDecodedImage($source, $fail);
    }

    private function checkDecodedImage(\GdImage $source, Closure $fail): void
    {
        $sample = imagescale($source, self::SAMPLE_WIDTH, -1, IMG_BICUBIC);
        imagedestroy($source);
        if (!$sample) {
            return;
        }

        $gray = $this->grayscaleGrid($sample);
        imagedestroy($sample);

        $contrast = sqrt($this->variance(array_merge(...$gray)));
        if ($contrast < self::MIN_CONTRAST) {
            $fail('The :attribute looks blank or washed out. Please resubmit a clearer photo or scan with visible content.');
            return;
        }

        if (!$this->hasSharpContent($gray)) {
            $fail('The :attribute looks too blurry to read. Please resubmit a sharper, more focused photo or scan.');
        }
    }

    /**
     * Whether enough of the image's actual content - as opposed to blank
     * margin - is in focus. See the TILE_* constants for why this is tiled
     * rather than one whole-image average.
     */
    private function hasSharpContent(array $grid): bool
    {
        $height = count($grid);
        $width = $height > 0 ? count($grid[0]) : 0;

        if ($width < self::TILE_SIZE * 2 || $height < self::TILE_SIZE * 2) {
            // Too small a sample to tile meaningfully - one whole-image
            // judgement rather than skipping the check entirely.
            return $this->variance($this->edges($grid)) >= self::TILE_MIN_SHARPNESS;
        }

        $sharpTiles = 0;
        $contentTiles = 0;

        for ($y = 0; $y + self::TILE_SIZE <= $height; $y += self::TILE_SIZE) {
            for ($x = 0; $x + self::TILE_SIZE <= $width; $x += self::TILE_SIZE) {
                $tile = array_map(
                    fn (array $row) => array_slice($row, $x, self::TILE_SIZE),
                    array_slice($grid, $y, self::TILE_SIZE)
                );

                if (sqrt($this->variance(array_merge(...$tile))) < self::TILE_MIN_CONTRAST) {
                    continue; // Blank margin - not part of the verdict either way.
                }

                $contentTiles++;
                if ($this->variance($this->edges($tile)) >= self::TILE_MIN_SHARPNESS) {
                    $sharpTiles++;
                }
            }
        }

        if ($contentTiles === 0) {
            // Every tile read as blank at this resolution even though the
            // whole-image contrast check above passed - an edge case, not a
            // reason to fail an upload over a check that found nothing to judge.
            return true;
        }

        return ($sharpTiles / $contentTiles) >= self::MIN_SHARP_CONTENT_FRACTION;
    }

    /**
     * Whether decoding an image this large is safe to attempt alongside
     * whatever else this request is already holding in memory. GD holds a
     * decoded truecolor image as roughly width x height x 4 bytes; on a
     * host with a tight memory_limit, a large phone photo could exhaust it
     * and take the whole request down rather than fail cleanly - so this
     * only proceeds when there is generous headroom, and quietly skips the
     * pixel checks otherwise.
     */
    private function withinMemoryBudget(int $width, int $height): bool
    {
        $limit = $this->parseMemoryLimit((string) ini_get('memory_limit'));
        if ($limit <= 0) {
            return true; // -1 or unset: no limit configured.
        }

        $needed = $width * $height * 4;
        $available = $limit - memory_get_usage(true);

        return $needed < $available * 0.5;
    }

    private function parseMemoryLimit(string $limit): int
    {
        if ($limit === '' || $limit === '-1') {
            return -1;
        }

        $unit = strtolower(substr($limit, -1));
        $value = (int) $limit;

        return match ($unit) {
            'g' => $value * 1024 * 1024 * 1024,
            'm' => $value * 1024 * 1024,
            'k' => $value * 1024,
            default => $value,
        };
    }

    /** @return \GdImage|false */
    private function decode(string $path, int $type)
    {
        return match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_GIF => @imagecreatefromgif($path),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : false,
            IMAGETYPE_BMP => function_exists('imagecreatefrombmp') ? @imagecreatefrombmp($path) : false,
            default => false,
        };
    }

    /** A height x width grid of 0-255 luminance values, read from the (already small) sample. */
    private function grayscaleGrid(\GdImage $image): array
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $grid = [];

        for ($y = 0; $y < $height; $y++) {
            $row = [];
            for ($x = 0; $x < $width; $x++) {
                $rgb = imagecolorat($image, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                $row[] = (int) round(0.299 * $r + 0.587 * $g + 0.114 * $b);
            }
            $grid[] = $row;
        }

        return $grid;
    }

    private function variance(array $values): float
    {
        $count = count($values);
        if ($count === 0) {
            return 0.0;
        }

        $mean = array_sum($values) / $count;

        return array_sum(array_map(fn ($v) => ($v - $mean) ** 2, $values)) / $count;
    }

    /**
     * A cheap stand-in for a Laplacian filter: for every interior pixel, how
     * far it differs from its four neighbours. A sharp photo has plenty of
     * strong edges (printed text, form rules); a blurred one has almost
     * none, so the variance of this measure is low - whether taken across
     * a whole sample or just one tile of it.
     */
    private function edges(array $grid): array
    {
        $height = count($grid);
        $width = $height > 0 ? count($grid[0]) : 0;

        if ($width < 3 || $height < 3) {
            return [];
        }

        $edges = [];
        for ($y = 1; $y < $height - 1; $y++) {
            for ($x = 1; $x < $width - 1; $x++) {
                $center = $grid[$y][$x];
                $edges[] = (4 * $center)
                    - $grid[$y - 1][$x]
                    - $grid[$y + 1][$x]
                    - $grid[$y][$x - 1]
                    - $grid[$y][$x + 1];
            }
        }

        return $edges;
    }
}
