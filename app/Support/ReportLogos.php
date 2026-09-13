<?php

namespace App\Support;

/**
 * The office's two logos at the size the downloads carry them.
 *
 * The seal on disk is 900px and 1.4 MB, which would otherwise ride along in
 * every workbook and PDF; each is shrunk once to 200px and kept under
 * storage/app, the way the PDF watermark is. Absolute paths, because DomPDF
 * and the spreadsheet writer both read the file off disk.
 */
class ReportLogos
{
    private const SIZE = 200;

    /** The city seal, for the left of a letterhead. */
    public static function seal(): ?string
    {
        return self::logo('Ilagan.png', 'seal');
    }

    /** The Ilagan 2030 mark, for the right of a letterhead. */
    public static function mark(): ?string
    {
        return self::logo('Ilagan Logo2.png', 'mark');
    }

    private static function logo(string $file, string $name): ?string
    {
        $cached = storage_path("app/report-logo-{$name}.png");
        if (is_file($cached)) {
            return $cached;
        }

        $source = public_path('images/' . $file);
        if (!is_readable($source)) {
            return null;
        }

        try {
            $image = @imagecreatefrompng($source);
            if (!$image) {
                return null;
            }

            $width = self::SIZE;
            $height = (int) round(imagesy($image) * ($width / imagesx($image)));
            $small = imagecreatetruecolor($width, $height);
            imagealphablending($small, false);
            imagesavealpha($small, true);
            imagefilledrectangle($small, 0, 0, $width, $height, imagecolorallocatealpha($small, 0, 0, 0, 127));
            imagecopyresampled($small, $image, 0, 0, 0, 0, $width, $height, imagesx($image), imagesy($image));
            imagedestroy($image);

            $ok = imagepng($small, $cached, 6);
            imagedestroy($small);

            return $ok ? $cached : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
