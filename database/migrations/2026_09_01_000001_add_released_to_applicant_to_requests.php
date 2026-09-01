<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Releasing the decision to the applicant is a deliberate act.
     *
     * The applicant used to see "Generate Clearance"/"Generate Certificate" the
     * moment their payment was confirmed, which meant they could print a document
     * before the office had finished preparing and signing it. The office now
     * releases it explicitly from Certificate Management, and only then does the
     * applicant's button appear.
     */
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            if (!Schema::hasColumn('requests', 'released_to_applicant_at')) {
                $table->timestamp('released_to_applicant_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            if (Schema::hasColumn('requests', 'released_to_applicant_at')) {
                $table->dropColumn('released_to_applicant_at');
            }
        });
    }
};
