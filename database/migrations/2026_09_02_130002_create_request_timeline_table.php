<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create request_timeline table for detailed status history tracking
     * This provides a complete audit trail of all status changes
     */
    public function up(): void
    {
        Schema::create('request_timeline', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');
            
            // Status information
            $table->string('event_type', 50); // status_change, payment_submitted, certificate_issued, etc.
            $table->string('old_status', 50)->nullable();
            $table->string('new_status', 50)->nullable();
            
            // Event details
            $table->string('title'); // Brief description
            $table->text('description')->nullable(); // Detailed description
            $table->json('metadata')->nullable(); // Additional data (amounts, file names, etc.)
            
            // Who performed the action
            $table->unsignedInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->string('user_role', 50)->nullable(); // applicant, admin, super_admin, system
            
            // Visibility
            $table->boolean('visible_to_applicant')->default(true);
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['request_id', 'created_at']);
            $table->index(['request_id', 'event_type']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_timeline');
    }
};
