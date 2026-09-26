<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * A requirement scan too poor to be read gets caught at the moment it is
 * uploaded (see App\Rules\ReadableDocument), through the same endpoint an
 * applicant's own upload reaches (see ApplicantRequirementUploadTest for the
 * ownership/authorization side of that endpoint - this file is only about
 * what the rule itself lets through).
 */
class ReadableDocumentTest extends TestCase
{
    use RefreshDatabase;

    private function makeApplication(User $owner): \App\Models\Request
    {
        $applicant = \App\Models\Applicant::create([
            'applicant_name' => 'Test Applicant',
            'applicant_address' => '1 Test Street',
            'applicant_type' => 'individual',
        ]);

        return \App\Models\Request::create([
            'user_id' => $owner->id,
            'applicant_id' => $applicant->id,
            'status' => 'in_applicant',
            'application_number' => 'TPZ-TEST-0001',
        ]);
    }

    /** A synthetic PNG built pixel by pixel, so the test controls exactly what the rule sees. */
    private function gdImage(callable $draw, int $width = 800, int $height = 800): UploadedFile
    {
        $image = imagecreatetruecolor($width, $height);
        $draw($image, $width, $height);

        $path = tempnam(sys_get_temp_dir(), 'doc') . '.png';
        imagepng($image, $path);
        imagedestroy($image);

        return new UploadedFile($path, 'scan.png', 'image/png', null, true);
    }

    private function upload(User $user, \App\Models\Request $app, UploadedFile $file)
    {
        return $this->actingAs($user)->post("/my-applications/{$app->id}/requirement-upload", [
            'requirement_id' => 3,
            'requirement_name' => '3. VICINITY MAP',
            'document' => $file,
        ]);
    }

    /** Raw JPEG bytes: printed-text-sized marks, sharp unless $blur shrinks and re-grows it away. */
    private function textDocJpeg(bool $blur = false): string
    {
        $image = imagecreatetruecolor(800, 1000);
        $white = imagecolorallocate($image, 255, 255, 255);
        $black = imagecolorallocate($image, 0, 0, 0);
        imagefill($image, 0, 0, $white);
        mt_srand(42);
        for ($y = 40; $y < 960; $y += 18) {
            for ($x = 40; $x < 760; $x += mt_rand(14, 60)) {
                imagefilledrectangle($image, $x, $y, $x + mt_rand(8, 40), $y + 10, $black);
            }
        }
        if ($blur) {
            $small = imagescale($image, 6, 6, IMG_BICUBIC);
            $blurred = imagescale($small, 800, 1000, IMG_BICUBIC);
            imagedestroy($image);
            imagedestroy($small);
            $image = $blurred;
        }
        ob_start();
        imagejpeg($image, null, 90);
        $bytes = ob_get_clean();
        imagedestroy($image);

        return $bytes;
    }

    /** A real PDF (via dompdf) wrapping one photo per page - what a scanning app produces. */
    private function pdfWithEmbeddedImages(array $jpegByteStrings): UploadedFile
    {
        $html = '<html><body style="margin:0">';
        foreach ($jpegByteStrings as $i => $bytes) {
            $sep = $i > 0 ? 'style="page-break-before: always;"' : '';
            $html .= "<div {$sep}><img src=\"data:image/jpeg;base64," . base64_encode($bytes) . '" style="width:100%"></div>';
        }
        $html .= '</body></html>';

        $dompdf = new \Dompdf\Dompdf();
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();

        $path = tempnam(sys_get_temp_dir(), 'doc') . '.pdf';
        file_put_contents($path, $dompdf->output());

        return new UploadedFile($path, 'scan.pdf', 'application/pdf', null, true);
    }

    public function test_a_blank_scan_is_refused(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        // imagecreatetruecolor() alone is already a solid black canvas -
        // exactly what a lens cap, a failed scan, or a blank page looks like.
        $blank = $this->gdImage(fn ($img) => null);

        $this->upload($user, $app, $blank)->assertSessionHasErrors('document');
        $this->assertDatabaseCount('requirement_documents', 0);
    }

    public function test_a_too_small_image_is_refused(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $tiny = $this->gdImage(function ($img, $w, $h) {
            imagefill($img, 0, 0, imagecolorallocate($img, 255, 255, 255));
        }, 100, 100);

        $this->upload($user, $app, $tiny)->assertSessionHasErrors('document');
        $this->assertDatabaseCount('requirement_documents', 0);
    }

    public function test_a_blurred_out_of_focus_scan_is_refused(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        // Scattered black marks on white - printed text, in miniature - then
        // shrunk down to a few pixels and blown back up. What survives is
        // the rough light/dark layout (so it is not caught as "blank"), but
        // every hard edge a real letter would have is gone, the way it is
        // in an out-of-focus photo.
        $sharp = imagecreatetruecolor(800, 800);
        $white = imagecolorallocate($sharp, 255, 255, 255);
        $black = imagecolorallocate($sharp, 0, 0, 0);
        imagefill($sharp, 0, 0, $white);
        mt_srand(42);
        for ($y = 40; $y < 760; $y += 18) {
            for ($x = 40; $x < 760; $x += mt_rand(14, 60)) {
                imagefilledrectangle($sharp, $x, $y, $x + mt_rand(8, 40), $y + 10, $black);
            }
        }
        $small = imagescale($sharp, 6, 6, IMG_BICUBIC);
        $softened = imagescale($small, 800, 800, IMG_BICUBIC);
        imagedestroy($sharp);
        imagedestroy($small);

        $path = tempnam(sys_get_temp_dir(), 'doc') . '.png';
        imagepng($softened, $path);
        imagedestroy($softened);
        $blurry = new UploadedFile($path, 'scan.png', 'image/png', null, true);

        $this->upload($user, $app, $blurry)->assertSessionHasErrors('document');
        $this->assertDatabaseCount('requirement_documents', 0);
    }

    /**
     * The case a whole-image average blur check misses: the frame around
     * the shot (a table edge, a hand, a phone case) is perfectly sharp,
     * but the actual text in the middle is not. The check has to be tiled
     * to catch this - the sharp border alone was previously enough to
     * pull a blurry page's overall average above the threshold.
     */
    public function test_a_sharp_border_around_blurry_text_is_still_refused(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $sharp = imagecreatetruecolor(800, 800);
        $white = imagecolorallocate($sharp, 255, 255, 255);
        $black = imagecolorallocate($sharp, 0, 0, 0);
        imagefill($sharp, 0, 0, $white);
        mt_srand(42);
        for ($y = 40; $y < 760; $y += 18) {
            for ($x = 40; $x < 760; $x += mt_rand(14, 60)) {
                imagefilledrectangle($sharp, $x, $y, $x + mt_rand(8, 40), $y + 10, $black);
            }
        }
        // A sharp, high-contrast border around the whole frame - what a
        // whole-image average would happily average the blur away against.
        imagerectangle($sharp, 5, 5, 794, 794, $black);
        imagerectangle($sharp, 6, 6, 793, 793, $black);
        imagerectangle($sharp, 7, 7, 792, 792, $black);

        // Blur only the interior - the text - leaving the border untouched.
        $inner = imagecreatetruecolor(760, 760);
        imagecopy($inner, $sharp, 0, 0, 20, 20, 760, 760);
        $small = imagescale($inner, 6, 6, IMG_BICUBIC);
        $blurredInner = imagescale($small, 760, 760, IMG_BICUBIC);
        imagecopy($sharp, $blurredInner, 20, 20, 0, 0, 760, 760);
        imagedestroy($inner);
        imagedestroy($small);
        imagedestroy($blurredInner);

        $path = tempnam(sys_get_temp_dir(), 'doc') . '.png';
        imagepng($sharp, $path);
        imagedestroy($sharp);
        $mixed = new UploadedFile($path, 'scan.png', 'image/png', null, true);

        $this->upload($user, $app, $mixed)->assertSessionHasErrors('document');
        $this->assertDatabaseCount('requirement_documents', 0);
    }

    /**
     * Regression guard for a real false positive: a genuinely legible photo
     * of a printed form (normal-sized text, not this file's bold synthetic
     * stand-in) was rejected as "too blurry" because the check downsampled
     * every image to a fixed 220px width before judging it, which threw
     * away enough of the real text's detail to look out of focus. Ordinary
     * phone-camera softness - not enough to make anything illegible - must
     * not be enough to fail this on its own; only a real, own-fault blur
     * (see the two tests above) should be.
     */
    public function test_ordinary_camera_softness_is_still_accepted(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $sharp = imagecreatetruecolor(1044, 1507);
        $white = imagecolorallocate($sharp, 255, 255, 255);
        $black = imagecolorallocate($sharp, 0, 0, 0);
        imagefill($sharp, 0, 0, $white);
        mt_srand(7);
        // Thin, small marks - the size real printed form text actually is,
        // not the thick bars the other fixtures here use as a stand-in.
        for ($y = 40; $y < 1467; $y += 14) {
            for ($x = 40; $x < 1004; $x += mt_rand(10, 40)) {
                imagefilledrectangle($sharp, $x, $y, $x + mt_rand(4, 22), $y + 4, $black);
            }
        }
        // One light Gaussian pass: the mild softness an ordinary, not
        // perfectly steady phone photo has, well short of "out of focus."
        imagefilter($sharp, IMG_FILTER_GAUSSIAN_BLUR);

        $path = tempnam(sys_get_temp_dir(), 'doc') . '.png';
        imagepng($sharp, $path);
        imagedestroy($sharp);
        $photo = new UploadedFile($path, 'scan.png', 'image/png', null, true);

        $this->upload($user, $app, $photo)->assertSessionHasNoErrors();
        $this->assertDatabaseCount('requirement_documents', 1);
    }

    public function test_a_sharp_legible_scan_is_accepted(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        // A checkerboard: a hard, high-contrast edge at every square
        // boundary - the opposite of a blurred photo - the way printed text
        // on a page reads to this same check.
        $sharp = $this->gdImage(function ($img, $w, $h) {
            $white = imagecolorallocate($img, 255, 255, 255);
            $black = imagecolorallocate($img, 0, 0, 0);
            imagefill($img, 0, 0, $white);
            $square = 20;
            for ($y = 0; $y < $h; $y += $square) {
                for ($x = 0; $x < $w; $x += $square) {
                    if ((($x / $square) + ($y / $square)) % 2 === 0) {
                        imagefilledrectangle($img, $x, $y, $x + $square - 1, $y + $square - 1, $black);
                    }
                }
            }
        });

        $this->upload($user, $app, $sharp)->assertSessionHasNoErrors();
        $this->assertDatabaseCount('requirement_documents', 1);
    }

    public function test_a_corrupt_pdf_is_refused(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $fake = UploadedFile::fake()->createWithContent('scan.pdf', 'this is not a pdf, just text wearing the extension');

        $this->upload($user, $app, $fake)->assertSessionHasErrors('document');
        $this->assertDatabaseCount('requirement_documents', 0);
    }

    public function test_a_structurally_valid_pdf_is_accepted(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $this->upload($user, $app, $this->fakePdf('scan.pdf', 40))->assertSessionHasNoErrors();
        $this->assertDatabaseCount('requirement_documents', 1);
    }

    /**
     * A scanned PDF is usually a scanner or "photo to PDF" app wrapping one
     * photo per page and nothing more - pulling that photo back out and
     * running the same checks a standalone one gets catches most of what
     * matters without needing a full PDF rasteriser (Imagick + Ghostscript),
     * which this server does not have. See ReadableDocument::checkPdfImages.
     */
    public function test_a_pdf_wrapping_a_sharp_photo_is_accepted(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $pdf = $this->pdfWithEmbeddedImages([$this->textDocJpeg(false)]);

        $this->upload($user, $app, $pdf)->assertSessionHasNoErrors();
        $this->assertDatabaseCount('requirement_documents', 1);
    }

    public function test_a_pdf_wrapping_a_blurry_photo_is_refused(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $pdf = $this->pdfWithEmbeddedImages([$this->textDocJpeg(true)]);

        $this->upload($user, $app, $pdf)->assertSessionHasErrors('document');
        $this->assertDatabaseCount('requirement_documents', 0);
    }

    public function test_a_multi_page_pdf_with_one_blurry_page_is_refused(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $pdf = $this->pdfWithEmbeddedImages([
            $this->textDocJpeg(false),
            $this->textDocJpeg(true), // page 2 is the blurry one
            $this->textDocJpeg(false),
        ]);

        $this->upload($user, $app, $pdf)->assertSessionHasErrors('document');
        $this->assertDatabaseCount('requirement_documents', 0);
    }

    /** A genuinely digital PDF - typed, not scanned - has no photo to check; nothing here should fail it. */
    public function test_a_text_only_pdf_with_no_embedded_image_is_accepted(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $dompdf = new \Dompdf\Dompdf();
        $dompdf->loadHtml('<html><body><h1>Authorization Letter</h1><p>I authorize Juan to act on my behalf.</p></body></html>');
        $dompdf->render();
        $path = tempnam(sys_get_temp_dir(), 'doc') . '.pdf';
        file_put_contents($path, $dompdf->output());
        $pdf = new UploadedFile($path, 'letter.pdf', 'application/pdf', null, true);

        $this->upload($user, $app, $pdf)->assertSessionHasNoErrors();
        $this->assertDatabaseCount('requirement_documents', 1);
    }
}
