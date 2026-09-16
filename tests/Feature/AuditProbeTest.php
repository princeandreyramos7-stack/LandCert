<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Pre-deployment probes: the decision flow cannot be bypassed, one role
 * cannot reach into another's account, and bad input is refused rather than
 * crashing.
 */
class AuditProbeTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_officer_cannot_approve_around_the_administrator(): void
    {
        $officer = $this->userOf('admin');
        $request = $this->application($this->userOf('applicant'), 'CZC', 'reviewed', $officer);
        $report = Report::where('request_id', $request->id)->first();
        Mail::fake();

        // The legacy direct-evaluation and bulk endpoints must not exist.
        $this->actingAs($officer)->post("/admin/update-evaluation/{$report->report_id}", ['evaluation' => 'approved'])
            ->assertNotFound();
        $this->actingAs($officer)->post('/admin/bulk/approve', ['request_ids' => [$request->id]])
            ->assertNotFound();
        $this->actingAs($officer)->post('/admin/bulk/reject', ['request_ids' => [$request->id], 'reason' => 'x'])
            ->assertNotFound();
        $this->actingAs($officer)->delete('/admin/bulk/delete', ['request_ids' => [$request->id]])
            ->assertNotFound();
        $this->actingAs($officer)->delete("/admin/delete-request/{$request->id}")
            ->assertNotFound();

        $this->assertSame('reviewed', $report->fresh()->evaluation);
        $this->assertSame('reviewed', $request->fresh()->status);
        Mail::assertNothingQueued();
    }

    public function test_the_officer_manages_applicants_only_never_staff(): void
    {
        $officer = $this->userOf('admin');
        $otherOfficer = $this->userOf('admin', ['email' => 'other-officer@example.test']);
        $administrator = $this->userOf('super_admin');
        $applicant = $this->userOf('applicant');

        // Rewriting the administrator's e-mail would hand the account over
        // through "forgot password".
        $this->actingAs($officer)->put("/super-admin/users/{$administrator->id}", ['name' => 'X', 'email' => 'me@example.test'])
            ->assertForbidden();
        $this->actingAs($officer)->put("/admin/users/{$administrator->id}", ['name' => 'X', 'email' => 'me@example.test'])
            ->assertForbidden();
        $this->actingAs($officer)->put("/admin/users/{$otherOfficer->id}", ['name' => 'X', 'email' => 'me2@example.test'])
            ->assertForbidden();
        $this->assertSame($administrator->email, $administrator->fresh()->email);
        $this->assertSame($otherOfficer->email, $otherOfficer->fresh()->email);

        $this->actingAs($officer)->delete("/admin/users/{$administrator->id}")->assertForbidden();
        $this->actingAs($officer)->delete("/admin/users/{$otherOfficer->id}")->assertForbidden();
        $this->actingAs($officer)->delete("/admin/users/{$officer->id}")->assertForbidden();
        $this->assertNotNull(User::find($administrator->id));
        $this->assertNotNull(User::find($otherOfficer->id));
        $this->assertNotNull(User::find($officer->id));

        // An applicant's account is theirs to manage.
        $this->actingAs($officer)->put("/admin/users/{$applicant->id}", ['name' => 'Renamed', 'email' => $applicant->email])
            ->assertRedirect();
        $this->assertSame('Renamed', $applicant->fresh()->name);
    }

    public function test_the_officer_can_add_applicant_accounts_and_only_those(): void
    {
        $officer = $this->userOf('admin');

        $this->actingAs($officer)->post('/admin/users', [
            'name' => 'Counter Applicant',
            'email' => 'counter@example.test',
            'contact_number' => '09181234567',
            'password' => 'Counter12345!',
            'password_confirmation' => 'Counter12345!',
            // Ignored: the role is never taken from the request.
            'user_type' => 'super_admin',
        ])->assertSessionHasNoErrors();

        $made = User::where('email', 'counter@example.test')->firstOrFail();
        $this->assertSame('applicant', $made->user_type);
        $this->assertNotNull($made->email_verified_at);
        $this->assertNull($made->address);

        // With a picked address the server composes the line, as at sign-up.
        $this->actingAs($officer)->post('/admin/users', array_merge([
            'name' => 'With Address', 'email' => 'withaddress@example.test', 'contact_number' => '09181234568',
            'password' => 'Counter12345!', 'password_confirmation' => 'Counter12345!',
        ], $this->addressFields('address')))->assertSessionHasNoErrors();
        $withAddress = User::where('email', 'withaddress@example.test')->firstOrFail();
        $this->assertSame('1 Test Street, Alibagu, City of Ilagan, Isabela', $withAddress->address);
        $this->assertSame('023114006', $withAddress->address_barangay_code);

        // Half an address is refused.
        $this->actingAs($officer)->post('/admin/users', [
            'name' => 'Half', 'email' => 'half@example.test', 'contact_number' => '09181234569',
            'password' => 'Counter12345!', 'password_confirmation' => 'Counter12345!',
            'address_region_code' => '020000000',
        ])->assertSessionHasErrors(['address_province_code']);

        $this->actingAs($officer)->post('/admin/users', [
            'name' => 'Bad Number', 'email' => 'bad@example.test', 'contact_number' => '12345',
            'password' => 'short', 'password_confirmation' => 'short',
        ])->assertSessionHasErrors(['contact_number', 'password']);

        // Applicants and administrators have no such endpoint.
        $this->actingAs($this->userOf('applicant'))->post('/admin/users', ['name' => 'x'])->assertForbidden();
    }

    public function test_who_texts_whom_and_who_words_the_automatic_notices(): void
    {
        $administrator = $this->userOf('super_admin');
        $officer = $this->userOf('admin');
        $message = ['recipients' => 'all', 'message' => 'Hello {name}'];

        // The Administrator texts the officers and nobody else.
        $this->actingAs($administrator)->post('/super-admin/sms/send', $message + ['audience' => 'officers'])->assertRedirect();
        $this->actingAs($administrator)->from('/sms-broadcast')->post('/super-admin/sms/send', $message + ['audience' => 'applicants'])
            ->assertSessionHasErrors('audience');

        // The officer texts applicants, and words the automatic notices.
        $this->actingAs($officer)->post('/admin/sms/send', $message + ['audience' => 'applicants'])->assertRedirect();
        $this->actingAs($officer)->from('/sms-broadcast')->post('/admin/sms/send', $message + ['audience' => 'officers'])
            ->assertSessionHasErrors('audience');
        $template = \App\Models\SmsTemplate::create(['event_key' => 'probe', 'event_label' => 'Probe', 'message' => 'Hello {name}', 'enabled' => true, 'variables' => ['name']]);
        $this->actingAs($administrator)->put("/super-admin/sms/templates/{$template->id}", ['message' => 'Changed by admin', 'enabled' => true])->assertNotFound();
        $this->actingAs($administrator)->put("/admin/sms/templates/{$template->id}", ['message' => 'Changed by admin', 'enabled' => true])->assertForbidden();
        $this->actingAs($officer)->put("/admin/sms/templates/{$template->id}", ['message' => 'Changed by officer', 'enabled' => true])->assertRedirect();
        $this->assertSame('Changed by officer', $template->fresh()->message);
    }

    public function test_nobody_promotes_themselves_through_their_profile(): void
    {
        $applicant = $this->userOf('applicant');

        $this->actingAs($applicant)->patch('/profile', [
            'name' => $applicant->name,
            'email' => $applicant->email,
            'user_type' => 'super_admin',
            'signature_path' => 'images/E-signitures/zoningadministrator.png',
        ]);

        $fresh = $applicant->fresh();
        $this->assertSame('applicant', $fresh->user_type);
        $this->assertNull($fresh->signature_path);
    }

    public function test_the_administrator_cannot_demote_or_delete_herself(): void
    {
        $administrator = $this->userOf('super_admin');

        $this->actingAs($administrator)->delete("/super-admin/users/{$administrator->id}");
        $this->assertNotNull(User::find($administrator->id));

        $this->actingAs($administrator)->put("/super-admin/users/{$administrator->id}", [
            'name' => $administrator->name,
            'email' => $administrator->email,
            'user_type' => 'applicant',
        ]);
        $this->assertSame('super_admin', $administrator->fresh()->user_type, 'the last administrator must not lock the office out');
    }

    public function test_a_backup_download_never_leaves_the_backup_folder(): void
    {
        $administrator = $this->userOf('super_admin');

        foreach (['..%2F..%2F.env', '../../.env', 'x.zip/../../.env', '.env', '..%5C..%5C.env'] as $file) {
            $this->actingAs($administrator)->get("/super-admin/backups/{$file}/download")->assertNotFound();
            $this->actingAs($administrator)->delete("/super-admin/backups/{$file}")->assertNotFound();
        }
    }

    /**
     * Garbage in, a validation error out - never a 500. Every POST/PUT the
     * roles can reach, hit with the wrong shape of data.
     */
    public function test_bad_input_is_refused_not_crashed(): void
    {
        Mail::fake();
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $applicant = $this->userOf('applicant');
        $request = $this->application($applicant, 'CZC', 'reviewed', $officer);
        $report = Report::where('request_id', $request->id)->first();

        $garbage = [
            'x' => str_repeat('A', 70000), 'request_id' => 'abc', 'action' => '<script>', 'payment_amount' => -1,
            'amount' => 'NaN', 'description' => ['a' => 'b'], 'email' => 'not-an-email', 'password' => '',
            'project_type' => 'DROP TABLE', 'project_cost' => '1e400', 'lot_number' => str_repeat('9', 500),
            'verified_requirements' => 'not-an-array', 'name' => null, 'id' => '1 OR 1=1', 'released' => 'maybe',
            'receipt_number' => str_repeat('R', 1000), 'payment_date' => '31-31-2026', 'file' => 'not-a-file',
            'contact_number' => 'call me', 'certificate_number' => ['nested'], 'user_ids' => 'x', 'message' => '',
        ];

        $probes = [
            [$applicant, 'post', '/request'],
            [$applicant, 'put', "/requests/{$request->id}"],
            [$applicant, 'post', '/payments'],
            [$applicant, 'post', "/my-applications/{$request->id}/requirement-upload"],
            [$applicant, 'post', "/my-applications/{$request->id}/notarized-form"],
            [$applicant, 'post', '/notifications/mark-read'],
            [$applicant, 'patch', '/profile'],
            [$applicant, 'put', '/password'],
            [$applicant, 'post', '/profile/avatar'],
            [$officer, 'post', '/admin/review-application'],
            [$officer, 'post', "/admin/requests/{$request->id}/verify-requirements"],
            [$officer, 'post', "/admin/requests/{$request->id}/application-details"],
            [$officer, 'post', "/admin/update-project-type/{$request->id}"],
            [$officer, 'post', "/admin/requests/{$request->id}/certificate-details"],
            [$officer, 'post', "/admin/requests/{$request->id}/release-to-applicant"],
            [$officer, 'post', '/admin/payments/record'],
            [$officer, 'post', '/admin/payments/upload-receipt'],
            [$officer, 'post', '/admin/upload-requirement-document'],
            [$officer, 'post', '/admin/save-requirement-verification'],
            [$officer, 'post', '/admin/certificates'],
            [$officer, 'post', '/admin/certificates/upload-softcopy'],
            [$officer, 'post', '/admin/sms/send'],
            [$officer, 'put', "/admin/users/{$applicant->id}"],
            [$administrator, 'post', "/super-admin/approve-request/{$report->report_id}"],
            [$administrator, 'post', "/super-admin/reject-request/{$report->report_id}"],
            [$administrator, 'post', '/super-admin/create-admin'],
            [$administrator, 'put', "/super-admin/users/{$applicant->id}"],
            [$administrator, 'put', '/super-admin/backups/schedule'],
            [$administrator, 'put', '/super-admin/sms/templates/1'],
            [$administrator, 'post', '/super-admin/payments/upload-receipt'],
            [$administrator, 'put', '/super-admin/payments/1'],
        ];

        $crashed = [];
        foreach ($probes as [$user, $method, $url]) {
            foreach ([$garbage, []] as $payload) {
                $response = $this->actingAs($user)->{$method}($url, $payload);
                if ($response->getStatusCode() >= 500) {
                    $crashed[] = strtoupper($method) . " {$url} -> {$response->getStatusCode()}";
                }
            }
        }

        $this->assertSame([], $crashed, "These endpoints crash on bad input:\n" . implode("\n", $crashed));
    }

    /**
     * Every upload is judged on its bytes (Laravel's mimes: rule asks fileinfo),
     * so an executable renamed scan.pdf is refused wherever a file can be sent.
     * Proven on the real guesser, not the test fake, which types by name.
     */
    public function test_every_upload_is_judged_by_content(): void
    {
        $uploadRules = [
            'AdminController.php' => ["'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'", "'receipt_file' => 'required|file|mimes:jpeg,jpg,png,gif,pdf|max:5120'"],
            'SuperAdminController.php' => ["'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'", "'receipt_file' => 'required|file|mimes:jpeg,jpg,png,gif,pdf|max:5120'"],
            'RequirementDocumentController.php' => ["'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120'"],
            'PaymentController.php' => ["'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120'"],
        ];
        foreach ($uploadRules as $controller => $rules) {
            $source = file_get_contents(app_path("Http/Controllers/{$controller}"));
            foreach ($rules as $rule) {
                $this->assertStringContainsString($rule, $source, "{$controller} lost its upload rule");
            }
        }

        $path = tempnam(sys_get_temp_dir(), 'probe');
        file_put_contents($path, "MZ\x90\x00 this is an executable, not a pdf");
        $real = new \Symfony\Component\HttpFoundation\File\UploadedFile($path, 'scan.pdf', 'application/pdf', null, true);
        $this->assertSame('exe', $real->guessExtension(), 'fileinfo must see through the file name');
        $this->assertTrue(extension_loaded('fileinfo'));
        @unlink($path);
    }
}
