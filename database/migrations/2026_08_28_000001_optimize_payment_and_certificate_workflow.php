<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration optimizes the payment and certificate workflow based on recent updates:
     * 1. Adds user_id to payments to track who uploaded/created the payment
     * 2. Adds user_id to certificates to track ownership
     * 3. Ensures proper indexes for performance
     * 4. Removes unused payment methods (keeping only 'cash')
     * 5. Updates certificate status enum for clearer workflow
     */
    public function up(): void
    {
        // ========================================
        // 1. UPDATE PAYMENTS TABLE
        // ========================================
        
        Schema::table('payments', function (Blueprint $table) {
            // Add user_id to track who created/uploaded the payment
            // For admin-recorded payments: admin's user_id
            // For applicant-uploaded payments: applicant's user_id
            if (!Schema::hasColumn('payments', 'user_id')) {
                $table->unsignedInteger('user_id')->nullable()->after('request_id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            }
        });

        // Update payment_method enum to only include 'cash' (as per requirements)
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash') DEFAULT 'cash'");

        // Add index for payment_status if not exists
        if (!$this->hasIndex('payments', 'payments_payment_status_index')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->index('payment_status', 'payments_payment_status_index');
            });
        }

        // Add index for payment_date if not exists
        if (!$this->hasIndex('payments', 'payments_payment_date_index')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->index('payment_date', 'payments_payment_date_index');
            });
        }

        // Add index for receipt_number if not exists
        if (!$this->hasIndex('payments', 'payments_receipt_number_index')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->index('receipt_number', 'payments_receipt_number_index');
            });
        }

        // ========================================
        // 2. UPDATE CERTIFICATES TABLE
        // ========================================
        
        Schema::table('certificates', function (Blueprint $table) {
            // Add user_id to track certificate ownership (applicant)
            if (!Schema::hasColumn('certificates', 'user_id')) {
                $table->unsignedInteger('user_id')->nullable()->after('payment_id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            }
            
            // Add fields for certificate release tracking
            if (!Schema::hasColumn('certificates', 'ready_at')) {
                $table->timestamp('ready_at')->nullable()->after('issued_at');
            }
            
            if (!Schema::hasColumn('certificates', 'released_at')) {
                $table->timestamp('released_at')->nullable()->after('ready_at');
            }
            
            if (!Schema::hasColumn('certificates', 'released_by')) {
                $table->unsignedInteger('released_by')->nullable()->after('released_at');
                $table->foreign('released_by')->references('id')->on('users')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('certificates', 'released_to_name')) {
                $table->string('released_to_name')->nullable()->after('released_by');
            }
            
            if (!Schema::hasColumn('certificates', 'released_to_id_type')) {
                $table->string('released_to_id_type', 100)->nullable()->after('released_to_name');
            }
            
            if (!Schema::hasColumn('certificates', 'released_to_id_number')) {
                $table->string('released_to_id_number', 100)->nullable()->after('released_to_id_type');
            }
            
            if (!Schema::hasColumn('certificates', 'release_signature_path')) {
                $table->string('release_signature_path')->nullable()->after('released_to_id_number');
            }
        });

        // Update certificate status enum to reflect actual workflow
        // preparing: Certificate created, being prepared
        // ready_for_pickup: Certificate ready to be collected
        // released: Certificate has been released/collected
        // cancelled: Certificate cancelled
        DB::statement("ALTER TABLE certificates MODIFY COLUMN status ENUM('preparing', 'ready_for_pickup', 'released', 'cancelled') DEFAULT 'preparing'");

        // Add index for certificate_number if not exists
        if (!$this->hasIndex('certificates', 'certificates_certificate_number_index')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->index('certificate_number', 'certificates_certificate_number_index');
            });
        }

        // Add index for payment_id if not exists (for filtering verified payments)
        if (!$this->hasIndex('certificates', 'certificates_payment_id_index')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->index('payment_id', 'certificates_payment_id_index');
            });
        }

        // ========================================
        // 3. UPDATE REQUESTS TABLE
        // ========================================
        
        // Ensure application_number is indexed for fast lookups
        if (!$this->hasIndex('requests', 'requests_application_number_index')) {
            Schema::table('requests', function (Blueprint $table) {
                $table->index('application_number', 'requests_application_number_index');
            });
        }

        // Ensure status is indexed for filtering
        if (!$this->hasIndex('requests', 'requests_status_index')) {
            Schema::table('requests', function (Blueprint $table) {
                $table->index('status', 'requests_status_index');
            });
        }

        // ========================================
        // 4. BACKFILL DATA
        // ========================================
        
        // Backfill user_id in payments from requests
        DB::statement("
            UPDATE payments 
            JOIN requests ON payments.request_id = requests.id 
            SET payments.user_id = requests.user_id 
            WHERE payments.user_id IS NULL
        ");

        // Backfill user_id in certificates from requests
        DB::statement("
            UPDATE certificates 
            JOIN requests ON certificates.request_id = requests.id 
            SET certificates.user_id = requests.user_id 
            WHERE certificates.user_id IS NULL
        ");

        // Update old certificate status values to new enum
        DB::statement("
            UPDATE certificates 
            SET status = 'preparing' 
            WHERE status = 'generated'
        ");

        DB::statement("
            UPDATE certificates 
            SET status = 'released' 
            WHERE status = 'collected'
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove added columns from payments
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });

        // Remove added columns from certificates
        Schema::table('certificates', function (Blueprint $table) {
            $columns = [
                'user_id', 'ready_at', 'released_at', 'released_by',
                'released_to_name', 'released_to_id_type', 'released_to_id_number',
                'release_signature_path'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('certificates', $column)) {
                    if (in_array($column, ['user_id', 'released_by'])) {
                        $table->dropForeign(['released_by']);
                    }
                    $table->dropColumn($column);
                }
            }
        });

        // Revert enum changes
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash', 'bank_transfer', 'gcash', 'paymaya', 'check', 'other') DEFAULT 'cash'");
        DB::statement("ALTER TABLE certificates MODIFY COLUMN status ENUM('generated', 'sent', 'collected') DEFAULT 'generated'");
    }

    /**
     * Check if an index exists on a table
     */
    private function hasIndex(string $table, string $index): bool
    {
        $indexes = DB::select("SHOW INDEXES FROM {$table} WHERE Key_name = ?", [$index]);
        return !empty($indexes);
    }
};
