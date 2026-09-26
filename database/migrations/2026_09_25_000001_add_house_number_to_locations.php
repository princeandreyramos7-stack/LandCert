<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The applicant's "Number" field on Project Location (item 9 on the paper
 * form - "No./Blk:", the house/building number) had nowhere of its own to
 * live: the wizard sent it as project_location_number, and the only column
 * that ever stored it was properties.lot_number - which the certificate and
 * the printed application form both read as the parcel's legal Lot No.
 * (item 10). Every submission silently printed a house number where the
 * cadastral lot number belongs, until an officer happened to overwrite it.
 *
 * This gives the house number a column of its own, so lot_number is free to
 * mean what it already prints as.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            if (!Schema::hasColumn('locations', 'house_number')) {
                $table->string('house_number', 100)->nullable()->after('street_address');
            }
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            if (Schema::hasColumn('locations', 'house_number')) {
                $table->dropColumn('house_number');
            }
        });
    }
};
