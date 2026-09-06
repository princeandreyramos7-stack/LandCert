<?php

namespace Database\Factories;

use App\Models\NormalizedProject;
use App\Models\Request as RequestModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class NormalizedProjectFactory extends Factory
{
    protected $model = NormalizedProject::class;

    public function definition(): array
    {
        return [
            'request_id' => RequestModel::factory(),
            // The permit being applied for, by its decision-number prefix.
            'project_type' => fake()->randomElement(['CZC', 'ZC', 'TUP', 'SUP', 'LC']),
            'project_nature' => fake()->randomElement([
                'New Residential House', 'Junk Shop', 'Sari-sari Store',
                'Warehouse', 'Commercial Building', 'Poultry Farm',
            ]),
            'project_nature_duration' => 'Permanent',
            'project_cost' => fake()->randomFloat(2, 50000, 5000000),
        ];
    }
}
