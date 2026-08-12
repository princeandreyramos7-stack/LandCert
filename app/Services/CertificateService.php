<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Payment;
use App\Models\Request as RequestModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CertificateService
{
    /**
     * Auto-create certificate after payment is recorded
     */
    public function autoCreateFromPayment(Payment $payment): Certificate
    {
        // Load relationships if not already
        if (!$payment->relationLoaded('request')) {
            $payment->load('request.applicant', 'request.project');
        }

        $request = $payment->request;

        if (!$request) {
            throw new \Exception("Payment #{$payment->id} has no associated request.");
        }

        // Return existing certificate if already created for this request
        $existing = Certificate::where('request_id', $request->id)->first();
        if ($existing) {
            Log::info("Certificate already exists for request #{$request->id}", [
                'certificate_id' => $existing->id,
            ]);
            return $existing;
        }

        $certificateNumber = $this->generateCertificateNumber();

        $certificate = Certificate::create([
            'request_id'         => $request->id,
            'payment_id'         => $payment->id,
            'user_id'            => $request->user_id,
            'certificate_number' => $certificateNumber,
            'issued_by'          => auth()->id(),
            'issued_at'          => now(),
            'status'             => 'preparing',
            'notes'              => 'Auto-generated after payment confirmation',
        ]);

        // Update request status
        $request->update(['status' => 'certificate_preparing']);

        // Audit log
        try {
            AuditLogService::log(
                'certificate_created',
                "Certificate {$certificateNumber} auto-created for request #{$request->id}",
                'Certificate',
                $certificate->id,
                null,
                [
                    'certificate_number' => $certificateNumber,
                    'request_id'         => $request->id,
                    'payment_id'         => $payment->id,
                    'status'             => 'preparing',
                ]
            );
        } catch (\Exception $e) {
            Log::warning("Audit log failed for certificate creation: " . $e->getMessage());
        }

        Log::info("Certificate created successfully", [
            'certificate_id'     => $certificate->id,
            'certificate_number' => $certificateNumber,
            'request_id'         => $request->id,
            'payment_id'         => $payment->id,
        ]);

        return $certificate;
    }

    /**
     * Generate unique certificate number: CERT-{YEAR}-{5-digit-seq}
     */
    public function generateCertificateNumber(): string
    {
        $year = now()->year;

        $last = Certificate::where('certificate_number', 'like', "CERT-{$year}-%")
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = 1;
        if ($last) {
            preg_match('/CERT-\d{4}-(\d+)/', $last->certificate_number, $matches);
            $nextNumber = isset($matches[1]) ? intval($matches[1]) + 1 : 1;
        }

        $certNumber = sprintf("CERT-%d-%05d", $year, $nextNumber);

        // Ensure uniqueness
        while (Certificate::where('certificate_number', $certNumber)->exists()) {
            $nextNumber++;
            $certNumber = sprintf("CERT-%d-%05d", $year, $nextNumber);
        }

        return $certNumber;
    }

    /**
     * Mark certificate as ready for pickup and notify applicant
     */
    public function markReady(Certificate $certificate, ?string $notes = null): Certificate
    {
        return DB::transaction(function () use ($certificate, $notes) {
            $oldStatus = $certificate->status;

            $certificate->update([
                'status'   => 'ready_for_pickup',
                'ready_at' => now(),
                'notes'    => $notes ?? $certificate->notes,
            ]);

            if ($certificate->request) {
                $certificate->request->update(['status' => 'certificate_ready']);
            }

            // Send notifications (static call)
            try {
                NotificationService::certificateReady($certificate->request, $certificate);
            } catch (\Exception $e) {
                Log::error("Failed to send certificate ready notifications: " . $e->getMessage());
            }

            // Audit log
            try {
                AuditLogService::log(
                    'certificate_marked_ready',
                    "Certificate {$certificate->certificate_number} marked ready for pickup",
                    'Certificate',
                    $certificate->id,
                    ['status' => $oldStatus],
                    ['status' => 'ready_for_pickup', 'ready_at' => now()],
                    [
                        'certificate_number' => $certificate->certificate_number,
                        'request_id'         => $certificate->request_id,
                        'marked_by'          => auth()->id(),
                        'notes'              => $notes,
                    ]
                );
            } catch (\Exception $e) {
                Log::warning("Audit log failed for markReady: " . $e->getMessage());
            }

            Log::info("Certificate marked ready", [
                'certificate_id'     => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
            ]);

            return $certificate->fresh();
        });
    }

    /**
     * Record certificate release/collection
     */
    public function recordRelease(Certificate $certificate, array $data): Certificate
    {
        return DB::transaction(function () use ($certificate, $data) {
            $oldStatus = $certificate->status;

            $certificate->update([
                'status'                 => 'released',
                'released_at'            => now(),
                'released_by'            => auth()->id(),
                'released_to_name'       => $data['released_to_name'],
                'released_to_id_type'    => $data['released_to_id_type'] ?? null,
                'released_to_id_number'  => $data['released_to_id_number'] ?? null,
            ]);

            if ($certificate->request) {
                $certificate->request->update(['status' => 'released']);
            }

            // Audit log
            try {
                AuditLogService::log(
                    'certificate_released',
                    "Certificate {$certificate->certificate_number} released to {$data['released_to_name']}",
                    'Certificate',
                    $certificate->id,
                    ['status' => $oldStatus],
                    ['status' => 'released', 'released_at' => now(), 'released_to' => $data['released_to_name']],
                    [
                        'certificate_number'    => $certificate->certificate_number,
                        'request_id'            => $certificate->request_id,
                        'released_by'           => auth()->id(),
                        'released_to_name'      => $data['released_to_name'],
                        'released_to_id_type'   => $data['released_to_id_type'] ?? null,
                        'released_to_id_number' => $data['released_to_id_number'] ?? null,
                    ]
                );
            } catch (\Exception $e) {
                Log::warning("Audit log failed for recordRelease: " . $e->getMessage());
            }

            Log::info("Certificate released", [
                'certificate_id'     => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
                'released_to'        => $data['released_to_name'],
            ]);

            return $certificate->fresh();
        });
    }

    /**
     * Get all certificates with filters (paginated)
     */
    public function getAllCertificates(array $filters = [])
    {
        $query = Certificate::with(['request.applicant', 'request.project', 'payment', 'issuedBy'])
            ->orderBy('issued_at', 'desc');

        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['from_date'])) {
            $query->where('issued_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->where('issued_at', '<=', $filters['to_date']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('certificate_number', 'like', "%{$search}%")
                    ->orWhereHas('request.applicant', function ($q2) use ($search) {
                        $q2->where('applicant_name', 'like', "%{$search}%");
                    });
            });
        }

        return $query->paginate(25);
    }
}
