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
        Schema::table('requests', function (Blueprint $table) {
            // Add new application_number and decision_number columns
            $table->string('application_number')->nullable()->unique()->after('id');
            $table->string('decision_number')->nullable()->unique()->after('application_number');
            
            // NOTE: We keep control_number for now - it will be dropped in a later migration
            // after we backfill the application numbers
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Restore control_number column
            $table->string('control_number')->nullable()->unique()->after('id');
            
            // Drop application_number and decision_number columns
            $table->dropColumn(['application_number', 'decision_number']);
        });
    }
};
