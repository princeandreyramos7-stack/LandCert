<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request as RequestModel;
use App\Models\Certificate;
use App\Models\Payment;
use App\Services\CertificateService;

class FixStuckCertificates extends Command
{
    protected $signature = 'fix:stuck-certificates';
    protected $description = 'Fix applications stuck at payment_confirmed or certificate_preparing status';

    public function handle()
    {
        $this->info('Fixing stuck certificates...');
        $this->newLine();

        // Fix 1: Applications at payment_confirmed with verified payments but no certificate
        $this->info('[1] Finding applications at payment_confirmed with no certificate...');
        $fixed1 = $this->fixMissingCertificates();

        $this->newLine();

        // Fix 2: Applications at certificate_preparing that should be certificate_ready
        $this->info('[2] Finding applications at certificate_preparing that should be ready...');
        $fixed2 = $this->fixCertificatePreparingStatus();

        $this->newLine();
        $this->info("=================================");
        $this->info("Total Summary:");
        $this->info("  Applications with missing certificates fixed: {$fixed1}");
        $this->info("  Applications status updated to certificate_ready: {$fixed2}");
        $this->info("=================================");

        return 0;
    }

    private function fixMissingCertificates(): int
    {
        // Find all requests with payment_confirmed status that have verified payments but no certificate
        $stuckRequests = RequestModel::where('status', 'payment_confirmed')
            ->whereHas('payments', function ($query) {
                $query->where('payment_status', 'verified');
            })
            ->whereDoesntHave('certificates')
            ->with('payments')
            ->get();

        if ($stuckRequests->isEmpty()) {
            $this->info('  No stuck applications found.');
            return 0;
        }

        $this->info("  Found {$stuckRequests->count()} stuck application(s)");

        $certificateService = app(CertificateService::class);
        $fixed = 0;
        $failed = 0;

        foreach ($stuckRequests as $request) {
            $payment = $request->payments()->where('payment_status', 'verified')->latest()->first();
            
            if (!$payment) {
                $this->warn("  Request #{$request->id} has no verified payment, skipping");
                continue;
            }

            try {
                $certificate = $certificateService->autoCreateFromPayment($payment);
                $this->info("  ✓ Created certificate {$certificate->certificate_number} for request #{$request->id}");
                $fixed++;
            } catch (\Exception $e) {
                $this->error("  ✗ Failed to create certificate for request #{$request->id}: {$e->getMessage()}");
                $failed++;
            }
        }

        if ($failed > 0) {
            $this->warn("  Failed: {$failed}");
        }

        return $fixed;
    }

    private function fixCertificatePreparingStatus(): int
    {
        // Find all requests at certificate_preparing status with existing certificates
        $preparingRequests = RequestModel::where('status', 'certificate_preparing')
            ->whereHas('certificates')
            ->with('certificates')
            ->get();

        if ($preparingRequests->isEmpty()) {
            $this->info('  No applications found at certificate_preparing status.');
            return 0;
        }

        $this->info("  Found {$preparingRequests->count()} application(s) at certificate_preparing status");

        $fixed = 0;

        foreach ($preparingRequests as $request) {
            $certificate = $request->certificates()->latest()->first();
            
            if (!$certificate) {
                continue;
            }

            try {
                // Update request status to certificate_ready
                $request->update(['status' => 'certificate_ready']);
                
                // Update certificate status to ready_for_pickup if not already
                if ($certificate->status !== 'ready_for_pickup') {
                    $certificate->update([
                        'status' => 'ready_for_pickup',
                        'ready_at' => now(),
                    ]);
                }
                
                $this->info("  ✓ Updated request #{$request->id} (App #: {$request->application_number}) to certificate_ready");
                $fixed++;
            } catch (\Exception $e) {
                $this->error("  ✗ Failed to update request #{$request->id}: {$e->getMessage()}");
            }
        }

        return $fixed;
    }
}
