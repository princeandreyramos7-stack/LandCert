<?php

namespace Database\Seeders;

use App\Models\ZoningRule;
use Illuminate\Database\Seeder;

class ZoningRuleSeeder extends Seeder
{
    public function run(): void
    {
        $zoningRules = [
            [
                'zone_code' => 'R1',
                'zone_name' => 'Low Density Residential',
                'zone_type' => 'residential',
                'description' => 'Single-family residential area with low density',
                'allowed_uses' => ['single_family', 'duplex', 'park', 'church', 'school'],
                'min_lot_area' => 200.00,
                'max_lot_area' => null,
                'max_building_height' => 10.00,
                'max_floor_area_ratio' => 0.60,
                'min_setback_front' => 5.00,
                'min_setback_rear' => 3.00,
                'min_setback_side' => 2.00,
                'distance_restrictions' => [
                    'school' => 100,
                    'hospital' => 50,
                ],
                'environmental_restrictions' => [
                    'flood_prone' => false,
                    'fault_line' => false,
                ],
                'is_active' => true,
            ],
            [
                'zone_code' => 'R2',
                'zone_name' => 'Medium Density Residential',
                'zone_type' => 'residential',
                'description' => 'Multi-family residential area with medium density',
                'allowed_uses' => ['single_family', 'duplex', 'townhouse', 'apartment', 'condo', 'park'],
                'min_lot_area' => 100.00,
                'max_lot_area' => null,
                'max_building_height' => 15.00,
                'max_floor_area_ratio' => 1.20,
                'min_setback_front' => 4.00,
                'min_setback_rear' => 2.00,
                'min_setback_side' => 1.50,
                'distance_restrictions' => [
                    'school' => 50,
                ],
                'environmental_restrictions' => [
                    'flood_prone' => false,
                ],
                'is_active' => true,
            ],
            [
                'zone_code' => 'C1',
                'zone_name' => 'Neighborhood Commercial',
                'zone_type' => 'commercial',
                'description' => 'Small-scale commercial establishments',
                'allowed_uses' => ['retail', 'restaurant', 'office', 'service', 'mixed_use'],
                'min_lot_area' => 50.00,
                'max_lot_area' => null,
                'max_building_height' => 20.00,
                'max_floor_area_ratio' => 2.00,
                'min_setback_front' => 3.00,
                'min_setback_rear' => 2.00,
                'min_setback_side' => 1.00,
                'distance_restrictions' => [
                    'residential' => 20,
                    'school' => 100,
                ],
                'environmental_restrictions' => [],
                'is_active' => true,
            ],
            [
                'zone_code' => 'C2',
                'zone_name' => 'General Commercial',
                'zone_type' => 'commercial',
                'description' => 'Large-scale commercial and business districts',
                'allowed_uses' => ['retail', 'restaurant', 'office', 'hotel', 'mall', 'mixed_use', 'warehouse'],
                'min_lot_area' => 100.00,
                'max_lot_area' => null,
                'max_building_height' => 40.00,
                'max_floor_area_ratio' => 4.00,
                'min_setback_front' => 5.00,
                'min_setback_rear' => 3.00,
                'min_setback_side' => 2.00,
                'distance_restrictions' => [
                    'residential' => 50,
                ],
                'environmental_restrictions' => [],
                'is_active' => true,
            ],
            [
                'zone_code' => 'I1',
                'zone_name' => 'Light Industrial',
                'zone_type' => 'industrial',
                'description' => 'Light manufacturing and warehousing',
                'allowed_uses' => ['warehouse', 'light_manufacturing', 'logistics', 'office'],
                'min_lot_area' => 500.00,
                'max_lot_area' => null,
                'max_building_height' => 15.00,
                'max_floor_area_ratio' => 1.50,
                'min_setback_front' => 10.00,
                'min_setback_rear' => 5.00,
                'min_setback_side' => 5.00,
                'distance_restrictions' => [
                    'residential' => 200,
                    'school' => 500,
                    'hospital' => 300,
                ],
                'environmental_restrictions' => [
                    'requires_environmental_clearance' => true,
                ],
                'is_active' => true,
            ],
            [
                'zone_code' => 'A1',
                'zone_name' => 'Agricultural Zone',
                'zone_type' => 'agricultural',
                'description' => 'Agricultural and farming areas',
                'allowed_uses' => ['farming', 'livestock', 'greenhouse', 'farm_house'],
                'min_lot_area' => 1000.00,
                'max_lot_area' => null,
                'max_building_height' => 8.00,
                'max_floor_area_ratio' => 0.30,
                'min_setback_front' => 10.00,
                'min_setback_rear' => 10.00,
                'min_setback_side' => 5.00,
                'distance_restrictions' => [],
                'environmental_restrictions' => [
                    'water_source_protection' => true,
                ],
                'is_active' => true,
            ],
            [
                'zone_code' => 'MX1',
                'zone_name' => 'Mixed Use Zone',
                'zone_type' => 'mixed',
                'description' => 'Mixed residential and commercial use',
                'allowed_uses' => ['residential', 'retail', 'office', 'restaurant', 'mixed_use'],
                'min_lot_area' => 150.00,
                'max_lot_area' => null,
                'max_building_height' => 25.00,
                'max_floor_area_ratio' => 2.50,
                'min_setback_front' => 4.00,
                'min_setback_rear' => 3.00,
                'min_setback_side' => 2.00,
                'distance_restrictions' => [],
                'environmental_restrictions' => [],
                'is_active' => true,
            ],
        ];

        foreach ($zoningRules as $rule) {
            ZoningRule::create($rule);
        }
    }
}
