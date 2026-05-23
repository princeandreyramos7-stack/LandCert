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
        Schema::table('payments', function (Blueprint $table) {
            // New fields for payment order workflow
            $table->string('payment_order_number')->nullable()->unique()->after('id');
            $table->timestamp('payment_order_generated_at')->nullable()->after('payment_order_number');
            $table->string('payment_order_pdf_path')->nullable()->after('payment_order_generated_at');
            $table->string('treasury_receipt_number')->nullable()->after('payment_order_pdf_path');
            $table->timestamp('payment_completed_at')->nullable()->after('treasury_receipt_number');
            $table->unsignedInteger('payment_completed_by')->nullable()->after('payment_completed_at');
            $table->boolean('is_legacy_payment')->default(false)->after('payment_completed_by');
            
            // Add foreign key constraint
            $table->foreign('payment_completed_by')->references('id')->on('users')->onDelete('set null');
            
            // Add indexes for payment order lookup and performance
            $table->index('payment_order_number');
            $table->index('payment_completed_at');
        });

        // Mark existing records as legacy
        DB::table('payments')->update(['is_legacy_payment' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['payment_order_number']);
            $table->dropIndex(['payment_completed_at']);
            
            // Drop foreign key constraint
            $table->dropForeign(['payment_completed_by']);
            
            // Drop columns
            $table->dropColumn([
                'payment_order_number',
                'payment_order_generated_at',
                'payment_order_pdf_path',
                'treasury_receipt_number',
                'payment_completed_at',
                'payment_completed_by',
                'is_legacy_payment'
            ]);
        });
    }
};
