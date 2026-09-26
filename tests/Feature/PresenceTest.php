<?php

namespace Tests\Feature;

use App\Support\Presence;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The dashboards' live view: who is using the system right now, and where.
 */
class PresenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_page_view_marks_the_user_seen_on_that_page(): void
    {
        $applicant = $this->userOf('applicant');

        $this->actingAs($applicant)->get('/my-applications')->assertOk();

        $applicant->refresh();
        $this->assertNotNull($applicant->last_seen_at);
        $this->assertSame('/my-applications', $applicant->last_seen_path);
        $this->assertSame('My Applications', Presence::pageLabel($applicant->last_seen_path));
    }

    public function test_the_dashboards_show_who_is_online_and_who_dropped_off(): void
    {
        $administrator = $this->userOf('super_admin', ['name' => 'Crisanta D. Concepcion']);
        $officer = $this->userOf('admin', ['name' => 'Jeffrey C. Pauig']);
        $applicant = $this->userOf('applicant', ['name' => 'Juan Dela Cruz']);
        // subHours(3) crossed into yesterday whenever this happened to run in
        // the first few hours after midnight, undercounting 'today' by one -
        // clamped to the start of today instead, which still clears the
        // 5-minute online window (Presence::ONLINE_MINUTES) by a wide margin
        // regardless of what time this runs at.
        $gone = $this->userOf('applicant', [
            'name' => 'Left Yesterday',
            'last_seen_at' => now()->subHours(3)->max(today()->startOfDay()),
            'last_seen_path' => '/dashboard',
        ]);

        $this->actingAs($officer)->get('/applications')->assertOk();
        $this->actingAs($applicant)->get('/request')->assertOk();

        $this->actingAs($administrator)->get('/dashboard-panel')
            ->assertInertia(fn (Assert $page) => $page
                ->where('online.online', 3)              // administrator, officer, applicant
                ->where('online.by_role.admin', 1)
                ->where('online.by_role.applicant', 1)
                ->where('online.by_role.super_admin', 1)
                ->where('online.today', 4)               // ...plus the one who left three hours ago
                ->where('online.users.0.name', 'Crisanta D. Concepcion')
                ->where('online.users.0.page', 'Dashboard'));

        $snapshot = Presence::snapshot();
        $pages = collect($snapshot['users'])->pluck('page', 'name');
        $this->assertSame('Applications', $pages['Jeffrey C. Pauig']);
        $this->assertSame('New application form', $pages['Juan Dela Cruz']);
        $this->assertFalse($pages->has('Left Yesterday'));

        $this->actingAs($officer)->get('/dashboard-panel')
            ->assertInertia(fn (Assert $page) => $page->has('online.users'));
    }
}
