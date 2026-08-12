<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Request as ApplicationRequest;
use App\Http\Requests\RecordPaymentRequest;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\NotificationService;
use App\Services\AuditLogService;

class PaymentController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Display pending payments (approved requests awaiting payment)
     * Admin/Super Admin Only - FR1
     * Task 9.1: Authorization handled by route middleware
     */
    public function pending()
    {
        $pendingPayments = $this->paymentService->getPendingPayments();

        // Render the correct page based on user role
        $user = auth()->user();
        $view = ($user && $user->user_type === 'super_admin')
            ? 'SuperAdmin/PaymentsPending'
            : 'Admin/Payments/Index';

        return Inertia::render($view, [
            'pendingPayments' => $pendingPayments,
            'count' => $pendingPayments->count()
        ]);
    }

    /**
     * Record a payment verification
     * Admin/Super Admin Only - FR2, FR4
     * Task 9.1: Authorization handled by RecordPaymentRequest and constructor middleware
     * Task 9.2: Audit logging handled in PaymentService
     */
    public function recordPayment(RecordPaymentRequest $request)
    {
        try {
            $applicationRequest = ApplicationRequest::findOrFail($request->request_id);
            
            $payment = $this->paymentService->recordPayment(
                $applicationRequest,
                $request->validated()
            );

            // Return back with success message for Inertia
            return redirect()->back()->with('success', 'Payment recorded successfully');
            
        } catch (\Exception $e) {
            // Return back with error message for Inertia
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * Check if OR number already exists (duplicate validation)
     * Admin/Super Admin Only - FR3
     * Task 9.1: Authorization handled by constructor middleware
     */
    public function checkDuplicate(Request $request)
    {
        $request->validate([
            'receipt_number' => 'required|string'
        ]);

        $payment = $this->paymentService->checkDuplicate($request->receipt_number);

        if ($payment) {
            return response()->json([
                'exists' => true,
                'payment' => [
                    'id' => $payment->id,
                    'request_id' => $payment->request_id,
                    'applicant_name' => $payment->request->applicant->applicant_name ?? 'Unknown',
                    'payment_date' => $payment->payment_date->format('Y-m-d'),
                    'amount' => $payment->amount
                ]
            ]);
        }

        return response()->json([
            'exists' => false,
            'payment' => null
        ]);
    }

    /**
     * Display payment history with filtering and search
     * Admin/Super Admin Only - FR5
     * Task 9.1: Authorization handled by constructor middleware
     * Task 11.1: Optimized with eager loading and pagination
     */
    public function history(Request $request)
    {
        // Task 11.1: Eager load all required relationships to avoid N+1 queries
        $query = Payment::with([
            'request:id,applicant_id,control_number',
            'request.applicant:id,applicant_name',
            'verifiedByUser:id,name,email',
            'certificate:id,payment_id,certificate_number,status'
        ]);

        // Filter by status - uses index: payments_payment_status_index
        if ($request->status && $request->status !== 'all') {
            $query->where('payment_status', $request->status);
        }

        // Filter by date range - uses index: payments_payment_date_index
        if ($request->from_date) {
            $query->where('payment_date', '>=', $request->from_date);
        }
        if ($request->to_date) {
            $query->where('payment_date', '<=', $request->to_date);
        }

        // Filter by payment method
        if ($request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        // Search by OR number or applicant name - uses index: payments_receipt_number_index
        if ($request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('request.applicant', function($q) use ($search) {
                      $q->where('applicant_name', 'like', "%{$search}%");
                  });
            });
        }

        // Task 11.1: Use pagination for better performance with large datasets
        $payments = $query->latest('payment_date')
            ->paginate(25);

        // Task 11.1: Transform pagination data while preserving pagination metadata
        $transformedPayments = $payments->through(function($payment) {
            return [
                'id' => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'request_id' => $payment->request_id,
                'applicant_name' => $payment->request->applicant->applicant_name ?? 'Unknown',
                'amount' => $payment->amount,
                'payment_date' => $payment->payment_date,
                'payment_method' => $payment->payment_method,
                'payment_status' => $payment->payment_status,
                'verified_by_name' => $payment->verifiedByUser->name ?? null,
                'verified_at' => $payment->verified_at,
                'receipt_file_path' => $payment->receipt_file_path,
                'notes' => $payment->notes,
                'rejection_reason' => $payment->rejection_reason,
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at,
                // Include certificate information
                'certificate' => $payment->certificate ? [
                    'id' => $payment->certificate->id,
                    'certificate_number' => $payment->certificate->certificate_number,
                    'status' => $payment->certificate->status,
                ] : null,
                // Include full relationships for details modal
                'request' => $payment->request,
                'verified_by_user' => $payment->verifiedByUser,
            ];
        });

        return Inertia::render('Admin/Payments/History', [
            'payments' => $transformedPayments,
            'filters' => $request->only(['status', 'from_date', 'to_date', 'payment_method', 'search']),
            'userType' => auth()->user()->user_type,
        ]);
    }

    /**
     * Show payment details
     * Admin/Super Admin Only - FR6
     * Task 9.1: Authorization handled by constructor middleware
     * Task 11.1: Optimized with selective eager loading
     */
    public function show($id)
    {
        // Task 11.1: Eager load only needed relationships and columns
        $payment = Payment::with([
            'request:id,applicant_id,control_number',
            'request.applicant:id,applicant_name,applicant_address,contact_number',
            'request.project:id,request_id,project_type,project_description',
            'verifiedByUser:id,name,email'
        ])->findOrFail($id);

        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment,
            'userType' => auth()->user()->user_type,
        ]);
    }

    /**
     * Display a listing of payments.
     * Task 11.1: Optimized with eager loading
     */
    public function index(Request $request)
    {
        // Task 11.1: Eager load relationships with selective columns
        $query = Payment::with([
            'request:id,applicant_id,control_number',
            'request.applicant:id,applicant_name',
            'verifiedBy:id,name'
        ]);

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
            'amount' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash',
            'receipt' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120', // Max 5MB
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        // Handle file upload
        if ($request->hasFile('receipt')) {
            $file = $request->file('receipt');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('receipts', $filename, 'public');
            $validated['receipt_file_path'] = $path;
        }

        // Generate receipt number
        $validated['receipt_number'] = 'RCP-' . strtoupper(uniqid());
        $validated['payment_status'] = 'pending';
        $validated['user_id'] = auth()->id();

        $payment = Payment::create($validated);

        // Get the request
        $requestModel = \App\Models\Request::find($validated['request_id']);
        if ($requestModel) {
            // Create notification for payment receipt upload
            NotificationService::paymentReceiptUploaded($requestModel, $payment);
            
            // Send email notification to applicant
            try {
                \Mail::to($requestModel->user->email)->send(
                    new \App\Mail\PaymentReceiptSubmitted($payment, $requestModel)
                );
            } catch (\Exception $e) {
                \Log::error('Failed to send payment receipt email: ' . $e->getMessage());
            }
            
            // Notify admins via email about pending payment verification
            try {
                $admins = \App\Models\User::where('user_type', 'admin')->get();
                foreach ($admins as $admin) {
                    // Create in-app notification
                    \App\Models\Notification::createForUser(
                        $admin->id,
                        'payment_pending_verification',
                        'Payment Pending Verification',
                        "A payment receipt has been uploaded for request #{$requestModel->id}. Please verify.",
                        "/admin/payments",
                        [
                            'request_id' => $requestModel->id,
                            'payment_id' => $payment->id,
                        ]
                    );
                }
            } catch (\Exception $e) {
                \Log::error('Failed to notify admins: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Receipt uploaded successfully! Payment is pending verification. You will be notified once verified.',
            'payment' => $payment
        ], 201);
    }

    /**
     * Update the specified payment.
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash',
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
     * Task 9.2: Add audit logging for payment verification
     */
    public function verify(Payment $payment)
    {
        $oldStatus = $payment->payment_status;
        
        $payment->update([
            'payment_status' => 'verified',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        // Task 9.2: Log payment verification action
        AuditLogService::log(
            'payment_verified',
            "Payment #{$payment->id} verified. OR: {$payment->receipt_number}, Amount: ₱{$payment->amount}",
            'Payment',
            $payment->id,
            ['payment_status' => $oldStatus],
            ['payment_status' => 'verified', 'verified_by' => Auth::id(), 'verified_at' => now()],
            [
                'request_id' => $payment->request_id,
                'receipt_number' => $payment->receipt_number,
                'amount' => $payment->amount,
                'payment_method' => $payment->payment_method,
                'ip_address' => request()->ip(),
            ]
        );

        // Get the application/request
        $applicationRequest = ApplicationRequest::find($payment->request_id);
        if ($applicationRequest) {
            // Create notification for payment verification
            NotificationService::paymentVerified($applicationRequest, $payment, auth()->user());
        }

        return redirect()->back()->with('success', 'Payment verified successfully.');
    }

    /**
     * Reject a payment.
     * Task 9.2: Add audit logging for payment rejection
     */
    public function reject(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $oldStatus = $payment->payment_status;
        
        $payment->update([
            'payment_status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        // Task 9.2: Log payment rejection action
        AuditLogService::log(
            'payment_rejected',
            "Payment #{$payment->id} rejected. OR: {$payment->receipt_number}. Reason: {$validated['rejection_reason']}",
            'Payment',
            $payment->id,
            ['payment_status' => $oldStatus, 'rejection_reason' => null],
            ['payment_status' => 'rejected', 'rejection_reason' => $validated['rejection_reason']],
            [
                'request_id' => $payment->request_id,
                'receipt_number' => $payment->receipt_number,
                'amount' => $payment->amount,
                'rejection_reason' => $validated['rejection_reason'],
                'ip_address' => request()->ip(),
            ]
        );

        // Get the application/request
        $applicationRequest = ApplicationRequest::find($payment->request_id);
        if ($applicationRequest) {
            // Create notification for payment rejection
            NotificationService::paymentRejected($applicationRequest, $payment, $validated['rejection_reason'], auth()->user());
        }

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
