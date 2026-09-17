<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\RequestStatusHistory;
use App\Support\ApplicationsList;
use App\Support\ProcessingSla;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Processing time (ARTA) and the archive: every status change is on record
 * with when it happened, the board says how long each application has sat
 * at its step against the Charter's limit, the reports page averages it,
 * and closed applications older than the archive age leave the board.
 */
class ProcessingTimeTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_status_change_is_recorded_from_filing_to_release(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');

        Carbon::setTestNow('2026-09-01 09:00:00');
        $request = $this->application($applicant, 'CZC', 'pending', $officer);
        $report = Report::where('request_id', $request->id)->firstOrFail();

        // The officer reviews it two working days later, the administrator
        // approves it the next day, it is paid and released after that.
        Carbon::setTestNow('2026-09-03 10:00:00');
        $report->update(['evaluation' => 'reviewed']);
        Carbon::setTestNow('2026-09-04 10:00:00');
        $report->update(['evaluation' => 'approved']);
        $request->update(['status' => 'approved']);
        Carbon::setTestNow('2026-09-07 10:00:00');
        $request->update(['status' => 'payment_confirmed']);
        Carbon::setTestNow('2026-09-08 10:00:00');
        $request->update(['status' => 'released']);

        $history = $request->fresh()->statusHistory->pluck('status')->all();
        $this->assertSame(['pending', 'reviewed', 'approved', 'payment_confirmed', 'released'], $history);

        $this->assertSame('2026-09-08 10:00:00', $request->fresh()->stage_since->format('Y-m-d H:i:s'));

        $stats = ProcessingSla::statistics(Carbon::parse('2026-08-01'));
        $this->assertSame(1, $stats['released']);
        // Sep 1 (Tue) to Sep 8 (Tue): five working days.
        $this->assertSame(5.0, $stats['average_turnaround_days']);
        $this->assertSame(2.0, $stats['average_stage_days']['verification']);
        $this->assertSame(1.0, $stats['average_stage_days']['approval']);
        $this->assertSame(1.0, $stats['average_stage_days']['release']);
        $this->assertSame(100, $stats['on_time_percent']);

        Carbon::setTestNow();
    }

    public function test_the_same_status_written_twice_is_one_entry(): void
    {
        $request = $this->application($this->userOf('applicant'), 'CZC', 'pending');
        $request->update(['status' => 'pending']);
        $request->touch();

        $this->assertSame(1, RequestStatusHistory::where('request_id', $request->id)->count());
    }

    public function test_working_days_skip_weekends(): void
    {
        // Friday to Monday is one working day; Friday to Friday is five.
        $this->assertSame(1, ProcessingSla::workingDaysBetween(Carbon::parse('2026-09-04 17:00'), Carbon::parse('2026-09-07 08:00')));
        $this->assertSame(5, ProcessingSla::workingDaysBetween(Carbon::parse('2026-09-04'), Carbon::parse('2026-09-11')));
        $this->assertSame(0, ProcessingSla::workingDaysBetween(Carbon::parse('2026-09-04 09:00'), Carbon::parse('2026-09-04 17:00')));
    }

    public function test_the_board_carries_the_stage_timestamp_and_the_limits(): void
    {
        $officer = $this->userOf('admin');
        $request = $this->application($this->userOf('applicant'), 'CZC', 'pending', $officer);

        $this->actingAs($officer)->get('/applications')
            ->assertInertia(fn (Assert $page) => $page
                ->where('archived', false)
                ->where('sla.verification', 3)
                ->where('sla.approval', 2)
                ->where('requests.0.id', $request->id)
                ->has('requests.0.stage_since'));
    }

    public function test_the_archive_is_a_separate_list_the_administrator_keeps(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $applicant = $this->userOf('applicant');
        $live = $this->application($applicant, 'CZC', 'released', $officer);
        $old = $this->application($applicant, 'TUP', 'released', $officer);

        // Only a closed application can be archived.
        $open = $this->application($applicant, 'SUP', 'reviewed', $officer);
        $this->actingAs($administrator)->post("/super-admin/requests/{$open->id}/archive")->assertSessionHas('error');
        $this->assertNull($open->fresh()->archived_at);

        $this->actingAs($administrator)->post("/super-admin/requests/{$old->id}/archive")->assertSessionHas('success');
        $this->assertNotNull($old->fresh()->archived_at);

        $this->assertEqualsCanonicalizing([$open->id, $live->id], ApplicationsList::rows('admin')->pluck('id')->all());
        $this->assertSame([$old->id], ApplicationsList::rows('admin', archived: true)->pluck('id')->all());

        $this->actingAs($officer)->get('/applications?archived=1')
            ->assertInertia(fn (Assert $page) => $page
                ->where('archived', true)
                ->where('archivedCount', 1)
                ->where('requests.0.id', $old->id)
                ->count('requests', 1));

        // Officers cannot archive; the administrator can bring it back.
        $this->actingAs($officer)->post("/super-admin/requests/{$old->id}/unarchive")->assertForbidden();
        $this->actingAs($administrator)->post("/super-admin/requests/{$old->id}/unarchive")->assertSessionHas('success');
        $this->assertNull($old->fresh()->archived_at);
    }

    public function test_the_command_archives_closed_applications_older_than_the_archive_age(): void
    {
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');
        $oldReleased = $this->application($applicant, 'CZC', 'released', $officer);
        $oldDenied = $this->application($applicant, 'CZC', 'rejected', $officer);
        $oldOpen = $this->application($applicant, 'CZC', 'approved', $officer);
        $recentReleased = $this->application($applicant, 'CZC', 'released', $officer);

        $threeYearsAgo = now()->subYears(3);
        RequestModel::whereIn('id', [$oldReleased->id, $oldDenied->id, $oldOpen->id])->update(['updated_at' => $threeYearsAgo]);

        $this->artisan('applications:archive --dry-run')->assertSuccessful();
        $this->assertSame(0, RequestModel::whereNotNull('archived_at')->count());

        $this->artisan('applications:archive')->assertSuccessful();

        $this->assertNotNull($oldReleased->fresh()->archived_at);
        $this->assertNotNull($oldDenied->fresh()->archived_at);
        $this->assertNull($oldOpen->fresh()->archived_at, 'an application still open is never archived');
        $this->assertNull($recentReleased->fresh()->archived_at, 'a recently released one stays on the board');
    }

    public function test_the_reports_page_carries_the_processing_figures(): void
    {
        $administrator = $this->userOf('super_admin');
        $this->application($this->userOf('applicant'), 'CZC', 'released');

        $this->actingAs($administrator)->get('/reports')
            ->assertInertia(fn (Assert $page) => $page
                ->has('processing.average_turnaround_days')
                ->has('processing.average_stage_days.verification')
                ->has('processing.on_time_percent')
                ->where('processing.limits.release', 3));
    }
}
