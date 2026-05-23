<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Drop foreign key constraint first before dropping the column
            if (Schema::hasColumn('payments', 'payment_completed_by')) {
                $table->dropForeign(['payment_completed_by']);
                $table->dropColumn('payment_completed_by');
            }
            
            if (Schema::hasColumn('payments', 'payment_order_number')) {
                $table->dropColumn('payment_order_number');
            }
            if (Schema::hasColumn('payments', 'payment_order_generated_at')) {
                $table->dropColumn('payment_order_generated_at');
            }
            if (Schema::hasColumn('payments', 'payment_order_pdf_path')) {
                $table->dropColumn('payment_order_pdf_path');
            }
            if (Schema::hasColumn('payments', 'treasury_receipt_number')) {
                $table->dropColumn('treasury_receipt_number');
            }
            if (Schema::hasColumn('payments', 'payment_completed_at')) {
                $table->dropColumn('payment_completed_at');
            }
        });
    }

    public function down(): void
    {
        // No need to restore
    }
};
