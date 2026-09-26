<?php

namespace Tests\Feature;

use App\Models\ApplicationDraft;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A New Application in progress, saved on the account so it survives
 * closing the browser or switching devices (see
 * ApplicationDraftController and resources/js/lib/requestDraft.js).
 */
class ApplicationDraftTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_has_no_draft(): void
    {
        $this->getJson(route('request.draft.show'))->assertUnauthorized();
    }

    public function test_a_signed_in_applicant_with_no_draft_sees_null(): void
    {
        $user = $this->userOf('applicant');

        $this->actingAs($user)->getJson(route('request.draft.show'))
            ->assertOk()
            ->assertJson(['draft' => null]);
    }

    public function test_saving_then_reading_back_a_draft(): void
    {
        $user = $this->userOf('applicant');

        $this->actingAs($user)->postJson(route('request.draft.store'), [
            'data' => ['applicant_name' => 'Juan Dela Cruz', 'project_type' => 'CZC'],
            'current_step' => 2,
            'completed_steps' => [1],
            'has_representative' => false,
        ])->assertOk()->assertJson(['ok' => true]);

        $this->actingAs($user)->getJson(route('request.draft.show'))
            ->assertOk()
            ->assertJsonPath('draft.data.applicant_name', 'Juan Dela Cruz')
            ->assertJsonPath('draft.current_step', 2)
            ->assertJsonPath('draft.completed_steps', [1]);

        $this->assertDatabaseCount('application_drafts', 1);
    }

    public function test_saving_again_replaces_the_same_draft_not_a_second_one(): void
    {
        $user = $this->userOf('applicant');

        $this->actingAs($user)->postJson(route('request.draft.store'), [
            'data' => ['applicant_name' => 'First'],
            'current_step' => 1,
        ])->assertOk();

        $this->actingAs($user)->postJson(route('request.draft.store'), [
            'data' => ['applicant_name' => 'Updated'],
            'current_step' => 3,
        ])->assertOk();

        $this->assertDatabaseCount('application_drafts', 1);
        $this->assertSame('Updated', ApplicationDraft::where('user_id', $user->id)->value('data')['applicant_name'] ?? null);
    }

    public function test_one_account_never_sees_anothers_draft(): void
    {
        $owner = $this->userOf('applicant');
        $stranger = $this->userOf('applicant');

        $this->actingAs($owner)->postJson(route('request.draft.store'), [
            'data' => ['applicant_name' => 'Owner Only'],
            'current_step' => 1,
        ])->assertOk();

        $this->actingAs($stranger)->getJson(route('request.draft.show'))
            ->assertOk()
            ->assertJson(['draft' => null]);
    }

    public function test_an_oversized_draft_is_refused(): void
    {
        $user = $this->userOf('applicant');

        $this->actingAs($user)->postJson(route('request.draft.store'), [
            'data' => ['note' => str_repeat('a', 250_000)],
            'current_step' => 1,
        ])->assertUnprocessable()->assertJsonValidationErrors('data');

        $this->assertDatabaseCount('application_drafts', 0);
    }

    public function test_deleting_clears_it(): void
    {
        $user = $this->userOf('applicant');
        ApplicationDraft::create([
            'user_id' => $user->id,
            'data' => ['applicant_name' => 'Juan'],
            'current_step' => 1,
        ]);

        $this->actingAs($user)->deleteJson(route('request.draft.destroy'))
            ->assertOk()->assertJson(['ok' => true]);

        $this->assertDatabaseCount('application_drafts', 0);
    }

    public function test_filing_the_application_clears_the_server_draft(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        $user = $this->userOf('applicant');
        ApplicationDraft::create([
            'user_id' => $user->id,
            'data' => ['applicant_name' => 'Juan Dela Cruz'],
            'current_step' => 4,
        ]);

        $this->actingAs($user)
            ->withHeaders(['X-Requested-With' => 'XMLHttpRequest', 'Accept' => 'application/json'])
            ->post('/request', array_merge($this->addressFields(), [
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
                'requirement_uploads' => [2 => [$this->fakePdf('title.pdf', 40)]],
                'requirement_names' => [2 => '2. Right Over Land Documentation'],
            ]))
            ->assertCreated();

        // Cleared server-side, in the controller itself - not left to the
        // client remembering to call request.draft.destroy afterward, which
        // a dropped connection right after success could skip entirely.
        $this->assertDatabaseCount('application_drafts', 0);
    }
}
