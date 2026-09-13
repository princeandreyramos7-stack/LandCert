<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use ZipArchive;

/**
 * Reports & Document Management: who may run which report, what the panel is
 * given to draw, and the three downloads.
 */
class ReportsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_only_staff_reach_the_reports_page_and_the_officer_report_is_the_administrators(): void
    {
        $this->actingAs($this->userOf('applicant'))->get('/reports')->assertForbidden();

        $this->actingAs($this->userOf('admin'))->get('/reports')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Reports')
                ->where('reportTypes', ['applicant', 'period']));

        $this->actingAs($this->userOf('super_admin'))->get('/reports')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('SuperAdmin/Reports')
                ->where('reportTypes', ['applicant', 'period', 'officer']));
    }

    public function test_the_officer_report_is_refused_to_the_zoning_officer(): void
    {
        $this->actingAs($this->userOf('admin'))
            ->getJson('/admin/reports/preview?type=officer&officer=all')
            ->assertStatus(422);
    }

    public function test_the_applicant_report_carries_the_documents_the_panel_draws(): void
    {
        $officer = $this->userOf('admin', ['name' => 'Mary Jane P. Bulauan']);
        $administrator = $this->userOf('super_admin', ['name' => 'Crisanta D. Concepcion', 'signature_path' => 'images/none.png']);
        $owner = $this->userOf('applicant');

        $czc = $this->application($owner, 'CZC', 'approved', $officer);
        $this->requirementScan($czc, 1, '1. Accomplished and notarized APPLICATION FORM');
        $this->requirementScan($czc, 13, 'Title');

        $response = $this->actingAs($administrator)
            ->getJson('/super-admin/reports/preview?type=applicant&applicant=' . urlencode('Juan Dela Cruz'))
            ->assertOk()
            ->assertJsonPath('type', 'applicant')
            ->assertJsonPath('summary.applications', 1);

        $app = $response->json('applications.0');

        // One issued document, named for what was applied for, with what it is drawn from.
        $this->assertSame('Certificate of Zoning Compliance', $app['document']['label']);
        $this->assertTrue($app['document']['available']);
        $this->assertStringEndsWith("/super-admin/requests/{$czc->id}/generate-clearance", $app['document']['url']);
        $this->assertSame('Juan Dela Cruz', $app['document']['sheet']['application']['applicant_name']);
        $this->assertSame('Mary Jane P. Bulauan', $app['document']['sheet']['reviewer']['name']);
        $this->assertEquals(3289, $app['document']['sheet']['payment']['amount']);

        // The order of payment and the form come with their sheets too.
        $this->assertTrue($app['order_of_payment']['available']);
        $this->assertSame('CZC', $app['order_of_payment']['sheet']['application']['project_type']);
        $this->assertSame('Juan Dela Cruz', $app['form']['sheet']['applicant_name']);

        // Requirements: the notarized form is flagged, and no server path leaks out.
        $this->assertCount(2, $app['requirements']);
        $this->assertTrue($app['requirements'][0]['is_application_form']);
        $this->assertFalse($app['requirements'][1]['is_application_form']);
        $this->assertArrayNotHasKey('path', $app['requirements'][0]);
        $this->assertArrayNotHasKey('receipt_path', $app['payment']);
    }

    public function test_a_zoning_certification_is_issued_a_certificate_and_a_pending_application_nothing_yet(): void
    {
        $administrator = $this->userOf('super_admin');
        $owner = $this->userOf('applicant');
        $zc = $this->application($owner, 'ZC', 'approved');
        $pending = $this->application($owner, 'TUP', 'pending', null, ['applicant_name' => 'Juan Dela Cruz']);

        $apps = $this->actingAs($administrator)
            ->getJson('/super-admin/reports/preview?type=applicant&applicant=' . urlencode('Juan Dela Cruz'))
            ->assertOk()
            ->json('applications');

        $byId = collect($apps)->keyBy('id');

        $this->assertSame('Zoning Certification', $byId[$zc->id]['document']['label']);
        $this->assertStringEndsWith("/generate-certificate", $byId[$zc->id]['document']['url']);

        $this->assertSame('Temporary Use Permit', $byId[$pending->id]['document']['label']);
        $this->assertFalse($byId[$pending->id]['document']['available']);
        $this->assertNull($byId[$pending->id]['document']['sheet']);
        $this->assertFalse($byId[$pending->id]['order_of_payment']['available']);
    }

    public function test_the_period_and_officer_reports_list_rows_and_the_preview_is_capped(): void
    {
        $officer = $this->userOf('admin', ['name' => 'Mary Jane P. Bulauan']);
        $administrator = $this->userOf('super_admin');
        $this->application($this->userOf('applicant'), 'CZC', 'approved', $officer);
        $this->application($this->userOf('applicant'), 'SUP', 'reviewed', $officer);

        $this->actingAs($administrator)
            ->getJson('/super-admin/reports/preview?type=period&year=' . now()->year . '&month=' . now()->month)
            ->assertOk()
            ->assertJsonPath('summary.applications', 2)
            ->assertJsonPath('truncated', false)
            ->assertJsonCount(2, 'rows');

        $this->actingAs($administrator)
            ->getJson("/super-admin/reports/preview?type=officer&officer={$officer->id}")
            ->assertOk()
            ->assertJsonPath('summary.applications', 2)
            ->assertJsonPath('rows.0.reviewed_by', 'Mary Jane P. Bulauan');
    }

    public function test_the_three_downloads_come_back_as_what_they_say_they_are(): void
    {
        $administrator = $this->userOf('super_admin');
        $this->application($this->userOf('applicant'), 'CZC', 'approved', $this->userOf('admin'));
        $query = 'type=period&year=' . now()->year . '&month=all';

        $pdf = $this->actingAs($administrator)->get("/super-admin/reports/generate?{$query}&format=pdf");
        $pdf->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF', $pdf->getContent());

        $csv = $this->actingAs($administrator)->get("/super-admin/reports/generate?{$query}&format=csv");
        $csv->assertOk();
        $this->assertStringStartsWith('text/csv', $csv->headers->get('content-type'));
        $body = $csv->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $body, 'Excel needs the byte-order mark to read accents');
        $this->assertStringContainsString('APPLICATIONS FILED', $body);
        $this->assertStringContainsString('Juan Dela Cruz', $body);

        $xlsx = $this->actingAs($administrator)->get("/super-admin/reports/generate?{$query}&format=xlsx");
        $xlsx->assertOk()->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $file = $xlsx->baseResponse->getFile()->getPathname();
        $zip = new ZipArchive();
        $this->assertTrue($zip->open($file));
        $this->assertNotFalse($zip->getFromName('xl/worksheets/sheet1.xml'));
        $this->assertNotFalse($zip->getFromName('xl/drawings/drawing1.xml'), 'the letterhead logos ride along');
        $this->assertStringContainsString('Juan Dela Cruz', $zip->getFromName('xl/worksheets/sheet1.xml'));
        $zip->close();
    }

    public function test_the_applicant_pdf_is_the_requirements_and_the_officer_gets_the_same_report(): void
    {
        $officer = $this->userOf('admin');
        $owner = $this->userOf('applicant');
        $app = $this->application($owner, 'CZC', 'approved', $officer);
        $this->requirementScan($app, 13, 'Title');

        $pdf = $this->actingAs($officer)
            ->get('/admin/reports/generate?type=applicant&applicant=' . urlencode('Juan Dela Cruz') . '&format=pdf');
        $pdf->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF', $pdf->getContent());
    }
}
