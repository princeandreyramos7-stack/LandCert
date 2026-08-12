<?php

namespace Database\Factories;

use App\Models\Applicant;
use App\Models\Location;
use App\Models\Project;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RequestFactory extends Factory
{
    protected $model = RequestModel::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'applicant_id' => Applicant::factory(),
            'project_id' => Project::factory(),
            'location_id' => Location::factory(),
            'status' => 'pending',
            'control_number' => 'CN-' . fake()->unique()->numberBetween(10000, 99999),
        ];
    }
}
