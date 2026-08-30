<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fields the Zoning Officer fills in when generating a certificate.
     *
     * The Tax Declaration number and the zoning classification are not collected
     * from the applicant — the officer supplies them at issuance time, taken from
     * the City Assessor's records and the zoning map. `lot_number` already exists
     * on this table and is reused for the same purpose.
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            if (!Schema::hasColumn('properties', 'tax_declaration_no')) {
                $table->string('tax_declaration_no')->nullable()->after('lot_number');
            }
            if (!Schema::hasColumn('properties', 'zone_classification')) {
                $table->string('zone_classification')->nullable()->after('tax_declaration_no');
            }
        });
    }

    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            foreach (['tax_declaration_no', 'zone_classification'] as $column) {
                if (Schema::hasColumn('properties', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
