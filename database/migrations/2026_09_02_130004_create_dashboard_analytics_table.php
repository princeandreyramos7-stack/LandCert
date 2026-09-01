<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create dashboard_analytics table for cached dashboard statistics
     * Improves dashboard performance by pre-computing metrics
     */
    public function up(): void
    {
        Schema::create('dashboard_analytics', function (Blueprint $table) {
            $table->id();
            $table->date('date'); // Date this snapshot represents
            $table->string('metric_type', 50); // daily, weekly, monthly, yearly
            
            // Request metrics
            $table->integer('total_requests')->default(0);
            $table->integer('pending_requests')->default(0);
            $table->integer('under_review_requests')->default(0);
            $table->integer('approved_requests')->default(0);
            $table->integer('rejected_requests')->default(0);
            $table->integer('completed_requests')->default(0);
            
            // Payment metrics
            $table->integer('pending_payments')->default(0);
            $table->integer('verified_payments')->default(0);
            $table->integer('rejected_payments')->default(0);
            $table->decimal('total_payment_amount', 15, 2)->default(0);
            
            // Certificate metrics
            $table->integer('preparing_certificates')->default(0);
            $table->integer('ready_certificates')->default(0);
            $table->integer('released_certificates')->default(0);
            
            // Application type breakdown (JSON)
            $table->json('requests_by_type')->nullable(); // {"CZ": 10, "CZC": 5, "TUP": 3}
            $table->json('requests_by_nature')->nullable(); // {"Residential": 8, "Commercial": 4}
            
            // Processing time metrics
            $table->decimal('avg_review_time_hours', 8, 2)->nullable();
            $table->decimal('avg_approval_time_hours', 8, 2)->nullable();
            $table->decimal('avg_total_time_hours', 8, 2)->nullable();
            
            // Additional metrics
            $table->json('metadata')->nullable(); // Store any additional metrics
            
            $table->timestamps();
            
            // Indexes
            $table->unique(['date', 'metric_type']);
            $table->index('date');
            $table->index('metric_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboard_analytics');
    }
};
