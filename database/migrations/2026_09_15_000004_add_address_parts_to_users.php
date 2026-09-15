<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The account's own address, as parts.
 *
 * `users.address` keeps holding the one line it always did. What is new is
 * the record of which barangay, city and province that line was picked from,
 * for the same reasons as on applicants: it is what lets the address be
 * shown back as selections rather than as text, and it is what makes the
 * account's address usable as the starting point of an application form
 * instead of a string nobody can match to anything.
 *
 * Nullable throughout: an address is optional at sign-up, and every account
 * that already exists typed theirs by hand.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->char('address_region_code', 9)->nullable()->after('address');
            $table->char('address_province_code', 9)->nullable()->after('address_region_code');
            $table->char('address_city_code', 9)->nullable()->after('address_province_code');
            $table->char('address_barangay_code', 9)->nullable()->after('address_city_code');
            $table->string('address_street')->nullable()->after('address_barangay_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'address_region_code',
                'address_province_code',
                'address_city_code',
                'address_barangay_code',
                'address_street',
            ]);
        });
    }
};
