<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * At most one signed-in session per account at a time. A fresh login (see
 * TwoFactorChallengeController::store - the one place a session actually
 * becomes trusted in this app, after the password and the texted code both
 * check out) mints a new random token here; any other session already
 * holding the previous one is signed out the next time it is seen (see
 * App\Http\Middleware\EnsureSingleSession).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'current_session_id')) {
                $table->string('current_session_id', 100)->nullable()->after('remember_token');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'current_session_id')) {
                $table->dropColumn('current_session_id');
            }
        });
    }
};
