<?php

namespace Tests\Feature;

use App\Models\Request as RequestModel;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * What the form's fetch() caller is told about its submission.
 *
 * The form posts with fetch(), which follows a redirect on its own. Every
 * refusal used to be a back()->withErrors(): to fetch() that was the form
 * page served again with a 200, and the browser announced "Application
 * Submitted" for an application that was never filed. A caller asking for
 * JSON gets a status it can tell apart from success, and success is the
 * controller's own answer - with the number - not a page it landed on.
 */
class SubmissionResponseTest extends TestCase
{
    use RefreshDatabase;

    /** The headers the form's fetch() sends when filing. */
    private const AS_FETCH = ['X-Requested-With' => 'XMLHttpRequest', 'Accept' => 'application/json'];

    private function submission(array $extra = []): array
    {
        return array_merge($this->addressFields(), [
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
            'requirement_uploads' => [2 => [UploadedFile::fake()->create('title.pdf', 40, 'application/pdf')]],
            'requirement_names' => [2 => '2. Right Over Land Documentation'],
        ], $extra);
    }

    public function test_a_filed_application_is_answered_with_its_number(): void
    {
        Storage::fake('local');
        $applicant = $this->userOf('applicant');

        $response = $this->actingAs($applicant)
            ->withHeaders(self::AS_FETCH)
            ->post('/request', $this->submission());

        $response->assertCreated()->assertJsonStructure(['message', 'application_number', 'redirect']);

        $filed = RequestModel::firstOrFail();
        $this->assertSame($filed->application_number, $response->json('application_number'));
        // Kept for the navigation the browser makes next, so that My
        // Applications can show the number too.
        $response->assertSessionHas('success');
    }

    public function test_a_repeated_submission_is_refused_not_redirected(): void
    {
        Storage::fake('local');
        $applicant = $this->userOf('applicant');

        $this->actingAs($applicant)->withHeaders(self::AS_FETCH)->post('/request', $this->submission())->assertCreated();

        $this->actingAs($applicant)
            ->withHeaders(self::AS_FETCH)
            ->post('/request', $this->submission())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('duplicate');

        $this->assertSame(1, RequestModel::count());
    }

    public function test_an_address_that_does_not_hang_together_is_refused_not_redirected(): void
    {
        $applicant = $this->userOf('applicant');

        $this->actingAs($applicant)
            ->withHeaders(self::AS_FETCH)
            ->post('/request', $this->submission(['applicant_address_barangay_code' => '999999999']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('applicant_address_barangay_code');

        $this->assertSame(0, RequestModel::count());
    }

    public function test_a_write_the_database_turns_away_is_a_failure_not_a_redirect(): void
    {
        Storage::fake('local');
        $applicant = $this->userOf('applicant');

        // The insert refused by the database - what an outdated schema does.
        RequestModel::creating(function () {
            throw new QueryException('mysql', 'insert into `requests`', [], new \PDOException(
                "SQLSTATE[42S22]: Column not found: 1054 Unknown column 'declared_at' in 'field list'"
            ));
        });

        $this->actingAs($applicant)
            ->withHeaders(self::AS_FETCH)
            ->post('/request', $this->submission())
            ->assertStatus(500)
            ->assertJsonPath('errors.submit.0', fn (string $message) => str_contains($message, 'Nothing was saved'));

        $this->assertSame(0, RequestModel::count());
    }

    public function test_a_plain_form_post_still_gets_the_redirect(): void
    {
        Storage::fake('local');
        $applicant = $this->userOf('applicant');

        $this->actingAs($applicant)
            ->post('/request', $this->submission())
            ->assertRedirect('/my-applications')
            ->assertSessionHas('success');
    }

    public function test_resubmitting_a_live_application_is_refused_not_redirected(): void
    {
        $applicant = $this->userOf('applicant');
        $pending = $this->application($applicant, 'CZC', 'pending');

        $this->actingAs($applicant)
            ->withHeaders(self::AS_FETCH)
            ->post(route('requests.update', $pending->id), ['_method' => 'PUT'] + $this->submission())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('error');

        $this->assertSame('pending', $pending->fresh()->status);
    }
}
