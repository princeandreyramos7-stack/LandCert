<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'lot_number' => fake()->numberBetween(1, 999),
            'block_number' => fake()->numberBetween(1, 50),
            'street' => fake()->streetName(),
            'barangay' => fake()->city(),
            'municipality' => 'Sample Municipality',
            'province' => 'Sample Province',
        ];
    }
}
