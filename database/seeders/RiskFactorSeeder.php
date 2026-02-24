<?php

namespace Database\Seeders;

use App\Models\RiskFactor;
use Illuminate\Database\Seeder;

class RiskFactorSeeder extends Seeder
{
    public function run(): void
    {
        $riskFactors = [
            [
                'factor_name' => 'Flood Prone Area',
                'category' => 'environmental',
                'description' => 'Property located in flood-prone zone',
                'weight' => 9,
                'criteria' => ['elevation' => 'low', 'drainage' => 'poor'],
                'is_active' => true,
            ],
            [
                'factor_name' => 'Near Fault Line',
                'category' => 'environmental',
                'description' => 'Property within 5km of active fault line',
                'weight' => 10,
                'criteria' => ['distance_to_fault' => '<5km'],
                'is_active' => true,
            ],
            [
                'factor_name' => 'Traffic Congestion',
                'category' => 'infrastructure',
                'description' => 'Area with high traffic congestion',
                'weight' => 5,
                'criteria' => ['road_capacity' => 'exceeded'],
                'is_active' => true,
            ],
            [
                'factor_name' => 'Inadequate Water Supply',
                'category' => 'infrastructure',
                'description' => 'Insufficient water infrastructure',
                'weight' => 7,
                'criteria' => ['water_pressure' => 'low'],
                'is_active' => true,
            ],
            [
                'factor_name' => 'Near Industrial Zone',
                'category' => 'safety',
                'description' => 'Residential property near industrial area',
                'weight' => 6,
                'criteria' => ['distance_to_industrial' => '<200m'],
                'is_active' => true,
            ],
            [
                'factor_name' => 'Land Use Conflict',
                'category' => 'land_use',
                'description' => 'Proposed use conflicts with surrounding area',
                'weight' => 8,
                'criteria' => ['compatibility' => 'low'],
                'is_active' => true,
            ],
            [
                'factor_name' => 'Steep Slope',
                'category' => 'environmental',
                'description' => 'Property on steep terrain (>30% grade)',
                'weight' => 7,
                'criteria' => ['slope' => '>30%'],
                'is_active' => true,
            ],
            [
                'factor_name' => 'Limited Road Access',
                'category' => 'infrastructure',
                'description' => 'Property has limited or narrow road access',
                'weight' => 6,
                'criteria' => ['road_width' => '<4m'],
                'is_active' => true,
            ],
        ];

        foreach ($riskFactors as $factor) {
            RiskFactor::create($factor);
        }
    }
}
