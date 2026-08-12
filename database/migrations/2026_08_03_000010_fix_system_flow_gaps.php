<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Fixes identified gaps in system flow:
     * 1. Add revision workflow statuses to requests
     * 2. Fix reports table FK (app_id → request_id)
     * 3. Update certificate status values
     */
    public function up(): void
    {
        // 1. Expand requests status enum to support revision workflow
        DB::statement("
            ALTER TABLE requests 
            MODIFY status ENUM(
                'pending', 
                'under_review', 
                'needs_revision', 
                'approved', 
                'rejected'
            ) DEFAULT 'pending'
        ");

        // 2. Fix reports table foreign key
        // Check if app_id column exists and applications table exists
        if (Schema::hasColumn('reports', 'app_id')) {
            // Drop the old foreign key if it exists
            DB::statement("
                ALTER TABLE reports 
                DROP FOREIGN KEY IF EXISTS reports_app_id_foreign
            ");

            // Add request_id column if it doesn't exist
            if (!Schema::hasColumn('reports', 'request_id')) {
                Schema::table('reports', function (Blueprint $table) {
                    $table->foreignId('request_id')->nullable()->after('report_id')
                        ->constrained('requests')->onDelete('cascade');
                });
            }

            // Drop app_id column
            Schema::table('reports', function (Blueprint $table) {
                $table->dropColumn('app_id');
            });
        }

        // 3. Update certificate status enum to match expected workflow
        DB::statement("
            ALTER TABLE certificates 
            MODIFY status ENUM(
                'preparing', 
                'ready_for_pickup', 
                'released', 
                'cancelled'
            ) DEFAULT 'preparing'
        ");
        
        // Update existing certificate statuses to new values
        DB::statement("
            UPDATE certificates 
            SET status = CASE status
                WHEN 'generated' THEN 'preparing'
                WHEN 'sent' THEN 'ready_for_pickup'
                WHEN 'collected' THEN 'released'
                ELSE 'preparing'
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert requests status enum
        DB::statement("
            ALTER TABLE requests 
            MODIFY status ENUM('pending', 'approved', 'rejected') 
            DEFAULT 'pending'
        ");

        // Revert reports table structure
        if (Schema::hasColumn('reports', 'request_id')) {
            Schema::table('reports', function (Blueprint $table) {
                $table->dropForeign(['request_id']);
                $table->dropColumn('request_id');
            });

            // Recreate app_id column
            Schema::table('reports', function (Blueprint $table) {
                $table->unsignedInteger('app_id')->after('report_id');
            });
        }

        // Revert certificate status enum
        DB::statement("
            ALTER TABLE certificates 
            MODIFY status ENUM('generated', 'sent', 'collected') 
            DEFAULT 'generated'
        ");
    }
};
