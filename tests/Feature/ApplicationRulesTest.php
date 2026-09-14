<?php

namespace Tests\Feature;

use App\Models\NormalizedProject;
use App\Models\Request as RequestModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Rules the application form enforces on the server, whatever the browser sent.
 */
class ApplicationRulesTest extends TestCase
{
    use RefreshDatabase;

    private function submission(array $extra = []): array
    {
        return array_merge($this->addressFields(), [
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
            'requirement_uploads' => [2 => [UploadedFile::fake()->create('title.pdf', 40, 'application/pdf')]],
            'requirement_names' => [2 => '2. Right Over Land Documentation'],
        ]) + $extra;
    }

    public function test_a_temporary_use_permit_runs_for_one_year_whatever_was_sent(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission([
            'project_type' => 'TUP',
            'project_nature_duration' => 'Permanent',
            'project_nature_years' => 5,
        ]))->assertRedirect();

        $project = NormalizedProject::firstOrFail();
        $this->assertSame('TUP', $project->project_type);
        $this->assertSame('Temporary', $project->project_nature_duration);
        $this->assertSame(1, (int) $project->project_nature_years);
    }

    public function test_other_categories_keep_the_tenure_they_were_given(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission([
            'project_type' => 'CZC',
            'project_nature_duration' => 'Temporary',
            'project_nature_years' => 3,
        ]))->assertRedirect();

        $project = NormalizedProject::firstOrFail();
        $this->assertSame('Temporary', $project->project_nature_duration);
        $this->assertSame(3, (int) $project->project_nature_years);
    }

    public function test_the_application_is_numbered_and_owned_by_the_applicant(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission(['project_type' => 'CZC']))->assertRedirect();

        $request = RequestModel::firstOrFail();
        $this->assertSame($user->id, $request->user_id);
        $this->assertMatchesRegularExpression('/^TPZ-\d{2}-\d{2}-\d{4}$/', $request->application_number);
        $this->assertSame('pending', $request->status);
    }
}
