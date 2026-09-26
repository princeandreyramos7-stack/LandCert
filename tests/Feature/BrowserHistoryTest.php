<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The Back button must ask the server, not the browser's memory: Inertia's
 * page history is encrypted, and the key is thrown away at sign-in and on
 * every page served to a signed-out visitor.
 */
class BrowserHistoryTest extends TestCase
{
    use RefreshDatabase;

    /** The page's history flags - carried beside the props, not among them. */
    private function historyFlags($response): array
    {
        $flags = [];
        $response->assertInertia(function ($page) use (&$flags) {
            $flags = array_intersect_key($page->toArray(), array_flip(['encryptHistory', 'clearHistory']));
        });

        return $flags;
    }

    public function test_history_is_encrypted_and_a_signed_out_page_throws_the_key_away(): void
    {
        $this->assertSame(
            ['encryptHistory' => true, 'clearHistory' => true],
            $this->historyFlags($this->get('/login')->assertOk())
        );
    }

    public function test_signing_in_rotates_the_key_once_and_then_leaves_it(): void
    {
        $user = $this->userOf('applicant', ['password' => 'secret-pass-2026']);

        $this->loginThroughTwoFactor($user->email, 'secret-pass-2026')
            ->assertRedirect();

        // The first page after sign-in clears the old history...
        $this->assertSame(
            ['encryptHistory' => true, 'clearHistory' => true],
            $this->historyFlags($this->get('/my-applications')->assertOk())
        );

        // ...and the next one does not, so Back works within the session.
        $this->assertSame(
            ['encryptHistory' => true, 'clearHistory' => false],
            $this->historyFlags($this->get('/my-applications')->assertOk())
        );
    }

    public function test_after_logout_a_protected_page_is_refused_and_the_next_page_rotates_the_key(): void
    {
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/logout')->assertRedirect('/');
        $this->assertGuest();

        $this->get('/my-applications')->assertRedirect('/login');
        $this->assertTrue($this->historyFlags($this->get('/')->assertOk())['clearHistory']);
    }
}
