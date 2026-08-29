<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VerifyDatabaseIntegrity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:verify-database-integrity';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify database integrity after migrations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('========================================');
        $this->info('DATABASE INTEGRITY VERIFICATION');
        $this->info('========================================');
        $this->newLine();

        $issues = 0;

        // Check 1: Verify broken foreign keys are removed
        $this->info('Check 1: Verifying broken foreign keys are removed...');
        $brokenFKs = [];
        
        if (Schema::hasColumn('payments', 'application_id')) {
            $brokenFKs[] = 'payments.application_id';
        }
        if (Schema::hasColumn('certificates', 'application_id')) {
            $brokenFKs[] = 'certificates.application_id';
        }
        if (Schema::hasColumn('reports', 'app_id')) {
            $brokenFKs[] = 'reports.app_id';
        }
        
        if (empty($brokenFKs)) {
            $this->info('✓ All broken foreign keys removed');
        } else {
            $this->error('✗ Found broken columns: ' . implode(', ', $brokenFKs));
            $issues += count($brokenFKs);
        }
        $this->newLine();

        // Check 2: Verify required columns exist
        $this->info('Check 2: Verifying required columns exist...');
        $missingColumns = [];
        
        if (!Schema::hasColumn('payments', 'user_id')) {
            $missingColumns[] = 'payments.user_id';
        }
        if (!Schema::hasColumn('certificates', 'user_id')) {
            $missingColumns[] = 'certificates.user_id';
        }
        if (!Schema::hasColumn('certificates', 'ready_at')) {
            $missingColumns[] = 'certificates.ready_at';
        }
        if (!Schema::hasColumn('certificates', 'released_at')) {
            $missingColumns[] = 'certificates.released_at';
        }
        
        if (empty($missingColumns)) {
            $this->info('✓ All required columns exist');
        } else {
            $this->error('✗ Missing columns: ' . implode(', ', $missingColumns));
            $issues += count($missingColumns);
        }
        $this->newLine();

        // Check 3: Verify critical indexes exist
        $this->info('Check 3: Verifying critical indexes exist...');
        $missingIndexes = [];
        
        $criticalIndexes = [
            'payments' => ['payments_user_id_index', 'payments_payment_status_index'],
            'certificates' => ['certificates_user_id_index', 'certificates_status_issued_composite'],
            'requests' => ['requests_status_index', 'requests_application_number_index'],
        ];
        
        foreach ($criticalIndexes as $table => $indexes) {
            foreach ($indexes as $index) {
                if (!$this->indexExists($table, $index)) {
                    $missingIndexes[] = "{$table}.{$index}";
                }
            }
        }
        
        if (empty($missingIndexes)) {
            $this->info('✓ All critical indexes exist');
        } else {
            $this->warn('⚠ Missing indexes: ' . implode(', ', $missingIndexes));
            $this->warn('  (Indexes improve performance but aren\'t critical)');
        }
        $this->newLine();

        // Check 4: Verify data integrity
        $this->info('Check 4: Verifying data integrity...');
        
        // Check for payments without user_id
        $paymentsWithoutUser = DB::table('payments')->whereNull('user_id')->count();
        if ($paymentsWithoutUser > 0) {
            $this->warn("⚠ Found {$paymentsWithoutUser} payments without user_id");
        } else {
            $this->info('✓ All payments have user_id');
        }
        
        // Check for certificates without user_id
        $certificatesWithoutUser = DB::table('certificates')->whereNull('user_id')->count();
        if ($certificatesWithoutUser > 0) {
            $this->warn("⚠ Found {$certificatesWithoutUser} certificates without user_id");
        } else {
            $this->info('✓ All certificates have user_id');
        }
        
        // Check for payments with verified status but no verified_by
        $verifiedWithoutVerifier = DB::table('payments')
            ->where('payment_status', 'verified')
            ->whereNull('verified_by')
            ->count();
        if ($verifiedWithoutVerifier > 0) {
            $this->warn("⚠ Found {$verifiedWithoutVerifier} verified payments without verified_by");
        } else {
            $this->info('✓ All verified payments have verified_by');
        }
        
        $this->newLine();

        // Check 5: Verify relationships
        $this->info('Check 5: Verifying model relationships...');
        
        // Check for orphaned payments
        $orphanedPayments = DB::table('payments')
            ->leftJoin('requests', 'payments.request_id', '=', 'requests.id')
            ->whereNull('requests.id')
            ->count();
        if ($orphanedPayments > 0) {
            $this->error("✗ Found {$orphanedPayments} orphaned payments (no matching request)");
            $issues++;
        } else {
            $this->info('✓ All payments linked to valid requests');
        }
        
        // Check for orphaned certificates
        $orphanedCertificates = DB::table('certificates')
            ->leftJoin('requests', 'certificates.request_id', '=', 'requests.id')
            ->whereNull('requests.id')
            ->count();
        if ($orphanedCertificates > 0) {
            $this->error("✗ Found {$orphanedCertificates} orphaned certificates (no matching request)");
            $issues++;
        } else {
            $this->info('✓ All certificates linked to valid requests');
        }
        
        $this->newLine();

        // Check 6: Verify enum values
        $this->info('Check 6: Verifying enum values...');
        
        // Check payment_method enum
        $invalidPaymentMethods = DB::table('payments')
            ->whereNotIn('payment_method', ['cash'])
            ->count();
        if ($invalidPaymentMethods > 0) {
            $this->warn("⚠ Found {$invalidPaymentMethods} payments with non-cash payment methods");
        } else {
            $this->info('✓ All payments use valid payment methods');
        }
        
        // Check certificate status enum
        $invalidCertStatuses = DB::table('certificates')
            ->whereNotIn('status', ['preparing', 'ready_for_pickup', 'released', 'cancelled'])
            ->count();
        if ($invalidCertStatuses > 0) {
            $this->error("✗ Found {$invalidCertStatuses} certificates with invalid status");
            $issues++;
        } else {
            $this->info('✓ All certificates have valid status');
        }
        
        $this->newLine();

        // Summary
        $this->info('========================================');
        if ($issues === 0) {
            $this->info('✓ DATABASE INTEGRITY CHECK PASSED');
            $this->info('All checks completed successfully!');
        } else {
            $this->error("✗ DATABASE INTEGRITY CHECK FAILED");
            $this->error("Found {$issues} critical issue(s) that need attention");
        }
        $this->info('========================================');

        return $issues === 0 ? 0 : 1;
    }

    /**
     * Check if an index exists
     */
    private function indexExists(string $table, string $index): bool
    {
        $indexes = DB::select("SHOW INDEXES FROM {$table} WHERE Key_name = ?", [$index]);
        return !empty($indexes);
    }
}
