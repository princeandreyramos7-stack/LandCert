<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The SMS automated processing fee added to what the applicant pays
 * (App\Support\SmsProcessingFee). payment_amount stays the total due; this
 * keeps how much of it is the SMS fee, so the Order of Payment and the
 * screens can show the breakdown. Applications reviewed before the fee
 * existed keep 0 - their Order of Payment was issued without it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->decimal('sms_fee', 10, 2)->default(0)->after('computed_fee');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('sms_fee');
        });
    }
};
