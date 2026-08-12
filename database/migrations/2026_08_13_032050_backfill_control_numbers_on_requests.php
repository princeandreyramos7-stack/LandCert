<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Backfill CPD control numbers for all existing requests that have none.
     * Format: CPD-{3-digit-sequence}-{suffix}
     * e.g.  CPD-001-0, CPD-002-0, CPD-003-0 ...
     */
    public function up(): void
    {
        $requests = DB::table('requests')
            ->whereNull('control_number')
            ->orderBy('id')
            ->get(['id']);

        foreach ($requests as $request) {
            $controlNumber = self::generateControlNumber();
            DB::table('requests')
                ->where('id', $request->id)
                ->update(['control_number' => $controlNumber]);
        }
    }

    public function down(): void
    {
        // Reverse is not meaningful; do nothing.
    }

    /**
     * Generate a unique CPD control number in the format CPD-XXX-0
     */
    private static function generateControlNumber(): string
    {
        $attempt = 0;
        do {
            // Grab the highest existing numeric sequence from CPD-NNN-0 numbers
            $last = DB::table('requests')
                ->whereNotNull('control_number')
                ->where('control_number', 'like', 'CPD-%-0')
                ->orderByRaw("CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(control_number, '-', 2), '-', -1) AS UNSIGNED) DESC")
                ->value('control_number');

            $nextSeq = 1;
            if ($last) {
                // Extract the middle number from CPD-NNN-0
                preg_match('/CPD-(\d+)-/', $last, $matches);
                $nextSeq = isset($matches[1]) ? (int)$matches[1] + 1 + $attempt : 1;
            } else {
                $nextSeq += $attempt;
            }

            $candidate = sprintf('CPD-%03d-0', $nextSeq);
            $attempt++;
        } while (DB::table('requests')->where('control_number', $candidate)->exists());

        return $candidate;
    }
};
