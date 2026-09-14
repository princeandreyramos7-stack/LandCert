<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The parts an address was picked from, kept beside the address itself.
 *
 * `applicant_address` and `representative_address` stay exactly as they are:
 * one line of text, which is what the CPD-001-0 form prints, what the
 * certificates carry and what every export and report already reads. Nothing
 * downstream has to change.
 *
 * What is new is the record of *which* barangay, city, province and region
 * that line was built from. That is what lets the form be filled in again
 * with the same selections, and what makes an address countable - "how many
 * applications from Isabela" is a question free text could never answer.
 *
 * Codes are PSGC codes, nullable throughout: every address already on file
 * was typed by hand and has no codes behind it, and a form can be saved
 * before an address is picked.
 */
return new class extends Migration
{
    private const TABLES = [
        'applicants' => 'applicant_address',
        'representatives' => 'representative_address',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $table => $after) {
            Schema::table($table, function (Blueprint $blueprint) use ($after) {
                $blueprint->char('address_region_code', 9)->nullable()->after($after);
                $blueprint->char('address_province_code', 9)->nullable()->after('address_region_code');
                $blueprint->char('address_city_code', 9)->nullable()->after('address_province_code');
                $blueprint->char('address_barangay_code', 9)->nullable()->after('address_city_code');
                // House/building number and street: the one part of an
                // address no reference list can supply.
                $blueprint->string('address_street')->nullable()->after('address_barangay_code');
            });
        }
    }

    public function down(): void
    {
        foreach (array_keys(self::TABLES) as $table) {
            Schema::table($table, function (Blueprint $blueprint) {
                $blueprint->dropColumn([
                    'address_region_code',
                    'address_province_code',
                    'address_city_code',
                    'address_barangay_code',
                    'address_street',
                ]);
            });
        }
    }
};
