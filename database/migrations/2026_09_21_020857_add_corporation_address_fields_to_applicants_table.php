<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->string('corporation_address_region_code', 10)->nullable();
            $table->string('corporation_address_province_code', 10)->nullable();
            $table->string('corporation_address_city_code', 10)->nullable();
            $table->string('corporation_address_barangay_code', 10)->nullable();
            $table->string('corporation_address_street')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn([
                'corporation_address_region_code',
                'corporation_address_province_code',
                'corporation_address_city_code',
                'corporation_address_barangay_code',
                'corporation_address_street',
            ]);
        });
    }
};
