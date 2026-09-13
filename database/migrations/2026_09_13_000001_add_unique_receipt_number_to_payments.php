<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * An official receipt number identifies one payment at the Treasury, so the
 * database should be the thing that enforces it.
 *
 * Until now the only protection was checkDuplicate(), which the browser calls
 * before submitting — a check-then-act gap that two officers recording the same
 * OR at the same time, or one officer double-clicking, would both pass.
 *
 * Nullable rows are left alone: MySQL allows many NULLs under a unique index,
 * which is what legacy payments recorded without an OR number need.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Guard rather than assume: adding a unique index over existing
        // duplicates fails the migration halfway and leaves the deploy stuck.
        $duplicates = DB::table('payments')
            ->select('receipt_number', DB::raw('COUNT(*) as total'))
            ->whereNotNull('receipt_number')
            ->where('receipt_number', '!=', '')
            ->groupBy('receipt_number')
            ->having('total', '>', 1)
            ->pluck('receipt_number')
            ->all();

        if ($duplicates) {
            throw new RuntimeException(
                'Cannot add a unique index: these receipt numbers already appear more than once — '
                . implode(', ', $duplicates)
                . '. Resolve them first, then re-run the migration.'
            );
        }

        if (!$this->hasIndex('payments', 'payments_receipt_number_unique')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->unique('receipt_number', 'payments_receipt_number_unique');
            });
        }
    }

    public function down(): void
    {
        if ($this->hasIndex('payments', 'payments_receipt_number_unique')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->dropUnique('payments_receipt_number_unique');
            });
        }
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(DB::select("SHOW INDEX FROM `{$table}`"))
            ->contains(fn ($row) => $row->Key_name === $index);
    }
};
