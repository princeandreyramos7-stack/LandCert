<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change status from enum to varchar to support longer status values
        DB::statement("ALTER TABLE `requests` MODIFY `status` VARCHAR(50) DEFAULT 'pending'");
        
        // Update any existing data if needed
        DB::statement("UPDATE `requests` SET `status` = 'pending' WHERE `status` NOT IN ('pending', 'approved', 'rejected', 'reviewed', 'pending_superadmin_approval')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to enum (this will truncate any long values)
        DB::statement("ALTER TABLE `requests` MODIFY `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
    }
};
