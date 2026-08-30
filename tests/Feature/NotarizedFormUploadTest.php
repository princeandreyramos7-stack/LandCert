<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Request as RequestModel;
use App\Models\RequirementDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The notarized application form (requirement #1) is uploaded from My Applications
 * after submission, because the applicant has to print and notarize it first.
 */
class NotarizedFormUploadTest extends TestCase
{
    use RefreshDatabase;

    private function makeApplication(User $owner): RequestModel
    {
        $applicant = Applicant::create([
            'applicant_name' => 'Test Applicant',
            'applicant_address' => '123 Test Street',
            'applicant_type' => 'individual',
        ]);

        return RequestModel::create([
            'user_id' => $owner->id,
            'applicant_id' => $applicant->id,
            'status' => 'pending',
            'application_number' => 'TPZ-TEST-0001',
        ]);
    }

    public function test_owner_can_upload_the_notarized_form(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['user_type' => 'applicant']);
        $application = $this->makeApplication($user);

        $response = $this->actingAs($user)->post(
            "/my-applications/{$application->id}/notarized-form",
            ['document' => UploadedFile::fake()->create('notarized.pdf', 60, 'application/pdf')]
        );

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $doc = RequirementDocument::where('request_id', $application->id)->first();

        $this->assertNotNull($doc, 'The notarized form should be stored.');
        $this->assertEquals(1, $doc->requirement_id);
        $this->assertEquals('notarized.pdf', $doc->original_filename);

        // Uploading does not verify the requirement — the officer does that.
        $application->refresh();
        $verified = $application->verified_requirements;
        $verified = is_array($verified) ? $verified : (json_decode((string) $verified, true) ?: []);
        $this->assertFalse((bool) ($verified[1] ?? false));
    }

    public function test_another_applicant_cannot_upload_to_someone_elses_application(): void
    {
        Storage::fake('local');

        $owner = User::factory()->create(['user_type' => 'applicant']);
        $stranger = User::factory()->create(['user_type' => 'applicant']);
        $application = $this->makeApplication($owner);

        $this->actingAs($stranger)->post(
            "/my-applications/{$application->id}/notarized-form",
            ['document' => UploadedFile::fake()->create('notarized.pdf', 60, 'application/pdf')]
        )->assertForbidden();

        $this->assertDatabaseCount('requirement_documents', 0);
    }
}
