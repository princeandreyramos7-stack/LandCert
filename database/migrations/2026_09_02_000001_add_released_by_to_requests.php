<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Certificate Management needs to show who released the decision to the
     * applicant, not just when — released_to_applicant_at alone cannot answer
     * "who did this" for the audit trail.
     */
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            if (!Schema::hasColumn('requests', 'released_by')) {
                // users.id is a plain unsigned int (not bigint) in this schema —
                // matching it is required or the foreign key fails to create.
                $table->unsignedInteger('released_by')->nullable()->after('released_to_applicant_at');
                $table->foreign('released_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            if (Schema::hasColumn('requests', 'released_by')) {
                $table->dropForeign(['released_by']);
                $table->dropColumn('released_by');
            }
        });
    }
};
