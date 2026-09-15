<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The regions table goes; the region's name moves onto the province.
 *
 * Nothing asks for a region any more - the address form starts at the
 * province, because every province belongs to exactly one region and asking
 * first only added a step to get wrong. A table of seventeen rows that
 * nothing selects from is just something else to keep in step.
 *
 * The region itself is still wanted in two places, so it is not thrown away:
 * it labels each province in the dropdown (which is what tells the province
 * Isabela from Isabela City), and it stands in for the province in a written
 * Metro Manila address, where there is no province to name. Both want the
 * name, so the name is what the province row now carries - alongside
 * region_code, which is still stored against every address.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('psgc_provinces', function (Blueprint $table) {
            $table->string('region_name')->nullable()->after('region_code');
        });

        // Carry the names over before the table they live in is dropped, so
        // an existing install keeps working without being re-seeded.
        if (Schema::hasTable('psgc_regions')) {
            \DB::statement('
                UPDATE psgc_provinces p
                JOIN psgc_regions r ON r.code = p.region_code
                SET p.region_name = r.name
            ');
        }

        Schema::dropIfExists('psgc_regions');
    }

    public function down(): void
    {
        Schema::create('psgc_regions', function (Blueprint $table) {
            $table->char('code', 9)->primary();
            $table->string('name');
            $table->string('short_name')->nullable();
        });

        \DB::statement('
            INSERT IGNORE INTO psgc_regions (code, name)
            SELECT DISTINCT region_code, region_name FROM psgc_provinces WHERE region_name IS NOT NULL
        ');

        Schema::table('psgc_provinces', function (Blueprint $table) {
            $table->dropColumn('region_name');
        });
    }
};
