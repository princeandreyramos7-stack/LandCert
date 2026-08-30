<?php

namespace Tests\Feature;

use App\Models\RequirementDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Regression guard for the requirement uploads submitted with a new application.
 *
 * The wizard posts files two levels deep (requirement_uploads[id][index]).
 * Laravel's $request->hasFile() only inspects the outer array, so gating the
 * save on it silently discarded every upload. This test locks in the fix.
 */
class RequirementUploadTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(): array
    {
        return [
            'applicant_name' => 'Test Applicant',
            'applicant_address' => '123 Test Street',
            'project_nature' => 'Residential building',
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
        ];
    }

    public function test_nested_requirement_uploads_are_persisted(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['user_type' => 'applicant']);

        $response = $this->actingAs($user)->post('/request', $this->validPayload() + [
            'requirement_uploads' => [
                2 => [UploadedFile::fake()->create('right-over-land.pdf', 40, 'application/pdf')],
                3 => [
                    UploadedFile::fake()->create('vicinity-map.pdf', 40, 'application/pdf'),
                    UploadedFile::fake()->create('vicinity-map-2.pdf', 40, 'application/pdf'),
                ],
            ],
            'requirement_names' => [
                2 => '2. Right Over Land Documentation',
                3 => '3. VICINITY MAP',
            ],
        ]);

        $response->assertRedirect();

        $docs = RequirementDocument::all();

        $this->assertCount(3, $docs, 'All three nested uploads should be saved.');

        $this->assertEquals(
            ['2. Right Over Land Documentation', '3. VICINITY MAP'],
            $docs->pluck('requirement_name')->unique()->sort()->values()->all(),
            'Documents should keep the name the wizard sent, not "Requirement #N".'
        );

        $this->assertEquals([2, 3], $docs->pluck('requirement_id')->unique()->sort()->values()->all());
    }

    public function test_application_submits_without_the_notarized_form(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['user_type' => 'applicant']);

        // Requirement #1 (notarized application form) is intentionally absent:
        // it can only be produced after the form is submitted and notarized.
        $response = $this->actingAs($user)->post('/request', $this->validPayload() + [
            'requirement_uploads' => [
                2 => [UploadedFile::fake()->create('right-over-land.pdf', 40, 'application/pdf')],
            ],
            'requirement_names' => [2 => '2. Right Over Land Documentation'],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseCount('requirement_documents', 1);
        $this->assertDatabaseMissing('requirement_documents', ['requirement_id' => 1]);
    }
}
