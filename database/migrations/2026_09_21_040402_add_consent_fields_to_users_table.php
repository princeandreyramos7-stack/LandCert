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
        Schema::table('users', function (Blueprint $table) {
            // Add consent tracking fields for GDPR compliance
            if (!Schema::hasColumn('users', 'consented_at')) {
                $table->timestamp('consented_at')->nullable()->after('password');
            }
            if (!Schema::hasColumn('users', 'consent_version')) {
                $table->string('consent_version', 10)->nullable()->after('consented_at');
            }
            if (!Schema::hasColumn('users', 'consent_ip')) {
                $table->string('consent_ip', 45)->nullable()->after('consent_version');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['consented_at', 'consent_version', 'consent_ip']);
        });
    }
};
