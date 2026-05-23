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
        // First, expand the enum to include both old and new values
        DB::statement("ALTER TABLE reports MODIFY COLUMN workflow_status ENUM(
            'pending_approval',
            'approved_pending_payment',
            'payment_submitted',
            'payment_verified',
            'certificate_issued',
            'payment_order_generated',
            'payment_completed',
            'certificate_ready_for_collection',
            'certificate_collected'
        ) DEFAULT 'pending_approval'");

        // Now update existing records to use new status values
        DB::table('reports')
            ->where('workflow_status', 'payment_submitted')
            ->update(['workflow_status' => 'payment_order_generated']);

        DB::table('reports')
            ->where('workflow_status', 'payment_verified')
            ->update(['workflow_status' => 'payment_completed']);

        DB::table('reports')
            ->where('workflow_status', 'certificate_issued')
            ->update(['workflow_status' => 'certificate_ready_for_collection']);

        // Finally, remove the old enum values
        DB::statement("ALTER TABLE reports MODIFY COLUMN workflow_status ENUM(
            'pending_approval',
            'approved_pending_payment',
            'payment_order_generated',
            'payment_completed',
            'certificate_ready_for_collection',
            'certificate_collected'
        ) DEFAULT 'pending_approval'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert status values back to old values
        DB::table('reports')
            ->where('workflow_status', 'payment_order_generated')
            ->update(['workflow_status' => 'payment_submitted']);

        DB::table('reports')
            ->where('workflow_status', 'payment_completed')
            ->update(['workflow_status' => 'payment_verified']);

        DB::table('reports')
            ->where('workflow_status', 'certificate_ready_for_collection')
            ->update(['workflow_status' => 'certificate_issued']);

        // Restore original enum values
        DB::statement("ALTER TABLE reports MODIFY COLUMN workflow_status ENUM(
            'pending_approval',
            'approved_pending_payment',
            'payment_submitted',
            'payment_verified',
            'certificate_issued'
        ) DEFAULT 'pending_approval'");
    }
};
