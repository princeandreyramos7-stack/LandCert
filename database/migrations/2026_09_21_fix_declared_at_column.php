<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Emergency fix: ensures declared_at and declaration_version columns exist.
 * 
 * The 2026_09_20_000001 migration should have added these, but if it failed
 * silently or the database was restored from a backup, the columns may be missing.
 * This migration checks first and only adds them if they don't exist.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Check if columns exist before attempting to add them
        if (!Schema::hasColumn('requests', 'declared_at')) {
            Schema::table('requests', function (Blueprint $table) {
                $table->timestamp('declared_at')->nullable()->after('created_at');
            });
        }

        if (!Schema::hasColumn('requests', 'declaration_version')) {
            Schema::table('requests', function (Blueprint $table) {
                $table->string('declaration_version', 16)->nullable()->after('declared_at');
            });
        }

        // Log the result
        $hasDeclaredAt = Schema::hasColumn('requests', 'declared_at');
        $hasDeclarationVersion = Schema::hasColumn('requests', 'declaration_version');
        
        \Log::info('Declaration columns check', [
            'declared_at' => $hasDeclaredAt ? 'EXISTS' : 'MISSING',
            'declaration_version' => $hasDeclarationVersion ? 'EXISTS' : 'MISSING',
        ]);
    }

    public function down(): void
    {
        // Only drop if they exist
        Schema::table('requests', function (Blueprint $table) {
            if (Schema::hasColumn('requests', 'declared_at')) {
                $table->dropColumn('declared_at');
            }
            if (Schema::hasColumn('requests', 'declaration_version')) {
                $table->dropColumn('declaration_version');
            }
        });
    }
};
