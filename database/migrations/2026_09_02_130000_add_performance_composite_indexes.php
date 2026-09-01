<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Add composite indexes for improved query performance
     * Based on database audit recommendations
     */
    public function up(): void
    {
        // Requests table composite indexes
        if (!$this->hasIndex('requests', 'requests_user_status_composite')) {
            Schema::table('requests', function (Blueprint $table) {
                $table->index(['user_id', 'status'], 'requests_user_status_composite');
            });
        }

        if (!$this->hasIndex('requests', 'requests_status_created_composite')) {
            Schema::table('requests', function (Blueprint $table) {
                $table->index(['status', 'created_at'], 'requests_status_created_composite');
            });
        }

        // Payments table composite indexes
        if (!$this->hasIndex('payments', 'payments_request_status_composite')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->index(['request_id', 'payment_status'], 'payments_request_status_composite');
            });
        }

        // Certificates table composite indexes
        if (!$this->hasIndex('certificates', 'certificates_status_issued_composite')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->index(['status', 'issued_at'], 'certificates_status_issued_composite');
            });
        }

        // Notifications table composite indexes
        if (!$this->hasIndex('notifications', 'notifications_user_read_composite')) {
            Schema::table('notifications', function (Blueprint $table) {
                $table->index(['user_id', 'read'], 'notifications_user_read_composite');
            });
        }

        // Additional useful composite indexes
        if (!$this->hasIndex('payments', 'payments_user_date_composite')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->index(['user_id', 'payment_date'], 'payments_user_date_composite');
            });
        }

        if (!$this->hasIndex('certificates', 'certificates_request_status_composite')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->index(['request_id', 'status'], 'certificates_request_status_composite');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropIndex('requests_user_status_composite');
            $table->dropIndex('requests_status_created_composite');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_request_status_composite');
            $table->dropIndex('payments_user_date_composite');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->dropIndex('certificates_status_issued_composite');
            $table->dropIndex('certificates_request_status_composite');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_user_read_composite');
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        $indexes = DB::select("SHOW INDEXES FROM {$table} WHERE Key_name = ?", [$index]);
        return !empty($indexes);
    }
};
