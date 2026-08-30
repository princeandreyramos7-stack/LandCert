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
 * Applicants can upload a document against any single requirement of their own
 * application from the Application Details page (and the notarized-form button on
 * My Applications, which shares the same handler).
 */
class ApplicantRequirementUploadTest extends TestCase
{
    use RefreshDatabase;

    private function makeApplication(User $owner): RequestModel
    {
        $applicant = Applicant::create([
            'applicant_name' => 'Test Applicant',
            'applicant_address' => '1 Test Street',
            'applicant_type' => 'individual',
        ]);

        return RequestModel::create([
            'user_id' => $owner->id,
            'applicant_id' => $applicant->id,
            'status' => 'pending',
            'application_number' => 'TPZ-TEST-0001',
        ]);
    }

    public function test_owner_uploads_a_requirement_document(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $this->actingAs($user)
            ->post("/my-applications/{$app->id}/requirement-upload", [
                'requirement_id' => 3,
                'requirement_name' => '3. VICINITY MAP',
                'document' => UploadedFile::fake()->create('vicinity.pdf', 50, 'application/pdf'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $doc = RequirementDocument::where('request_id', $app->id)->first();
        $this->assertNotNull($doc);
        $this->assertEquals(3, $doc->requirement_id);
        $this->assertEquals('3. VICINITY MAP', $doc->requirement_name);
        $this->assertEquals('vicinity.pdf', $doc->original_filename);

        // Uploading a document must NOT verify the requirement — that is the
        // Zoning Officer's decision after they review the file.
        $app->refresh();
        $verified = is_array($app->verified_requirements)
            ? $app->verified_requirements
            : (json_decode((string) $app->verified_requirements, true) ?: []);
        $this->assertFalse((bool) ($verified[3] ?? false));
    }

    public function test_notarized_form_shortcut_still_works(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $this->actingAs($user)
            ->post("/my-applications/{$app->id}/notarized-form", [
                'document' => UploadedFile::fake()->create('notarized.pdf', 50, 'application/pdf'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('requirement_documents', [
            'request_id' => $app->id,
            'requirement_id' => 1,
        ]);
    }

    public function test_a_stranger_cannot_upload(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create(['user_type' => 'applicant']);
        $stranger = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($owner);

        $this->actingAs($stranger)
            ->post("/my-applications/{$app->id}/requirement-upload", [
                'requirement_id' => 2,
                'document' => UploadedFile::fake()->create('x.pdf', 10, 'application/pdf'),
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('requirement_documents', 0);
    }

    public function test_rejects_a_non_document_file_type(): void
    {
        Storage::fake('local');
        $user = User::factory()->create(['user_type' => 'applicant']);
        $app = $this->makeApplication($user);

        $this->actingAs($user)
            ->post("/my-applications/{$app->id}/requirement-upload", [
                'requirement_id' => 2,
                'document' => UploadedFile::fake()->create('malware.exe', 10, 'application/octet-stream'),
            ])
            ->assertSessionHasErrors('document');

        $this->assertDatabaseCount('requirement_documents', 0);
    }
}
