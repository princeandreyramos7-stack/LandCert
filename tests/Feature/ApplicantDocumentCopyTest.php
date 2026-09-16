<?php

namespace Tests\Feature;

use App\Models\Report;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The applicant's own copy of the clearance / permit / certification.
 *
 * It is the office's document, so it is signed by the officer who reviewed
 * the application and by the Zoning Administrator - e-signatures included -
 * and it is only there once the office has released it.
 */
class ApplicantDocumentCopyTest extends TestCase
{
    use RefreshDatabase;

    private function signedStaff(): array
    {
        // Both signature files are in the repository.
        $officer = $this->userOf('admin', ['signature_path' => 'images/E-signitures/JeffreyPauig.png']);
        $administrator = $this->userOf('super_admin', ['signature_path' => 'images/E-signitures/zoningadministrator.png']);

        return [$officer, $administrator];
    }

    public function test_nothing_to_print_until_the_office_releases_it(): void
    {
        [$officer] = $this->signedStaff();
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'TUP', 'approved', $officer);

        $this->actingAs($applicant)->get("/my-applications/{$request->id}/print-clearance")->assertForbidden();
        $this->actingAs($applicant)->get("/my-applications/{$request->id}/print-certificate")->assertForbidden();

        $request->update(['released_to_applicant_at' => now()]);

        $this->actingAs($applicant)->get("/my-applications/{$request->id}/print-clearance")->assertOk();
    }

    public function test_the_permit_copy_is_signed_by_the_administrator_and_the_reviewing_officer(): void
    {
        [$officer, $administrator] = $this->signedStaff();
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'TUP', 'released', $officer);
        $request->update(['released_to_applicant_at' => now()]);

        $this->actingAs($applicant)->get("/my-applications/{$request->id}/print-clearance")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Applicant/PrintClearance')
                ->where('application.project_type', 'TUP')
                ->where('reviewer.name', $officer->name)
                ->where('reviewer.signature_url', '/images/E-signitures/JeffreyPauig.png')
                ->where('zoningAdministrator.name', $administrator->name)
                ->where('zoningAdministrator.signature_url', '/images/E-signitures/zoningadministrator.png'));
    }

    public function test_the_certification_copy_is_signed_and_dated_as_issued(): void
    {
        [$officer, $administrator] = $this->signedStaff();
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'ZC', 'released', $officer);
        $request->update(['released_to_applicant_at' => '2026-09-10 09:00:00']);

        $this->actingAs($applicant)->get("/my-applications/{$request->id}/print-certificate")
            ->assertInertia(fn (Assert $page) => $page
                ->component('Applicant/PrintCertificate')
                ->where('zoningAdministrator.signature_url', '/images/E-signitures/zoningadministrator.png')
                ->where('issuedOn', 'September 10, 2026')
                // The whole staff account used to be handed to the page.
                ->missing('reviewer.email'));
    }

    public function test_someone_elses_document_is_not_theirs_to_print(): void
    {
        [$officer] = $this->signedStaff();
        $owner = $this->userOf('applicant');
        $other = $this->userOf('applicant', ['email' => 'other@example.test']);
        $request = $this->application($owner, 'CZC', 'released', $officer);
        $request->update(['released_to_applicant_at' => now()]);

        $this->actingAs($other)->get("/my-applications/{$request->id}/print-clearance")->assertForbidden();
    }
}
