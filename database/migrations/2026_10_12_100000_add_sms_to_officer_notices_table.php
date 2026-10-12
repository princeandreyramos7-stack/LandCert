<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Notify Officers now also texts: "SMS to Officers" was folded into it, so a
 * notice can go out as a text message as well as in-app. These record that it
 * did and how the sending went, for the Sent list.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('officer_notices', function (Blueprint $table) {
            $table->boolean('via_sms')->default(false)->after('recipients');
            $table->unsignedSmallInteger('sms_sent')->nullable()->after('via_sms');
            $table->unsignedSmallInteger('sms_failed')->nullable()->after('sms_sent');
            // Officers with no mobile number on their account.
            $table->unsignedSmallInteger('sms_skipped')->nullable()->after('sms_failed');
        });
    }

    public function down(): void
    {
        Schema::table('officer_notices', function (Blueprint $table) {
            $table->dropColumn(['via_sms', 'sms_sent', 'sms_failed', 'sms_skipped']);
        });
    }
};
