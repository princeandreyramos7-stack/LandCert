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
     * Update certificates table to support physical certificate workflow:
     * - Add user_id to track certificate owner
     * - Update status enum to match physical workflow
     * - Add physical release tracking fields
     */
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            // Add user_id if it doesn't exist
            if (!Schema::hasColumn('certificates', 'user_id')) {
                $table->unsignedInteger('user_id')->nullable()->after('request_id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            }
            
            // Add physical release tracking fields if they don't exist
            if (!Schema::hasColumn('certificates', 'ready_at')) {
                $table->timestamp('ready_at')->nullable()->after('issued_at');
            }
            
            if (!Schema::hasColumn('certificates', 'released_at')) {
                $table->timestamp('released_at')->nullable()->after('ready_at');
            }
            
            if (!Schema::hasColumn('certificates', 'released_by')) {
                $table->unsignedInteger('released_by')->nullable()->after('released_at');
                $table->foreign('released_by')->references('id')->on('users')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('certificates', 'released_to_name')) {
                $table->string('released_to_name')->nullable()->after('released_by');
            }
            
            if (!Schema::hasColumn('certificates', 'released_to_id_type')) {
                $table->string('released_to_id_type', 100)->nullable()->after('released_to_name');
            }
            
            if (!Schema::hasColumn('certificates', 'released_to_id_number')) {
                $table->string('released_to_id_number', 100)->nullable()->after('released_to_id_type');
            }
            
            if (!Schema::hasColumn('certificates', 'release_signature_path')) {
                $table->string('release_signature_path')->nullable()->after('released_to_id_number');
            }
        });
        
        // Update status enum to support physical certificate workflow
        DB::statement("ALTER TABLE certificates MODIFY status ENUM('preparing', 'ready_for_pickup', 'released', 'cancelled') DEFAULT 'preparing'");
        
        // Update existing status values to new values
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
        // Revert status enum
        DB::statement("ALTER TABLE certificates MODIFY status ENUM('generated', 'sent', 'collected') DEFAULT 'generated'");
        
        // Revert status values
        DB::statement("
            UPDATE certificates 
            SET status = CASE status
                WHEN 'preparing' THEN 'generated'
                WHEN 'ready_for_pickup' THEN 'sent'
                WHEN 'released' THEN 'collected'
                ELSE 'generated'
            END
        ");
        
        Schema::table('certificates', function (Blueprint $table) {
            // Drop new columns
            if (Schema::hasColumn('certificates', 'release_signature_path')) {
                $table->dropColumn('release_signature_path');
            }
            if (Schema::hasColumn('certificates', 'released_to_id_number')) {
                $table->dropColumn('released_to_id_number');
            }
            if (Schema::hasColumn('certificates', 'released_to_id_type')) {
                $table->dropColumn('released_to_id_type');
            }
            if (Schema::hasColumn('certificates', 'released_to_name')) {
                $table->dropColumn('released_to_name');
            }
            if (Schema::hasColumn('certificates', 'released_by')) {
                $table->dropForeign(['released_by']);
                $table->dropColumn('released_by');
            }
            if (Schema::hasColumn('certificates', 'released_at')) {
                $table->dropColumn('released_at');
            }
            if (Schema::hasColumn('certificates', 'ready_at')) {
                $table->dropColumn('ready_at');
            }
            if (Schema::hasColumn('certificates', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};
