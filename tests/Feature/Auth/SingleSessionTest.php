<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * At most one signed-in session per account at a time (see
 * App\Support\SingleSession and App\Http\Middleware\EnsureSingleSession).
 */
class SingleSessionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Auth::user() is cached on the guard instance for the rest of a test
     * method once resolved - real requests never share a guard this way,
     * but PHPUnit reuses the same application across every call within one
     * test. Without this, a DB change made mid-test (standing in for
     * "another device just signed in") would never be seen by the next
     * request. Mirrors the same reset RouteSweepTest uses between roles.
     */
    private function forgetResolvedUser(): void
    {
        $this->app['auth']->forgetGuards();
    }

    public function test_a_real_login_claims_a_session_token(): void
    {
        $user = $this->userOf('applicant');

        $this->loginThroughTwoFactor($user->email, 'password')->assertRedirect();

        $user->refresh();
        $this->assertNotNull($user->current_session_id);
        $this->assertSame($user->current_session_id, session('device_session_id'));
    }

    /**
     * A later sign-in elsewhere overwrites the account's token - simulated
     * here directly, the same effect a second device's own real login
     * would have, without needing to fake a second independent browser
     * inside one test.
     */
    public function test_a_later_login_elsewhere_signs_this_session_out(): void
    {
        $user = $this->userOf('applicant');
        $this->loginThroughTwoFactor($user->email, 'password')->assertRedirect();
        $this->assertAuthenticatedAs($user);

        $user->forceFill(['current_session_id' => 'a-different-devices-token'])->save();
        $this->forgetResolvedUser();

        $this->get('/dashboard')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_the_signed_out_message_explains_why(): void
    {
        $user = $this->userOf('applicant');
        $this->loginThroughTwoFactor($user->email, 'password');
        $user->forceFill(['current_session_id' => 'a-different-devices-token'])->save();
        $this->forgetResolvedUser();

        $this->get('/dashboard')
            ->assertRedirect(route('login'))
            ->assertSessionHas('status', 'You have been signed out because this account was signed in on another device.');
    }

    public function test_logging_out_releases_the_claim(): void
    {
        $user = $this->userOf('applicant');
        $this->loginThroughTwoFactor($user->email, 'password')->assertRedirect();

        $this->post('/logout');

        $this->assertNull($user->fresh()->current_session_id);
    }

    /**
     * actingAs() bypasses the real login flow entirely, the same as any
     * session that predates this feature or whose account has never signed
     * in since - both this session and the account are left with no token
     * at all, and null must only ever match null, not read as a conflict.
     */
    public function test_a_session_with_no_claim_is_not_kicked_by_itself(): void
    {
        $user = $this->userOf('applicant');

        $this->actingAs($user)->get('/dashboard')->assertOk();
    }

    public function test_a_second_real_login_mints_a_different_token_than_the_first(): void
    {
        $user = $this->userOf('applicant');

        $this->loginThroughTwoFactor($user->email, 'password')->assertRedirect();
        $firstToken = $user->fresh()->current_session_id;
        $this->assertNotNull($firstToken);

        // A different device: its own session, not still carrying Device
        // 1's - real ones never share one to begin with. /login is a
        // guest-only route, so without this the still-authenticated test
        // client would just be redirected away rather than sign in again.
        $this->forgetResolvedUser();
        $this->flushSession();

        $this->loginThroughTwoFactor($user->email, 'password')->assertRedirect();
        $secondToken = $user->fresh()->current_session_id;

        $this->assertNotNull($secondToken);
        $this->assertNotSame($firstToken, $secondToken);
    }

    /** One account's claim can never be satisfied by a different account's session. */
    public function test_one_accounts_token_never_matches_another_accounts_session(): void
    {
        $first = $this->userOf('applicant');
        $second = $this->userOf('applicant');

        $this->loginThroughTwoFactor($first->email, 'password')->assertRedirect();
        $this->assertAuthenticatedAs($first);

        // Another account signing in elsewhere does not touch this one.
        $second->forceFill(['current_session_id' => 'unrelated-token'])->save();
        $this->forgetResolvedUser();

        $this->get('/dashboard')->assertOk();
        $this->assertAuthenticatedAs($first);
    }
}
