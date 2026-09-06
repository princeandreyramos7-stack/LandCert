<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Request as ApplicationRequest;
use App\Services\CertificateService;
use App\Services\CertificatePDFService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CertificateController extends Controller
{
    protected $certificateService;
    protected $certificatePDFService;

    public function __construct(CertificateService $certificateService, CertificatePDFService $certificatePDFService)
    {
        $this->certificateService = $certificateService;
        $this->certificatePDFService = $certificatePDFService;
    }

    /**
     * Display a listing of certificates.
     */
    public function index(Request $request)
    {
        // Use the service method with filters
        $filters = [
            'status' => $request->status ?? 'all',
            'search' => $request->search ?? null,
            'from_date' => $request->from_date ?? null,
            'to_date' => $request->to_date ?? null,
        ];

        $certificates = $this->certificateService->getAllCertificates($filters);

        return Inertia::render('Admin/Certificates/Index', [
            'certificates' => $certificates,
            'filters' => $filters,
            'userType' => Auth::user()->user_type,
        ]);
    }

    /**
     * Display the specified certificate.
     */
    public function show(Certificate $certificate)
    {
        $certificate->load(['request.applicant', 'request.project', 'payment', 'issuedBy', 'releasedBy']);

        return Inertia::render('Admin/Certificates/Show', [
            'certificate' => $certificate,
        ]);
    }

    /**
     * Download certificate PDF.
     */
    public function download(Certificate $certificate)
    {
        try {
            return $this->certificatePDFService->download($certificate);
        } catch (\Exception $e) {
            \Log::error('Failed to download certificate', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->back()->with('error', 'Failed to download certificate. Please try again.');
        }
    }

    /**
     * Stream/preview certificate PDF.
     */
    public function preview(Certificate $certificate)
    {
        try {
            return $this->certificatePDFService->stream($certificate);
        } catch (\Exception $e) {
            \Log::error('Failed to preview certificate', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->back()->with('error', 'Failed to preview certificate. Please try again.');
        }
    }

    /**
     * Ensure the current user is allowed to view this certificate.
     */
    private function authorizeApplicantAccess(Certificate $certificate): void
    {
        $user = Auth::user();

        if (in_array($user->user_type, ['admin', 'super_admin'])) {
            return;
        }

        $ownsCertificate = $certificate->user_id === $user->id
            || ($certificate->request && $certificate->request->user_id === $user->id);

        abort_unless($ownsCertificate, 403, 'You are not authorized to access this certificate.');
    }

    /**
     * Applicant-facing certificate download (with ownership check).
     */
    public function applicantDownload(Certificate $certificate)
    {
        $this->authorizeApplicantAccess($certificate);

        try {
            return $this->certificatePDFService->download($certificate);
        } catch (\Exception $e) {
            \Log::error('Failed to download certificate', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Failed to download certificate. Please try again.');
        }
    }

    /**
     * Applicant-facing certificate preview (with ownership check).
     */
    public function applicantPreview(Certificate $certificate)
    {
        $this->authorizeApplicantAccess($certificate);

        try {
            return $this->certificatePDFService->stream($certificate);
        } catch (\Exception $e) {
            \Log::error('Failed to preview certificate', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Failed to preview certificate. Please try again.');
        }
    }

    /**
     * Store a newly created certificate.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:requests,id',
            'payment_id' => 'required|exists:payments,id',
            'certificate_number' => 'required|unique:certificates,certificate_number',
            'issued_at' => 'nullable|date',
            'valid_until' => 'nullable|date|after:issued_at',
            'notes' => 'nullable|string',
        ]);

        $validated['issued_by'] = Auth::id();
        $validated['status'] = 'preparing'; // Physical certificate needs signatures

        $certificate = Certificate::create($validated);

        return redirect()->back()->with('success', 'Physical certificate record created successfully.');
    }

    /**
     * Update the specified certificate.
     */
    public function update(Request $request, Certificate $certificate)
    {
        $validated = $request->validate([
            'certificate_number' => 'required|unique:certificates,certificate_number,' . $certificate->id,
            'issued_at' => 'nullable|date',
            'valid_until' => 'nullable|date',
            'status' => 'required|in:preparing,ready_for_pickup,released,cancelled',
            'notes' => 'nullable|string',
        ]);

        $certificate->update($validated);

        return redirect()->back()->with('success', 'Certificate updated successfully.');
    }

    /**
     * Mark certificate as ready for collection.
     */
    public function markReady(Request $request, Certificate $certificate)
    {
        try {
            $validated = $request->validate([
                'notes' => 'nullable|string|max:500',
            ]);

            $this->certificateService->markReady($certificate, $validated['notes'] ?? null);

            return redirect()->back()->with('success', 'Certificate marked as ready. Applicant has been notified via email, SMS, and in-app notification.');
        } catch (\Exception $e) {
            \Log::error('Failed to mark certificate ready', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->back()->with('error', 'Failed to mark certificate as ready. Please try again.');
        }
    }

    /**
     * Record certificate release/collection.
     */
    public function recordRelease(Request $request, Certificate $certificate)
    {
        try {
            $validated = $request->validate([
                'released_to_name' => 'required|string|max:255',
                'released_to_id_type' => 'nullable|string|max:100',
                'released_to_id_number' => 'nullable|string|max:100',
            ]);

            $this->certificateService->recordRelease($certificate, $validated);

            return redirect()->back()->with('success', 'Certificate release recorded successfully.');
        } catch (\Exception $e) {
            \Log::error('Failed to record certificate release', [
                'certificate_id' => $certificate->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->back()->with('error', 'Failed to record certificate release. Please try again.');
        }
    }

    /**
     * Upload certificate softcopy (digital PDF)
     */
    public function uploadSoftcopy(Request $request)
    {
        $validated = $request->validate([
            'certificate_id' => 'required|exists:certificates,id',
            'certificate_file' => 'required|file|mimes:pdf|max:10240', // 10MB max
        ]);

        $certificate = Certificate::findOrFail($validated['certificate_id']);

        // Delete old certificate file if exists
        if ($certificate->certificate_file_path && \Storage::disk('local')->exists($certificate->certificate_file_path)) {
            \Storage::disk('local')->delete($certificate->certificate_file_path);
        }

        // Store the new certificate file on the private disk with a non-guessable name
        $file = $request->file('certificate_file');
        $filename = time() . '_' . uniqid() . '.pdf';
        $path = $file->storeAs('certificates', $filename, 'local');

        // Update certificate record
        $certificate->update([
            'certificate_file_path' => $path,
        ]);

        // Log the action
        \App\Services\AuditLogService::logUpdate(
            'Certificate',
            $certificate->id,
            ['certificate_file_path' => $certificate->certificate_file_path],
            ['certificate_file_path' => $path],
            "Uploaded certificate softcopy for Certificate #{$certificate->certificate_number}"
        );

        return back()->with('success', 'Certificate softcopy uploaded successfully! Applicant can now download it.');
    }

    /**
     * Delete a certificate record.
     */
    public function destroy(Certificate $certificate)
    {
        $certificate->delete();

        return redirect()->back()->with('success', 'Certificate record deleted successfully.');
    }
}
