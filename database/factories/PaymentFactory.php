<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'request_id' => RequestModel::factory(),
            'amount' => fake()->randomFloat(2, 100, 5000),
            // Payments are settled over the counter; the column is a
            // single-value enum since the online gateway was removed.
            'payment_method' => 'cash',
            'receipt_number' => 'OR-' . fake()->unique()->numberBetween(100000, 999999),
            'payment_date' => now()->format('Y-m-d'),
            'payment_status' => 'pending',
        ];
    }

    /**
     * A verified payment. The table has a CHECK constraint requiring both the
     * verifier and the timestamp whenever the status is "verified".
     */
    public function verified(): static
    {
        return $this->state(fn () => [
            'payment_status' => 'verified',
            'verified_by' => User::factory(),
            'verified_at' => now(),
        ]);
    }

    /**
     * A rejected payment — the same constraint requires a reason.
     */
    public function rejected(): static
    {
        return $this->state(fn () => [
            'payment_status' => 'rejected',
            'rejection_reason' => 'Receipt number does not match our records.',
        ]);
    }
}
