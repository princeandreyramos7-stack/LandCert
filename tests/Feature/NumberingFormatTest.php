<?php

namespace Tests\Feature;

use App\Models\Applicant;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Application and decision numbers carry MM-YY of the month the application was
 * CREATED — not the month the number happens to be generated. A request filed in
 * October and approved in December must still read 10-26 on both numbers.
 */
class NumberingFormatTest extends TestCase
{
    use RefreshDatabase;

    private function makeApplicant(): Applicant
    {
        return Applicant::create([
            'applicant_name' => 'Numbering Test',
            'applicant_address' => '1 Test Street',
            'applicant_type' => 'individual',
        ]);
    }

    public function test_application_number_uses_the_creation_month(): void
    {
        $applicant = $this->makeApplicant();
        $october = Carbon::create(2026, 10, 14, 9, 0, 0);

        $number = RequestModel::generateApplicationNumber($applicant->id, $october);

        $this->assertMatchesRegularExpression('/^TPZ-10-26-\d{4}$/', $number, "Got: {$number}");
    }

    public function test_decision_number_uses_the_application_creation_month_not_approval_date(): void
    {
        $applicant = $this->makeApplicant();
        $october = Carbon::create(2026, 10, 14, 9, 0, 0);

        // Approval happens in December — the decision number must still say 10-26.
        Carbon::setTestNow(Carbon::create(2026, 12, 20, 9, 0, 0));

        $number = RequestModel::generateDecisionNumber('CZC', $october);

        Carbon::setTestNow();

        $this->assertMatchesRegularExpression('/^CZC-10-26-\d{4}-\d{4}$/', $number, "Got: {$number}");
        $this->assertStringNotContainsString('-12-26-', $number, 'Must not use the approval month.');
    }

    public function test_both_numbers_agree_on_the_month_for_one_application(): void
    {
        $user = User::factory()->create(['user_type' => 'applicant']);
        $applicant = $this->makeApplicant();
        $october = Carbon::create(2026, 10, 3, 8, 30, 0);

        $request = RequestModel::create([
            'user_id' => $user->id,
            'applicant_id' => $applicant->id,
            'status' => 'pending',
        ]);
        $request->forceFill(['created_at' => $october])->save();

        $appNo = RequestModel::generateApplicationNumber($applicant->id, $request->created_at);
        $decNo = RequestModel::generateDecisionNumber('SUP', $request->created_at);

        // Both carry the same MM-YY segment.
        $this->assertSame('10-26', implode('-', array_slice(explode('-', $appNo), 1, 2)));
        $this->assertSame('10-26', implode('-', array_slice(explode('-', $decNo), 1, 2)));
    }

    public function test_permit_type_drives_the_decision_number_prefix(): void
    {
        $march = Carbon::create(2026, 3, 1, 0, 0, 0);

        foreach (['CZC' => 'CZC', 'SUP' => 'SUP', 'TUP' => 'TUP'] as $type => $prefix) {
            $number = RequestModel::generateDecisionNumber($type, $march);
            $this->assertStringStartsWith("{$prefix}-03-26-", $number, "Got: {$number}");
        }
    }
}
