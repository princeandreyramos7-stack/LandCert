<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Which row of the Schedule of Fees (App\Support\ZoningFeeSchedule) the
 * officer priced a review under, and what the schedule computed for it -
 * kept beside payment_amount (what the officer actually set) so an
 * override of the computed fee is visible afterwards. Both nullable:
 * older reviews, and application types the schedule does not price, have
 * neither.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('fee_category', 2)->nullable()->after('payment_amount');
            $table->decimal('computed_fee', 12, 2)->nullable()->after('fee_category');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['fee_category', 'computed_fee']);
        });
    }
};
