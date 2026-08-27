<?php

namespace App\Services;

use App\Models\Certificate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CertificatePDFService
{
    /**
     * Build the data array for the certificate template.
     */
    private function buildData(Certificate $certificate): array
    {
        $certificate->load(
            'request.applicant',
            'request.applicant.corporation',
            'request.project',
            'request.location',
            'payment'
        );

        $req        = $certificate->request;
        $applicant  = $req->applicant;
        $project    = $req->project;
        $location   = $req->location;
        $corp       = $applicant->corporation ?? null;
        $payment    = $certificate->payment;

        // Build full address
        $addressParts = array_filter([
            $location->street_address ?? null,
            $location->barangay       ?? null,
            $location->city_municipality ?? null,
            $location->province       ?? null,
        ]);
        $fullAddress = implode(', ', $addressParts) ?: ($applicant->applicant_address ?? 'N/A');

        $projectType = $project->project_type ?? 'N/A';

        return [
            'certificate'       => $certificate,
            'request'           => $req,
            'applicant'         => $applicant,
            'project'           => $project,
            'location'          => $location,
            'payment'           => $payment,

            // Certificate meta
            'certificateNumber' => $certificate->certificate_number,
            'applicationNumber' => $req->application_number ?? 'N/A',
            'decisionNumber'    => $req->decision_number ?? 'N/A',
            'issueDate'         => $certificate->issued_at->format('F d, Y'),
            'issueDateShort'    => $certificate->issued_at->format('F j, Y'),

            // Applicant
            'applicantName'     => strtoupper($applicant->applicant_name ?? 'N/A'),
            'applicantAddress'  => strtoupper($applicant->applicant_address ?? 'N/A'),
            'projectAddress'    => strtoupper($fullAddress),

            // Corporation
            'corporationName'   => strtoupper($corp->corporation_name ?? ''),
            'corporationAddress'=> strtoupper($corp->corporation_address ?? ''),

            // Project
            'projectType'       => $projectType,
            'projectNature'     => $project->project_nature ?? 'N/A',
            'projectDescription'=> strtoupper($project->project_description ?? ($project->project_nature ?? 'N/A')),
            'projectCost'       => $project->project_cost ? '₱' . number_format($project->project_cost, 2) : 'N/A',

            // Payment
            'orNumber'          => $payment->receipt_number ?? 'N/A',
            'paymentAmount'     => $payment ? '₱' . number_format($payment->amount, 2) : 'N/A',
            'paymentAmountRaw'  => $payment->amount ?? 0,
        ];
    }

    /**
     * Download PDF certificate.
     */
    public function download(Certificate $certificate)
    {
        // Check if a softcopy (uploaded PDF) exists
        if ($certificate->certificate_file_path && Storage::disk('local')->exists($certificate->certificate_file_path)) {
            return Storage::disk('local')->download($certificate->certificate_file_path, $this->generateFilename($certificate));
        }
        
        // Otherwise, generate PDF on the fly (fallback for backward compatibility)
        $data = $this->buildData($certificate);
        $pdf  = $this->makePdf($data);
        return $pdf->download($this->generateFilename($certificate));
    }

    /**
     * Stream PDF certificate (for preview).
     */
    public function stream(Certificate $certificate)
    {
        // Check if a softcopy (uploaded PDF) exists
        if ($certificate->certificate_file_path && Storage::disk('local')->exists($certificate->certificate_file_path)) {
            return response()->file(Storage::disk('local')->path($certificate->certificate_file_path));
        }
        
        // Otherwise, generate PDF on the fly (fallback for backward compatibility)
        $data = $this->buildData($certificate);
        $pdf  = $this->makePdf($data);
        return $pdf->stream($this->generateFilename($certificate));
    }

    /**
     * Generate and save PDF to storage.
     */
    public function generate(Certificate $certificate): string
    {
        $data = $this->buildData($certificate);
        $pdf  = $this->makePdf($data);

        $filename = $this->generateFilename($certificate);
        $path     = "certificates/{$filename}";
        Storage::disk('local')->put($path, $pdf->output());
        $certificate->update(['certificate_file_path' => $path]);

        Log::info("Certificate PDF generated", [
            'certificate_id'     => $certificate->id,
            'certificate_number' => $certificate->certificate_number,
            'file_path'          => $path,
        ]);

        return $path;
    }

    private function makePdf(array $data)
    {
        $pdf = Pdf::loadView('certificates.template', $data);
        $pdf->setPaper('a4', 'portrait');
        return $pdf;
    }

    private function generateFilename(Certificate $certificate): string
    {
        return sprintf(
            'Certificate_%s_%s.pdf',
            $certificate->certificate_number,
            now()->format('Ymd_His')
        );
    }
}
