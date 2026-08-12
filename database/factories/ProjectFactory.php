<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'project_type' => fake()->randomElement([
                'Zoning Clearance',
                'Building Permit',
                'Occupancy Permit',
                'Fencing Permit'
            ]),
            'project_title' => fake()->sentence(),
            'project_description' => fake()->paragraph(),
        ];
    }
}
