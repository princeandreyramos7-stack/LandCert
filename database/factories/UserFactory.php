<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            // A factory user stands in for a real, already-onboarded account
            // unless a test asks for unverifiedPhone() - AuthenticatedSessionController
            // now refuses a plain sign-in without this, same as a real
            // account that never finished its registration code would be.
            'phone_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            // Required at real registration (see RegisteredUserController)
            // and, since it is where a sign-in's SMS code goes, now needed
            // to sign in at all - a factory user without one is not one a
            // real account could be.
            'contact_number' => fake()->numerify('09#########'),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Never finished the registration SMS code - the state a plain sign-in
     * refuses (see AuthenticatedSessionController::store).
     */
    public function unverifiedPhone(): static
    {
        return $this->state(fn (array $attributes) => [
            'phone_verified_at' => null,
        ]);
    }
}
