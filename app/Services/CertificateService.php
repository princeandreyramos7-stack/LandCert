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

        // The existence check and the number generation + insert happen
        // under one lock: without it, two near-simultaneous calls for the
        // same request could both see "none yet", both compute the same
        // next number, and both insert - the unique certificate_number
        // index would then reject one with an uncaught exception instead of
        // this just quietly returning the other call's certificate.
        [$certificate, $certificateNumber] = Certificate::underIssuanceLock(function () use ($request, $payment) {
            $existing = Certificate::where('request_id', $request->id)->first();
            if ($existing) {
                Log::info("Certificate already exists for request #{$request->id}", [
                    'certificate_id' => $existing->id,
                ]);
                return [$existing, $existing->certificate_number];
            }

            $certificateNumber = $this->generateCertificateNumber();

            $certificate = Certificate::create([
                'request_id'         => $request->id,
                'payment_id'         => $payment->id,
                'user_id'            => $request->user_id,
                'certificate_number' => $certificateNumber,
                'issued_by'          => auth()->id(),
                'issued_at'          => now(),
                'valid_until'        => now()->addMonths(self::validityMonths()),
                'status'             => 'preparing',
                'notes'              => 'Auto-generated after payment confirmation',
            ]);

            return [$certificate, $certificateNumber];
        });

        // Already existed - the rest of this method (marking ready, the
        // audit log, notifications) already ran the first time; running it
        // again for the same certificate would double-log and double-notify.
        if ($certificate->wasRecentlyCreated === false) {
            return $certificate;
        }

        // Update request status to certificate_ready immediately since certificate is generated
        $request->update(['status' => 'certificate_ready']);
        
        // Also mark the certificate as ready for pickup immediately
        $certificate->update([
            'status' => 'ready_for_pickup',
            'ready_at' => now(),
        ]);

        // Audit log
        try {
            AuditLogService::log(
                'certificate_created',
                "Certificate {$certificateNumber} auto-created and marked ready for request #{$request->id}",
                'Certificate',
                $certificate->id,
                null,
                [
                    'certificate_number' => $certificateNumber,
                    'request_id'         => $request->id,
                    'payment_id'         => $payment->id,
                    'status'             => 'ready_for_pickup',
                ]
            );
        } catch (\Exception $e) {
            Log::warning("Audit log failed for certificate creation: " . $e->getMessage());
        }
        
        // Send notifications that certificate is ready
        try {
            NotificationService::certificateReady($request, $certificate);
        } catch (\Exception $e) {
            Log::error("Failed to send certificate ready notifications: " . $e->getMessage());
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

            // Notify applicant certificate has been released
            try {
                $certRequest = $certificate->request()->with('user')->first();
                $certUser = $certRequest?->user;
                if ($certUser) {
                    $phone = app(\App\Services\SmsService::class)->resolvePhone($certUser);
                    if ($phone) {
                        app(\App\Services\SmsService::class)->sendCertificateReleased(
                            $phone,
                            $certUser->name,
                            $certificate->certificate_number ?? (string) $certificate->id
                        );
                    }
                }
            } catch (\Exception $e) {
                Log::error("Failed to send certificate released SMS: " . $e->getMessage());
            }

            return $certificate->fresh();
        });
    }

    /**
     * How long a certificate is good for, from the Certificates settings
     * (certificate_expiry_months). Twelve months when nothing is set.
     */
    public static function validityMonths(): int
    {
        try {
            $months = (int) DB::table('system_settings')->where('key', 'certificate_expiry_months')->value('value');
        } catch (\Throwable $e) {
            $months = 0;
        }

        return $months > 0 ? $months : 12;
    }

    /**
     * Withdraw an issued certificate. The record stays - the public
     * verification page now answers "revoked" for it, with the reason, which
     * is the whole point: a paper copy in circulation can be checked.
     */
    public function revoke(Certificate $certificate, string $reason): Certificate
    {
        return DB::transaction(function () use ($certificate, $reason) {
            $certificate->update([
                'revoked_at'        => now(),
                'revoked_by'        => auth()->id(),
                'revocation_reason' => $reason,
            ]);

            try {
                AuditLogService::log(
                    'certificate_revoked',
                    "Certificate {$certificate->certificate_number} revoked: {$reason}",
                    'Certificate',
                    $certificate->id,
                    ['revoked_at' => null],
                    ['revoked_at' => now(), 'revocation_reason' => $reason],
                    [
                        'certificate_number' => $certificate->certificate_number,
                        'request_id'         => $certificate->request_id,
                        'revoked_by'         => auth()->id(),
                    ]
                );
            } catch (\Exception $e) {
                Log::warning("Audit log failed for revoke: " . $e->getMessage());
            }

            return $certificate->fresh();
        });
    }

    /** Undo a revocation - the certificate verifies as valid again. */
    public function reinstate(Certificate $certificate): Certificate
    {
        return DB::transaction(function () use ($certificate) {
            $reason = $certificate->revocation_reason;

            $certificate->update([
                'revoked_at'        => null,
                'revoked_by'        => null,
                'revocation_reason' => null,
            ]);

            try {
                AuditLogService::log(
                    'certificate_reinstated',
                    "Certificate {$certificate->certificate_number} reinstated",
                    'Certificate',
                    $certificate->id,
                    ['revocation_reason' => $reason],
                    ['revoked_at' => null],
                    [
                        'certificate_number' => $certificate->certificate_number,
                        'request_id'         => $certificate->request_id,
                        'reinstated_by'      => auth()->id(),
                    ]
                );
            } catch (\Exception $e) {
                Log::warning("Audit log failed for reinstate: " . $e->getMessage());
            }

            return $certificate->fresh();
        });
    }

    /**
     * Get all certificates with filters (paginated)
     */
    public function getAllCertificates(array $filters = [])
    {
        $archived = !empty($filters['archived']);

        $query = Certificate::with(['request.applicant', 'request.project', 'request.releaser', 'payment', 'issuedBy'])
            // Only show certificates with verified payments
            ->whereHas('payment', function ($q) {
                $q->where('payment_status', 'verified');
            })
            // An archived application (App\Console\Commands\ArchiveApplications)
            // is off the live board, so its certificate defaults off this list
            // too - the 'archived' filter still reaches it.
            ->whereHas('request', fn ($q) => $q->{$archived ? 'whereNotNull' : 'whereNull'}('archived_at'))
            ->orderBy('issued_at', 'desc');

        // Released means handed to the applicant, which is what the badge in the
        // list shows and what the release dialog records. This used to filter on
        // whether a softcopy had been uploaded instead — a different thing
        // entirely — so choosing "Released" returned a set that disagreed with
        // the Released badges on screen.
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'preparing') {
                $query->whereHas('request', fn ($q) => $q->whereNull('released_to_applicant_at'));
            } elseif ($filters['status'] === 'released') {
                $query->whereHas('request', fn ($q) => $q->whereNotNull('released_to_applicant_at'));
            }
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
                    ->orWhereHas('request', function ($q2) use ($search) {
                        $q2->where('application_number', 'like', "%{$search}%")
                            ->orWhere('decision_number', 'like', "%{$search}%");
                    })
                    ->orWhereHas('request.applicant', function ($q2) use ($search) {
                        $q2->where('applicant_name', 'like', "%{$search}%");
                    });
            });
        }

        return $query->paginate(25);
    }
}
