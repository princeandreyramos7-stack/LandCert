<?php

namespace Tests\Unit;

use App\Support\ZoningFeeSchedule;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * The 2013 Schedule of Fees, section 1, row by row - including the office's
 * own worked example (a P2M single residence pays P2,520).
 */
class ZoningFeeScheduleTest extends TestCase
{
    public static function fees(): array
    {
        return [
            'office example: P2M house' => ['A', 2_000_000, 2_520.00],
            'A at P100k and below' => ['A', 100_000, 288.00],
            'A just over P100k' => ['A', 100_001, 576.00],
            'A at P200k' => ['A', 200_000, 576.00],
            'A over P200k' => ['A', 500_000, 1_020.00],
            'B at P500k' => ['B', 500_000, 1_440.00],
            'B up to P2M' => ['B', 2_000_000, 2_160.00],
            'B over P2M' => ['B', 3_000_000, 4_600.00],
            'C at P2M' => ['C', 2_000_000, 3_600.00],
            'C over P2M' => ['C', 2_500_000, 4_100.00],
            'D below P2M' => ['D', 1_500_000, 2_880.00],
            'D exactly P2M' => ['D', 2_000_000, 2_880.00],
            'D over P2M' => ['D', 4_000_000, 4_880.00],
            'E below P100k' => ['E', 50_000, 1_440.00],
            'E exactly P100k (lower row)' => ['E', 100_000, 1_440.00],
            'E P100k-500k' => ['E', 300_000, 2_160.00],
            'E P500k-1M' => ['E', 750_000, 2_880.00],
            'E P1M-2M' => ['E', 1_500_000, 4_320.00],
            'E exactly P2M' => ['E', 2_000_000, 4_320.00],
            'E over P2M' => ['E', 5_000_000, 10_200.00],
            'F below P2M' => ['F', 1_000_000, 7_200.00],
            'F over P2M' => ['F', 3_000_000, 8_200.00],
            // Excess with centavos: 2,145,678.50 / 1,000 = 2,145.6785 -> 2,145.68
            'centavos round half up' => ['A', 2_345_678.50, 2_865.68],
        ];
    }

    #[DataProvider('fees')]
    public function test_the_schedule(string $category, float $cost, float $expected): void
    {
        $this->assertSame($expected, ZoningFeeSchedule::compute($category, $cost)['amount']);
    }

    public function test_the_formula_spells_out_the_office_example(): void
    {
        $this->assertSame(
            '₱720.00 + 1/10 of 1% of ₱1,800,000.00 (cost in excess of ₱200,000.00) = ₱720.00 + ₱1,800.00',
            ZoningFeeSchedule::compute('A', 2_000_000)['formula'],
        );
    }

    public function test_no_cost_or_unknown_category_gives_nothing(): void
    {
        $this->assertNull(ZoningFeeSchedule::compute('A', null));
        $this->assertNull(ZoningFeeSchedule::compute('A', ''));
        $this->assertNull(ZoningFeeSchedule::compute('Z', 1_000));
        $this->assertSame([], ZoningFeeSchedule::quotes(null));
        $this->assertCount(6, ZoningFeeSchedule::quotes(1_000));
    }

    public function test_land_use_suggests_a_starting_category(): void
    {
        $this->assertSame('A', ZoningFeeSchedule::suggestCategory('Residential'));
        $this->assertSame('D', ZoningFeeSchedule::suggestCategory('Institutional'));
        $this->assertSame('E', ZoningFeeSchedule::suggestCategory('Commercial'));
        $this->assertSame('E', ZoningFeeSchedule::suggestCategory('Industrial'));
        $this->assertNull(ZoningFeeSchedule::suggestCategory('Vacant'));
        $this->assertNull(ZoningFeeSchedule::suggestCategory(null));
    }

    public function test_clearance_types_are_priced_by_category_and_cost(): void
    {
        foreach (['CZC', 'Zoning', 'TUP', 'SUP'] as $type) {
            $this->assertTrue(ZoningFeeSchedule::appliesTo($type), $type);
        }
        $this->assertFalse(ZoningFeeSchedule::appliesTo('ZC'));
        $this->assertFalse(ZoningFeeSchedule::appliesTo('N/A'));
        $this->assertFalse(ZoningFeeSchedule::appliesTo(null));
    }

    public function test_every_zoning_certification_is_a_fixed_720(): void
    {
        $this->assertSame(720.00, ZoningFeeSchedule::zoningCertification()['amount']);

        // Nothing on file changes it - no cost, any cost, any category sent.
        foreach ([null, 0, 150_000, 50_000_000] as $cost) {
            $quotes = ZoningFeeSchedule::quotesFor('ZC', $cost);
            $this->assertCount(1, $quotes);
            $this->assertSame(['ZC', 720.00], [$quotes[0]['category'], $quotes[0]['amount']]);
            $this->assertSame(720.00, ZoningFeeSchedule::computeFor('ZC', 'F', $cost)['amount']);
        }
    }
}
