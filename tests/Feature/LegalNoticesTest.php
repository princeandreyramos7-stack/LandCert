<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\LegalDocuments;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The published notices, and the consent that points at them.
 *
 * Two things matter here beyond "the page loads". The notices must be
 * readable without an account, because somebody deciding whether to
 * register has to see what they would be agreeing to. And the consent has
 * to be enforced on the server: a tick that can be skipped by posting the
 * form directly is not a consent the office could stand behind.
 */
class LegalNoticesTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_notice_is_readable_without_signing_in(): void
    {
        foreach (LegalDocuments::keys() as $key) {
            $this->get("/legal/{$key}")
                ->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('Legal/Show')
                    ->where('doc.key', $key)
                    ->where('doc.version', LegalDocuments::VERSION)
                    ->has('doc.sections')
                    // The other three, for the links across the top.
                    ->has('documents', 4));
        }
    }

    public function test_an_unknown_notice_is_not_found(): void
    {
        $this->get('/legal/whatever')->assertNotFound();
    }

    public function test_each_notice_has_a_title_an_opening_and_sections(): void
    {
        foreach (LegalDocuments::all() as $doc) {
            $this->assertNotEmpty($doc['title'], "{$doc['key']} has no title");
            $this->assertNotEmpty($doc['intro'], "{$doc['key']} has no opening paragraph");
            $this->assertNotEmpty($doc['sections'], "{$doc['key']} has no sections");

            foreach ($doc['sections'] as $section) {
                $this->assertNotEmpty($section['heading']);
                $this->assertNotEmpty($section['content'], "empty section: {$section['heading']}");
            }
        }
    }

    public function test_registration_is_refused_without_the_consent_tick(): void
    {
        $this->post('/register', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'contact_number' => '09171234567',
            'password' => 'password',
            'password_confirmation' => 'password',
            // No consent.
        ])->assertSessionHasErrors('consent');

        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'juan@example.com']);
    }

    public function test_a_consent_of_no_is_not_a_consent(): void
    {
        $this->post('/register', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'contact_number' => '09171234567',
            'password' => 'password',
            'password_confirmation' => 'password',
            'consent' => '0',
        ])->assertSessionHasErrors('consent');

        $this->assertGuest();
    }

    public function test_the_edition_consented_to_is_recorded_with_the_account(): void
    {
        $this->post('/register', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'contact_number' => '09171234567',
            'password' => 'password',
            'password_confirmation' => 'password',
            'consent' => '1',
        ]);

        $user = User::where('email', 'juan@example.com')->firstOrFail();

        // "They consented" is worth little without saying to what.
        $this->assertNotNull($user->consented_at);
        $this->assertSame(LegalDocuments::VERSION, $user->consent_version);
        $this->assertNotNull($user->consent_ip);
    }

    public function test_the_registration_form_carries_the_notices_it_refers_to(): void
    {
        $this->get('/register')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('legal', 4)
                ->where('legalVersion', LegalDocuments::VERSION));
    }

    public function test_the_notices_are_reachable_while_signed_in_too(): void
    {
        $this->actingAs($this->userOf('applicant'))
            ->get('/legal/privacy')
            ->assertOk();
    }
}
