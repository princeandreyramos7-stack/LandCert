<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Request as RequestModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class LocationFactory extends Factory
{
    protected $model = Location::class;

    public function definition(): array
    {
        return [
            // A location hangs off its request, not off a user.
            'request_id' => RequestModel::factory(),
            'street_address' => fake()->streetAddress(),
            'barangay' => fake()->randomElement([
                'Alibagu', 'Alinguigan 1st', 'Alinguigan 2nd', 'Osmena',
                'Cabannungan 1st', 'Baligatan', 'San Vicente', 'Calamagui 1st',
            ]),
            'city_municipality' => 'City of Ilagan',
            'province' => 'Isabela',
            'postal_code' => '3300',
        ];
    }
}
