<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The Philippine Standard Geographic Code, as four tables.
 *
 * The address fields on the application form used to be free text, so two
 * applicants from the same barangay could write it three different ways and
 * nothing could be counted or checked. These tables are the reference list
 * the address pickers read and the server validates against: every region,
 * province, city/municipality and barangay in the country.
 *
 * Codes are the PSGC's own nine-digit codes, so a row can be matched back to
 * the official list. They are the primary keys - the data is published with
 * them and they do not change when a name is spelled differently.
 *
 * "Province" here also covers the two things that sit at the province level
 * without being provinces: Metro Manila's four districts, and the couple of
 * cities that report straight to their region. The `kind` column says which,
 * so the picker can label them honestly while the cascade still works.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('psgc_regions', function (Blueprint $table) {
            $table->char('code', 9)->primary();
            $table->string('name');
            // "Region II", "NCR" - the numeral the region is better known by.
            $table->string('short_name')->nullable();
        });

        Schema::create('psgc_provinces', function (Blueprint $table) {
            $table->char('code', 9)->primary();
            $table->string('name');
            $table->char('region_code', 9);
            $table->enum('kind', ['province', 'district', 'standalone'])->default('province');
            $table->index('region_code');
        });

        Schema::create('psgc_cities_municipalities', function (Blueprint $table) {
            $table->char('code', 9)->primary();
            $table->string('name');
            $table->char('province_code', 9);
            $table->boolean('is_city')->default(false);
            $table->index('province_code');
        });

        Schema::create('psgc_barangays', function (Blueprint $table) {
            $table->char('code', 9)->primary();
            $table->string('name');
            $table->char('city_code', 9);
            $table->index('city_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('psgc_barangays');
        Schema::dropIfExists('psgc_cities_municipalities');
        Schema::dropIfExists('psgc_provinces');
        Schema::dropIfExists('psgc_regions');
    }
};
