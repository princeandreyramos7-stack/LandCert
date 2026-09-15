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
    protected $description = 'Fix applications stuck at payment_confirmed by creating missing certificates';

    public function handle()
    {
        $this->info('Finding applications stuck at payment_confirmed...');

        // Find all requests with payment_confirmed status that have verified payments but no certificate
        $stuckRequests = RequestModel::where('status', 'payment_confirmed')
            ->whereHas('payments', function ($query) {
                $query->where('payment_status', 'verified');
            })
            ->whereDoesntHave('certificate')
            ->with('payments')
            ->get();

        if ($stuckRequests->isEmpty()) {
            $this->info('No stuck applications found!');
            return 0;
        }

        $this->info("Found {$stuckRequests->count()} stuck application(s)");

        $certificateService = app(CertificateService::class);
        $fixed = 0;
        $failed = 0;

        foreach ($stuckRequests as $request) {
            $payment = $request->payments()->where('payment_status', 'verified')->latest()->first();
            
            if (!$payment) {
                $this->warn("Request #{$request->id} has no verified payment, skipping");
                continue;
            }

            try {
                $certificate = $certificateService->autoCreateFromPayment($payment);
                $this->info("✓ Created certificate {$certificate->certificate_number} for request #{$request->id}");
                $fixed++;
            } catch (\Exception $e) {
                $this->error("✗ Failed to create certificate for request #{$request->id}: {$e->getMessage()}");
                $failed++;
            }
        }

        $this->newLine();
        $this->info("Summary:");
        $this->info("  Fixed: {$fixed}");
        if ($failed > 0) {
            $this->warn("  Failed: {$failed}");
        }

        return 0;
    }
}
