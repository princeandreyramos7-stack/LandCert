<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\OfficerNotice;
use App\Models\Report;
use App\Support\OfficerActionQueue;
use App\Support\ProcessingSla;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * The Zoning Officer's dashboard panels: "Needs Immediate Officer Action"
 * (App\Support\OfficerActionQueue) and "From the Zoning Administrator" (what
 * the Zoning Administrator sends the officers - OfficerNoticeController).
 */
class OfficerDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function enteredStageAt($request, string $when): void
    {
        DB::table('requests')->where('id', $request->id)->update(['stage_since' => Carbon::parse($when)]);
    }

    public function test_working_days_skip_the_weekend(): void
    {
        // Friday 10:00 + 3 working days = Wednesday 10:00.
        $due = ProcessingSla::addWorkingDays(Carbon::parse('2026-10-02 10:00'), 3);
        $this->assertSame('2026-10-07 10:00', $due->format('Y-m-d H:i'));

        // Monday + 3 = Thursday.
        $this->assertSame('2026-10-08', ProcessingSla::addWorkingDays(Carbon::parse('2026-10-05 09:00'), 3)->toDateString());
    }

    public function test_the_queue_holds_only_what_waits_on_the_officer_soonest_deadline_first(): void
    {
        $this->travelTo(Carbon::parse('2026-10-05 08:00')); // a Monday
        $applicant = $this->userOf('applicant');

        $later = $this->application($applicant, 'CZC', 'pending');
        $sooner = $this->application($applicant, 'TUP', 'pending');
        $returned = $this->application($applicant, 'SUP', 'pending');
        $release = $this->application($applicant, 'CZC', 'certificate_ready');
        $withAdministrator = $this->application($applicant, 'CZC', 'reviewed');
        $released = $this->application($applicant, 'CZC', 'released');

        $this->enteredStageAt($later, '2026-10-05 07:00');     // due Thu 07:00
        $this->enteredStageAt($sooner, '2026-09-30 11:00');    // Wed + 3 = Mon 10-05 11:00 (3 hrs away)
        $this->enteredStageAt($returned, '2026-10-01 09:00');  // Thu + 3 = Tue 10-06 09:00
        $this->enteredStageAt($release, '2026-10-02 15:00');   // Fri + 3 = Wed 10-07 15:00
        Report::where('request_id', $returned->id)->update([
            'evaluation' => 'pending',
            'admin_notes' => Report::RETURNED_NOTE_PREFIX . 'Lot number does not match the title.',
        ]);

        $queue = OfficerActionQueue::build();
        $ids = array_column($queue['items'], 'id');

        $this->assertSame([$sooner->id, $returned->id, $release->id, $later->id], $ids);
        $this->assertNotContains($withAdministrator->id, $ids, 'awaiting the Administrator, not the officer');
        $this->assertNotContains($released->id, $ids);
        $this->assertSame(4, $queue['total']);
        // Due within 24 hours: only the TUP (3 hrs away).
        $this->assertSame(1, $queue['critical']);

        $byId = collect($queue['items'])->keyBy('id');
        $this->assertSame('2026-10-05 11:00', Carbon::parse($byId[$sooner->id]['due_at'])->format('Y-m-d H:i'));
        $this->assertSame('Temporary Use Permit', $byId[$sooner->id]['type_label']);
        $this->assertSame(['label' => 'Review Application', 'href' => "/admin/requests/{$sooner->id}/view-application"], $byId[$sooner->id]['action']);
        $this->assertTrue($byId[$returned->id]['returned']);
        $this->assertSame('Address Return', $byId[$returned->id]['action']['label']);
        $this->assertSame(['label' => 'Release Certificate', 'href' => '/certificates'], $byId[$release->id]['action']);
        $this->assertSame('release', $byId[$release->id]['stage']);
        $this->assertSame('Alibagu', $byId[$later->id]['barangay']);
        $this->assertSame('LOT-1', $byId[$later->id]['lot_number']);
        $this->assertSame('Juan Dela Cruz', $byId[$later->id]['applicant']);
    }

    public function test_the_officer_dashboard_carries_the_queue_and_what_the_administrator_sent_them(): void
    {
        $officer = $this->userOf('admin');
        $other = $this->userOf('admin');
        $this->application($this->userOf('applicant'), 'CZC', 'pending');

        Notification::createForUser($officer->id, OfficerNotice::TYPE, 'Setback rule', 'Use 3 m from the river.', '/dashboard-panel', ['important' => true]);
        Notification::createForUser($officer->id, 'application_returned', 'Returned', 'Check the lot number.', '/admin/requests/1/view-application');
        Notification::createForUser($officer->id, 'payment_uploaded', 'Not from her', 'x');        // other kinds stay in the bell only
        Notification::createForUser($other->id, OfficerNotice::TYPE, 'For someone else', 'x');   // another officer's

        $this->actingAs($officer)->get('/dashboard-panel')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('actionQueue.total', 1)
                ->has('adminNotices', 2)
                ->where('adminNotices.0.type', 'application_returned')
                ->where('adminNotices.1.title', 'Setback rule')
                ->where('adminNotices.1.important', true)
                ->where('adminNotices.1.read', false)
                ->missing('advisories')
                ->etc());
    }

    public function test_the_administrator_notifies_all_officers(): void
    {
        $administrator = $this->userOf('super_admin');
        $ana = $this->userOf('admin', ['name' => 'Ana Officer']);
        $ben = $this->userOf('admin', ['name' => 'Ben Officer']);
        $applicant = $this->userOf('applicant');

        $this->actingAs($administrator)->get('/officer-notices')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('SuperAdmin/OfficerNotices')->has('officers', 2)->etc());

        $this->actingAs($administrator)->post('/super-admin/officer-notices', [
            'title' => 'Office closed Friday',
            'message' => 'No evaluations on Friday.',
            'is_important' => true,
            'recipients' => 'all',
        ])->assertRedirect()->assertSessionHas('success');

        foreach ([$ana, $ben] as $officer) {
            $copy = Notification::where('user_id', $officer->id)->where('type', OfficerNotice::TYPE)->first();
            $this->assertNotNull($copy, 'each officer gets the notification');
            $this->assertSame('Office closed Friday', $copy->title);
            $this->assertTrue($copy->data['important']);
        }
        $this->assertSame(0, Notification::where('user_id', $applicant->id)->count(), 'applicants are never sent these');

        $notice = OfficerNotice::firstOrFail();
        $this->assertSame($administrator->id, $notice->sent_by);
        $this->assertSame(['Ana Officer', 'Ben Officer'], $notice->recipients);
        $this->assertTrue(AuditLog::where('model_type', 'OfficerNotice')->where('model_id', $notice->id)->exists());
    }

    public function test_the_administrator_can_notify_selected_officers_only(): void
    {
        $administrator = $this->userOf('super_admin');
        $chosen = $this->userOf('admin');
        $left = $this->userOf('admin');
        $applicant = $this->userOf('applicant');

        $this->actingAs($administrator)->post('/super-admin/officer-notices', [
            'title' => 'Just you', 'message' => 'Please see me.', 'recipients' => 'selected', 'user_ids' => [$chosen->id],
        ])->assertSessionHas('success');

        $this->assertSame(1, Notification::where('user_id', $chosen->id)->count());
        $this->assertSame(0, Notification::where('user_id', $left->id)->count());

        // Only officers can be chosen.
        $this->actingAs($administrator)->post('/super-admin/officer-notices', [
            'title' => 'x', 'message' => 'y', 'recipients' => 'selected', 'user_ids' => [$applicant->id],
        ])->assertSessionHasErrors('user_ids.0');
        $this->assertSame(0, Notification::where('user_id', $applicant->id)->count());
    }

    public function test_only_the_administrator_notifies_officers(): void
    {
        $this->userOf('admin');

        foreach (['admin', 'applicant'] as $role) {
            $user = $this->userOf($role);
            $this->actingAs($user)->get('/officer-notices')->assertForbidden();
            $this->actingAs($user)->post('/super-admin/officer-notices', ['title' => 'a', 'message' => 'b', 'recipients' => 'all'])->assertForbidden();
        }

        $this->assertSame(0, OfficerNotice::count());
        $this->assertSame(0, Notification::where('type', OfficerNotice::TYPE)->count());
    }

    public function test_the_old_advisories_page_is_gone(): void
    {
        $this->actingAs($this->userOf('super_admin'))->get('/advisories')->assertNotFound();
    }
}
