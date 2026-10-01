<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Request as RequestModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * After the 3rd denial (Request::MAX_DENIALS) an application can no longer
 * be resubmitted online - RequestController::update() refuses it outright,
 * before any of the form's own validation runs. Staff can still lift that
 * for a specific application after speaking to the applicant in person -
 * AdminController::allowResubmission(), offered on OfficerDecision.jsx once
 * the lock shows.
 */
class DenialLockTest extends TestCase
{
    use RefreshDatabase;

    public function test_resubmission_is_refused_once_denied_three_times(): void
    {
        $applicant = $this->userOf('applicant');
        $officer = $this->userOf('admin');
        $request = $this->application($applicant, 'CZC', 'rejected', $officer);
        $request->update(['denial_count' => RequestModel::MAX_DENIALS]);

        $this->actingAs($applicant)
            ->put("/requests/{$request->id}", [])
            ->assertSessionHasErrors('error');
    }

    public function test_resubmission_still_works_below_the_cap(): void
    {
        $applicant = $this->userOf('applicant');
        $officer = $this->userOf('admin');
        $request = $this->application($applicant, 'CZC', 'rejected', $officer);
        $request->update(['denial_count' => RequestModel::MAX_DENIALS - 1]);

        // An empty payload still fails the form's own field validation
        // (applicant_name required, etc.) - the point here is only that the
        // lock-specific error key is not what refused it.
        $this->actingAs($applicant)
            ->put("/requests/{$request->id}", [])
            ->assertSessionHasErrors()
            ->assertSessionDoesntHaveErrors('error');
    }

    public function test_staff_can_lift_the_lock(): void
    {
        $applicant = $this->userOf('applicant');
        $officer = $this->userOf('admin');
        $request = $this->application($applicant, 'CZC', 'rejected', $officer);
        $request->update(['denial_count' => RequestModel::MAX_DENIALS]);

        $this->actingAs($officer)
            ->post("/admin/requests/{$request->id}/allow-resubmission")
            ->assertSessionHas('success');

        $this->assertSame(0, $request->fresh()->denial_count);

        $log = AuditLog::where('description', 'like', '%Resubmission re-allowed%')->latest()->firstOrFail();
        $this->assertSame($request->id, $log->model_id);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $applicant->id,
            'type' => 'resubmission_allowed',
        ]);

        // The lock really is gone, not just the counter - the applicant's
        // own route is unblocked too.
        $this->actingAs($applicant)
            ->put("/requests/{$request->id}", [])
            ->assertSessionDoesntHaveErrors('error');
    }

    public function test_lifting_a_lock_that_is_not_there_is_refused(): void
    {
        $applicant = $this->userOf('applicant');
        $officer = $this->userOf('admin');
        $request = $this->application($applicant, 'CZC', 'rejected', $officer);
        // denial_count defaults to 0 - never reached the cap.

        $this->actingAs($officer)
            ->post("/admin/requests/{$request->id}/allow-resubmission")
            ->assertSessionHas('error');

        $this->assertSame(0, $request->fresh()->denial_count);
    }

    public function test_an_applicant_cannot_lift_their_own_lock(): void
    {
        $applicant = $this->userOf('applicant');
        $officer = $this->userOf('admin');
        $request = $this->application($applicant, 'CZC', 'rejected', $officer);
        $request->update(['denial_count' => RequestModel::MAX_DENIALS]);

        $this->actingAs($applicant)
            ->post("/admin/requests/{$request->id}/allow-resubmission")
            ->assertForbidden();

        $this->assertSame(RequestModel::MAX_DENIALS, $request->fresh()->denial_count);
    }
}
