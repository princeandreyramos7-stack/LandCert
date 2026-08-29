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
     * COMPREHENSIVE DATABASE CLEANUP
     * This migration fixes all identified issues from system scan:
     * 1. Remove broken foreign keys to dropped 'applications' table
     * 2. Remove unused/redundant columns
     * 3. Add missing indexes for performance
     * 4. Add missing columns from recent code updates
     * 5. Fix data type inconsistencies
     */
    public function up(): void
    {
        // ====================================
        // SECTION 1: REMOVE BROKEN FOREIGN KEYS
        // ====================================
        
        $this->info('Removing broken foreign keys...');
        
        // Drop broken foreign key and column from payments table
        if (Schema::hasColumn('payments', 'application_id')) {
            Schema::table('payments', function (Blueprint $table) {
                // Try to drop foreign key if it exists
                try {
                    $table->dropForeign(['application_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, that's OK
                }
                $table->dropColumn('application_id');
            });
        }

        // Drop broken foreign key and column from certificates table  
        if (Schema::hasColumn('certificates', 'application_id')) {
            Schema::table('certificates', function (Blueprint $table) {
                // Try to drop foreign key if it exists
                try {
                    $table->dropForeign(['application_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, that's OK
                }
                $table->dropColumn('application_id');
            });
        }

        // Drop broken foreign key and column from reports table
        if (Schema::hasColumn('reports', 'app_id')) {
            Schema::table('reports', function (Blueprint $table) {
                // Try to drop foreign key if it exists
                try {
                    $table->dropForeign(['app_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist, that's OK
                }
                $table->dropColumn('app_id');
            });
        }

        // ====================================
        // SECTION 2: ADD MISSING COLUMNS
        // ====================================
        
        $this->info('Adding missing columns...');
        
        // Add user_id to payments (tracks who created/uploaded the payment)
        if (!Schema::hasColumn('payments', 'user_id')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->unsignedInteger('user_id')->nullable()->after('request_id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            });
            
            // Backfill user_id from requests
            DB::statement("
                UPDATE payments 
                JOIN requests ON payments.request_id = requests.id 
                SET payments.user_id = requests.user_id 
                WHERE payments.user_id IS NULL
            ");
        }

        // Add missing columns to certificates (if not already added)
        Schema::table('certificates', function (Blueprint $table) {
            if (!Schema::hasColumn('certificates', 'user_id')) {
                $table->unsignedInteger('user_id')->nullable()->after('payment_id');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            }
            
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

        // Backfill certificates user_id
        DB::statement("
            UPDATE certificates 
            JOIN requests ON certificates.request_id = requests.id 
            SET certificates.user_id = requests.user_id 
            WHERE certificates.user_id IS NULL
        ");

        // ====================================
        // SECTION 3: UPDATE ENUMS
        // ====================================
        
        $this->info('Updating enum values...');
        
        // Update payment_method enum (only cash)
        DB::statement("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash') DEFAULT 'cash'");

        // Update certificate status enum
        DB::statement("
            ALTER TABLE certificates 
            MODIFY COLUMN status ENUM('preparing', 'ready_for_pickup', 'released', 'cancelled') 
            DEFAULT 'preparing'
        ");

        // Migrate old certificate status values
        DB::statement("UPDATE certificates SET status = 'preparing' WHERE status = 'generated'");
        DB::statement("UPDATE certificates SET status = 'released' WHERE status = 'collected'");
        DB::statement("UPDATE certificates SET status = 'ready_for_pickup' WHERE status = 'sent'");

        // ====================================
        // SECTION 4: ADD MISSING INDEXES
        // ====================================
        
        $this->info('Adding missing indexes...');
        
        // Payments indexes
        $this->addIndexIfNotExists('payments', 'payments_user_id_index', ['user_id']);
        $this->addIndexIfNotExists('payments', 'payments_payment_status_index', ['payment_status']);
        $this->addIndexIfNotExists('payments', 'payments_payment_date_index', ['payment_date']);
        $this->addIndexIfNotExists('payments', 'payments_receipt_number_index', ['receipt_number']);
        $this->addIndexIfNotExists('payments', 'payments_status_date_composite', ['payment_status', 'payment_date']);
        $this->addIndexIfNotExists('payments', 'payments_request_status_composite', ['request_id', 'payment_status']);

        // Certificates indexes
        $this->addIndexIfNotExists('certificates', 'certificates_user_id_index', ['user_id']);
        $this->addIndexIfNotExists('certificates', 'certificates_payment_id_index', ['payment_id']);
        $this->addIndexIfNotExists('certificates', 'certificates_certificate_number_index', ['certificate_number']);
        $this->addIndexIfNotExists('certificates', 'certificates_status_issued_composite', ['status', 'issued_at']);

        // Add unique constraint on certificates.payment_id (one certificate per payment)
        if (!$this->hasIndex('certificates', 'certificates_payment_id_unique')) {
            // Clean up duplicate certificates first
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

        // Requests indexes
        $this->addIndexIfNotExists('requests', 'requests_application_number_index', ['application_number']);
        $this->addIndexIfNotExists('requests', 'requests_decision_number_index', ['decision_number']);
        $this->addIndexIfNotExists('requests', 'requests_status_index', ['status']);
        $this->addIndexIfNotExists('requests', 'requests_status_created_composite', ['status', 'created_at']);

        // Normalized tables indexes
        $this->addIndexIfNotExists('normalized_corporations', 'normalized_corporations_applicant_id_index', ['applicant_id']);
        $this->addIndexIfNotExists('normalized_projects', 'normalized_projects_request_id_index', ['request_id']);
        $this->addIndexIfNotExists('properties', 'properties_request_id_index', ['request_id']);
        $this->addIndexIfNotExists('locations', 'locations_request_id_index', ['request_id']);
        $this->addIndexIfNotExists('representatives', 'representatives_applicant_id_index', ['applicant_id']);
        $this->addIndexIfNotExists('representatives', 'representatives_is_primary_index', ['is_primary']);

        // Reports indexes
        $this->addIndexIfNotExists('reports', 'reports_request_id_index', ['request_id']);
        $this->addIndexIfNotExists('reports', 'reports_evaluation_index', ['evaluation']);

        // Requirement documents indexes
        $this->addIndexIfNotExists('requirement_documents', 'requirement_documents_request_id_index', ['request_id']);

        // ====================================
        // SECTION 5: REMOVE CONTROL_NUMBER (IF SAFE)
        // ====================================
        
        $this->info('Checking control_number for removal...');
        
        // Only remove control_number if application_number is populated for all records
        $recordsWithoutAppNumber = DB::table('requests')
            ->whereNull('application_number')
            ->count();
        
        if ($recordsWithoutAppNumber == 0 && Schema::hasColumn('requests', 'control_number')) {
            Schema::table('requests', function (Blueprint $table) {
                // Try to drop unique constraint if it exists
                try {
                    $table->dropUnique(['control_number']);
                } catch (\Exception $e) {
                    // Constraint might not exist, that's OK
                }
                $table->dropColumn('control_number');
            });
            $this->info('✓ Removed control_number column');
        } else {
            $this->info("⚠ Keeping control_number ({$recordsWithoutAppNumber} records without application_number)");
        }

        $this->info('✓ Database cleanup complete!');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration is a cleanup migration
        // Rolling it back would restore broken foreign keys which is not desirable
        // Manual restoration would be needed if rollback is absolutely necessary
        
        $this->info('⚠ This is a cleanup migration. Rollback would restore broken foreign keys.');
        $this->info('⚠ Manual intervention required for rollback.');
    }

    /**
     * Add an index if it doesn't already exist
     */
    private function addIndexIfNotExists(string $table, string $indexName, array $columns): void
    {
        if (!$this->hasIndex($table, $indexName)) {
            Schema::table($table, function (Blueprint $table) use ($indexName, $columns) {
                $table->index($columns, $indexName);
            });
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
     * Output info message
     */
    private function info(string $message): void
    {
        echo "[INFO] {$message}\n";
    }
};
