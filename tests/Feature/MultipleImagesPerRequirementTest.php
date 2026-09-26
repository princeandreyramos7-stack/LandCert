<?php

namespace Tests\Feature;

use App\Models\Request as RequestModel;
use App\Models\RequirementDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * A requirement takes at most one separate photo at initial submission -
 * several loose images attached at once have to be combined into a single
 * PDF first (see RequestController::assertNoMultipleImagesPerRequirement).
 * A PDF has no such limit, and this never counts across different
 * requirements. On a live application, re-uploading against a requirement
 * that already has a file replaces it instead (see
 * RequirementDocumentController::storeApplicantRequirement).
 */
class MultipleImagesPerRequirementTest extends TestCase
{
    use RefreshDatabase;

    private function submission(array $extra = []): array
    {
        return array_merge($this->addressFields(), [
            'declaration' => '1',
            'applicant_name' => 'Juan Dela Cruz',
            'project_nature' => 'New Residential House',
            'project_location_street' => 'Purok 1',
            'project_location_barangay' => 'Alibagu',
            'project_location_municipality' => 'City of Ilagan',
            'project_location_province' => 'Isabela',
            'lot_area_sqm' => 100,
            'right_over_land' => 'Owner',
            'existing_land_use' => 'Vacant',
            'has_written_notice' => 'no',
            'has_similar_application' => 'no',
            'preferred_release_mode' => 'pickup',
        ], $extra);
    }

    /**
     * A real, varied JPEG - not UploadedFile::fake()->image(), which is a
     * solid black square with nothing drawn on it and would be refused by
     * App\Rules\ReadableDocument as blank, for a reason unrelated to what
     * these tests are actually about.
     */
    private function image(string $name = 'scan.jpg'): UploadedFile
    {
        $gd = imagecreatetruecolor(800, 800);
        $white = imagecolorallocate($gd, 255, 255, 255);
        $black = imagecolorallocate($gd, 0, 0, 0);
        imagefill($gd, 0, 0, $white);
        for ($y = 0; $y < 800; $y += 20) {
            for ($x = 0; $x < 800; $x += 20) {
                if ((($x / 20) + ($y / 20)) % 2 === 0) {
                    imagefilledrectangle($gd, $x, $y, $x + 19, $y + 19, $black);
                }
            }
        }

        $path = tempnam(sys_get_temp_dir(), 'img') . '.jpg';
        imagejpeg($gd, $path, 90);
        imagedestroy($gd);

        return new UploadedFile($path, $name, 'image/jpeg', null, true);
    }

    public function test_two_images_for_one_requirement_is_refused_at_submission(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission([
            'requirement_uploads' => [2 => [$this->image('front.jpg'), $this->image('back.jpg')]],
            'requirement_names' => [2 => '2. Right Over Land Documentation'],
        ]))->assertSessionHasErrors('requirement_uploads.2');

        $this->assertSame(0, RequestModel::count());
    }

    public function test_one_image_per_requirement_across_different_requirements_is_fine(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission([
            'requirement_uploads' => [
                2 => [$this->image('title.jpg')],
                3 => [$this->image('vicinity.jpg')],
            ],
            'requirement_names' => [2 => '2. Right Over Land Documentation', 3 => '3. VICINITY MAP'],
        ]))->assertRedirect();

        $this->assertSame(1, RequestModel::count());
    }

    public function test_several_pdfs_for_one_requirement_are_not_limited(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission([
            'requirement_uploads' => [2 => [
                $this->fakePdf('page-1.pdf', 40),
                $this->fakePdf('page-2.pdf', 40),
            ]],
            'requirement_names' => [2 => '2. Right Over Land Documentation'],
        ]))->assertRedirect();

        $this->assertSame(1, RequestModel::count());
    }

    public function test_one_image_and_one_pdf_for_one_requirement_is_fine(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission([
            'requirement_uploads' => [2 => [$this->image('title.jpg'), $this->fakePdf('deed.pdf', 40)]],
            'requirement_names' => [2 => '2. Right Over Land Documentation'],
        ]))->assertRedirect();

        $this->assertSame(1, RequestModel::count());
    }

    /**
     * The live application's own upload page has one file input per
     * requirement, offered as "Upload" then "Replace" - there is no way to
     * attach a second image alongside the first through it, so re-uploading
     * here means replacing what's on file, not appending to it. See
     * RequirementDocumentController::storeApplicantRequirement.
     */
    public function test_uploading_a_second_image_to_a_live_application_replaces_the_first(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');
        $app = $this->application($user, 'CZC', 'in_applicant');

        $this->actingAs($user)->post("/my-applications/{$app->id}/requirement-upload", [
            'requirement_id' => 3,
            'requirement_name' => '3. VICINITY MAP',
            'document' => $this->image('first.jpg'),
        ])->assertSessionHasNoErrors();

        $this->actingAs($user)->post("/my-applications/{$app->id}/requirement-upload", [
            'requirement_id' => 3,
            'requirement_name' => '3. VICINITY MAP',
            'document' => $this->image('second.jpg'),
        ])->assertSessionHasNoErrors();

        $documents = RequirementDocument::where('request_id', $app->id)->where('requirement_id', 3)->get();
        $this->assertCount(1, $documents);
        $this->assertSame('second.jpg', $documents->first()->original_filename);
    }

    /** A PDF re-upload replaces an existing image the same way an image re-upload does. */
    public function test_uploading_a_pdf_after_an_existing_image_replaces_it(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');
        $app = $this->application($user, 'CZC', 'in_applicant');

        $this->actingAs($user)->post("/my-applications/{$app->id}/requirement-upload", [
            'requirement_id' => 3,
            'requirement_name' => '3. VICINITY MAP',
            'document' => $this->image('first.jpg'),
        ])->assertSessionHasNoErrors();

        $this->actingAs($user)->post("/my-applications/{$app->id}/requirement-upload", [
            'requirement_id' => 3,
            'requirement_name' => '3. VICINITY MAP',
            'document' => $this->fakePdf('combined.pdf', 40),
        ])->assertSessionHasNoErrors();

        $documents = RequirementDocument::where('request_id', $app->id)->where('requirement_id', 3)->get();
        $this->assertCount(1, $documents);
        $this->assertSame('combined.pdf', $documents->first()->original_filename);
    }
}
