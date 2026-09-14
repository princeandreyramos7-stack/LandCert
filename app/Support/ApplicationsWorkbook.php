<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * The applications list as an Excel workbook - the office's letterhead and
 * logos, a title and subject, a summary, the table with a styled header,
 * real dates and numbers, a filter and a frozen header, and a totals row.
 * The same arrangement as the report workbooks, so every download from the
 * system reads alike.
 */
class ApplicationsWorkbook
{
    private const COLUMNS = 14;

    /**
     * @param  Collection  $rows  the objects AdminController::exportRequests builds
     */
    public static function build(Collection $rows, string $subtitle, string $preparedBy): string
    {
        $widths = [5, 17, 28, 30, 13, 24, 40, 14, 16, 28, 30, 26, 12, 18];
        $sheet = (new Xlsx('Applications'))->widths($widths);
        $columns = self::COLUMNS;

        // Letterhead: seal and mark either side of the office's lines, placed by
        // pixel from the centre of the sheet.
        $logo = 66;
        $centre = (int) ($sheet->widthPixels() / 2);
        if ($seal = ReportLogos::seal()) {
            $sheet->imageAt($seal, $centre - 170 - $logo, 0, 10, $logo);
        }
        if ($mark = ReportLogos::mark()) {
            $sheet->imageAt($mark, $centre + 170, 0, 10, $logo);
        }
        $sheet->row([['Republic of the Philippines', 'letterhead']], 20)->mergeLastRow($columns);
        $sheet->row([['City of Ilagan, Isabela', 'city']], 24)->mergeLastRow($columns);
        $sheet->row([['City Planning & Development Office', 'letterhead']], 20)->mergeLastRow($columns);
        $sheet->blank();

        $sheet->row([['APPLICATIONS', 'title']], 30)->mergeLastRow($columns);
        $sheet->row([[$subtitle, 'subtitle']], 22)->mergeLastRow($columns);
        $sheet->row([['Generated ' . now()->format('F j, Y \a\t g:i A') . ' by ' . $preparedBy, 'meta']])->mergeLastRow($columns);
        $sheet->blank();

        // Summary
        $statusCounts = $rows->countBy(fn ($row) => self::statusLabel($row->status))->sortKeys();
        $totalCost = $rows->sum(fn ($row) => (float) ($row->project_cost ?? 0));
        $sheet->row([['Applications', 'label'], [$rows->count(), 'value']]);
        foreach ($statusCounts as $label => $count) {
            $sheet->row([[$label, 'label'], [$count, 'value']]);
        }
        $sheet->row([['Total project cost (PHP)', 'label'], [$totalCost, 'number']]);
        $sheet->blank();

        // The table
        $sheet->row([
            ['#', 'header'], ['Application No.', 'header'], ['Applicant', 'header'], ['Address', 'header'],
            ['Application Type', 'header'], ['Project Nature', 'header'], ['Project Location', 'header'],
            ['Lot Area (sqm)', 'header'], ['Project Cost (PHP)', 'header'], ['Status', 'header'],
            ['Account', 'header'], ['Corporation', 'header'], ['Auth. Letter', 'header'], ['Submitted', 'header'],
        ], 24)
            ->freezeBelowLastRow()
            ->repeatLastRowWhenPrinting();
        $headerRow = $sheet->lastRow();

        foreach ($rows->values() as $i => $row) {
            $alt = $i % 2 === 1 ? 'Alt' : '';
            $location = implode(', ', array_filter([
                $row->project_location_street ?? null,
                $row->project_location_barangay ?? null,
                $row->project_location_city ?? null,
                $row->project_location_province ?? null,
            ]));
            $sheet->row([
                [$i + 1, "int{$alt}"],
                [$row->application_number ?? "#{$row->id}", "text{$alt}"],
                [$row->applicant_name, "text{$alt}"],
                [$row->applicant_address, "text{$alt}"],
                [$row->project_type, "text{$alt}"],
                [$row->project_nature, "text{$alt}"],
                [$location ?: null, "text{$alt}"],
                [$row->lot_area_sqm !== null && $row->lot_area_sqm !== '' ? (float) $row->lot_area_sqm : null, "number{$alt}"],
                [$row->project_cost !== null && $row->project_cost !== '' ? (float) $row->project_cost : null, "number{$alt}"],
                [self::statusLabel($row->status), "text{$alt}"],
                [trim(($row->user_name ?? '') . ' ' . ($row->user_email ? "<{$row->user_email}>" : '')) ?: null, "text{$alt}"],
                [$row->corporation_name ?: null, "text{$alt}"],
                [$row->authorization_letter_path ? 'Yes' : 'No', "text{$alt}"],
                [$row->created_at ? Carbon::parse($row->created_at) : null, "date{$alt}"],
            ]);
        }

        $sheet->row(array_merge(
            [['', 'totalBlank'], ['TOTAL', 'totalLabel'], [$rows->count() . ' application' . ($rows->count() === 1 ? '' : 's'), 'totalLabel']],
            array_fill(0, 5, ['', 'totalBlank']),
            [[$totalCost, 'totalNumber']],
            array_fill(0, 5, ['', 'totalBlank'])
        ));
        $lastDataRow = $sheet->lastRow() - 1;
        if ($lastDataRow > $headerRow) {
            $sheet->filter($headerRow, $lastDataRow, $columns);
        }
        $sheet->blank();

        $sheet->row([['This list was generated from the CPDO Land Use Certification System records.', 'note']])->mergeLastRow($columns);
        $sheet->row([['Prepared by', 'label'], [$preparedBy, 'value']]);

        return $sheet->save();
    }

    /** The wording the office uses for a status, as the lists show it. */
    public static function statusLabel(?string $status): string
    {
        return match ($status) {
            'pending', 'for_verification' => 'For Verification',
            'reviewed', 'pending_superadmin_approval' => 'For Approval',
            'returned', 'in_applicant' => 'Returned to Applicant',
            'approved' => 'Approved - For Payment',
            'for_payment', 'pending_payment' => 'For Payment',
            'payment_confirmed', 'approved_with_payment', 'certificate_preparing',
            'certificate_ready', 'released', 'collected', 'completed' => 'Application Approved (paid)',
            'rejected' => 'Application Denied',
            default => $status ? ucfirst(str_replace('_', ' ', $status)) : 'Unknown',
        };
    }
}
