<?php

namespace Database\Factories;

use App\Models\Applicant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicantFactory extends Factory
{
    protected $model = Applicant::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'applicant_name' => fake()->name(),
            'applicant_type' => fake()->randomElement(['individual', 'corporation']),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
        ];
    }
}
