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
        Schema::table('reports', function (Blueprint $table) {
            // Drop index first if it exists
            $table->dropIndex(['appointment_date']);
            
            // Drop the appointment date and time columns
            $table->dropColumn([
                'appointment_date',
                'appointment_time',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            // Re-add the appointment date and time columns
            $table->date('appointment_date')->nullable()->after('description');
            $table->time('appointment_time')->nullable()->after('appointment_date');
            
            // Re-add index for better query performance
            $table->index('appointment_date');
        });
    }
};
