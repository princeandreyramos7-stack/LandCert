<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\Representative;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The 2026-09-17 round of fixes to the application flow: the authorization
 * letter is kept, the representative's email is optional, a Zoning
 * Certification is located at the applicant's address, the account learns
 * the applicant's address, a release moves the status, the officer hears of
 * the approval, and the tracker knows about an uploaded receipt.
 */
class ApplicationFixesTest extends TestCase
{
    use RefreshDatabase;

    private function submission(array $extra = []): array
    {
        return array_merge($this->addressFields(), [
            // Ticked in the summary dialog before the form can be
            // filed, and required by the server. See LegalDocuments.
            'declaration' => '1',
            'applicant_name' => 'Juan Dela Cruz',
            'project_type' => 'CZC',
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
            'requirement_uploads' => [2 => [$this->fakePdf('title.pdf', 40)]],
            'requirement_names' => [2 => '2. Right Over Land Documentation'],
        ], $extra);
    }

    private function withRepresentative(array $extra = []): array
    {
        return $this->submission(array_merge($this->addressFields('authorized_representative_address'), [
            'authorized_representative_name' => 'Maria Santos',
            'authorization_letter' => UploadedFile::fake()->create('authorization.pdf', 30, 'application/pdf'),
        ], $extra));
    }

    public function test_the_authorization_letter_is_kept_and_the_representative_email_is_optional(): void
    {
        Storage::fake('local');
        $applicant = $this->userOf('applicant');

        $this->actingAs($applicant)->post('/request', $this->withRepresentative())->assertRedirect();

        $representative = Representative::firstOrFail();
        $this->assertSame('Maria Santos', $representative->representative_name);
        $this->assertNull($representative->representative_email);
        $this->assertNotNull($representative->authorization_letter_path);
        Storage::disk('local')->assertExists($representative->authorization_letter_path);

        // The office can open it.
        $request = RequestModel::firstOrFail();
        $this->actingAs($this->userOf('admin'))->get("/requests/{$request->id}/authorization-letter")->assertOk();
    }

    public function test_editing_the_representative_email_keeps_the_letter_on_file(): void
    {
        Storage::fake('local');
        $applicant = $this->userOf('applicant');
        $this->actingAs($applicant)->post('/request', $this->withRepresentative())->assertRedirect();

        $request = RequestModel::firstOrFail();
        $letter = Representative::firstOrFail()->authorization_letter_path;
        $request->update(['status' => 'rejected']);
        Report::where('request_id', $request->id)->update(['evaluation' => 'rejected']);

        // The edit form names the letter on file and carries the email.
        $this->actingAs($applicant)
            ->withSession(['clean_page.edit-application' => $request->id])
            ->get('/edit-application')
            ->assertInertia(fn (Assert $page) => $page
                ->where('existingApplication.authorization_letter_on_file', basename($letter))
                ->where('existingApplication.authorized_representative_email', ''));

        // Resubmit with an email and no new letter, sending verified_requirements
        // as array fields the way the form now does.
        $payload = $this->withRepresentative([
            'authorized_representative_email' => 'maria@example.com',
            'verified_requirements' => [1 => '0', 2 => '1'],
        ]);
        unset($payload['authorization_letter'], $payload['requirement_uploads'], $payload['requirement_names']);

        $this->actingAs($applicant)->put("/requests/{$request->id}", $payload)
            ->assertRedirect('/my-applications/index')
            ->assertSessionHasNoErrors();

        $representative = Representative::firstOrFail();
        $this->assertSame('maria@example.com', $representative->representative_email);
        $this->assertSame($letter, $representative->authorization_letter_path);
        $this->assertSame('in_applicant', $request->fresh()->status);
    }

    public function test_a_zoning_certification_is_located_at_the_applicants_address(): void
    {
        Storage::fake('local');
        $applicant = $this->userOf('applicant');

        $payload = $this->submission(['project_type' => 'ZC']);
        // A ZC skips the project step: no location comes with it.
        unset($payload['project_location_street'], $payload['project_location_barangay'], $payload['project_location_municipality'], $payload['project_location_province']);

        $this->actingAs($applicant)->post('/request', $payload)->assertRedirect();

        $request = RequestModel::with('location')->firstOrFail();
        $this->assertSame('Alibagu', $request->location->barangay);
        $this->assertSame('City of Ilagan', $request->location->city_municipality);
        $this->assertSame('1 Test Street', $request->location->street_address);

        $issuance = \App\Services\ApplicationDocuments::issuance($request);
        $this->assertSame('Alibagu', $issuance['project_location_barangay']);
    }

    public function test_the_account_learns_the_address_from_the_first_application(): void
    {
        Storage::fake('local');
        $applicant = $this->userOf('applicant', ['address' => null, 'address_barangay_code' => null]);

        $this->actingAs($applicant)->post('/request', $this->submission())->assertRedirect();

        $applicant->refresh();
        $this->assertSame('023114006', $applicant->address_barangay_code);
        $this->assertSame('023114000', $applicant->address_city_code);
        $this->assertSame('1 Test Street', $applicant->address_street);
        $this->assertSame('1 Test Street, Alibagu, City of Ilagan, Isabela', $applicant->address);

        // And the form is filled in from it.
        $this->actingAs($applicant)->get('/request')
            ->assertInertia(fn (Assert $page) => $page->where('auth.user.address_barangay_code', '023114006'));
    }

    public function test_releasing_to_the_applicant_moves_the_status_and_the_tracker_offers_the_download(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'payment_confirmed', $officer);

        $this->actingAs($officer)
            ->post("/admin/requests/{$request->id}/release-to-applicant", ['released' => true])
            ->assertRedirect();

        $request->refresh();
        $this->assertSame('released', $request->status);
        $this->assertNotNull($request->released_to_applicant_at);

        $this->actingAs($applicant)->get('/my-applications')
            ->assertInertia(fn (Assert $page) => $page
                ->where('applications.data.0.status', 'released')
                ->where('applications.data.0.request_status', 'released'));

        // Withdrawn: back to ready, nothing to download.
        $this->actingAs($officer)
            ->post("/admin/requests/{$request->id}/release-to-applicant", ['released' => false])
            ->assertRedirect();
        $this->assertSame('certificate_ready', $request->fresh()->status);
        $this->assertNull($request->fresh()->released_to_applicant_at);
    }

    public function test_the_reviewing_officer_hears_that_the_administrator_approved(): void
    {
        $officer = $this->userOf('admin');
        $other = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'reviewed', $officer);
        $report = Report::where('request_id', $request->id)->firstOrFail();

        $this->actingAs($administrator)
            ->post("/super-admin/approve-request/{$report->report_id}", [])
            ->assertRedirect();

        $this->assertTrue(Notification::where('user_id', $officer->id)->where('type', 'application_final_approved')->exists());
        $this->assertFalse(Notification::where('user_id', $other->id)->where('type', 'application_final_approved')->exists());
    }

    public function test_the_tracker_knows_a_receipt_is_awaiting_verification(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'approved', $officer);
        \App\Models\Payment::where('request_id', $request->id)->update(['payment_status' => 'pending']);

        $this->actingAs($applicant)->get('/my-applications')
            ->assertInertia(fn (Assert $page) => $page
                ->where('applications.data.0.status', 'approved')
                ->where('applications.data.0.latest_payment_status', 'pending'));
    }

    public function test_payment_is_not_a_missing_document(): void
    {
        foreach (['SUP', 'TUP'] as $type) {
            $payment = collect(\App\Constants\ApplicationRequirements::getRequirements($type))
                ->first(fn ($r) => str_starts_with($r['name'], 'Payment of'));
            $this->assertNotNull($payment);
            $this->assertFalse($payment['required'], "$type lists payment as a required upload");
        }
    }
}
