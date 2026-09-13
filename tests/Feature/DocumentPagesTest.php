<?php

namespace Tests\Feature;

use App\Services\ApplicationDocuments;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The four drawn documents - certificate, clearance, order of payment and the
 * application form - reached through their clean URLs, and the data they are
 * drawn from.
 */
class DocumentPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_open_the_documents_through_the_clean_urls(): void
    {
        $officer = $this->userOf('admin');
        $administrator = $this->userOf('super_admin');
        $app = $this->application($this->userOf('applicant'), 'CZC', 'approved', $officer);

        foreach ([
            ['admin', $officer, 'generate-certificate', 'Admin/GenerateCertificate'],
            ['admin', $officer, 'generate-clearance', 'Admin/GenerateClearance'],
            ['admin', $officer, 'generate-order-of-payment', 'Admin/GenerateOrderOfPayment'],
            ['super-admin', $administrator, 'generate-certificate', 'Admin/GenerateCertificate'],
            ['super-admin', $administrator, 'generate-clearance', 'Admin/GenerateClearance'],
            ['super-admin', $administrator, 'generate-order-of-payment', 'Admin/GenerateOrderOfPayment'],
            ['admin', $officer, 'print', 'Admin/PrintForm'],
        ] as [$prefix, $user, $slug, $component]) {
            $this->actingAs($user)
                ->followingRedirects()
                ->get("/{$prefix}/requests/{$app->id}/{$slug}")
                ->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component($component)
                    ->where('application.application_number', $app->application_number));
        }
    }

    public function test_the_document_pages_are_not_for_applicants(): void
    {
        $owner = $this->userOf('applicant');
        $app = $this->application($owner, 'CZC', 'approved');

        // Even with a record remembered in the session, the page refuses.
        $this->actingAs($owner)
            ->withSession(['clean_page.generate-certificate' => $app->id])
            ->get('/generate-certificate')
            ->assertForbidden();

        // But the applicant's own order of payment and form are theirs.
        $this->actingAs($owner)
            ->followingRedirects()
            ->get("/my-applications/{$app->id}/order-of-payment")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/GenerateOrderOfPayment'));

        $this->actingAs($owner)
            ->followingRedirects()
            ->get("/my-applications/{$app->id}/print")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/PrintForm'));
    }

    public function test_an_applicant_cannot_open_another_applicants_form(): void
    {
        $app = $this->application($this->userOf('applicant'), 'CZC', 'approved');

        $this->actingAs($this->userOf('applicant'))
            ->followingRedirects()
            ->get("/my-applications/{$app->id}/print")
            ->assertForbidden();
    }

    public function test_every_document_reads_the_same_picture_of_the_application(): void
    {
        $officer = $this->userOf('admin', ['name' => 'Mary Jane P. Bulauan']);
        $app = $this->application($this->userOf('applicant'), 'SUP', 'approved', $officer, ['project_nature' => 'Warehouse']);
        $app->load(ApplicationDocuments::FORM_RELATIONS);

        $issuance = ApplicationDocuments::issuance($app);
        $this->assertSame('SUP', $issuance['project_type']);
        $this->assertSame('Warehouse', $issuance['project_nature']);
        $this->assertSame('Alibagu', $issuance['project_location_barangay']);
        $this->assertSame('LOT-1', $issuance['lot_number']);
        $this->assertSame('TD-2026-001', $issuance['tax_declaration_no']);
        $this->assertSame('Residential', $issuance['zone_classification']);

        $form = ApplicationDocuments::form($app);
        $this->assertSame($app->application_number, $form['application_number']);
        $this->assertSame('Juan Dela Cruz', $form['applicant_name']);
        $this->assertSame('Alibagu', $form['location_barangay']);
        $this->assertSame('Owner', $form['right_over_land']);
        $this->assertSame('approved', $form['evaluation']);

        $this->assertSame('Mary Jane P. Bulauan', ApplicationDocuments::signer(ApplicationDocuments::reviewer($app->id))['name']);
    }

    public function test_the_page_props_match_the_service(): void
    {
        $officer = $this->userOf('admin');
        $app = $this->application($this->userOf('applicant'), 'CZC', 'approved', $officer);
        $app->load(ApplicationDocuments::ISSUANCE_RELATIONS);

        $expected = ApplicationDocuments::issuance($app);
        $expected['created_at'] = $expected['created_at']->toJSON();
        $expected['updated_at'] = $expected['updated_at']->toJSON();

        $this->actingAs($officer)
            ->followingRedirects()
            ->get("/admin/requests/{$app->id}/generate-clearance")
            ->assertInertia(fn ($page) => $page->where('application', $expected));
    }
}
