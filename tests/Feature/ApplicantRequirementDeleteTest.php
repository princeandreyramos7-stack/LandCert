<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Request as RequestModel;
use App\Models\RequirementDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * The applicant's own "Remove" button on Application Details
 * (RequirementDocumentController::destroy), newly wired to the front end
 * here - the endpoint itself already existed, untested, with no button
 * calling it. Editable at any status before the Zoning Administrator's
 * decision (see App\Models\Request::APPLICANT_EDITABLE_STATUSES); locked
 * from 'approved' onward, since those documents are then part of an issued
 * decision.
 */
class ApplicantRequirementDeleteTest extends TestCase
{
    use RefreshDatabase;

    private function makeApplication(User $owner, string $status = 'in_applicant'): RequestModel
    {
        $applicant = Applicant::create([
            'applicant_name' => 'Test Applicant',
            'applicant_address' => '1 Test Street',
            'applicant_type' => 'individual',
        ]);

        return RequestModel::create([
            'user_id' => $owner->id,
            'applicant_id' => $applicant->id,
            'status' => $status,
            'application_number' => 'TPZ-TEST-0001',
        ]);
    }

    /** @return array<string, array{string}> */
    public static function editableStatuses(): array
    {
        return [
            'pending' => ['pending'],
            'in_applicant' => ['in_applicant'],
            'reviewed' => ['reviewed'],
            'rejected' => ['rejected'],
        ];
    }

    #[DataProvider('editableStatuses')]
    public function test_owner_can_remove_a_document_at_any_status_before_a_decision(string $status): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');
        $app = $this->makeApplication($user, $status);
        $doc = $this->requirementScan($app, 3, 'Vicinity Map');

        $this->actingAs($user)->delete("/requirements/{$doc->id}")
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('requirement_documents', ['id' => $doc->id]);
    }

    public function test_a_stranger_cannot_remove_someone_elses_document(): void
    {
        Storage::fake('local');
        $owner = $this->userOf('applicant');
        $stranger = $this->userOf('applicant');
        $app = $this->makeApplication($owner, 'in_applicant');
        $doc = $this->requirementScan($app, 3, 'Vicinity Map');

        $this->actingAs($stranger)->delete("/requirements/{$doc->id}")->assertForbidden();

        $this->assertDatabaseHas('requirement_documents', ['id' => $doc->id]);
    }

    /** @return array<string, array{string}> */
    public static function decidedStatuses(): array
    {
        return [
            'approved' => ['approved'],
            'payment_confirmed' => ['payment_confirmed'],
            'certificate_ready' => ['certificate_ready'],
            'released' => ['released'],
        ];
    }

    #[DataProvider('decidedStatuses')]
    public function test_a_document_cannot_be_removed_once_the_application_is_decided(string $status): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');
        $app = $this->makeApplication($user, $status);
        $doc = $this->requirementScan($app, 3, 'Vicinity Map');

        $this->actingAs($user)->delete("/requirements/{$doc->id}")
            ->assertSessionHasErrors('document');

        $this->assertDatabaseHas('requirement_documents', ['id' => $doc->id]);
    }

    /**
     * Unlike uploading it, removing the notarized application form has no
     * special case in RequirementDocumentController::destroy() - it is
     * locked by status exactly like any other requirement once the
     * application is decided. The front end's "Remove" button deliberately
     * follows this same rule (see ApplicationDetails.jsx), not the more
     * permissive one upload uses.
     */
    public function test_the_notarized_form_is_still_locked_once_decided(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');
        $app = $this->makeApplication($user, 'approved');
        $doc = $this->requirementScan($app, 1, '1. Accomplished and notarized APPLICATION FORM');

        $this->actingAs($user)->delete("/requirements/{$doc->id}")
            ->assertSessionHasErrors('document');

        $this->assertDatabaseHas('requirement_documents', ['id' => $doc->id]);
    }

    public function test_removing_deletes_the_stored_file_too(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');
        $app = $this->makeApplication($user, 'rejected');
        $doc = $this->requirementScan($app, 3, 'Vicinity Map');

        Storage::disk('local')->assertExists($doc->file_path);

        $this->actingAs($user)->delete("/requirements/{$doc->id}");

        Storage::disk('local')->assertMissing($doc->file_path);
    }
}
