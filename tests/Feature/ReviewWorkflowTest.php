<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\Report;
use App\Models\Request as RequestModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The two-step decision on View Application.
 *
 *   pending  -> Zoning Officer marks reviewed (sets the Treasury fee) -> reviewed
 *            -> Zoning Administrator approves -> approved (locked for both)
 *            -> or returns it to the officer -> pending, with the reason kept
 *   pending  -> Zoning Officer denies -> rejected (applicant told at once)
 *
 * The Administrator's routes take the report id, not the request id, so the
 * page has to be handed the report; and the checklist toggles must not touch
 * anything but the checklist.
 */
class ReviewWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_view_application_hands_both_roles_the_report(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $request = $this->application($this->userOf('applicant'), 'CZC', 'reviewed', $officer);
        $report = Report::where('request_id', $request->id)->first();

        $this->actingAs($officer)->get("/admin/requests/{$request->id}/view-application")
            ->assertRedirect('/view-application');
        $this->actingAs($officer)->get('/view-application')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/ViewApplication')
                ->where('request.report_id', $report->report_id)
                ->where('request.status', 'reviewed')
                ->where('request.payment_amount', '3289.00')
                ->where('request.reviewed_by_name', $officer->name)
                ->where('request.returned_reason', null));

        $this->actingAs($administrator)->get("/super-admin/requests/{$request->id}/view-application")
            ->assertRedirect('/view-application');
        $this->actingAs($administrator)->get('/view-application')
            ->assertInertia(fn (Assert $page) => $page
                ->component('SuperAdmin/ViewApplication')
                ->where('request.report_id', $report->report_id)
                ->where('request.reviewed_by_name', $officer->name));
    }

    public function test_officer_marks_reviewed_with_the_fee_and_the_administrators_are_told(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $request = $this->application($this->userOf('applicant'), 'CZC', 'pending');

        $this->actingAs($officer)->post('/admin/review-application', [
            'request_id' => $request->id,
            'action' => 'reviewed',
            'payment_amount' => '1250.50',
            'admin_notes' => 'Bring the notarized form.',
        ])->assertSessionHas('success');

        $this->assertSame('reviewed', $request->fresh()->status);
        $report = Report::where('request_id', $request->id)->first();
        $this->assertSame('reviewed', $report->evaluation);
        $this->assertSame('1250.50', $report->payment_amount);
        $this->assertSame($officer->id, $report->reviewed_by);

        $notice = Notification::where('user_id', $administrator->id)->where('type', 'application_pending_approval')->first();
        $this->assertNotNull($notice);
        $this->assertSame("/super-admin/requests/{$request->id}/view-application?section=requirements", $notice->link);
    }

    public function test_officer_cannot_mark_reviewed_without_the_type_lot_and_tax_numbers(): void
    {
        $officer = $this->userOf('admin');
        $request = $this->application($this->userOf('applicant'), 'CZC', 'pending');
        $request->property->update(['lot_number' => null]);

        $this->actingAs($officer)->post('/admin/review-application', [
            'request_id' => $request->id,
            'action' => 'reviewed',
            'payment_amount' => '100',
        ])->assertSessionHasErrors('property');

        $this->assertSame('pending', $request->fresh()->status);
    }

    public function test_officer_denial_tells_the_applicant(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'pending');
        // After the fixture: filing an application mails a submission notice of its own.
        Mail::fake();

        $this->actingAs($officer)->post('/admin/review-application', [
            'request_id' => $request->id,
            'action' => 'rejected',
            'rejection_reason' => 'Missing or Incomplete Requirements: - Title',
        ])->assertSessionHas('success');

        $this->assertSame('rejected', $request->fresh()->status);
        Mail::assertQueued(\App\Mail\ApplicationRejected::class);
        $this->assertTrue(Notification::where('user_id', $applicant->id)->exists());

        // And the officer's page carries the reason back to them.
        $this->actingAs($officer)->get("/admin/requests/{$request->id}/view-application");
        $this->actingAs($officer)->get('/view-application')
            ->assertInertia(fn (Assert $page) => $page
                ->where('request.status', 'rejected')
                ->where('request.rejection_reason', 'Missing or Incomplete Requirements: - Title'));
    }

    public function test_administrator_cannot_decide_before_the_officer_has_reviewed(): void
    {
        $administrator = $this->userOf('super_admin');
        $request = $this->application($this->userOf('applicant'), 'CZC', 'pending');
        $report = Report::where('request_id', $request->id)->first();

        $this->actingAs($administrator)->post("/super-admin/approve-request/{$report->report_id}")
            ->assertSessionHas('error');
        $this->actingAs($administrator)->post("/super-admin/reject-request/{$report->report_id}", ['description' => 'x'])
            ->assertSessionHas('error');

        $this->assertSame('pending', $request->fresh()->status);
    }

    public function test_administrator_approves_by_report_id_and_the_decision_locks(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $applicant = $this->userOf('applicant');

        // A stray record first so the report id and the request id differ —
        // the page used to post the request id to a route that takes the report id.
        $stray = $this->application($this->userOf('applicant', ['email' => 'other@example.test']), 'CZC', 'approved');
        Report::where('request_id', $stray->id)->delete();
        Report::create(['request_id' => $stray->id, 'evaluation' => 'approved', 'date_reported' => now()]);

        $request = $this->application($applicant, 'CZC', 'reviewed', $officer);
        $report = Report::where('request_id', $request->id)->first();
        $this->assertNotSame($request->id, $report->report_id);
        Mail::fake();

        // Posting the request id is refused, as it should be: it is a different report.
        $this->actingAs($administrator)->post("/super-admin/approve-request/{$request->id}");
        $this->assertSame('reviewed', $request->fresh()->status);

        $this->actingAs($administrator)->post("/super-admin/approve-request/{$report->report_id}")
            ->assertSessionHas('success');

        $request->refresh();
        $this->assertSame('approved', $request->status);
        $this->assertNotEmpty($request->decision_number);
        $this->assertSame($administrator->name, $report->fresh()->approved_by);
        Mail::assertQueued(\App\Mail\ApplicationApprovedWithDetails::class);

        // Locked for both roles from here on.
        $this->actingAs($officer)->post('/admin/review-application', [
            'request_id' => $request->id,
            'action' => 'rejected',
            'rejection_reason' => 'too late',
        ])->assertSessionHasErrors('action');
        $this->actingAs($administrator)->post("/super-admin/reject-request/{$report->report_id}", ['description' => 'too late'])
            ->assertSessionHas('error');
        $this->assertSame('approved', $request->fresh()->status);
    }

    public function test_administrator_return_goes_back_to_the_officer_with_the_reason(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'reviewed', $officer);
        $report = Report::where('request_id', $request->id)->first();
        // Filing the fixture already told the applicant "submitted"; nothing may be added to that.
        $applicantNotices = Notification::where('user_id', $applicant->id)->count();
        Mail::fake();

        $this->actingAs($administrator)->post("/super-admin/reject-request/{$report->report_id}", [
            'description' => 'Verify Location',
        ])->assertSessionHas('success');

        $this->assertSame('pending', $request->fresh()->status);
        $this->assertSame('Verify Location', $report->fresh()->returnedReason());
        // The fee the officer set survives the round trip.
        $this->assertSame('3289.00', $report->fresh()->payment_amount);

        // The officer hears; the applicant does not.
        $this->assertSame(
            "/admin/requests/{$request->id}/view-application?section=requirements",
            Notification::where('user_id', $officer->id)->where('type', 'application_returned')->value('link'),
        );
        $this->assertSame($applicantNotices, Notification::where('user_id', $applicant->id)->count());
        Mail::assertNothingQueued();
        Mail::assertNothingSent();

        $this->actingAs($officer)->get("/admin/requests/{$request->id}/view-application");
        $this->actingAs($officer)->get('/view-application')
            ->assertInertia(fn (Assert $page) => $page
                ->where('request.status', 'pending')
                ->where('request.returned_reason', 'Verify Location'));

        // The applicant's own page shows neither the internal note nor the
        // fee while the office is still deciding — and stays out of the
        // Administrator's list, which only carries what the officer has dealt with.
        $this->actingAs($applicant)->get("/my-applications/{$request->id}/details");
        $this->actingAs($applicant)->get('/application-details')
            ->assertInertia(fn (Assert $page) => $page
                ->where('application.status', 'pending')
                ->where('application.admin_notes', null)
                ->where('application.payment_amount', null));
        $this->assertFalse(\App\Support\ApplicationsList::rows('super_admin')->contains('id', $request->id));
        $this->assertTrue(\App\Support\ApplicationsList::rows('admin')->contains('id', $request->id));
    }

    public function test_applicant_reads_the_note_and_fee_only_once_approved(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'reviewed', $officer);
        $report = Report::where('request_id', $request->id)->first();
        $report->update(['admin_notes' => 'Bring two valid IDs.']);

        $this->actingAs($applicant)->get("/my-applications/{$request->id}/details");
        $this->actingAs($applicant)->get('/application-details')
            ->assertInertia(fn (Assert $page) => $page
                ->where('application.status', 'reviewed')
                ->where('application.admin_notes', null)
                ->where('application.payment_amount', null));

        Mail::fake();
        $this->actingAs($administrator)->post("/super-admin/approve-request/{$report->report_id}");

        $this->actingAs($applicant)->get("/my-applications/{$request->id}/details");
        $this->actingAs($applicant)->get('/application-details')
            ->assertInertia(fn (Assert $page) => $page
                ->where('application.status', 'approved')
                ->where('application.admin_notes', 'Bring two valid IDs.')
                ->where('application.payment_amount', '3289.00'));
    }

    public function test_resubmitted_application_returns_to_the_officer_not_the_administrator(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'rejected', $officer);

        // What RequestController::update does when the applicant resubmits.
        $request->update(['status' => 'in_applicant']);
        Report::where('request_id', $request->id)->update(['evaluation' => 'pending']);

        $this->assertTrue(\App\Support\ApplicationsList::rows('admin')->contains('id', $request->id));
        $this->assertSame('pending', \App\Support\ApplicationsList::rows('admin')->firstWhere('id', $request->id)->status);
        $this->assertFalse(\App\Support\ApplicationsList::rows('super_admin')->contains('id', $request->id));
    }

    public function test_applicant_is_told_once_with_the_real_reason_and_the_audit_names_the_report(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');

        // Denial: one notice, carrying the officer's reason — not a second,
        // generic one from the model observer.
        $denied = $this->userOf('applicant');
        $request = $this->application($denied, 'CZC', 'pending');
        Mail::fake();
        $this->actingAs($officer)->post('/admin/review-application', [
            'request_id' => $request->id,
            'action' => 'rejected',
            'rejection_reason' => 'Verify Location',
        ]);
        $notices = Notification::where('user_id', $denied->id)->where('type', 'like', 'application_rejected%')->get();
        $this->assertCount(1, $notices);
        $this->assertStringContainsString('Verify Location', $notices->first()->message);

        // Approval: one notice with the fee, not one from the observer as well.
        $approved = $this->userOf('applicant', ['email' => 'approved@example.test']);
        $request = $this->application($approved, 'CZC', 'reviewed', $officer);
        $report = Report::where('request_id', $request->id)->first();
        $this->actingAs($administrator)->post("/super-admin/approve-request/{$report->report_id}");
        $this->assertCount(1, Notification::where('user_id', $approved->id)->where('type', 'like', 'application_approved%')->get());

        // The audit trail points at the report it describes.
        $this->assertSame(0, \App\Models\AuditLog::where('model_type', 'Report')->whereNull('model_id')->count());
        $this->assertTrue(\App\Models\AuditLog::where('model_type', 'Report')->where('model_id', $report->report_id)->exists());
    }

    public function test_checklist_toggle_saves_only_the_checklist(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $request = $this->application($this->userOf('applicant'), 'CZC', 'pending');

        // The page used to send a title_number too, which the handler wrote
        // onto the requests row — a column it does not have.
        $this->actingAs($officer)->postJson("/admin/requests/{$request->id}/verify-requirements", [
            'verified_requirements' => ['1' => true, '2' => false],
            'title_number' => 'TCT-123',
        ])->assertOk()->assertJson(['success' => true]);

        $this->actingAs($administrator)->postJson("/super-admin/requests/{$request->id}/verify-requirements", [
            'verified_requirements' => ['1' => true, '2' => true],
            'title_number' => 'TCT-123',
        ])->assertOk()->assertJson(['success' => true]);

        $this->assertSame(['1' => true, '2' => true], $request->fresh()->verified_requirements);
        $this->assertSame('LOT-1', $request->fresh()->property->lot_number);
    }
}
