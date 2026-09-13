<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Property;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The Zoning Officer supplies the Tax Declaration number, lot number and zoning
 * classification when issuing a certificate — they are not collected from the
 * applicant.
 */
class CertificateDetailsTest extends TestCase
{
    use RefreshDatabase;

    private function makeRequest(): RequestModel
    {
        $applicant = Applicant::create([
            'applicant_name' => 'Test Applicant',
            'applicant_address' => '123 Test Street',
            'applicant_type' => 'individual',
        ]);

        return RequestModel::create([
            'user_id' => User::factory()->create(['user_type' => 'applicant'])->id,
            'applicant_id' => $applicant->id,
            'status' => 'approved',
            'application_number' => 'TPZ-TEST-0001',
        ]);
    }

    public function test_officer_can_save_certificate_details(): void
    {
        $officer = User::factory()->create(['user_type' => 'admin']);
        $application = $this->makeRequest();

        Property::create(['request_id' => $application->id, 'lot_area_sqm' => 300]);

        $this->actingAs($officer)
            ->post("/admin/requests/{$application->id}/certificate-details", [
                'lot_number' => '1234-B',
                'tax_declaration_no' => '2024-12-0001',
                'zone_classification' => 'RESIDENTIAL',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('properties', [
            'request_id' => $application->id,
            'lot_number' => '1234-B',
            'tax_declaration_no' => '2024-12-0001',
            'zone_classification' => 'RESIDENTIAL',
            // The pre-existing property data must survive the update.
            'lot_area_sqm' => 300,
        ]);
    }

    public function test_details_are_saved_when_the_request_has_no_property_row(): void
    {
        $officer = User::factory()->create(['user_type' => 'admin']);
        $application = $this->makeRequest();

        $this->assertDatabaseMissing('properties', ['request_id' => $application->id]);

        $this->actingAs($officer)
            ->post("/admin/requests/{$application->id}/certificate-details", [
                'lot_number' => '99',
                'tax_declaration_no' => 'TD-99',
                'zone_classification' => 'AGRICULTURAL',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('properties', [
            'request_id' => $application->id,
            'lot_number' => '99',
            'tax_declaration_no' => 'TD-99',
        ]);
    }

    public function test_an_applicant_cannot_set_certificate_details(): void
    {
        $applicantUser = User::factory()->create(['user_type' => 'applicant']);
        $application = $this->makeRequest();

        $this->actingAs($applicantUser)
            ->post("/admin/requests/{$application->id}/certificate-details", [
                'lot_number' => 'hacked',
                'tax_declaration_no' => 'hacked',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('properties', ['lot_number' => 'hacked']);
    }
}
