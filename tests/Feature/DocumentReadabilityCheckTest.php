<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/**
 * The no-save check Step 4 of the New Application wizard runs the moment a
 * file is attached, before the applicant has anything to submit (see
 * RequirementDocumentController::checkReadability). Ties the wizard's early
 * feedback to the same rule the final submission enforces - see
 * ReadableDocumentTest for the rule's own behaviour in detail; this file is
 * only about the endpoint around it.
 */
class DocumentReadabilityCheckTest extends TestCase
{
    use RefreshDatabase;

    private function blankImage(): UploadedFile
    {
        $image = imagecreatetruecolor(800, 800);
        $path = tempnam(sys_get_temp_dir(), 'doc') . '.png';
        imagepng($image, $path);
        imagedestroy($image);

        return new UploadedFile($path, 'scan.png', 'image/png', null, true);
    }

    public function test_a_bad_scan_is_refused_with_no_application_to_attach_it_to(): void
    {
        $user = $this->userOf('applicant');

        $this->actingAs($user)
            ->postJson(route('requirements.check-readability'), ['document' => $this->blankImage()])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('document');

        // Nothing about this check is ever written anywhere.
        $this->assertDatabaseCount('requirement_documents', 0);
    }

    public function test_a_legible_file_is_confirmed(): void
    {
        $user = $this->userOf('applicant');

        $this->actingAs($user)
            ->postJson(route('requirements.check-readability'), ['document' => $this->fakePdf('scan.pdf', 40)])
            ->assertOk()
            ->assertJson(['ok' => true]);
    }

    public function test_a_file_over_the_shared_limit_is_refused(): void
    {
        $user = $this->userOf('applicant');

        // A real (if padded) PDF, not the empty stand-in a fake file's
        // integer-size form produces - that would fail on being unreadable
        // instead, which is a different rule than the one under test here
        // (see App\Support\UploadLimits, shared by every upload endpoint).
        $this->actingAs($user)
            ->postJson(route('requirements.check-readability'), [
                'document' => $this->fakePdf('big.pdf', \App\Support\UploadLimits::MAX_FILE_KB + 100),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('document');
    }

    public function test_a_guest_cannot_reach_it(): void
    {
        $this->post(route('requirements.check-readability'), ['document' => $this->blankImage()])
            ->assertRedirect('/login');
    }
}
