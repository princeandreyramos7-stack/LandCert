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
            // Appointment details
            $table->date('appointment_date')->nullable()->after('description');
            $table->time('appointment_time')->nullable()->after('appointment_date');
            
            // Payment information
            $table->decimal('payment_amount', 10, 2)->nullable()->after('appointment_time');
            
            // Requirements as JSON
            $table->json('requirements')->nullable()->after('payment_amount');
            
            // Admin notes
            $table->text('admin_notes')->nullable()->after('requirements');
            
            // SuperAdmin approval tracking
            $table->string('approved_by')->nullable()->after('admin_notes');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            
            // Add index for better query performance
            $table->index('appointment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropIndex(['appointment_date']);
            $table->dropColumn([
                'appointment_date',
                'appointment_time',
                'payment_amount',
                'requirements',
                'admin_notes',
                'approved_by',
                'approved_at'
            ]);
        });
    }
};
