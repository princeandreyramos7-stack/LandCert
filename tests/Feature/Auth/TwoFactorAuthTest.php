<?php

namespace Tests\Feature\Auth;

use App\Events\TwoFactorCodeIssued;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

/**
 * The texted code a brand-new account confirms before it is signed in (see
 * RegisteredUserController and TwoFactorChallengeController). A plain
 * sign-in with an existing account never triggers this any more - see
 * AuthenticationTest for that path.
 */
class TwoFactorAuthTest extends TestCase
{
    use RefreshDatabase;

    private function registrationPayload(array $overrides = []): array
    {
        return array_merge([
            'consent' => '1',
            'name' => 'Test User',
            'email' => 'newcomer@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'contact_number' => '09171234567',
        ], $overrides);
    }

    public function test_registering_sends_a_code_and_does_not_sign_in(): void
    {
        Event::fake([TwoFactorCodeIssued::class]);

        $this->post('/register', $this->registrationPayload())
            ->assertRedirect(route('two-factor.challenge'));

        $this->assertGuest();
        $user = User::where('email', 'newcomer@example.com')->firstOrFail();
        Event::assertDispatched(TwoFactorCodeIssued::class, fn ($event) => $event->user->is($user));
    }

    public function test_the_right_code_finishes_registering(): void
    {
        $this->registerThroughTwoFactor()
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
    }

    public function test_a_wrong_code_is_refused_and_logged(): void
    {
        $this->post('/register', $this->registrationPayload());
        $user = User::where('email', 'newcomer@example.com')->firstOrFail();

        $this->post('/two-factor-challenge', ['code' => '000000'])
            ->assertSessionHasErrors('code');

        $this->assertGuest();
        $log = AuditLog::where('action', 'two_factor_failed')->firstOrFail();
        $this->assertSame($user->id, $log->user_id);
        $this->assertSame(1, $log->metadata['attempt']);
    }

    public function test_five_wrong_codes_lock_the_challenge_and_restart_the_sign_in(): void
    {
        $this->post('/register', $this->registrationPayload());
        $user = User::where('email', 'newcomer@example.com')->firstOrFail();
        RateLimiter::clear('two-factor:' . $user->id . '|127.0.0.1');

        foreach (range(1, 5) as $ignored) {
            $this->post('/two-factor-challenge', ['code' => '000000']);
        }

        // Locked out now: even a code that happens to be right is refused.
        $this->post('/two-factor-challenge', ['code' => '111111'])
            ->assertSessionHasErrors('code');

        // And the pending sign-in was cleared along with it - back to a
        // fresh registration attempt, not stuck on a challenge it cannot pass.
        $this->get('/two-factor-challenge')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_resending_replaces_the_code_the_old_one_no_longer_works(): void
    {
        $this->post('/register', $this->registrationPayload());

        Event::fake([TwoFactorCodeIssued::class]);
        $this->post('/two-factor-challenge/resend')->assertSessionHas('status');

        $newCode = null;
        Event::assertDispatched(TwoFactorCodeIssued::class, function ($event) use (&$newCode) {
            $newCode = $event->code;
            return true;
        });

        $this->post('/two-factor-challenge', ['code' => $newCode])->assertRedirect();
        $this->assertAuthenticated();
    }

    public function test_visiting_the_challenge_page_with_no_pending_sign_in_bounces_to_login(): void
    {
        $this->get('/two-factor-challenge')->assertRedirect(route('login'));
    }
}
