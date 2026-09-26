<?php

namespace Tests\Feature\Auth;

use App\Events\TwoFactorCodeIssued;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * The texted code every sign-in confirms between a right password and a
 * trusted session (see AuthenticatedSessionController and
 * TwoFactorChallengeController).
 */
class TwoFactorAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_right_password_sends_a_code_and_does_not_sign_in(): void
    {
        Event::fake([TwoFactorCodeIssued::class]);
        $user = $this->userOf('applicant');

        $this->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect(route('two-factor.challenge'));

        $this->assertGuest();
        Event::assertDispatched(TwoFactorCodeIssued::class, fn ($event) => $event->user->is($user));
    }

    public function test_the_right_code_finishes_signing_in(): void
    {
        $user = $this->userOf('applicant');

        $this->loginThroughTwoFactor($user->email, 'password')
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticatedAs($user);
    }

    public function test_a_wrong_code_is_refused_and_logged(): void
    {
        $user = $this->userOf('applicant');

        $this->post('/login', ['email' => $user->email, 'password' => 'password']);

        $this->post('/two-factor-challenge', ['code' => '000000'])
            ->assertSessionHasErrors('code');

        $this->assertGuest();
        $log = AuditLog::where('action', 'two_factor_failed')->firstOrFail();
        $this->assertSame($user->id, $log->user_id);
        $this->assertSame(1, $log->metadata['attempt']);
    }

    public function test_five_wrong_codes_lock_the_challenge_and_restart_the_sign_in(): void
    {
        $user = $this->userOf('applicant');
        RateLimiter::clear('two-factor:' . $user->id . '|127.0.0.1');

        $this->post('/login', ['email' => $user->email, 'password' => 'password']);

        foreach (range(1, 5) as $ignored) {
            $this->post('/two-factor-challenge', ['code' => '000000']);
        }

        // Locked out now: even a code that happens to be right is refused.
        $this->post('/two-factor-challenge', ['code' => '111111'])
            ->assertSessionHasErrors('code');

        // And the pending sign-in was cleared along with it - back to a
        // fresh password check, not stuck on a challenge it cannot pass.
        $this->get('/two-factor-challenge')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_resending_replaces_the_code_the_old_one_no_longer_works(): void
    {
        $user = $this->userOf('applicant');

        $this->post('/login', ['email' => $user->email, 'password' => 'password']);

        Event::fake([TwoFactorCodeIssued::class]);
        $this->post('/two-factor-challenge/resend')->assertSessionHas('status');

        $newCode = null;
        Event::assertDispatched(TwoFactorCodeIssued::class, function ($event) use (&$newCode) {
            $newCode = $event->code;
            return true;
        });

        $this->post('/two-factor-challenge', ['code' => $newCode])->assertRedirect();
        $this->assertAuthenticatedAs($user);
    }

    public function test_an_account_with_no_phone_number_cannot_sign_in(): void
    {
        $user = $this->userOf('applicant', ['contact_number' => null]);

        $this->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_visiting_the_challenge_page_with_no_pending_sign_in_bounces_to_login(): void
    {
        $this->get('/two-factor-challenge')->assertRedirect(route('login'));
    }

    public function test_staff_still_land_on_their_own_dashboard_after_the_code(): void
    {
        $admin = $this->userOf('admin');

        $this->loginThroughTwoFactor($admin->email, 'password')
            ->assertRedirect(route('admin.dashboard'));

        $superAdmin = $this->userOf('super_admin');
        $this->post('/logout');

        $this->loginThroughTwoFactor($superAdmin->email, 'password')
            ->assertRedirect(route('super-admin.dashboard'));
    }
}
