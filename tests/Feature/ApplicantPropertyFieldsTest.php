<?php

namespace Tests\Feature;

use App\Models\Location;
use App\Models\Property;
use App\Models\Request as RequestModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The applicant's house/building number, the parcel's Lot Number, and its
 * Tax Declaration No. land in three different places - project_location_number
 * (locations.house_number), properties.lot_number and properties.tax_declaration_no
 * respectively - and must never be conflated. They used to be: the wizard sent
 * only project_location_number, which was written straight into
 * properties.lot_number - the certificate's own "parcel of land, lot ___" -
 * so a house number silently became the printed legal lot number.
 */
class ApplicantPropertyFieldsTest extends TestCase
{
    use RefreshDatabase;

    private function submission(array $extra = []): array
    {
        return array_merge($this->addressFields(), [
            'declaration' => '1',
            'applicant_name' => 'Juan Dela Cruz',
            'project_nature' => 'New Residential House',
            'project_location_street' => 'Purok 1',
            'project_location_barangay' => 'Alibagu',
            'project_location_municipality' => 'City of Ilagan',
            'project_location_province' => 'Isabela',
            'lot_area_sqm' => 100,
            'right_over_land' => 'Owner',
            'existing_land_use' => 'Vacant',
            'has_written_notice' => 'no',
            'has_similar_application' => 'no',
            'preferred_release_mode' => 'pickup',
            'requirement_uploads' => [2 => [$this->fakePdf('title.pdf', 40)]],
            'requirement_names' => [2 => '2. Right Over Land Documentation'],
        ], $extra);
    }

    public function test_house_number_lot_number_and_tax_declaration_no_land_in_their_own_columns(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission([
            'project_location_number' => 'Blk 3',
            'lot_number' => 'Lot 4522-F',
            'tax_declaration_no' => '2026-01-000123',
        ]))->assertRedirect();

        $filed = RequestModel::firstOrFail();

        $location = Location::where('request_id', $filed->id)->firstOrFail();
        $this->assertSame('Blk 3', $location->house_number);
        // The street itself was never touched by the house number.
        $this->assertSame('Purok 1', $location->street_address);

        $property = Property::where('request_id', $filed->id)->firstOrFail();
        $this->assertSame('Lot 4522-F', $property->lot_number);
        $this->assertSame('2026-01-000123', $property->tax_declaration_no);
    }

    public function test_all_three_are_optional(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $this->actingAs($user)->post('/request', $this->submission())->assertRedirect();

        $filed = RequestModel::firstOrFail();
        $this->assertNull(Location::where('request_id', $filed->id)->value('house_number'));
        $this->assertNull(Property::where('request_id', $filed->id)->value('lot_number'));
        $this->assertNull(Property::where('request_id', $filed->id)->value('tax_declaration_no'));
    }

    public function test_my_applications_list_exposes_all_three_distinctly(): void
    {
        $user = $this->userOf('applicant');
        $app = $this->application($user, 'CZC', 'pending');
        $app->location()->update(['house_number' => 'Blk 3']);
        $app->property()->update(['lot_number' => 'Lot 4522-F', 'tax_declaration_no' => '2026-01-000123']);

        $this->actingAs($user)->get('/my-applications')->assertInertia(fn ($page) => $page
            ->where('applications.data.0.project_location_number', 'Blk 3')
            ->where('applications.data.0.lot_number', 'Lot 4522-F')
            ->where('applications.data.0.tax_declaration_no', '2026-01-000123'));
    }

    /**
     * A Zoning Certification skips Step 2 entirely - it has no project to
     * describe, and locationForZoningCertification() sources its location
     * from the applicant's own address, not a project location. Lot Number
     * and Tax Declaration No. are asked for in Step 1 instead (see
     * Step1ApplicantInfo's "Property Identification"), but they still land
     * on the same properties columns - the Property::create() call is not
     * conditional on project type.
     */
    public function test_zc_applications_still_capture_lot_number_and_tax_declaration_no(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');

        $payload = $this->submission([
            'project_type' => 'ZC',
            'lot_number' => 'Lot 4522-F',
            'tax_declaration_no' => '2026-01-000123',
        ]);
        // A ZC has no project location step to send these from.
        unset($payload['project_location_street'], $payload['project_location_barangay'], $payload['project_location_municipality'], $payload['project_location_province']);

        $this->actingAs($user)->post('/request', $payload)->assertRedirect();

        $filed = RequestModel::firstOrFail();
        $property = Property::where('request_id', $filed->id)->firstOrFail();
        $this->assertSame('Lot 4522-F', $property->lot_number);
        $this->assertSame('2026-01-000123', $property->tax_declaration_no);
    }

    public function test_editing_a_returned_application_updates_all_three(): void
    {
        Storage::fake('local');
        $user = $this->userOf('applicant');
        $app = $this->application($user, 'CZC', 'rejected');
        $app->location()->update(['house_number' => 'Old Blk']);
        $app->property()->update(['lot_number' => 'Old Lot', 'tax_declaration_no' => 'Old TD']);

        $this->actingAs($user)->put("/requests/{$app->id}", $this->submission([
            'project_location_number' => 'New Blk 9',
            'lot_number' => 'Lot 9999-Z',
            'tax_declaration_no' => '2026-02-000999',
        ]))->assertRedirect();

        $app->refresh();
        $this->assertSame('New Blk 9', $app->location->house_number);
        $this->assertSame('Lot 9999-Z', $app->property->lot_number);
        $this->assertSame('2026-02-000999', $app->property->tax_declaration_no);
    }
}
