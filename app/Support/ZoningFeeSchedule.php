<?php

namespace App\Support;

/**
 * The City's 2013 Schedule of Fees, section 1 (Zoning / Locational
 * Clearance) - the fee the Zoning Officer sets when marking an application
 * reviewed (see appliesTo() for which types). The officer picks the
 * category; the project cost picks the row.
 *
 * "1/10 of 1% of the cost in excess of X" is 0.1% of (cost - X), i.e. the
 * excess divided by 1,000 - the office's own shortcut of "drop three
 * zeros". Worked in whole centavos so a cost with centavos never rounds
 * differently from the paper computation; the result is rounded half-up to
 * the centavo.
 *
 * Row boundaries are read as inclusive upper limits ("P100,000 and below",
 * "Over P100,000 to P200,000"). Where the printed schedule leaves an exact
 * amount uncovered - Commercial at exactly P100,000 ("Below" / "Over"),
 * Institutional at exactly P2M - the amount falls in the lower row, the same
 * way the residential rows read. Pending the office's confirmation; changing
 * it is a one-number edit to that row's `up_to`.
 *
 * Alteration/Expansion (row G, "same as the original application, affected
 * areas/cost only") is not a category of its own: the same table applies to
 * the cost of the alteration, which is what the project cost holds for an
 * "Improvement" application.
 */
final class ZoningFeeSchedule
{
    public const CATEGORIES = [
        'A' => [
            'label' => 'Single residential structure (attached or detached)',
            'rows' => [
                ['up_to' => 100_000, 'base' => 288],
                ['up_to' => 200_000, 'base' => 576],
                ['up_to' => null, 'base' => 720, 'excess_over' => 200_000],
            ],
        ],
        'B' => [
            'label' => 'Apartments / Townhouses',
            'rows' => [
                ['up_to' => 500_000, 'base' => 1_440],
                ['up_to' => 2_000_000, 'base' => 2_160],
                ['up_to' => null, 'base' => 3_600, 'excess_over' => 2_000_000],
            ],
        ],
        'C' => [
            'label' => 'Dormitories',
            'rows' => [
                ['up_to' => 2_000_000, 'base' => 3_600],
                ['up_to' => null, 'base' => 3_600, 'excess_over' => 2_000_000],
            ],
        ],
        'D' => [
            'label' => 'Institutional',
            'rows' => [
                ['up_to' => 2_000_000, 'base' => 2_880],
                ['up_to' => null, 'base' => 2_880, 'excess_over' => 2_000_000],
            ],
        ],
        'E' => [
            'label' => 'Commercial, Industrial and Agro-Industrial',
            'rows' => [
                ['up_to' => 100_000, 'base' => 1_440],
                ['up_to' => 500_000, 'base' => 2_160],
                ['up_to' => 1_000_000, 'base' => 2_880],
                ['up_to' => 2_000_000, 'base' => 4_320],
                ['up_to' => null, 'base' => 7_200, 'excess_over' => 2_000_000],
            ],
        ],
        'F' => [
            'label' => 'Special uses / special projects (gasoline station, cell site, slaughterhouse, treatment plant, etc.)',
            'rows' => [
                ['up_to' => 2_000_000, 'base' => 7_200],
                ['up_to' => null, 'base' => 7_200, 'excess_over' => 2_000_000],
            ],
        ],
    ];

    /**
     * B. Other Certifications: Zoning Certifications. The printed schedule
     * reads "P720/ha", but the office charges every Zoning Certification a
     * fixed P720 whatever the lot size - so no area is asked for.
     */
    public const ZONING_CERTIFICATION_FEE = 720;

    /** The application types priced by categories A-F and the project cost. */
    public static function appliesTo(?string $projectType): bool
    {
        return in_array(strtoupper(trim((string) $projectType)), ['CZC', 'ZONING', 'TUP', 'SUP'], true);
    }

    public static function isZoningCertification(?string $projectType): bool
    {
        return strtoupper(trim((string) $projectType)) === 'ZC';
    }

    /** @return array{category: string, label: string, amount: float, formula: string} */
    public static function zoningCertification(): array
    {
        return self::result(
            'ZC',
            'Zoning Certification',
            self::ZONING_CERTIFICATION_FEE * 100,
            '₱' . self::peso(self::ZONING_CERTIFICATION_FEE * 100) . ' (fixed fee for every Zoning Certification)',
        );
    }

    /**
     * What the officer's decision card offers for one application: a
     * Zoning Certification's fixed fee, or categories A-F for the project
     * cost.
     */
    public static function quotesFor(?string $projectType, $projectCost): array
    {
        if (self::isZoningCertification($projectType)) {
            return [self::zoningCertification()];
        }

        return self::appliesTo($projectType) ? self::quotes($projectCost) : [];
    }

    /**
     * The schedule's fee for the category the officer submitted, recomputed
     * from what is on file. null when the schedule cannot price it.
     */
    public static function computeFor(?string $projectType, ?string $category, $projectCost): ?array
    {
        if (self::isZoningCertification($projectType)) {
            return self::zoningCertification();
        }

        return self::appliesTo($projectType) && $category ? self::compute($category, $projectCost) : null;
    }

    /**
     * The category to pre-select from what the applicant gave as the land
     * use. Only a starting point - "Residential" alone cannot tell a house
     * (A) from an apartment (B) or a dormitory (C), and Vacant/Tenanted/
     * Agricultural describe the land, not the project.
     */
    public static function suggestCategory(?string $existingLandUse): ?string
    {
        return match (strtolower(trim((string) $existingLandUse))) {
            'residential' => 'A',
            'institutional' => 'D',
            'commercial', 'industrial' => 'E',
            default => null,
        };
    }

    /**
     * @return array{category: string, label: string, amount: float, formula: string}|null
     *         null for an unknown category or a missing/negative cost.
     */
    public static function compute(string $category, $projectCost): ?array
    {
        $definition = self::CATEGORIES[$category] ?? null;
        if ($definition === null || $projectCost === null || $projectCost === '' || !is_numeric($projectCost) || $projectCost < 0) {
            return null;
        }

        $costCentavos = (int) round(((float) $projectCost) * 100);

        foreach ($definition['rows'] as $row) {
            if ($row['up_to'] !== null && $costCentavos > $row['up_to'] * 100) {
                continue;
            }

            $baseCentavos = $row['base'] * 100;
            $threshold = $row['excess_over'] ?? null;

            if ($threshold === null) {
                return self::result($category, $definition['label'], $baseCentavos, '₱' . self::peso($baseCentavos) . ' (flat)');
            }

            $excessCentavos = max(0, $costCentavos - $threshold * 100);
            // excess / 1,000, rounded half-up, in centavos.
            $addCentavos = intdiv($excessCentavos + 500, 1000);
            $total = $baseCentavos + $addCentavos;

            $formula = '₱' . self::peso($baseCentavos)
                . ' + 1/10 of 1% of ₱' . self::peso($excessCentavos)
                . ' (cost in excess of ₱' . self::peso($threshold * 100) . ')'
                . ' = ₱' . self::peso($baseCentavos) . ' + ₱' . self::peso($addCentavos);

            return self::result($category, $definition['label'], $total, $formula);
        }

        return null;
    }

    /**
     * Every category's fee for one project cost - what the officer's
     * decision card shows, so the browser never does fee arithmetic of
     * its own.
     *
     * @return array<int, array{category: string, label: string, amount: float, formula: string}>
     */
    public static function quotes($projectCost): array
    {
        $quotes = [];
        foreach (array_keys(self::CATEGORIES) as $category) {
            $quote = self::compute($category, $projectCost);
            if ($quote !== null) {
                $quotes[] = $quote;
            }
        }

        return $quotes;
    }

    private static function result(string $category, string $label, int $centavos, string $formula): array
    {
        return [
            'category' => $category,
            'label' => $label,
            'amount' => (float) ($centavos / 100),
            'formula' => $formula,
        ];
    }

    private static function peso(int $centavos): string
    {
        return number_format($centavos / 100, 2);
    }
}
