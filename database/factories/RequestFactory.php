<?php

namespace Database\Factories;

use App\Models\Applicant;
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
            'status' => 'pending',
            'has_written_notice' => 'no',
            'has_similar_application' => 'no',
            'preferred_release_mode' => 'pickup',
        ];
    }

    /**
     * Give the request its application number. It is assigned after creation
     * because the format counts existing applications for that applicant.
     */
    public function numbered(): static
    {
        return $this->afterCreating(function (RequestModel $request) {
            $request->update([
                'application_number' => RequestModel::generateApplicationNumber(
                    $request->applicant_id,
                    $request->created_at
                ),
            ]);
        });
    }
}
