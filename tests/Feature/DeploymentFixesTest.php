<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\User;
use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The failures from the 2026-10-07 deployment audit, held fixed:
 *  - the server files only what the wizard would file (H3);
 *  - the officer can supply a missing Lot / Tax Declaration No. (H2);
 *  - an approval is all-or-nothing and cannot be doubled (H1);
 *  - seeding never hands out or resets a known password (C2).
 */
class DeploymentFixesTest extends TestCase
{
    use RefreshDatabase;

    private const AS_FETCH = ['X-Requested-With' => 'XMLHttpRequest', 'Accept' => 'application/json'];

    private function bare(array $extra = []): array
    {
        return array_merge($this->addressFields(), [
            'declaration' => '1',
            'applicant_name' => 'Juan Dela Cruz',
        ], $extra);
    }

    // ------------------------------------------------------------------ H3

    public function test_a_hollow_application_is_refused_with_what_is_missing(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->withHeaders(self::AS_FETCH)
            ->post('/request', $this->bare())
            ->assertStatus(422)
            ->assertJsonValidationErrors(['project_nature', 'project_location_barangay', 'lot_area_sqm', 'project_cost', 'existing_land_use']);

        $this->assertSame(0, RequestModel::count());
    }

    public function test_every_required_document_must_be_attached(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');
        $payload = $this->completeSubmission($this->bare(['project_type' => 'CZC']));
        unset($payload['requirement_uploads'][4]); // Site Development Plan

        $this->actingAs($user)->withHeaders(self::AS_FETCH)
            ->post('/request', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['requirement_uploads.4']);

        $this->assertSame(0, RequestModel::count());
    }

    public function test_the_notarized_form_is_still_not_needed_at_filing(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->withHeaders(self::AS_FETCH)
            ->post('/request', $this->completeSubmission($this->bare(['project_type' => 'CZC'])))
            ->assertCreated();
    }

    public function test_a_zoning_certification_needs_only_its_own_documents(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        // No project step at all - just the applicant and the five documents.
        $this->actingAs($user)->withHeaders(self::AS_FETCH)
            ->post('/request', $this->completeSubmission($this->bare(['project_type' => 'ZC'])))
            ->assertCreated();

        $payload = $this->completeSubmission($this->bare(['project_type' => 'ZC']));
        unset($payload['requirement_uploads'][5]);
        $this->actingAs($user)->withHeaders(self::AS_FETCH)
            ->post('/request', $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['requirement_uploads.5']);
    }

    public function test_not_sure_of_the_type_still_files_and_the_officer_can_set_it(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->withHeaders(self::AS_FETCH)
            ->post('/request', $this->completeSubmission($this->bare()))
            ->assertCreated();

        $application = RequestModel::firstOrFail();
        $this->assertNotNull($application->project, 'every application gets a project row for the type to go on');

        $this->actingAs($this->userOf('admin'))
            ->postJson("/admin/update-project-type/{$application->id}", ['project_type' => 'CZC'])
            ->assertOk();
        $this->assertSame('CZC', $application->fresh()->project->project_type);
    }

    public function test_setting_the_type_creates_the_missing_project_row_instead_of_pretending(): void
    {
        $application = $this->application($this->userOf('applicant'), 'CZC', 'pending');
        $application->project()->delete();

        $this->actingAs($this->userOf('admin'))
            ->postJson("/admin/update-project-type/{$application->id}", ['project_type' => 'TUP'])
            ->assertOk();

        $this->assertSame('TUP', $application->fresh()->project?->project_type);
    }

    // ------------------------------------------------------------------ H2

    public function test_the_officer_fills_in_missing_lot_and_tax_numbers_then_reviews(): void
    {
        $officer = $this->userOf('admin');
        $application = $this->application($this->userOf('applicant'), 'CZC', 'pending');
        $application->property->update(['lot_number' => null, 'tax_declaration_no' => null]);

        $review = fn () => $this->actingAs($officer)->post('/admin/review-application', [
            'request_id' => $application->id, 'action' => 'reviewed', 'payment_amount' => '720',
        ]);

        $review()->assertSessionHasErrors('property');

        $this->actingAs($officer)->post("/admin/requests/{$application->id}/certificate-details", [
            'lot_number' => 'LOT-4522-F',
            'tax_declaration_no' => 'TD-2026-0001',
        ])->assertRedirect();

        $review()->assertSessionHas('success');
        $this->assertSame('reviewed', $application->fresh()->status);
    }

    // ------------------------------------------------------------------ H1

    public function test_a_second_approval_is_refused_and_tells_nobody_twice(): void
    {
        Mail::fake();
        $administrator = $this->userOf('super_admin');
        $applicant = $this->userOf('applicant');
        $application = $this->application($applicant, 'CZC', 'reviewed', $this->userOf('admin'));
        $report = Report::where('request_id', $application->id)->firstOrFail();

        $this->actingAs($administrator)->post("/super-admin/approve-request/{$report->report_id}")->assertSessionHas('success');
        $number = $application->fresh()->decision_number;
        $this->actingAs($administrator)->post("/super-admin/approve-request/{$report->report_id}")->assertSessionHas('error');

        $this->assertNotEmpty($number);
        $this->assertSame($number, $application->fresh()->decision_number);
        $this->assertSame(1, Notification::where('user_id', $applicant->id)->where('type', 'application_approved_final')->count());
    }

    public function test_an_approval_cut_short_before_the_fix_can_be_finished(): void
    {
        Mail::fake();
        $application = $this->application($this->userOf('applicant'), 'CZC', 'reviewed', $this->userOf('admin'));
        $report = Report::where('request_id', $application->id)->firstOrFail();
        // What the race left behind: report approved, request still "For Approval", no number.
        $report->update(['evaluation' => 'approved']);
        RequestModel::whereKey($application->id)->update(['status' => 'reviewed', 'decision_number' => null]);

        $this->actingAs($this->userOf('super_admin'))
            ->post("/super-admin/approve-request/{$report->report_id}")
            ->assertSessionHas('success');

        $application->refresh();
        $this->assertSame('approved', $application->status);
        $this->assertNotEmpty($application->decision_number);
    }

    public function test_approvals_in_a_row_get_distinct_decision_numbers(): void
    {
        Mail::fake();
        $administrator = $this->userOf('super_admin');
        $officer = $this->userOf('admin');

        $numbers = [];
        foreach (range(1, 4) as $i) {
            $application = $this->application($this->userOf('applicant'), 'CZC', 'reviewed', $officer);
            $report = Report::where('request_id', $application->id)->firstOrFail();
            $this->actingAs($administrator)->post("/super-admin/approve-request/{$report->report_id}")->assertSessionHas('success');
            $numbers[] = $application->fresh()->decision_number;
        }

        $this->assertCount(4, array_unique(array_filter($numbers)));
    }

    // ------------------------------------------------------------------ C2

    public function test_seeding_keeps_existing_passwords_and_hands_out_no_known_one(): void
    {
        $existing = User::factory()->create([
            'email' => 'jeff@cpdo.com', 'user_type' => 'admin', 'password' => Hash::make('Chosen-by-Jeff-2026'),
        ]);

        $this->seed(AdminUserSeeder::class);

        $this->assertTrue(Hash::check('Chosen-by-Jeff-2026', $existing->fresh()->password), 're-seeding must not reset a password');
        $this->assertSame('Jeffrey C. Pauig', $existing->fresh()->name);

        // A new account's password is random: no two accounts share one, and
        // the seeder file holds no password to share.
        $source = file_get_contents(database_path('seeders/AdminUserSeeder.php'));
        $this->assertDoesNotMatchRegularExpression("/Hash::make\\('/", $source);
        $hashes = User::whereIn('email', ['kay@cpdo.com', 'april@cpdo.com', 'maryjane@cpdo.com', 'crisanta@cpdo.com'])->pluck('password');
        $this->assertCount(4, $hashes);
        foreach ($hashes as $hash) {
            $this->assertFalse(Hash::check('password', $hash));
        }
    }
}
