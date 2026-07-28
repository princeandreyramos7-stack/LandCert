<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\User;
use App\Models\Certificate;
use App\Models\CertificateRelease;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use App\Services\DashboardCacheService;
use App\Models\AuditLog;

class SuperAdminController extends Controller
{
    protected $cacheService;

    public function __construct(DashboardCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Display super admin dashboard
     */
    public function dashboard(Request $request): Response
    {
        $perPage = $request->input('per_page', 25);
        
        // Get all requests with their related data
        $requests = RequestModel::with('user')->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Get applications and reports data
        $applicationsData = Application::with('report')->get()->keyBy(function($app) {
            return $app->applicant_name . '|' . $app->applicant_address;
        });
        
        // Merge the data
        $applications = $requests->through(function($request) use ($applicationsData) {
            $key = $request->applicant_name . '|' . $request->applicant_address;
            $application = $applicationsData->get($key);
            $report = $application?->report;
            
            return (object)[
                'id' => $request->id,
                'applicant_name' => $request->applicant_name,
                'corporation_name' => $request->corporation_name,
                'applicant_address' => $request->applicant_address,
                'project_type' => $request->project_type,
                'project_nature' => $request->project_nature,
                'project_location_street' => $request->project_location_street,
                'project_location_barangay' => $request->project_location_barangay,
                'project_location_city' => $request->project_location_city,
                'project_location_municipality' => $request->project_location_municipality,
                'project_location_province' => $request->project_location_province,
                'lot_area_sqm' => $request->lot_area_sqm,
                'project_cost' => $request->project_cost,
                'created_at' => $request->created_at,
                'updated_at' => $request->updated_at,
                'application_id' => $application?->id,
                'report_id' => $report?->getKey(),
                'evaluation' => $report?->evaluation,
                'report_description' => $report?->description,
                'report_amount' => $report?->amount,
                'date_certified' => $report?->date_certified,
                'date_reported' => $report?->date_reported,
                'issued_by' => $report?->issued_by,
                'user_name' => $request->user?->name,
                'user_email' => $request->user?->email,
                'status' => $report?->evaluation ?? $request->status,
            ];
        });

        // Get cached analytics and stats
        $analytics = $this->cacheService->getAnalytics();
        $stats = $this->cacheService->getStats();
        $evaluationDistribution = $this->cacheService->getEvaluationDistribution();
        
        // Get system-wide statistics for Super Admin
        $systemStats = [
            'total_users' => User::count(),
            'total_admins' => User::whereIn('user_type', ['admin', 'super_admin'])->count(),
            'total_applicants' => User::where('user_type', 'applicant')->count(),
            'total_staff' => User::where('user_type', 'staff')->count(),
            'total_requests' => RequestModel::count(),
            'pending_requests' => RequestModel::where('status', 'pending')->count(),
            'recent_activity' => AuditLog::with('user')->latest()->take(10)->get(),
        ];

        return Inertia::render('SuperAdmin/Dashboard', [
            'applications' => $applications,
            'stats' => $stats,
            'analytics' => $analytics,
            'evaluationDistribution' => $evaluationDistribution,
            'systemStats' => $systemStats,
        ]);
    }

    /**
     * Display all requests for super admin with approve/reject actions
     */
    public function requests(Request $request): Response
    {
        $perPage = $request->input('per_page', 25);
        
        $requestsData = RequestModel::with('user')->orderBy('created_at', 'desc')->paginate($perPage);
        
        $applicationsData = Application::with('report')->get()->keyBy(function($app) {
            return $app->applicant_name . '|' . $app->applicant_address;
        });
        
        $requests = $requestsData->through(function($request) use ($applicationsData) {
            $key = $request->applicant_name . '|' . $request->applicant_address;
            $application = $applicationsData->get($key);
            $report = $application?->report;
            
            $requestArray = $request->toArray();
            $requestArray['application_id'] = $application?->id;
            $requestArray['authorization_letter_path'] = $application?->authorization_letter_path;
            $requestArray['report_id'] = $report?->getKey();
            $requestArray['evaluation'] = $report?->evaluation;
            $requestArray['user_name'] = $request->user?->name;
            $requestArray['user_email'] = $request->user?->email;
            $requestArray['status'] = $report?->evaluation ?? $request->status;
            
            return $requestArray;
        });

        return Inertia::render('SuperAdmin/Requests', [
            'requests' => $requests,
        ]);
    }

    /**
     * Approve a request (Super Admin only)
     */
    public function approveRequest(Request $request, $reportId)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'amount' => 'nullable|numeric',
            'date_certified' => 'nullable|date',
            'issued_by' => 'nullable|string|max:255',
        ]);

        $report = Report::findOrFail($reportId);
        
        $report->update([
            'evaluation' => 'approved',
            'description' => $validated['description'] ?? 'Application approved by Super Admin',
            'amount' => $validated['amount'] ?? $report->amount,
            'date_certified' => $validated['date_certified'] ?? now(),
            'date_reported' => now(),
            'issued_by' => $validated['issued_by'] ?? 'Super Admin',
        ]);

        return back()->with('success', 'Request approved successfully!');
    }

    /**
     * Reject a request (Super Admin only)
     */
    public function rejectRequest(Request $request, $reportId)
    {
        $validated = $request->validate([
            'description' => 'required|string',
        ]);

        $report = Report::findOrFail($reportId);
        
        $report->update([
            'evaluation' => 'rejected',
            'description' => $validated['description'],
            'date_reported' => now(),
            'issued_by' => 'Super Admin',
        ]);

        return back()->with('success', 'Request rejected successfully!');
    }

    /**
     * Manage all users including admins
     */
    public function users(Request $request): Response
    {
        $perPage = $request->input('per_page', 25);
        
        $users = User::orderBy('created_at', 'desc')->paginate($perPage);

        return Inertia::render('SuperAdmin/Users', [
            'users' => $users,
        ]);
    }

    /**
     * Show edit user form
     */
    public function editUser($userId): Response
    {
        $user = User::findOrFail($userId);

        return Inertia::render('SuperAdmin/EditUser', [
            'user' => $user,
        ]);
    }

    /**
     * Create a new user (admin, staff, applicant, or super_admin)
     */
    public function createAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'user_type' => 'required|in:admin,staff,applicant,super_admin',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'user_type' => $validated['user_type'],
            'contact_number' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'email_verified_at' => now(),
        ]);

        return back()->with('success', 'User created successfully!');
    }

    /**
     * Update user information
     */
    public function updateUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userId,
            'user_type' => 'required|in:admin,staff,applicant,super_admin',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'password' => 'nullable|string|min:8',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'user_type' => $validated['user_type'],
            'contact_number' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = bcrypt($validated['password']);
        }

        $user->update($updateData);

        return back()->with('success', 'User updated successfully!');
    }

    /**
     * Delete a user
     */
    public function deleteUser($userId)
    {
        $user = User::findOrFail($userId);
        
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account!');
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully!');
    }

    /**
     * View audit logs
     */
    public function auditLogs(Request $request): Response
    {
        $perPage = $request->input('per_page', 50);
        
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('user_email', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate($perPage);

        // Get filter options
        $users = User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $actions = AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->toArray();

        $modelTypes = AuditLog::select('model_type')
            ->distinct()
            ->whereNotNull('model_type')
            ->orderBy('model_type')
            ->pluck('model_type')
            ->toArray();

        return Inertia::render('SuperAdmin/AuditLogs', [
            'logs' => $logs,
            'users' => $users,
            'actions' => $actions,
            'modelTypes' => $modelTypes,
            'filters' => $request->only(['user_id', 'action', 'model_type', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * System settings
     */
    public function settings(): Response
    {
        return Inertia::render('SuperAdmin/Settings');
    }

    /**
     * Display all certificates for super admin management
     */
    public function certificates(Request $request): Response
    {
        $perPage = $request->input('per_page', 25);
        
        $query = Certificate::with([
            'request.user',
            'payment',
            'issuedBy',
            'release.releasedBy'
        ])->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('certificate_number', 'like', "%{$search}%")
                  ->orWhereHas('request', function($q) use ($search) {
                      $q->where('applicant_name', 'like', "%{$search}%");
                  });
            });
        }

        $certificates = $query->paginate($perPage);

        return Inertia::render('SuperAdmin/Certificates', [
            'certificates' => $certificates,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    /**
     * Update certificate status or details
     */
    public function updateCertificate(Request $request, $certificateId)
    {
        $validated = $request->validate([
            'status' => 'required|in:generated,ready_for_collection,collected',
            'certificate_number' => 'required|string|max:255',
            'issued_by' => 'nullable|exists:users,id',
            'valid_until' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $certificate = Certificate::findOrFail($certificateId);
        
        $certificate->update([
            'status' => $validated['status'],
            'certificate_number' => $validated['certificate_number'],
            'issued_by' => $validated['issued_by'] ?? auth()->id(),
            'valid_until' => $validated['valid_until'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Certificate updated successfully!');
    }

    /**
     * Mark certificate as ready for collection
     */
    public function markCertificateReady(Request $request, $certificateId)
    {
        $validated = $request->validate([
            'certificate_number' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $certificate = Certificate::findOrFail($certificateId);
        
        $certificate->update([
            'status' => 'ready_for_collection',
            'certificate_number' => $validated['certificate_number'],
            'issued_by' => auth()->id(),
            'issued_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Certificate marked as ready for collection!');
    }

    /**
     * Record certificate collection/release
     */
    public function releaseCertificate(Request $request, $certificateId)
    {
        $validated = $request->validate([
            'collected_by_name' => 'required|string|max:255',
            'release_date' => 'required|date',
            'release_time' => 'required|date_format:H:i',
            'valid_id_type' => 'required|string|max:100',
            'valid_id_number' => 'required|string|max:100',
            'relationship_to_applicant' => 'required|string|max:100',
            'remarks' => 'nullable|string',
        ]);

        $certificate = Certificate::findOrFail($certificateId);
        
        // Create release record
        CertificateRelease::create([
            'certificate_id' => $certificate->id,
            'released_by' => auth()->id(),
            'collected_by_name' => $validated['collected_by_name'],
            'release_date' => $validated['release_date'],
            'release_time' => $validated['release_time'],
            'valid_id_type' => $validated['valid_id_type'],
            'valid_id_number' => $validated['valid_id_number'],
            'relationship_to_applicant' => $validated['relationship_to_applicant'],
            'remarks' => $validated['remarks'] ?? null,
        ]);

        // Update certificate status
        $certificate->update([
            'status' => 'collected',
        ]);

        return back()->with('success', 'Certificate collection recorded successfully!');
    }

    /**
     * Display all payments for super admin management
     */
    public function payments(Request $request): Response
    {
        $perPage = $request->input('per_page', 25);
        
        $query = Payment::with([
            'request.user',
            'verifiedBy'
        ])->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('request', function($q) use ($search) {
                      $q->where('applicant_name', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->paginate($perPage);

        return Inertia::render('SuperAdmin/Payments', [
            'payments' => $payments,
            'filters' => $request->only(['payment_status', 'payment_method', 'search']),
        ]);
    }

    /**
     * Verify payment
     */
    public function verifyPayment(Request $request, $paymentId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'receipt_number' => 'required|string|max:255',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::findOrFail($paymentId);
        
        $payment->update([
            'payment_status' => 'verified',
            'amount' => $validated['amount'],
            'receipt_number' => $validated['receipt_number'],
            'payment_date' => $validated['payment_date'],
            'verified_by' => auth()->id(),
            'verified_at' => now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Payment verified successfully!');
    }

    /**
     * Reject payment
     */
    public function rejectPayment(Request $request, $paymentId)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $payment = Payment::findOrFail($paymentId);
        
        $payment->update([
            'payment_status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return back()->with('success', 'Payment rejected successfully!');
    }

    /**
     * Update payment details
     */
    public function updatePayment(Request $request, $paymentId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,check,bank_transfer',
            'receipt_number' => 'required|string|max:255',
            'payment_date' => 'required|date',
            'payment_status' => 'required|in:pending,verified,rejected',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::findOrFail($paymentId);
        
        $payment->update($validated);

        return back()->with('success', 'Payment updated successfully!');
    }
}
