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
            // New fields for automated submission
            $table->timestamp('submission_deadline')->nullable()->after('status');
            $table->unsignedInteger('submission_deadline_set_by')->nullable()->after('submission_deadline');
            $table->timestamp('requirements_submitted_at')->nullable()->after('submission_deadline_set_by');
            $table->unsignedInteger('requirements_submitted_by')->nullable()->after('requirements_submitted_at');
            
            // Add foreign key constraints
            $table->foreign('submission_deadline_set_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('requirements_submitted_by')->references('id')->on('users')->onDelete('set null');
            
            // Add indexes for performance
            $table->index('submission_deadline');
            $table->index('requirements_submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['submission_deadline']);
            $table->dropIndex(['requirements_submitted_at']);
            
            // Drop foreign key constraints
            $table->dropForeign(['submission_deadline_set_by']);
            $table->dropForeign(['requirements_submitted_by']);
            
            // Drop columns
            $table->dropColumn([
                'submission_deadline',
                'submission_deadline_set_by',
                'requirements_submitted_at',
                'requirements_submitted_by'
            ]);
        });
    }
};
