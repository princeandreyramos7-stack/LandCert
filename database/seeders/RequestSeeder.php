<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user ID or create a test user
        $userId = DB::table('users')->first()->id ?? 1;

        $projectTypes = [
            'Residential Building',
            'Commercial Building',
            'Industrial Facility',
            'Mixed-Use Development',
            'Warehouse',
            'Office Building',
            'Shopping Mall',
            'Condominium',
            'Subdivision',
            'Hotel',
            'Restaurant',
            'Gas Station',
            'School Building',
            'Hospital',
            'Church',
        ];

        $projectNatures = [
            'New Construction',
            'Renovation',
            'Expansion',
            'Repair',
            'Demolition',
            'Addition',
        ];

        $barangays = [
            'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5',
            'Poblacion', 'San Jose', 'San Miguel', 'Santa Cruz', 'Santo Niño',
            'Bagong Silang', 'Maligaya', 'Masaya', 'Pag-asa', 'Tahanan',
        ];

        $cities = [
            'Quezon City', 'Manila', 'Makati', 'Pasig', 'Taguig',
            'Mandaluyong', 'Pasay', 'Caloocan', 'Marikina', 'Parañaque',
        ];

        $provinces = [
            'Metro Manila', 'Rizal', 'Cavite', 'Laguna', 'Bulacan',
        ];

        $statuses = ['pending', 'approved', 'rejected'];

        $firstNames = [
            'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlos', 'Elena',
            'Miguel', 'Sofia', 'Luis', 'Carmen', 'Antonio', 'Isabel', 'Manuel',
            'Teresa', 'Francisco', 'Patricia', 'Ricardo', 'Laura',
        ];

        $lastNames = [
            'Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres',
            'Flores', 'Rivera', 'Gonzales', 'Ramos', 'Fernandez', 'Lopez', 'Perez',
            'Gomez', 'Sanchez', 'Ramirez', 'Castillo', 'Morales', 'Aquino',
        ];

        $corporations = [
            'ABC Development Corporation',
            'XYZ Construction Inc.',
            'Prime Builders Corporation',
            'Golden Properties Inc.',
            'Metro Development Corp.',
            'Skyline Realty Corporation',
            'Urban Developers Inc.',
            'Pacific Construction Group',
            'Sunrise Properties Corp.',
            'Elite Builders Inc.',
        ];

        $requests = [];
        $now = Carbon::now();

        for ($i = 0; $i < 100; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $applicantName = $firstName . ' ' . $lastName;
            
            $hasCorporation = rand(0, 1) === 1;
            $corporationName = $hasCorporation ? $corporations[array_rand($corporations)] : null;
            
            $projectType = $projectTypes[array_rand($projectTypes)];
            $projectNature = $projectNatures[array_rand($projectNatures)];
            $barangay = $barangays[array_rand($barangays)];
            $city = $cities[array_rand($cities)];
            $province = $provinces[array_rand($provinces)];
            
            $status = $statuses[array_rand($statuses)];
            
       
            $createdAt = Carbon::now()->subDays(rand(0, 180));
            $updatedAt = $createdAt->copy()->addDays(rand(0, 30));

            $requests[] = [
                'applicant_name' => $applicantName,
                'corporation_name' => $corporationName,
                'applicant_address' => rand(1, 999) . ' ' . $lastNames[array_rand($lastNames)] . ' Street, ' . $barangay . ', ' . $city,
                'corporation_address' => $hasCorporation ? rand(1, 999) . ' Corporate Avenue, ' . $city : null,
                'authorized_representative_name' => $hasCorporation ? $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)] : null,
                'authorized_representative_address' => $hasCorporation ? rand(1, 999) . ' Representative St., ' . $city : null,
                
                'project_type' => $projectType,
                'project_nature' => $projectNature,
                'project_location_number' => rand(1, 999),
                'project_location_street' => $lastNames[array_rand($lastNames)] . ' Street',
                'project_location_barangay' => $barangay,
                'project_location_city' => $city,
                'project_location_municipality' => null,
                'project_location_province' => $province,
                'project_area_sqm' => rand(100, 5000) + (rand(0, 99) / 100),
                'lot_area_sqm' => rand(100, 5000) + (rand(0, 99) / 100),
                'bldg_improvement_sqm' => rand(50, 3000) + (rand(0, 99) / 100),
                'right_over_land' => ['Owner', 'Lessee'][rand(0, 1)],
                'project_nature_duration' => ['Permanent', 'Temporary'][rand(0, 1)],
                'project_nature_years' => rand(1, 50),
                'project_cost' => number_format(rand(500000, 50000000), 2, '.', ''),
                
                'existing_land_use' => ['Residential', 'Institutional', 'Commercial', 'Industrial', 'Vacant', 'Agricultural'][rand(0, 5)],
                'has_written_notice' => ['yes', 'no'][rand(0, 1)],
                'notice_officer_name' => $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)],
                'notice_dates' => $createdAt->copy()->subDays(rand(10, 60))->format('Y-m-d'),
                'has_similar_application' => ['yes', 'no'][rand(0, 1)],
                'similar_application_offices' => rand(0, 1) ? 'City Planning Office, Building Official' : null,
                'similar_application_dates' => rand(0, 1) ? $createdAt->copy()->subDays(rand(30, 180))->format('Y-m-d') : null,
                'preferred_release_mode' => ['pickup', 'mail_applicant', 'mail_representative'][rand(0, 2)],
                'release_address' => rand(1, 999) . ' Release Address St., ' . $city,
                
                'status' => $status,
                'user_id' => $userId,
                'created_at' => $createdAt,
                'updated_at' => $updatedAt,
            ];
        }

        // Insert in chunks to avoid memory issues
        foreach (array_chunk($requests, 50) as $chunk) {
            DB::table('requests')->insert($chunk);
        }

        $this->command->info('Successfully seeded 100 requests!');
    }
}
