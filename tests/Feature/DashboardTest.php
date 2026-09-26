<?php

namespace Tests\Feature;

use App\Models\Report;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_each_role_lands_on_its_own_dashboard(): void
    {
        $this->actingAs($this->userOf('applicant'))->get('/dashboard')
            ->assertOk()->assertInertia(fn ($page) => $page->component('Dashboard'));

        $this->actingAs($this->userOf('admin'))->get('/dashboard-panel')
            ->assertOk()->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));

        $this->actingAs($this->userOf('super_admin'))->get('/dashboard-panel')
            ->assertOk()->assertInertia(fn ($page) => $page->component('SuperAdmin/Dashboard'));

        $this->actingAs($this->userOf('applicant'))->get('/dashboard-panel')->assertForbidden();
    }

    /**
     * Regression: the administrator's own reviews are dropped from the
     * performance list with reject(), which keeps keys. When theirs came first
     * the rest started at 1, was encoded as a JSON object, and the dashboard
     * died on `.slice`.
     */
    public function test_the_admin_performance_list_is_a_list_even_when_the_administrator_reviewed_first(): void
    {
        $administrator = $this->userOf('super_admin', ['name' => 'Crisanta D. Concepcion']);
        $officer = $this->userOf('admin', ['name' => 'Mary Jane P. Bulauan']);

        // The administrator's review sorts first (by name) in the grouped query.
        $this->application($this->userOf('applicant'), 'ZC', 'approved', $administrator);
        $this->application($this->userOf('applicant'), 'CZC', 'approved', $officer);

        $this->actingAs($administrator)->get('/dashboard-panel')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('SuperAdmin/Dashboard')
                ->has('adminActivity.admin_performance', 1)
                ->where('adminActivity.admin_performance.0.admin_name', 'Mary Jane P. Bulauan'));
    }

    /**
     * Regression: a request returned to the applicant for correction
     * ('in_applicant') has no decision yet, so its report's evaluation is
     * null (Request::deriveStatus falls back to the request's own status
     * only when evaluation is null). DashboardCacheService's status
     * breakdown grouped by evaluation without excluding that null, and the
     * dashboard's formatStatusData() called .charAt() on it and crashed the
     * whole analytics panel.
     */
    public function test_the_dashboard_survives_a_request_with_no_decision_yet(): void
    {
        $officer = $this->userOf('admin');
        $request = $this->application($this->userOf('applicant'), 'CZC', 'pending', $officer);
        Report::where('request_id', $request->id)->update(['evaluation' => null]);
        $request->update(['status' => 'in_applicant']);

        $this->actingAs($officer)->get('/dashboard-panel')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('analytics.status_breakdown', fn ($rows) => collect($rows)->every(fn ($row) => $row['evaluation'] !== null)));
    }
}
