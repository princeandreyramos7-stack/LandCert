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
        Schema::table('payments', function (Blueprint $table) {
            // Index on receipt_number for duplicate checking (FR3.2)
            if (!$this->indexExists('payments', 'payments_receipt_number_index')) {
                $table->index('receipt_number');
            }

            // Composite index on request_id and payment_status for performance (NFR2)
            // Useful for queries that filter by request and payment status
            if (!$this->indexExists('payments', 'payments_request_id_payment_status_index')) {
                $table->index(['request_id', 'payment_status']);
            }
        });
    }

    /**
     * Check if an index exists on a table
     */
    private function indexExists(string $table, string $index): bool
    {
        $connection = Schema::getConnection();
        $databaseName = $connection->getDatabaseName();
        
        $result = $connection->select(
            "SELECT COUNT(*) as count FROM information_schema.statistics 
             WHERE table_schema = ? AND table_name = ? AND index_name = ?",
            [$databaseName, $table, $index]
        );
        
        return $result[0]->count > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_receipt_number_index');
            $table->dropIndex('payments_request_id_payment_status_index');
        });
    }
};
