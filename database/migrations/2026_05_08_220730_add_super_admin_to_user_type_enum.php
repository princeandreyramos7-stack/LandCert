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
        // Add 'super_admin' to the user_type enum
        DB::statement("ALTER TABLE users MODIFY COLUMN user_type ENUM('applicant', 'staff', 'admin', 'super_admin') DEFAULT 'applicant'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'super_admin' from the enum
        DB::statement("ALTER TABLE users MODIFY COLUMN user_type ENUM('applicant', 'staff', 'admin') DEFAULT 'applicant'");
    }
};
