<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
        });

        // Every account that already exists at this moment predates the rule
        // this column enforces (see AuthenticatedSessionController::store) -
        // none of them could have completed a step that did not exist yet,
        // so none of them should be locked out by it. Only a registration
        // that happens AFTER this migration runs is subject to the rule.
        DB::table('users')->update(['phone_verified_at' => now()]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone_verified_at');
        });
    }
};
