<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\CertificateRelease;
use App\Models\Request as ApplicationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Display a listing of certificates.
     */
    public function index(Request $request)
    {
        $query = Certificate::with(['request', 'payment', 'issuedBy', 'release.releasedBy']);

        // Filter by status
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('certificate_number', 'like', "%{$search}%")
                  ->orWhereHas('request', function ($req) use ($search) {
                      $req->where('applicant_name', 'like', "%{$search}%");
                  });
            });
        }

        $certificates = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('SuperAdmin/Certificates', [
            'certificates' => $certificates,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
            ],
        ]);
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
    public function markReady(Certificate $certificate)
    {
        $certificate->update([
            'status' => 'ready_for_pickup',
            'ready_at' => now(),
        ]);

        // Send notification to applicant
        try {
            $requestModel = $certificate->request;
            if ($requestModel && $requestModel->user) {
                // Send email notification
                // TODO: Create CertificateReadyForPickup mailable
                
                // Send SMS notification
                if ($requestModel->user->contact_number) {
                    app(\App\Services\SmsService::class)->sendMessage(
                        $requestModel->user->contact_number,
                        "CPDO: Your certificate ({$certificate->certificate_number}) is ready for pickup at our office. Please bring a valid ID."
                    );
                }
                
                // Create in-app notification
                \App\Models\Notification::createForUser(
                    $requestModel->user_id,
                    'certificate_ready',
                    'Certificate Ready for Pickup',
                    "Your certificate {$certificate->certificate_number} is ready for collection at the CPDO office. Please bring a valid government-issued ID.",
                    "/dashboard",
                    ['certificate_id' => $certificate->id]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send certificate ready notification: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Certificate marked as ready for collection. Applicant has been notified.');
    }

    /**
     * Record certificate release/collection.
     */
    public function recordRelease(Request $request, Certificate $certificate)
    {
        $validated = $request->validate([
            'collected_by_name' => 'required|string|max:255',
            'release_date' => 'required|date',
            'release_time' => 'required',
            'valid_id_type' => 'nullable|string|max:255',
            'valid_id_number' => 'nullable|string|max:255',
            'relationship_to_applicant' => 'required|in:applicant,authorized_representative,other',
            'remarks' => 'nullable|string',
        ]);

        $validated['certificate_id'] = $certificate->id;
        $validated['released_by'] = Auth::id();

        CertificateRelease::create($validated);

        // Update certificate status to released and add release tracking
        $certificate->update([
            'status' => 'released',
            'released_at' => now(),
            'released_by' => Auth::id(),
            'released_to_name' => $validated['collected_by_name'],
            'released_to_id_type' => $validated['valid_id_type'] ?? null,
            'released_to_id_number' => $validated['valid_id_number'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Certificate release recorded successfully.');
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
