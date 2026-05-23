<?php

namespace Database\Seeders;

use App\Models\PropertyLocation;
use App\Models\ZoningRule;
use Illuminate\Database\Seeder;

class PropertyLocationSeeder extends Seeder
{
    public function run(): void
    {
        // Get zoning rules
        $residential = ZoningRule::where('zone_code', 'R-1')->first();
        $commercial = ZoningRule::where('zone_code', 'C-1')->first();
        $industrial = ZoningRule::where('zone_code', 'I-1')->first();
        $agricultural = ZoningRule::where('zone_code', 'A-1')->first();
        $mixedUse = ZoningRule::where('zone_code', 'M-1')->first();
        $institutional = ZoningRule::where('zone_code', 'IN-1')->first();
        $openSpace = ZoningRule::where('zone_code', 'OS-1')->first();

        // Sample properties in Ilagan City, Isabela
        $properties = [
            // Residential properties
            [
                'latitude' => 16.9754,
                'longitude' => 121.8947,
                'address' => 'Barangay Centro 1, Ilagan City',
                'barangay' => 'Centro 1',
                'district' => 'District 1',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 150.00,
                'lot_number' => 'LOT-001',
                'title_number' => 'TCT-12345',
            ],
            [
                'latitude' => 16.9800,
                'longitude' => 121.8900,
                'address' => 'Barangay San Felipe, Ilagan City',
                'barangay' => 'San Felipe',
                'district' => 'District 2',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 200.00,
                'lot_number' => 'LOT-002',
                'title_number' => 'TCT-12346',
            ],
            [
                'latitude' => 16.9700,
                'longitude' => 121.9000,
                'address' => 'Barangay Alibagu, Ilagan City',
                'barangay' => 'Alibagu',
                'district' => 'District 1',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 180.00,
                'lot_number' => 'LOT-003',
                'title_number' => 'TCT-12347',
            ],

            // Commercial properties
            [
                'latitude' => 16.9760,
                'longitude' => 121.8950,
                'address' => 'Maharlika Highway, Barangay Centro 2, Ilagan City',
                'barangay' => 'Centro 2',
                'district' => 'District 1',
                'zoning_rule_id' => $commercial?->id,
                'lot_area' => 300.00,
                'lot_number' => 'LOT-004',
                'title_number' => 'TCT-12348',
            ],
            [
                'latitude' => 16.9780,
                'longitude' => 121.8920,
                'address' => 'National Highway, Barangay Centro 3, Ilagan City',
                'barangay' => 'Centro 3',
                'district' => 'District 1',
                'zoning_rule_id' => $commercial?->id,
                'lot_area' => 250.00,
                'lot_number' => 'LOT-005',
                'title_number' => 'TCT-12349',
            ],

            // Industrial properties
            [
                'latitude' => 16.9650,
                'longitude' => 121.9100,
                'address' => 'Barangay Marana, Ilagan City',
                'barangay' => 'Marana',
                'district' => 'District 3',
                'zoning_rule_id' => $industrial?->id,
                'lot_area' => 800.00,
                'lot_number' => 'LOT-006',
                'title_number' => 'TCT-12350',
            ],
            [
                'latitude' => 16.9600,
                'longitude' => 121.9150,
                'address' => 'Barangay Bagong Silang, Ilagan City',
                'barangay' => 'Bagong Silang',
                'district' => 'District 3',
                'zoning_rule_id' => $industrial?->id,
                'lot_area' => 1000.00,
                'lot_number' => 'LOT-007',
                'title_number' => 'TCT-12351',
            ],

            // Agricultural properties
            [
                'latitude' => 16.9900,
                'longitude' => 121.8800,
                'address' => 'Barangay San Juan, Ilagan City',
                'barangay' => 'San Juan',
                'district' => 'District 2',
                'zoning_rule_id' => $agricultural?->id,
                'lot_area' => 2000.00,
                'lot_number' => 'LOT-008',
                'title_number' => 'TCT-12352',
            ],
            [
                'latitude' => 16.9950,
                'longitude' => 121.8750,
                'address' => 'Barangay Calamagui, Ilagan City',
                'barangay' => 'Calamagui',
                'district' => 'District 2',
                'zoning_rule_id' => $agricultural?->id,
                'lot_area' => 1500.00,
                'lot_number' => 'LOT-009',
                'title_number' => 'TCT-12353',
            ],

            // Mixed-use properties
            [
                'latitude' => 16.9770,
                'longitude' => 121.8960,
                'address' => 'Barangay Centro 4, Ilagan City',
                'barangay' => 'Centro 4',
                'district' => 'District 1',
                'zoning_rule_id' => $mixedUse?->id,
                'lot_area' => 220.00,
                'lot_number' => 'LOT-010',
                'title_number' => 'TCT-12354',
            ],
            [
                'latitude' => 16.9790,
                'longitude' => 121.8940,
                'address' => 'Barangay Centro 5, Ilagan City',
                'barangay' => 'Centro 5',
                'district' => 'District 1',
                'zoning_rule_id' => $mixedUse?->id,
                'lot_area' => 280.00,
                'lot_number' => 'LOT-011',
                'title_number' => 'TCT-12355',
            ],

            // Institutional properties
            [
                'latitude' => 16.9740,
                'longitude' => 121.8970,
                'address' => 'Barangay Centro 6, Ilagan City',
                'barangay' => 'Centro 6',
                'district' => 'District 1',
                'zoning_rule_id' => $institutional?->id,
                'lot_area' => 500.00,
                'lot_number' => 'LOT-012',
                'title_number' => 'TCT-12356',
            ],

            // Open space/Parks
            [
                'latitude' => 16.9750,
                'longitude' => 121.8980,
                'address' => 'Ilagan City Plaza, Barangay Centro 7',
                'barangay' => 'Centro 7',
                'district' => 'District 1',
                'zoning_rule_id' => $openSpace?->id,
                'lot_area' => 350.00,
                'lot_number' => 'LOT-013',
                'title_number' => 'TCT-12357',
            ],

            // Additional residential properties in different barangays
            [
                'latitude' => 16.9820,
                'longitude' => 121.8880,
                'address' => 'Barangay Naguilian, Ilagan City',
                'barangay' => 'Naguilian',
                'district' => 'District 2',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 160.00,
                'lot_number' => 'LOT-014',
                'title_number' => 'TCT-12358',
            ],
            [
                'latitude' => 16.9680,
                'longitude' => 121.9020,
                'address' => 'Barangay Malalam, Ilagan City',
                'barangay' => 'Malalam',
                'district' => 'District 3',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 140.00,
                'lot_number' => 'LOT-015',
                'title_number' => 'TCT-12359',
            ],
            [
                'latitude' => 16.9850,
                'longitude' => 121.8850,
                'address' => 'Barangay Santa Victoria, Ilagan City',
                'barangay' => 'Santa Victoria',
                'district' => 'District 2',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 175.00,
                'lot_number' => 'LOT-016',
                'title_number' => 'TCT-12360',
            ],
            [
                'latitude' => 16.9720,
                'longitude' => 121.8980,
                'address' => 'Barangay San Antonio, Ilagan City',
                'barangay' => 'San Antonio',
                'district' => 'District 1',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 165.00,
                'lot_number' => 'LOT-017',
                'title_number' => 'TCT-12361',
            ],
            [
                'latitude' => 16.9810,
                'longitude' => 121.8910,
                'address' => 'Barangay Santa Isabel, Ilagan City',
                'barangay' => 'Santa Isabel',
                'district' => 'District 2',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 190.00,
                'lot_number' => 'LOT-018',
                'title_number' => 'TCT-12362',
            ],
            [
                'latitude' => 16.9690,
                'longitude' => 121.9010,
                'address' => 'Barangay Baculod, Ilagan City',
                'barangay' => 'Baculod',
                'district' => 'District 3',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 155.00,
                'lot_number' => 'LOT-019',
                'title_number' => 'TCT-12363',
            ],
            [
                'latitude' => 16.9830,
                'longitude' => 121.8870,
                'address' => 'Barangay Cabannungan, Ilagan City',
                'barangay' => 'Cabannungan',
                'district' => 'District 2',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 170.00,
                'lot_number' => 'LOT-020',
                'title_number' => 'TCT-12364',
            ],
            [
                'latitude' => 16.9710,
                'longitude' => 121.8990,
                'address' => 'Barangay Cabeseria 1, Ilagan City',
                'barangay' => 'Cabeseria 1',
                'district' => 'District 1',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 145.00,
                'lot_number' => 'LOT-021',
                'title_number' => 'TCT-12365',
            ],
            [
                'latitude' => 16.9840,
                'longitude' => 121.8860,
                'address' => 'Barangay Cabeseria 2, Ilagan City',
                'barangay' => 'Cabeseria 2',
                'district' => 'District 2',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 185.00,
                'lot_number' => 'LOT-022',
                'title_number' => 'TCT-12366',
            ],
            [
                'latitude' => 16.9670,
                'longitude' => 121.9030,
                'address' => 'Barangay Cadu, Ilagan City',
                'barangay' => 'Cadu',
                'district' => 'District 3',
                'zoning_rule_id' => $residential?->id,
                'lot_area' => 150.00,
                'lot_number' => 'LOT-023',
                'title_number' => 'TCT-12367',
            ],
        ];

        foreach ($properties as $property) {
            PropertyLocation::create($property);
        }

        $this->command->info('✓ Created ' . count($properties) . ' sample property locations in Ilagan City');
    }
}

