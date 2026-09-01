<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add soft delete functionality to main tables
     * This allows marking records as deleted without permanently removing them
     */
    public function up(): void
    {
        // Add soft deletes to requests table
        if (!Schema::hasColumn('requests', 'deleted_at')) {
            Schema::table('requests', function (Blueprint $table) {
                $table->softDeletes()->after('updated_at');
                $table->index('deleted_at');
            });
        }

        // Add soft deletes to payments table
        if (!Schema::hasColumn('payments', 'deleted_at')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->softDeletes()->after('updated_at');
                $table->index('deleted_at');
            });
        }

        // Add soft deletes to certificates table
        if (!Schema::hasColumn('certificates', 'deleted_at')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->softDeletes()->after('updated_at');
                $table->index('deleted_at');
            });
        }

        // Add soft deletes to applicants table
        if (!Schema::hasColumn('applicants', 'deleted_at')) {
            Schema::table('applicants', function (Blueprint $table) {
                $table->softDeletes()->after('updated_at');
                $table->index('deleted_at');
            });
        }

        // Add soft deletes to users table (for account deactivation)
        if (!Schema::hasColumn('users', 'deleted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->softDeletes()->after('updated_at');
                $table->index('deleted_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropIndex(['deleted_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['deleted_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->dropIndex(['deleted_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('applicants', function (Blueprint $table) {
            $table->dropIndex(['deleted_at']);
            $table->dropSoftDeletes();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['deleted_at']);
            $table->dropSoftDeletes();
        });
    }
};
