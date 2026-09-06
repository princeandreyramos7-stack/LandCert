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
            'applicant_address' => fake()->streetAddress() . ', City of Ilagan, Isabela',
            'applicant_contact' => '09' . fake()->numerify('#########'),
            'applicant_type' => 'individual',
        ];
    }

    /**
     * A corporate applicant — the enum value is "corporate", and a corporation
     * record is expected alongside it.
     */
    public function corporate(): static
    {
        return $this->state(fn () => ['applicant_type' => 'corporate']);
    }
}
