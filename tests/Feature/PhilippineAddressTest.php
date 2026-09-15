<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Request as RequestModel;
use App\Support\PhilippineAddress;
use Database\Seeders\PsgcSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Addresses picked from the Philippine Standard Geographic Code.
 *
 * The form offers Province -> City/Municipality -> Barangay, each list drawn
 * from the one above it, and a street typed by hand; the region is read off
 * the province rather than asked for. What matters on this side is that the
 * server does not take any of it on trust: the list endpoints only ever hand
 * out the children of the thing asked for, and a submission whose barangay
 * does not belong to its city is refused however it was assembled.
 */
class PhilippineAddressTest extends TestCase
{
    use RefreshDatabase;

    /** Codes used throughout; they are the PSGC's own and do not change. */
    private const REGION_CAGAYAN_VALLEY = '020000000';
    private const PROVINCE_ISABELA = '023100000';
    private const CITY_ILAGAN = '023114000';
    private const REGION_NCR = '130000000';

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PsgcSeeder::class);
    }

    public function test_the_whole_country_is_on_file(): void
    {
        $this->assertDatabaseCount('psgc_regions', 17);
        $this->assertDatabaseCount('psgc_cities_municipalities', 1634);
        // Every barangay in the Philippines, not a sample.
        $this->assertGreaterThan(41000, \DB::table('psgc_barangays')->count());

        // Nothing dangles: each level's parent exists on the level above.
        $this->assertSame(0, \DB::table('psgc_barangays as b')
            ->leftJoin('psgc_cities_municipalities as c', 'b.city_code', '=', 'c.code')
            ->whereNull('c.code')->count(), 'every barangay belongs to a city or municipality');
        $this->assertSame(0, \DB::table('psgc_cities_municipalities as c')
            ->leftJoin('psgc_provinces as p', 'c.province_code', '=', 'p.code')
            ->whereNull('p.code')->count(), 'every city belongs to a province-level entry');
        $this->assertSame(0, \DB::table('psgc_provinces as p')
            ->leftJoin('psgc_regions as r', 'p.region_code', '=', 'r.code')
            ->whereNull('r.code')->count(), 'every province belongs to a region');
    }

    public function test_each_list_offers_only_what_sits_under_the_one_above(): void
    {
        $applicant = $this->userOf('applicant');

        $provinces = $this->actingAs($applicant)
            ->getJson(route('psgc.provinces', self::REGION_CAGAYAN_VALLEY))
            ->assertOk()->json('data');
        $this->assertEqualsCanonicalizing(
            ['Batanes', 'Cagayan', 'Isabela', 'Nueva Vizcaya', 'Quirino'],
            array_column($provinces, 'name')
        );

        $cities = $this->actingAs($applicant)
            ->getJson(route('psgc.cities', self::PROVINCE_ISABELA))
            ->assertOk()->json('data');
        $this->assertContains('City of Ilagan', array_column($cities, 'name'));
        $this->assertNotContains('Tuguegarao City', array_column($cities, 'name'), 'a Cagayan city must not appear under Isabela');

        $barangays = $this->actingAs($applicant)
            ->getJson(route('psgc.barangays', self::CITY_ILAGAN))
            ->assertOk()->json('data');
        $this->assertContains('Alibagu', array_column($barangays, 'name'));
        $this->assertCount(91, $barangays, 'Ilagan has 91 barangays');

        // Only the code and the name leave the server.
        $this->assertSame(['code', 'name'], array_keys($barangays[0]));
    }

    public function test_metro_manila_still_offers_a_level_between_region_and_city(): void
    {
        // NCR has no provinces at all. Without something standing in their
        // place the cascade would dead-end and no Manila address could be
        // filed, so its four districts sit at that level.
        $districts = $this->actingAs($this->userOf('applicant'))
            ->getJson(route('psgc.provinces', self::REGION_NCR))
            ->assertOk()->json('data');

        $this->assertCount(4, $districts);
        $this->assertSame('district', $districts[0]['kind']);

        $cities = PhilippineAddress::citiesOf($districts[0]['code']);
        $this->assertNotEmpty($cities);
        $this->assertNotEmpty(PhilippineAddress::barangaysOf($cities[0]['code']));
    }

    public function test_the_address_is_written_the_way_the_form_prints_it(): void
    {
        $alibagu = collect(PhilippineAddress::barangaysOf(self::CITY_ILAGAN))->firstWhere('name', 'Alibagu');

        $resolved = PhilippineAddress::resolve([
            'a_province_code' => self::PROVINCE_ISABELA,
            'a_city_code' => self::CITY_ILAGAN,
            'a_barangay_code' => $alibagu['code'],
            'a_street' => '123 Rizal Street',
        ], 'a');

        $this->assertSame('123 Rizal Street, Alibagu, City of Ilagan, Isabela', $resolved['line']);
    }

    public function test_a_district_is_left_out_of_the_written_address(): void
    {
        // "12 Mabini St., Barangay 1, City of Manila, First District, NCR" is
        // not how anyone writes their address.
        $district = PhilippineAddress::provincesOf(self::REGION_NCR)[0];
        $city = PhilippineAddress::citiesOf($district['code'])[0];
        $barangay = PhilippineAddress::barangaysOf($city['code'])[0];

        $resolved = PhilippineAddress::resolve([
            'a_province_code' => $district['code'],
            'a_city_code' => $city['code'],
            'a_barangay_code' => $barangay['code'],
            'a_street' => '12 Mabini St.',
        ], 'a');

        $this->assertStringNotContainsString('District', $resolved['line']);
        $this->assertStringEndsWith('NCR', $resolved['line']);
    }

    public function test_an_application_is_filed_with_the_address_the_server_composed(): void
    {
        $applicant = $this->userOf('applicant');
        $alibagu = collect(PhilippineAddress::barangaysOf(self::CITY_ILAGAN))->firstWhere('name', 'Alibagu');

        $this->actingAs($applicant)
            ->post('/request', $this->submission([
                'applicant_address_barangay_code' => $alibagu['code'],
                'applicant_address_street' => '123 Rizal Street',
                // A line of text sent alongside is ignored: the server writes
                // its own, so the certificate cannot disagree with the form.
                'applicant_address' => 'somewhere else entirely',
            ]))
            ->assertRedirect(route('my-applications'));

        $filed = Applicant::latest('id')->first();
        $this->assertSame('123 Rizal Street, Alibagu, City of Ilagan, Isabela', $filed->applicant_address);
        $this->assertSame($alibagu['code'], $filed->address_barangay_code);
        $this->assertSame(self::CITY_ILAGAN, $filed->address_city_code);
        $this->assertSame('123 Rizal Street', $filed->address_street);
    }

    public function test_a_barangay_from_another_city_is_refused(): void
    {
        $applicant = $this->userOf('applicant');
        // A real barangay code, but not one of Ilagan's.
        $elsewhere = \DB::table('psgc_barangays')->where('city_code', '!=', self::CITY_ILAGAN)->value('code');

        $this->actingAs($applicant)
            ->from('/request')
            ->post('/request', $this->submission(['applicant_address_barangay_code' => $elsewhere]))
            ->assertRedirect('/request')
            ->assertSessionHasErrors('applicant_address_barangay_code');

        $this->assertSame(0, RequestModel::count(), 'nothing is filed when the address does not hang together');
    }

    public function test_a_city_from_another_province_is_refused(): void
    {
        $applicant = $this->userOf('applicant');
        $foreignCity = \DB::table('psgc_cities_municipalities')->where('province_code', '!=', self::PROVINCE_ISABELA)->value('code');

        $this->actingAs($applicant)
            ->from('/request')
            ->post('/request', $this->submission(['applicant_address_city_code' => $foreignCity]))
            ->assertRedirect('/request')
            ->assertSessionHasErrors('applicant_address_city_code');
    }

    public function test_an_invented_code_never_reaches_the_database(): void
    {
        $applicant = $this->userOf('applicant');

        $this->actingAs($applicant)
            ->from('/request')
            ->post('/request', $this->submission(['applicant_address_barangay_code' => '999999999']))
            ->assertRedirect('/request')
            ->assertSessionHasErrors('applicant_address_barangay_code');

        // And a malformed one is not even looked up.
        $this->actingAs($applicant)->get('/psgc/cities/not-a-code/barangays')->assertNotFound();
    }

    public function test_the_address_cannot_be_left_blank(): void
    {
        $applicant = $this->userOf('applicant');

        $this->actingAs($applicant)
            ->from('/request')
            ->post('/request', array_merge($this->submission(), [
                'applicant_address_province_code' => '',
                'applicant_address_city_code' => '',
                'applicant_address_barangay_code' => '',
                'applicant_address_street' => '',
            ]))
            ->assertRedirect('/request')
            ->assertSessionHasErrors([
                'applicant_address_province_code',
                'applicant_address_barangay_code',
                'applicant_address_street',
            ]);
    }

    public function test_the_lists_are_for_signed_in_people_only(): void
    {
        $this->get(route('psgc.regions'))->assertRedirect('/login');
    }

    public function test_the_province_list_covers_the_whole_country_and_names_its_region(): void
    {
        // The form starts at province, so this one list has to carry every
        // province-level entry there is - including the stand-ins that let
        // Metro Manila be reached at all.
        $provinces = $this->actingAs($this->userOf('applicant'))
            ->getJson(route('psgc.provinces.index'))
            ->assertOk()->json('data');

        $this->assertCount(87, $provinces);
        $this->assertContains('Isabela', array_column($provinces, 'name'));
        $this->assertContains('First District', array_column($provinces, 'name'));

        // The region rides along as a label: it is what tells the province
        // Isabela from Isabela City in a single flat list.
        $isabela = collect($provinces)->firstWhere('code', self::PROVINCE_ISABELA);
        $this->assertSame('Cagayan Valley', $isabela['region_name']);
    }

    public function test_the_region_is_stored_even_though_it_is_never_asked_for(): void
    {
        $alibagu = collect(PhilippineAddress::barangaysOf(self::CITY_ILAGAN))->firstWhere('name', 'Alibagu');

        $this->actingAs($this->userOf('applicant'))
            ->post('/request', $this->submission(['applicant_address_barangay_code' => $alibagu['code']]))
            ->assertRedirect(route('my-applications'));

        $this->assertSame(self::REGION_CAGAYAN_VALLEY, Applicant::latest('id')->first()->address_region_code);
    }

    /** A complete, valid submission; $overrides replaces any part of it. */
    private function submission(array $overrides = []): array
    {
        $alibagu = collect(PhilippineAddress::barangaysOf(self::CITY_ILAGAN))->firstWhere('name', 'Alibagu');

        return array_merge([
            'applicant_name' => 'Juan Dela Cruz',
            'applicant_address_province_code' => self::PROVINCE_ISABELA,
            'applicant_address_city_code' => self::CITY_ILAGAN,
            'applicant_address_barangay_code' => $alibagu['code'],
            'applicant_address_street' => '1 Test Street',
            'project_type' => 'CZC',
            'project_nature' => 'Sari-sari Store',
            'project_location_street' => 'Test Street',
            'project_location_barangay' => 'Alibagu',
            'project_location_city' => 'City of Ilagan',
            'project_location_province' => 'Isabela',
            'right_over_land' => 'Owner',
            'project_nature_duration' => 'Permanent',
            'existing_land_use' => 'Residential',
            'preferred_release_mode' => 'pickup',
        ], $overrides);
    }
}
