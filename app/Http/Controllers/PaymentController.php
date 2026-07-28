<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Request as ApplicationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['request', 'verifiedBy']);

        // Filter by status
        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        // Filter by payment method
        if ($request->has('payment_method') && $request->payment_method !== '') {
            $query->where('payment_method', $request->payment_method);
        }

        // Search functionality
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('request', function ($req) use ($search) {
                      $req->where('applicant_name', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->orderBy('payment_date', 'desc')->paginate(15);

        return Inertia::render('SuperAdmin/Payments', [
            'payments' => $payments,
            'filters' => [
                'payment_status' => $request->payment_status,
                'payment_method' => $request->payment_method,
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Store a newly created payment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:requests,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,bank_transfer,gcash,paymaya,check,other',
            'receipt_number' => 'required|string|max:255',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $validated['payment_status'] = 'pending';

        $payment = Payment::create($validated);

        return redirect()->back()->with('success', 'Physical payment record created successfully.');
    }

    /**
     * Update the specified payment.
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,bank_transfer,gcash,paymaya,check,other',
            'receipt_number' => 'required|string|max:255',
            'payment_date' => 'required|date',
            'payment_status' => 'required|in:pending,verified,rejected',
            'rejection_reason' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        // If status is being changed to verified
        if ($validated['payment_status'] === 'verified' && $payment->payment_status !== 'verified') {
            $validated['verified_by'] = Auth::id();
            $validated['verified_at'] = now();
        }

        // If status is being changed from verified to something else
        if ($validated['payment_status'] !== 'verified' && $payment->payment_status === 'verified') {
            $validated['verified_by'] = null;
            $validated['verified_at'] = null;
        }

        $payment->update($validated);

        return redirect()->back()->with('success', 'Payment record updated successfully.');
    }

    /**
     * Verify a payment.
     */
    public function verify(Payment $payment)
    {
        $payment->update([
            'payment_status' => 'verified',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Payment verified successfully.');
    }

    /**
     * Reject a payment.
     */
    public function reject(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $payment->update([
            'payment_status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Payment rejected.');
    }

    /**
     * Delete a payment record.
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->back()->with('success', 'Payment record deleted successfully.');
    }
}
