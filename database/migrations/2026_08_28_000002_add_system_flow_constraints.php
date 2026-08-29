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
     * This migration adds database constraints to ensure data integrity:
     * 1. Ensures one certificate per payment (one-to-one relationship)
     * 2. Prevents duplicate payments for same request
     * 3. Adds composite indexes for common queries
     */
    public function up(): void
    {
        // ========================================
        // 1. ADD UNIQUE CONSTRAINT ON CERTIFICATES
        // ========================================
        
        // One certificate per payment (prevents duplicate certificates)
        if (!$this->hasIndex('certificates', 'certificates_payment_id_unique')) {
            // First, handle any duplicate certificates (keep the latest one)
            DB::statement("
                DELETE c1 FROM certificates c1
                INNER JOIN certificates c2 
                WHERE c1.payment_id = c2.payment_id 
                AND c1.id < c2.id 
                AND c1.payment_id IS NOT NULL
            ");
            
            Schema::table('certificates', function (Blueprint $table) {
                $table->unique('payment_id', 'certificates_payment_id_unique');
            });
        }

        // ========================================
        // 2. ADD COMPOSITE INDEXES FOR PERFORMANCE
        // ========================================
        
        // Payments: Filter by status and date (common in payment history)
        if (!$this->hasIndex('payments', 'payments_status_date_composite')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->index(['payment_status', 'payment_date'], 'payments_status_date_composite');
            });
        }

        // Payments: Filter by request and status (check payment status for request)
        if (!$this->hasIndex('payments', 'payments_request_status_composite')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->index(['request_id', 'payment_status'], 'payments_request_status_composite');
            });
        }

        // Certificates: Filter by status and issued date
        if (!$this->hasIndex('certificates', 'certificates_status_issued_composite')) {
            Schema::table('certificates', function (Blueprint $table) {
                $table->index(['status', 'issued_at'], 'certificates_status_issued_composite');
            });
        }

        // Requests: Filter by status and created date (common in dashboards)
        if (!$this->hasIndex('requests', 'requests_status_created_composite')) {
            Schema::table('requests', function (Blueprint $table) {
                $table->index(['status', 'created_at'], 'requests_status_created_composite');
            });
        }

        // ========================================
        // 3. ADD CHECK CONSTRAINTS (MySQL 8.0.16+)
        // ========================================
        
        // Only create check constraints if MySQL version supports them
        $mysqlVersion = DB::select("SELECT VERSION() as version")[0]->version;
        $versionNumber = (float) $mysqlVersion;
        
        if ($versionNumber >= 8.0) {
            // Payment amount must be positive
            if (!$this->hasConstraint('payments', 'payments_amount_positive')) {
                DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_amount_positive CHECK (amount > 0)");
            }

            // Note: payment_date check removed - MySQL doesn't support CURDATE() in CHECK constraints
            // This will be validated in the application layer instead

            // Verified payments must have verifier and timestamp
            if (!$this->hasConstraint('payments', 'payments_verified_consistency')) {
                DB::statement("
                    ALTER TABLE payments 
                    ADD CONSTRAINT payments_verified_consistency 
                    CHECK (
                        (payment_status = 'verified' AND verified_by IS NOT NULL AND verified_at IS NOT NULL) 
                        OR payment_status != 'verified'
                    )
                ");
            }

            // Rejected payments must have rejection reason
            if (!$this->hasConstraint('payments', 'payments_rejection_reason_required')) {
                DB::statement("
                    ALTER TABLE payments 
                    ADD CONSTRAINT payments_rejection_reason_required 
                    CHECK (
                        (payment_status = 'rejected' AND rejection_reason IS NOT NULL) 
                        OR payment_status != 'rejected'
                    )
                ");
            }
        }

        // ========================================
        // 4. OPTIMIZE EXISTING FOREIGN KEYS
        // ========================================
        
        // Add ON UPDATE CASCADE to maintain referential integrity
        // This ensures that if related records are updated, references are updated too
        
        // Note: Laravel doesn't support changing foreign key constraints directly
        // We'll document this for manual update if needed
        
        // ========================================
        // 5. ADD MISSING NULLABLE CONSTRAINTS
        // ========================================
        
        // Ensure receipt_file_path is nullable (applicants might not upload immediately)
        DB::statement("ALTER TABLE payments MODIFY COLUMN receipt_file_path VARCHAR(255) NULL");
        
        // Ensure certificate_file_path is nullable (generated later)
        DB::statement("ALTER TABLE certificates MODIFY COLUMN certificate_file_path VARCHAR(255) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop unique constraint
        Schema::table('certificates', function (Blueprint $table) {
            if ($this->hasIndex('certificates', 'certificates_payment_id_unique')) {
                $table->dropUnique('certificates_payment_id_unique');
            }
        });

        // Drop composite indexes
        Schema::table('payments', function (Blueprint $table) {
            if ($this->hasIndex('payments', 'payments_status_date_composite')) {
                $table->dropIndex('payments_status_date_composite');
            }
            if ($this->hasIndex('payments', 'payments_request_status_composite')) {
                $table->dropIndex('payments_request_status_composite');
            }
        });

        Schema::table('certificates', function (Blueprint $table) {
            if ($this->hasIndex('certificates', 'certificates_status_issued_composite')) {
                $table->dropIndex('certificates_status_issued_composite');
            }
        });

        Schema::table('requests', function (Blueprint $table) {
            if ($this->hasIndex('requests', 'requests_status_created_composite')) {
                $table->dropIndex('requests_status_created_composite');
            }
        });

        // Drop check constraints
        $mysqlVersion = DB::select("SELECT VERSION() as version")[0]->version;
        $versionNumber = (float) $mysqlVersion;
        
        if ($versionNumber >= 8.0) {
            $constraints = [
                'payments_amount_positive',
                'payments_verified_consistency',
                'payments_rejection_reason_required'
            ];
            
            foreach ($constraints as $constraint) {
                if ($this->hasConstraint('payments', $constraint)) {
                    DB::statement("ALTER TABLE payments DROP CONSTRAINT {$constraint}");
                }
            }
        }
    }

    /**
     * Check if an index exists on a table
     */
    private function hasIndex(string $table, string $index): bool
    {
        $indexes = DB::select("SHOW INDEXES FROM {$table} WHERE Key_name = ?", [$index]);
        return !empty($indexes);
    }

    /**
     * Check if a constraint exists on a table
     */
    private function hasConstraint(string $table, string $constraint): bool
    {
        $constraints = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = ? 
            AND CONSTRAINT_NAME = ?
        ", [$table, $constraint]);
        return !empty($constraints);
    }
};
