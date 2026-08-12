<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Request as RequestModel;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'request_id' => RequestModel::factory(),
            'amount' => fake()->randomFloat(2, 100, 1000),
            'payment_method' => fake()->randomElement(['cash', 'bank_transfer', 'gcash', 'paymaya', 'check']),
            'receipt_number' => 'OR-' . fake()->unique()->numberBetween(100000, 999999),
            'payment_date' => now()->format('Y-m-d'),
            'payment_status' => 'pending',
        ];
    }
}
