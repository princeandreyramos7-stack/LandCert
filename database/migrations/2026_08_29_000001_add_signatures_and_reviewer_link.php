<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * E-signatures on certificates and clearances.
     *
     * Two problems are fixed here:
     *  1. Users had nowhere to store a signature image.
     *  2. reports.reviewed_by was referenced by every generate* controller method
     *     but never actually existed as a column, so the reviewing officer could
     *     not be resolved back to a user account (issued_by only holds a name
     *     string). Without that link there is no way to pick the right signature.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'signature_path')) {
                $table->string('signature_path')->nullable()->after('user_type');
            }
        });

        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'reviewed_by')) {
                $table->unsignedBigInteger('reviewed_by')->nullable()->after('issued_by');
                $table->index('reviewed_by');
            }
        });

        // Backfill reviewed_by for existing reports by matching the recorded
        // issued_by name against staff accounts. Exact match only — a wrong
        // guess would put the wrong signature on a government document.
        $staff = DB::table('users')
            ->whereIn('user_type', ['admin', 'super_admin'])
            ->get(['id', 'name']);

        foreach ($staff as $user) {
            DB::table('reports')
                ->whereNull('reviewed_by')
                ->whereRaw('LOWER(TRIM(issued_by)) = ?', [mb_strtolower(trim($user->name))])
                ->update(['reviewed_by' => $user->id]);
        }
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'reviewed_by')) {
                $table->dropIndex(['reviewed_by']);
                $table->dropColumn('reviewed_by');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'signature_path')) {
                $table->dropColumn('signature_path');
            }
        });
    }
};
