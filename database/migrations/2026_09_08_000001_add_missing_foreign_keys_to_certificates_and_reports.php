<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Two relationships the models declare but the database never enforced.
     *
     *  1. certificates.payment_id had only a unique index. The rule that no
     *     certificate exists without the payment that entitled it to be issued
     *     was left entirely to Certificate::payment(), so anything writing the
     *     column outside Eloquent could point it at a payment that never existed.
     *  2. reports.reviewed_by was added as an index-only column, and as a bigint
     *     against users.id, which is an int. The width has to be narrowed before
     *     the constraint will hold at all.
     *
     * Both columns are nullable, so an orphaned value is set back to NULL rather
     * than blocking the migration — a dangling reference is already meaningless.
     */
    public function up(): void
    {
        // --- certificates.payment_id -> payments.id ---------------------------
        DB::statement('
            UPDATE certificates c
            LEFT JOIN payments p ON p.id = c.payment_id
            SET c.payment_id = NULL
            WHERE c.payment_id IS NOT NULL AND p.id IS NULL
        ');

        if (!$this->hasForeignKey('certificates', 'certificates_payment_id_foreign')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->foreign('payment_id')
                    ->references('id')->on('payments')
                    ->nullOnDelete();
            });
        }

        // --- reports.reviewed_by -> users.id ----------------------------------
        DB::statement('
            UPDATE reports r
            LEFT JOIN users u ON u.id = r.reviewed_by
            SET r.reviewed_by = NULL
            WHERE r.reviewed_by IS NOT NULL AND u.id IS NULL
        ');

        // users.id is int(10) unsigned; reviewed_by was created as bigint.
        // MySQL refuses a foreign key across mismatched integer widths.
        DB::statement('ALTER TABLE reports MODIFY reviewed_by INT UNSIGNED NULL');

        if (!$this->hasForeignKey('reports', 'reports_reviewed_by_foreign')) {
            Schema::table('reports', function (Blueprint $table) {
                $table->foreign('reviewed_by')
                    ->references('id')->on('users')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if ($this->hasForeignKey('certificates', 'certificates_payment_id_foreign')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->dropForeign('certificates_payment_id_foreign');
            });
        }

        if ($this->hasForeignKey('reports', 'reports_reviewed_by_foreign')) {
            Schema::table('reports', function (Blueprint $table) {
                $table->dropForeign('reports_reviewed_by_foreign');
            });
        }

        DB::statement('ALTER TABLE reports MODIFY reviewed_by BIGINT UNSIGNED NULL');
    }

    private function hasForeignKey(string $table, string $constraint): bool
    {
        return DB::table('information_schema.TABLE_CONSTRAINTS')
            ->where('CONSTRAINT_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', $table)
            ->where('CONSTRAINT_NAME', $constraint)
            ->where('CONSTRAINT_TYPE', 'FOREIGN KEY')
            ->exists();
    }
};
