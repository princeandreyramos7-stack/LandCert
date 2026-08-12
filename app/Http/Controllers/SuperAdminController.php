<?php

namespace App\Http\Controllers;

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
use App\Services\NotificationService;
use App\Services\AuditLogService;
use App\Models\AuditLog;
use App\Mail\ApplicationApprovedWithDetails;

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
        
        // Get all requests with normalized table joins
        $requests = RequestModel::leftJoin('reports', 'requests.id', '=', 'reports.request_id')
            ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->leftJoin('locations', 'requests.id', '=', 'locations.request_id')
            ->leftJoin('properties', 'requests.id', '=', 'properties.request_id')
            ->leftJoin('normalized_corporations', 'applicants.id', '=', 'normalized_corporations.applicant_id')
            ->leftJoin('users', 'requests.user_id', '=', 'users.id')
            ->select(
                'requests.id',
                'requests.user_id',
                'requests.status as request_status',
                'requests.created_at',
                'requests.updated_at',
                // Applicant fields
                'applicants.applicant_name',
                'applicants.applicant_address',
                // Corporation fields
                'normalized_corporations.corporation_name',
                // Project fields
                'normalized_projects.project_type',
                'normalized_projects.project_nature',
                'normalized_projects.project_cost',
                // Location fields
                'locations.street_address as project_location_street',
                'locations.barangay as project_location_barangay',
                'locations.city_municipality as project_location_city',
                'locations.province as project_location_province',
                // Property fields
                'properties.lot_area_sqm',
                // Report fields
                'reports.report_id',
                'reports.evaluation',
                'reports.description as report_description',
                'reports.amount as report_amount',
                'reports.date_certified',
                'reports.date_reported',
                'reports.issued_by',
                // User fields
                'users.name as user_name',
                'users.email as user_email',
                // Status
                DB::raw('COALESCE(reports.evaluation, requests.status) as status')
            )
            ->orderBy('requests.created_at', 'desc')
            ->paginate($perPage);

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
            'applications' => $requests,
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
        
        // Get all requests with their related data and reports (using normalized structure)
        $requestsData = RequestModel::with(['user', 'reports'])->orderBy('created_at', 'desc')->paginate($perPage);
        
        $requests = $requestsData->through(function($request) {
            // Get the latest report for this request
            $report = $request->reports->first();
            
            $requestArray = $request->toArray();
            $requestArray['application_id'] = $request->id; // Using request ID as application ID
            $requestArray['authorization_letter_path'] = $request->authorization_letter_path ?? null;
            $requestArray['report_id'] = $report?->report_id;
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
     * Show review page for a request (Super Admin)
     */
    public function reviewRequest($id): Response
    {
        $request = RequestModel::with([
            'user', 
            'reports',
            'applicant.corporation',
            'applicant.primaryRepresentative',
            'project',
            'location',
            'property'
        ])->findOrFail($id);
        
        // Get the latest report for this request
        $report = $request->reports->first();
        
        // Build the request data with normalized relationships
        $requestData = [
            'id' => $request->id,
            'control_number' => $request->control_number,
            'status' => $report?->evaluation ?? $request->status,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            
            // User info
            'user_id' => $request->user_id,
            'user_name' => $request->user?->name,
            'user_email' => $request->user?->email,
            
            // Applicant info
            'applicant_name' => $request->applicant?->applicant_name,
            'applicant_address' => $request->applicant?->applicant_address,
            'applicant_contact' => $request->applicant?->applicant_contact,
            
            // Corporation info
            'corporation_name' => $request->applicant?->corporation?->corporation_name,
            'corporation_address' => $request->applicant?->corporation?->corporation_address,
            
            // Representative info
            'authorized_representative_name' => $request->applicant?->primaryRepresentative?->representative_name,
            'authorized_representative_address' => $request->applicant?->primaryRepresentative?->representative_address,
            'authorization_letter_path' => $request->applicant?->primaryRepresentative?->authorization_letter_path,
            
            // Project info
            'application_category' => $request->project?->project_type,
            'project_type' => $request->project?->project_type,
            'project_nature' => $request->project?->project_nature,
            'project_nature_duration' => $request->project?->project_nature_duration,
            'project_nature_years' => $request->project?->project_nature_years,
            'project_cost' => $request->project?->project_cost,
            
            // Location info
            'project_location_number' => null,
            'project_location_street' => $request->location?->street_address,
            'project_location_barangay' => $request->location?->barangay,
            'project_location_municipality' => $request->location?->city_municipality,
            'project_location_province' => $request->location?->province,
            
            // Property info
            'project_area_sqm' => ($request->property?->lot_area_sqm + $request->property?->bldg_improvement_sqm),
            'lot_area_sqm' => $request->property?->lot_area_sqm,
            'bldg_improvement_sqm' => $request->property?->bldg_improvement_sqm,
            'right_over_land' => $request->property?->right_over_land,
            
            // Land use info
            'existing_land_use' => $request->property?->existing_land_use,
            'has_written_notice' => $request->has_written_notice,
            'notice_officer_name' => $request->notice_officer_name,
            'notice_dates' => $request->notice_dates,
            'has_similar_application' => $request->has_similar_application,
            'similar_application_offices' => $request->similar_application_offices,
            'similar_application_dates' => $request->similar_application_dates,
            
            // Report info
            'report_id' => $report?->report_id,
            'evaluation' => $report?->evaluation,
            'application_id' => $request->id,
        ];
        
        return Inertia::render('SuperAdmin/ReviewRequest', [
            'request' => $requestData,
        ]);
    }

    /**
     * Approve a request (Super Admin only) - UPDATED FOR NEW WORKFLOW
     * After admin review, SuperAdmin gives final approval and applicant gets notified
     */
    public function approveRequest(Request $request, $reportId)
    {
        $report = Report::with(['requestModel.applicant', 'requestModel.project', 'requestModel.user'])
            ->findOrFail($reportId);
        
        $requestModel = $report->requestModel;

        // Verify that application was reviewed by admin first
        if ($report->evaluation !== 'reviewed') {
            return back()->with('error', 'Application must be reviewed by admin before SuperAdmin approval.');
        }

        // Update report to approved
        $report->evaluation = 'approved';
        $report->approved_by = auth()->user()->name;
        $report->approved_at = now();
        $report->description = 'Application approved by SuperAdmin ' . auth()->user()->name;
        $report->save();

        // Update request status
        $requestModel->status = 'approved';
        $requestModel->save();

        // Log the action
        AuditLogService::logUpdate(
            'Report',
            $report->id,
            ['evaluation' => 'reviewed'],
            ['evaluation' => 'approved'],
            "SuperAdmin approved application #{$requestModel->id}"
        );

        // Send comprehensive approval email to applicant with appointment details
        try {
            if ($requestModel->user && $requestModel->user->email) {
                // Create a custom mail class or send detailed notification
                $requirements = json_decode($report->requirements, true) ?? [];
                
                \Mail::to($requestModel->user->email)->send(
                    new \App\Mail\ApplicationApprovedWithDetails(
                        $requestModel,
                        $requestModel->applicant->applicant_name ?? 'Applicant',
                        $report->appointment_date,
                        $report->appointment_time,
                        $report->payment_amount,
                        $requirements,
                        $report->admin_notes
                    )
                );

                \Log::info('Approval email with details sent to: ' . $requestModel->user->email);
            }

            // Create notification
            \App\Models\Notification::createForUser(
                $requestModel->user_id,
                'application_approved_final',
                'Application Approved! 🎉',
                "Your application #{$requestModel->id} has been approved! Check your email for appointment details and requirements.",
                "/my-applications",
                [
                    'request_id' => $requestModel->id,
                    'appointment_date' => $report->appointment_date,
                    'payment_amount' => $report->payment_amount,
                ]
            );

            // Send SMS if available
            if ($requestModel->user && $requestModel->user->contact_number) {
                app(\App\Services\SmsService::class)->sendApplicationApproved(
                    $requestModel->user->contact_number,
                    $requestModel->user->name,
                    $requestModel->id
                );
            }

            // Schedule payment reminder
            app(\App\Services\ReminderService::class)->schedulePaymentReminder(
                $requestModel->id,
                $requestModel->user_id,
                3
            );
        } catch (\Exception $e) {
            \Log::error('Failed to send approval notification: ' . $e->getMessage());
        }

        return back()->with('success', 'Application approved! Applicant has been notified with appointment details.');
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
        
        $query = Certificate::leftJoin('requests', 'certificates.request_id', '=', 'requests.id')
            ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->leftJoin('users', 'requests.user_id', '=', 'users.id')
            ->leftJoin('payments', 'certificates.payment_id', '=', 'payments.id')
            ->leftJoin('users as issuer', 'certificates.issued_by', '=', 'issuer.id')
            ->select(
                'certificates.*',
                'applicants.applicant_name',
                'normalized_projects.project_type',
                'users.name as user_name',
                'users.email as user_email',
                'issuer.name as issued_by_name'
            )
            ->orderBy('certificates.created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('certificates.status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('certificates.certificate_number', 'like', "%{$search}%")
                  ->orWhere('applicants.applicant_name', 'like', "%{$search}%");
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
        
        $query = Payment::leftJoin('requests', 'payments.request_id', '=', 'requests.id')
            ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->leftJoin('users', 'requests.user_id', '=', 'users.id')
            ->leftJoin('users as verifier', 'payments.verified_by', '=', 'verifier.id')
            ->select(
                'payments.*',
                'applicants.applicant_name',
                'normalized_projects.project_type',
                'users.name as user_name',
                'users.email as user_email',
                'verifier.name as verified_by_name'
            )
            ->orderBy('payments.created_at', 'desc');

        // Apply filters
        if ($request->filled('payment_status')) {
            $query->where('payments.payment_status', $request->payment_status);
        }

        if ($request->filled('payment_method')) {
            $query->where('payments.payment_method', $request->payment_method);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('payments.receipt_number', 'like', "%{$search}%")
                  ->orWhere('applicants.applicant_name', 'like', "%{$search}%");
            });
        }

        $payments = $query->paginate($perPage);

        // Summary stats for analytics cards
        $statsQuery = Payment::leftJoin('requests', 'payments.request_id', '=', 'requests.id')
            ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id');

        $stats = [
            'total'          => (clone $statsQuery)->count(),
            'pending'        => (clone $statsQuery)->where('payments.payment_status', 'pending')->count(),
            'verified'       => (clone $statsQuery)->where('payments.payment_status', 'verified')->count(),
            'rejected'       => (clone $statsQuery)->where('payments.payment_status', 'rejected')->count(),
            'total_revenue'  => (clone $statsQuery)->where('payments.payment_status', 'verified')->sum('payments.amount'),
            'pending_amount' => (clone $statsQuery)->where('payments.payment_status', 'pending')->sum('payments.amount'),
            'this_month'     => (clone $statsQuery)->where('payments.payment_status', 'verified')
                                    ->whereMonth('payments.verified_at', now()->month)
                                    ->whereYear('payments.verified_at', now()->year)
                                    ->sum('payments.amount'),
            'last_month'     => (clone $statsQuery)->where('payments.payment_status', 'verified')
                                    ->whereMonth('payments.verified_at', now()->subMonth()->month)
                                    ->whereYear('payments.verified_at', now()->subMonth()->year)
                                    ->sum('payments.amount'),
        ];

        return Inertia::render('SuperAdmin/Payments', [
            'payments' => $payments,
            'filters' => $request->only(['payment_status', 'payment_method', 'search']),
            'stats'   => $stats,
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

        // Generate certificate after payment verification
        try {
            $requestModel = $payment->request;
            
            // Ensure request and user exist
            if (!$requestModel) {
                \Log::warning("Payment {$payment->id} has no associated request");
                return back()->with('success', 'Payment verified successfully!');
            }
            
            if (!$requestModel->user) {
                \Log::warning("Request {$requestModel->id} has no associated user");
                return back()->with('success', 'Payment verified successfully!');
            }
            
            // Check if certificate already exists for this request
            $existingCertificate = Certificate::where('request_id', $requestModel->id)->first();
            
            if (!$existingCertificate) {
                // Generate unique certificate number
                $year = date('Y');
                $sequence = str_pad($requestModel->id, 6, '0', STR_PAD_LEFT);
                $certificateNumber = "CPDO-{$year}-{$sequence}";
                
                // Create certificate record
                $certificate = Certificate::create([
                    'request_id' => $requestModel->id,
                    'payment_id' => $payment->id,
                    'user_id' => $requestModel->user_id,
                    'certificate_number' => $certificateNumber,
                    'issued_by' => auth()->id(),
                    'issued_at' => now(),
                    'valid_until' => now()->addYears(1),
                    'status' => 'preparing', // Certificate needs physical signatures
                    'notes' => 'Certificate created after payment verification. Pending physical signatures from officials.',
                ]);
                
                // Send notification to applicant
                NotificationService::certificateGenerated($requestModel, $certificate);
                
                // Send email notification
                try {
                    \Mail::to($requestModel->user->email)->send(
                        new \App\Mail\CertificateIssued($requestModel, $certificate)
                    );
                } catch (\Exception $e) {
                    \Log::error('Failed to send certificate issued email: ' . $e->getMessage());
                }
                
                // Send SMS notification
                if ($requestModel->user->contact_number) {
                    try {
                        app(\App\Services\SmsService::class)->sendCertificatePreparing(
                            $requestModel->user->contact_number,
                            $requestModel->user->name,
                            $certificateNumber
                        );
                    } catch (\Exception $e) {
                        \Log::error('Failed to send SMS notification: ' . $e->getMessage());
                    }
                }
                
                \Log::info("Certificate {$certificateNumber} created for request #{$requestModel->id}");
                
                return back()->with('success', 'Payment verified successfully! Certificate has been generated and is being prepared for signatures.');
            } else {
                \Log::info("Certificate already exists for request #{$requestModel->id}");
                return back()->with('success', 'Payment verified successfully! Certificate already exists for this request.');
            }
        } catch (\Exception $e) {
            \Log::error('Failed to generate certificate: ' . $e->getMessage());
            // Don't fail the payment verification if certificate generation fails
            return back()->with('success', 'Payment verified successfully! Note: Certificate generation encountered an issue - check logs.');
        }
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
