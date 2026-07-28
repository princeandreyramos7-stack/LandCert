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
        $validated['status'] = 'generated';

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
            'status' => 'required|in:generated,sent,collected',
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
            'status' => 'sent',
            'issued_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Certificate marked as ready for collection.');
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

        // Update certificate status to collected
        $certificate->update(['status' => 'collected']);

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
