<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The throttles: the general one on every signed-in page, the tighter one on
 * filing an application, and the loose one on the pictures and scans a report
 * page loads by the dozen. Each must count on its own. Laravel keys a throttle
 * by the user alone unless it is given a prefix, so throttles that stack on a
 * route, or that sit on routes the same user hits, share one counter - and
 * then ten page views used up an applicant's ten submissions a minute, and
 * sixty scans on a report page used up the sixty page views.
 */
class RateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_browsing_the_site_does_not_use_up_the_applicant_s_submissions(): void
    {
        $applicant = $this->userOf('applicant');

        for ($i = 0; $i < 12; $i++) {
            $this->actingAs($applicant)->get('/my-applications')->assertOk();
        }

        // Nothing filled in, so validation refuses it - but it must get as far
        // as validation, not be turned away at the door as "too many requests".
        $this->actingAs($applicant)
            ->from('/request')
            ->post('/request', [])
            ->assertRedirect('/request')
            ->assertSessionHasErrors('applicant_name');
    }

    public function test_ten_submissions_a_minute_is_the_applicant_s_own_limit(): void
    {
        $applicant = $this->userOf('applicant');

        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($applicant)->post('/request', [])->assertStatus(302);
        }
        $this->actingAs($applicant)->post('/request', [])->assertStatus(429);

        // ...and the rest of the site stays open to them meanwhile.
        $this->actingAs($applicant)->get('/my-applications')->assertOk();
    }

    public function test_loading_scans_does_not_use_up_the_page_views(): void
    {
        $officer = $this->userOf('admin');
        $app = $this->application($this->userOf('applicant'), 'CZC', 'pending');
        $scan = $this->requirementScan($app, 1, 'Application form');

        for ($i = 0; $i < 70; $i++) {
            $this->actingAs($officer)->get(route('requirements.view', $scan->id))->assertOk();
        }

        $this->actingAs($officer)->get('/dashboard-panel')->assertOk();
    }
}
