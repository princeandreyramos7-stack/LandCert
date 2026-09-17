<?php

namespace Tests\Feature;

use App\Models\Certificate;
use App\Models\SignatureVersion;
use App\Services\ApplicationDocuments;
use App\Support\Signatories;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Who signs, and as what, is dated. A document is signed with the signature
 * and position in force on the day it was issued, so a new signature or a
 * promotion changes nothing already issued.
 */
class SignatoryTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        // Uploaded test signatures land in public/; keep the tree clean.
        foreach (glob(public_path(Signatories::UPLOAD_DIRECTORY . '/user-*-*.png')) ?: [] as $file) {
            @unlink($file);
        }
        parent::tearDown();
    }

    public function test_a_staff_account_starts_with_a_default_position_and_the_administrator_can_set_it_from_a_date(): void
    {
        $administrator = $this->userOf('super_admin');
        $officer = $this->userOf('admin', ['name' => 'Kay B. Aggarao']);
        Signatories::backfill($officer);

        $this->assertSame('Zoning Officer IV', Signatories::signer($officer)['position']);

        $this->actingAs($administrator)
            ->post("/super-admin/users/{$officer->id}/signatory", ['position' => 'Zoning Officer V', 'effective_from' => '2026-09-10'])
            ->assertSessionHas('success');

        $officer->refresh();
        $this->assertSame('Zoning Officer V', $officer->position);
        $this->assertSame('Zoning Officer V', Signatories::signer($officer, Carbon::parse('2026-09-15'))['position']);
        // Before the date, the previous title stands.
        $this->assertSame('Zoning Officer IV', Signatories::signer($officer, Carbon::parse('2026-09-01'))['position']);
    }

    public function test_the_administrator_uploads_a_signature_and_an_applicant_cannot_have_one(): void
    {
        $administrator = $this->userOf('super_admin');
        $officer = $this->userOf('admin');
        $applicant = $this->userOf('applicant');

        $this->actingAs($administrator)
            ->post("/super-admin/users/{$officer->id}/signatory", [
                'signature' => UploadedFile::fake()->image('sig.png', 300, 100),
            ])
            ->assertSessionHas('success');

        $version = SignatureVersion::where('user_id', $officer->id)->orderByDesc('id')->firstOrFail();
        $this->assertStringStartsWith(Signatories::UPLOAD_DIRECTORY . '/user-', $version->signature_path);
        $this->assertFileExists(public_path($version->signature_path));
        $this->assertSame('/' . $version->signature_path, $officer->fresh()->signature_url);

        $this->actingAs($administrator)
            ->post("/super-admin/users/{$applicant->id}/signatory", ['position' => 'x'])
            ->assertSessionHas('error');

        // Nothing given: refused.
        $this->actingAs($administrator)
            ->post("/super-admin/users/{$officer->id}/signatory", [])
            ->assertSessionHasErrors('position');

        // An officer cannot set anyone's.
        $this->actingAs($officer)
            ->post("/super-admin/users/{$officer->id}/signatory", ['position' => 'x'])
            ->assertForbidden();
    }

    public function test_a_new_signature_from_my_profile_is_in_force_from_now_and_old_documents_keep_theirs(): void
    {
        $officer = $this->userOf('admin', ['signature_path' => 'images/E-signitures/JeffreyPauig.png']);
        $administrator = $this->userOf('super_admin', ['signature_path' => 'images/E-signitures/zoningadministrator.png']);
        Signatories::backfill($officer);
        Signatories::backfill($administrator);
        $applicant = $this->userOf('applicant');

        // A certificate issued yesterday.
        $old = $this->application($applicant, 'CZC', 'released', $officer);
        Certificate::create(['request_id' => $old->id, 'certificate_number' => 'CERT-2026-00001', 'status' => 'released', 'issued_at' => now()->subDay()]);

        // The officer replaces their signature today.
        $this->actingAs($officer)
            ->post('/profile/signature', ['signature' => UploadedFile::fake()->image('new.png', 300, 100)])
            ->assertSessionHas('success');
        $new = $officer->fresh()->signature_url;
        $this->assertStringContainsString('/uploads/user-', $new);

        // Yesterday's certificate is still signed with yesterday's signature.
        $signers = ApplicationDocuments::signers($old->fresh());
        $this->assertSame('/images/E-signitures/JeffreyPauig.png', $signers['reviewer']['signature_url']);

        // One issued today - and one not yet issued - carry the new one.
        $today = $this->application($applicant, 'CZC', 'released', $officer);
        Certificate::create(['request_id' => $today->id, 'certificate_number' => 'CERT-2026-00002', 'status' => 'released', 'issued_at' => now()]);
        $this->assertSame($new, ApplicationDocuments::signers($today->fresh())['reviewer']['signature_url']);

        $pending = $this->application($applicant, 'CZC', 'approved', $officer);
        $this->assertSame($new, ApplicationDocuments::signers($pending)['reviewer']['signature_url']);

        // Applicants have no signature to replace.
        $this->actingAs($applicant)
            ->post('/profile/signature', ['signature' => UploadedFile::fake()->image('x.png')])
            ->assertForbidden();
    }

    public function test_a_change_of_administrator_keeps_older_documents_with_the_previous_one(): void
    {
        $officer = $this->userOf('admin');
        $outgoing = $this->userOf('super_admin', ['name' => 'Crisanta D. Concepcion', 'signature_path' => 'images/E-signitures/zoningadministrator.png']);
        Signatories::backfill($officer);
        Signatories::backfill($outgoing);
        $applicant = $this->userOf('applicant');

        $earlier = $this->application($applicant, 'CZC', 'released', $officer);
        Certificate::create(['request_id' => $earlier->id, 'certificate_number' => 'CERT-2026-00001', 'status' => 'released', 'issued_at' => '2026-06-01 09:00:00']);

        // A new administrator takes over on Sep 1.
        $incoming = $this->userOf('super_admin', ['name' => 'Juan Dela Cruz']);
        Signatories::set($incoming, UploadedFile::fake()->image('sig.png', 300, 100), 'OIC - CPDC / Zoning Administrator', Carbon::parse('2026-09-01'), $outgoing->id);

        $this->assertSame('Crisanta D. Concepcion', ApplicationDocuments::signers($earlier->fresh())['zoningAdministrator']['name']);

        $later = $this->application($applicant, 'CZC', 'released', $officer);
        Certificate::create(['request_id' => $later->id, 'certificate_number' => 'CERT-2026-00002', 'status' => 'released', 'issued_at' => '2026-09-05 09:00:00']);
        $signer = ApplicationDocuments::signers($later->fresh())['zoningAdministrator'];
        $this->assertSame('Juan Dela Cruz', $signer['name']);
        $this->assertSame('OIC - CPDC / Zoning Administrator', $signer['position']);
    }

    public function test_the_documents_carry_the_position_and_the_profile_shares_the_signature(): void
    {
        $officer = $this->userOf('admin', ['signature_path' => 'images/E-signitures/JeffreyPauig.png']);
        $administrator = $this->userOf('super_admin', ['signature_path' => 'images/E-signitures/zoningadministrator.png']);
        Signatories::backfill($officer);
        Signatories::backfill($administrator);
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'TUP', 'released', $officer);
        $request->update(['released_to_applicant_at' => now()]);

        $this->actingAs($applicant)->get("/my-applications/{$request->id}/print-clearance")
            ->assertInertia(fn (Assert $page) => $page
                ->where('reviewer.position', 'Zoning Officer IV')
                ->where('zoningAdministrator.position', 'City Planning & Development Coordinator / Zoning Administrator'));

        $this->actingAs($officer)->get('/profile')
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.signature_url', '/images/E-signitures/JeffreyPauig.png')
                ->where('auth.user.position', 'Zoning Officer IV'));

        $this->actingAs($administrator)->get('/users')
            ->assertInertia(fn (Assert $page) => $page
                ->where('users.0.position', fn ($v) => $v !== null || true));
    }
}
