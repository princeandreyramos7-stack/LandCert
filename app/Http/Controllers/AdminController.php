<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Mail\ApplicationRejected;
use App\Services\DashboardCacheService;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use App\Jobs\GeneratePdfExport;
use App\Models\AuditLog;

class AdminController extends Controller
{
    // Middleware is applied in routes/web.php


    /**
     * Display admin dashboard with all applications
     */
    protected $cacheService;

    public function __construct(DashboardCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function dashboard(Request $request): Response
    {
        // Get cached analytics data
        $analytics = $this->cacheService->getAnalytics();
        
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

        // Get cached stats and evaluation distribution
        $stats = $this->cacheService->getStats();
        $evaluationDistribution = $this->cacheService->getEvaluationDistribution();

        // Get recent payment activity (last 5 verified payments) - FR9.3
        $recentPayments = \App\Models\Payment::with(['request.applicant', 'verifiedByUser'])
            ->where('payment_status', 'verified')
            ->whereNotNull('verified_at')
            ->orderBy('verified_at', 'desc')
            ->take(5)
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'receipt_number' => $payment->receipt_number,
                    'applicant_name' => $payment->request->applicant->applicant_name ?? 'Unknown',
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'verified_by_name' => $payment->verifiedByUser->name ?? 'Unknown',
                    'verified_at' => $payment->verified_at,
                ];
            });

        // Get pending payments count - FR9.1 & FR9.2
        $pendingPaymentsCount = RequestModel::join('reports', 'requests.id', '=', 'reports.request_id')
            ->where('reports.evaluation', 'approved')
            ->whereDoesntHave('payments', function($query) {
                $query->where('payment_status', 'verified');
            })
            ->count();

        return Inertia::render('Admin/Dashboard', [
            'applications' => $requests,
            'stats' => $stats,
            'analytics' => $analytics,
            'evaluationDistribution' => $evaluationDistribution,
            'recentPayments' => $recentPayments,
            'pendingPaymentsCount' => $pendingPaymentsCount,
        ]);
    }
    
    /**
     * Get dashboard analytics
     */
    private function getDashboardAnalytics()
    {
        // Monthly submissions trend (last 6 months)
        $monthlyData = RequestModel::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();
        
        // Payment statistics
        $paymentStats = [
            'total_revenue' => \App\Models\Payment::where('payment_status', 'verified')->sum('amount'),
            'pending_payments' => \App\Models\Payment::where('payment_status', 'pending')->count(),
            'verified_payments' => \App\Models\Payment::where('payment_status', 'verified')->count(),
            'rejected_payments' => \App\Models\Payment::where('payment_status', 'rejected')->count(),
            'average_payment' => \App\Models\Payment::where('payment_status', 'verified')->avg('amount'),
        ];
        
        // Monthly payment revenue (last 6 months)
        $monthlyRevenue = \App\Models\Payment::select(
            DB::raw('DATE_FORMAT(payment_date, "%Y-%m") as month'),
            DB::raw('SUM(amount) as revenue'),
            DB::raw('COUNT(*) as count')
        )
        ->where('payment_status', 'verified')
        ->where('payment_date', '>=', now()->subMonths(6))
        ->groupBy('month')
        ->orderBy('month')
        ->get();
        
        // Payment methods distribution
        $paymentMethods = \App\Models\Payment::select('payment_method', DB::raw('COUNT(*) as count'))
            ->where('payment_status', 'verified')
            ->groupBy('payment_method')
            ->get();
        
        // Certificate statistics
        $certificateStats = [
            'total_issued' => \App\Models\Certificate::count(),
            'issued_this_month' => \App\Models\Certificate::whereMonth('issued_at', now()->month)->count(),
            'collected' => \App\Models\Certificate::where('status', 'collected')->count(),
            'sent' => \App\Models\Certificate::where('status', 'sent')->count(),
        ];
        
        // Application status breakdown
        $statusBreakdown = Report::select('evaluation', DB::raw('COUNT(*) as count'))
            ->groupBy('evaluation')
            ->get();
        
        // Average processing time (from submission to approval)
        $avgProcessingTime = Report::where('evaluation', 'approved')
            ->whereNotNull('date_reported')
            ->join('requests', 'reports.request_id', '=', 'requests.id')
            ->selectRaw('AVG(DATEDIFF(reports.date_reported, requests.created_at)) as avg_days')
            ->value('avg_days');
        
        // Recent activity
        $recentActivity = \App\Models\StatusHistory::with('user')
            ->latest()
            ->take(10)
            ->get()
            ->map(function($history) {
                return [
                    'id' => $history->id,
                    'request_id' => $history->request_id,
                    'entity_type' => $history->entity_type,
                    'old_status' => $history->old_status,
                    'new_status' => $history->new_status,
                    'changed_by' => $history->user?->name ?? 'System',
                    'notes' => $history->notes,
                    'created_at' => $history->created_at,
                ];
            });
        
        // Project type distribution
        $projectTypes = RequestModel::join('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->select('normalized_projects.project_type', DB::raw('COUNT(*) as count'))
            ->whereNotNull('normalized_projects.project_type')
            ->groupBy('normalized_projects.project_type')
            ->get();
        
        // Top users by submissions
        $topUsers = RequestModel::select('user_id', DB::raw('COUNT(*) as count'))
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderByDesc('count')
            ->take(5)
            ->with('user')
            ->get()
            ->map(function($item) {
                return [
                    'name' => $item->user?->name ?? 'Unknown',
                    'email' => $item->user?->email ?? '',
                    'count' => $item->count,
                ];
            });
        
        // Weekly activity (last 4 weeks)
        $weeklyActivity = RequestModel::select(
            DB::raw('YEARWEEK(created_at) as week'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subWeeks(4))
        ->groupBy('week')
        ->orderBy('week')
        ->get();
        
        return [
            'monthly_submissions' => $monthlyData,
            'monthly_revenue' => $monthlyRevenue,
            'payment_stats' => $paymentStats,
            'payment_methods' => $paymentMethods,
            'certificate_stats' => $certificateStats,
            'status_breakdown' => $statusBreakdown,
            'avg_processing_time' => round($avgProcessingTime ?? 0, 1),
            'recent_activity' => $recentActivity,
            'project_types' => $projectTypes,
            'top_users' => $topUsers,
            'weekly_activity' => $weeklyActivity,
        ];
    }

    /**
     * Display all applications for admin to review
     */
    public function applications(Request $request): Response
    {
        $perPage = $request->input('per_page', 25);
        
        // Get all requests with normalized table joins
        $applications = RequestModel::leftJoin('reports', 'requests.id', '=', 'reports.request_id')
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

        return Inertia::render('Admin/Applications', [
            'applications' => $applications,
        ]);
    }

    /**
     * Display all requests for admin
     */
    public function requests(Request $request): Response
    {
        $perPage = $request->input('per_page', 25); // Increased default pagination
        
        // Get all requests with their related data (using normalized structure)
        $requestsData = RequestModel::with(['user', 'reports'])->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Merge the data
        $requests = $requestsData->through(function($request) {
            // Get the latest report for this request
            $report = $request->reports->first();
            
            // Convert to array and add additional fields
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

        return Inertia::render('Admin/Request', [
            'requests' => $requests,
        ]);
    }

    /**
     * View a single request details
     */
    public function viewRequest($id): Response
    {
        $request = RequestModel::with(['user', 'reports'])
            ->findOrFail($id);
        
        // Get the latest report for this request
        $report = $request->reports->first();
        
        // Convert to array and add additional fields
        $requestData = $request->toArray();
        $requestData['application_id'] = $request->id; // Using request ID as application ID
        $requestData['authorization_letter_path'] = $request->authorization_letter_path ?? null;
        $requestData['report_id'] = $report?->report_id;
        $requestData['evaluation'] = $report?->evaluation;
        $requestData['user_name'] = $request->user?->name;
        $requestData['user_email'] = $request->user?->email;
        $requestData['status'] = $report?->evaluation ?? $request->status;
        
        return Inertia::render('Admin/RequestDetails', [
            'request' => $requestData,
        ]);
    }

    /**
     * Show review page for a request
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
            'application_category' => $request->project?->project_type, // project_type serves as category
            'project_type' => $request->project?->project_type,
            'project_nature' => $request->project?->project_nature,
            'project_nature_duration' => $request->project?->project_nature_duration,
            'project_nature_years' => $request->project?->project_nature_years,
            'project_cost' => $request->project?->project_cost,
            
            // Location info
            'project_location_number' => null, // Not in normalized structure
            'project_location_street' => $request->location?->street_address,
            'project_location_barangay' => $request->location?->barangay,
            'project_location_municipality' => $request->location?->city_municipality,
            'project_location_province' => $request->location?->province,
            
            // Property info
            'project_area_sqm' => ($request->property?->lot_area_sqm + $request->property?->bldg_improvement_sqm), // Calculate total
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
        
        return Inertia::render('Admin/ReviewRequest', [
            'request' => $requestData,
        ]);
    }

    /**
     * Delete a request
     */
    public function deleteRequest($requestId)
    {
        $request = RequestModel::findOrFail($requestId);
        $request->delete();

        return back()->with('success', 'Request deleted successfully!');
    }

    /**
     * Update report evaluation
     */
    public function updateEvaluation(Request $request, $reportId)
    {
        \Log::info('updateEvaluation called with reportId: ' . $reportId);
        \Log::info('Request data: ' . json_encode($request->all()));
        
        $validated = $request->validate([
            'evaluation' => 'required|in:pending,approved,rejected,reviewed',
            'description' => 'nullable|string',
            'amount' => 'nullable|numeric',
            'date_certified' => 'nullable|date',
            'issued_by' => 'nullable|string|max:255',
        ]);

        $report = Report::findOrFail($reportId);
        $oldEvaluation = $report->evaluation;
        
        // Store old values for audit log
        $oldValues = [
            'evaluation' => $report->evaluation,
            'description' => $report->description,
            'amount' => $report->amount,
            'date_certified' => $report->date_certified,
            'issued_by' => $report->issued_by,
        ];
        
        $report->update([
            'evaluation' => $validated['evaluation'],
            'description' => $validated['description'] ?? $report->description,
            'amount' => $validated['amount'] ?? $report->amount,
            'date_certified' => $validated['date_certified'] ?? $report->date_certified,
            'date_reported' => now(),
            'issued_by' => $validated['issued_by'] ?? $report->issued_by,
        ]);
        
        // Log the update in audit log
        $newValues = [
            'evaluation' => $report->evaluation,
            'description' => $report->description,
            'amount' => $report->amount,
            'date_certified' => $report->date_certified,
            'issued_by' => $report->issued_by,
        ];
        
        AuditLogService::logUpdate(
            'Report',
            $report->id,
            $oldValues,
            $newValues,
            "Updated evaluation status from '{$oldEvaluation}' to '{$report->evaluation}'"
        );

        // Send email and SMS notification if status changed
        if ($validated['evaluation'] !== $oldEvaluation) {
            try {
                // Get the request details (reports now link directly to requests via request_id)
                $requestModel = RequestModel::find($report->request_id);
                \Log::info('Request found: ' . ($requestModel ? 'Yes - ID: ' . $requestModel->id . ', User ID: ' . $requestModel->user_id : 'No'));
                
                if ($requestModel && $requestModel->user_id) {
                    $user = \App\Models\User::find($requestModel->user_id);
                    \Log::info('User found: ' . ($user ? 'Yes - Email: ' . $user->email : 'No'));
                    
                    // Load relationships for email
                    $requestModel->load(['applicant']);
                    
                    if ($user) {
                        if ($validated['evaluation'] === 'approved') {
                            \Mail::to($user->email)->send(
                                new \App\Mail\ApplicationApproved(
                                    $requestModel, // Pass request instead of application
                                    $requestModel->applicant->applicant_name ?? 'Applicant',
                                    $requestModel->id
                                )
                            );
                            \Log::info('Application approval email sent to: ' . $user->email . ' for request ID: ' . $requestModel->id);
                            
                            // Create notification for admin review
                            NotificationService::applicationReviewed($requestModel, 'approved', auth()->user());
                            
                            // Send SMS notification
                            if ($user->contact_number) {
                                app(\App\Services\SmsService::class)->sendApplicationApproved(
                                    $user->contact_number,
                                    $user->name,
                                    $requestModel->id
                                );
                            }
                            
                            // Schedule automatic payment reminder for 3 days
                            try {
                                app(\App\Services\ReminderService::class)->schedulePaymentReminder(
                                    $requestModel->id,
                                    $user->id,
                                    3
                                );
                                \Log::info('Payment reminder scheduled for request ID: ' . $requestModel->id . ' (3 days)');
                            } catch (\Exception $e) {
                                \Log::error('Failed to schedule payment reminder: ' . $e->getMessage());
                            }
                        } elseif ($validated['evaluation'] === 'rejected') {
                            $rejectionReason = $validated['description'] ?? 'Your application has been rejected. Please review and resubmit with the necessary corrections.';
                            
                            // Send rejection email immediately (not queued)
                            \Mail::to($user->email)->send(
                                new ApplicationRejected(
                                    $requestModel, // Pass request instead of application
                                    $requestModel->applicant->applicant_name ?? 'Applicant',
                                    $requestModel->id,
                                    $rejectionReason
                                )
                            );
                            
                            // Create notification for rejection
                            NotificationService::applicationRejected($requestModel, $rejectionReason, auth()->user());
                            
                            // Send SMS notification
                            if ($user->contact_number) {
                                app(\App\Services\SmsService::class)->sendApplicationRejected(
                                    $user->contact_number,
                                    $user->name,
                                    $requestModel->id,
                                    $rejectionReason
                                );
                            }
                            
                            // Log the email sending for debugging
                            \Log::info('Application rejection email sent to: ' . $user->email . ' for request ID: ' . $requestModel->id);
                        }
                    } else {
                        \Log::warning('User not found for user_id: ' . $requestModel->user_id);
                    }
                } else {
                    \Log::warning('Request not found for report request_id: ' . $report->request_id);
                }
            } catch (\Exception $e) {
                // Log the error but don't fail the request
                \Log::error('Failed to send status change email: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Application evaluation updated successfully!');
    }

    /**
     * Streamlined review application method (NEW)
     * Allows admin to review or reject with one action
     */
    public function reviewApplication(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:requests,id',
            'action' => 'required|in:reviewed,rejected',
            
            // For "reviewed" action
            'appointment_date' => 'required_if:action,reviewed|nullable|date|after:today',
            'appointment_time' => 'required_if:action,reviewed|nullable',
            'payment_amount' => 'required_if:action,reviewed|nullable|numeric|min:0',
            'requirements' => 'required_if:action,reviewed|nullable|array',
            'requirements.*.id' => 'nullable|integer',
            'requirements.*.name' => 'nullable|string',
            'requirements.*.checked' => 'nullable|boolean',
            'requirements.*.required' => 'nullable|boolean',
            'admin_notes' => 'nullable|string|max:1000',
            
            // For "rejected" action
            'rejection_reason' => 'required_if:action,rejected|nullable|string|max:1000'
        ]);

        \Log::info('Review Application - Request Data:', $request->all());
        \Log::info('Review Application - Validated Data:', $validated);

        $requestModel = RequestModel::with(['applicant', 'project', 'user'])->findOrFail($validated['request_id']);

        if ($validated['action'] === 'reviewed') {
            // Create or update report with review details
            $report = Report::updateOrCreate(
                ['request_id' => $requestModel->id],
                [
                    'evaluation' => 'reviewed',
                    'issued_by' => auth()->user()->name,
                    'date_reported' => now(),
                    'appointment_date' => $validated['appointment_date'],
                    'appointment_time' => $validated['appointment_time'],
                    'payment_amount' => $validated['payment_amount'],
                    'requirements' => json_encode($validated['requirements']),
                    'admin_notes' => $validated['admin_notes'] ?? null,
                    'description' => 'Application reviewed by ' . auth()->user()->name . '. Pending SuperAdmin approval.'
                ]
            );

            // Update request status
            $requestModel->status = 'pending_superadmin_approval';
            $requestModel->save();

            // Log the action
            AuditLogService::logCreate(
                'Report',
                $report->id,
                $report->toArray(),
                "Admin reviewed application #{$requestModel->id} - Pending SuperAdmin approval"
            );

            // Notify SuperAdmins
            $superAdmins = User::where('user_type', 'admin')->get();
            foreach ($superAdmins as $superAdmin) {
                \App\Models\Notification::createForUser(
                    $superAdmin->id,
                    'application_pending_approval',
                    'Application Pending Your Approval',
                    "Application #{$requestModel->id} from " . ($requestModel->applicant->applicant_name ?? 'Applicant') . " has been reviewed and requires your approval.",
                    "/super-admin/applications",
                    [
                        'request_id' => $requestModel->id,
                        'applicant_name' => $requestModel->applicant->applicant_name ?? 'N/A',
                        'project_type' => $requestModel->project->project_type ?? 'N/A',
                    ]
                );
            }

            return back()->with('success', 'Application reviewed successfully! Waiting for SuperAdmin approval.');

        } else {
            // Rejection flow
            $report = Report::updateOrCreate(
                ['request_id' => $requestModel->id],
                [
                    'evaluation' => 'rejected',
                    'issued_by' => auth()->user()->name,
                    'date_reported' => now(),
                    'description' => $validated['rejection_reason']
                ]
            );

            $requestModel->status = 'rejected';
            $requestModel->save();

            // Log the action
            AuditLogService::logCreate(
                'Report',
                $report->id,
                $report->toArray(),
                "Admin rejected application #{$requestModel->id}"
            );

            // Send immediate rejection email and notification
            try {
                if ($requestModel->user && $requestModel->user->email) {
                    \Mail::to($requestModel->user->email)->send(
                        new ApplicationRejected(
                            $requestModel,
                            $requestModel->applicant->applicant_name ?? 'Applicant',
                            $requestModel->id,
                            $validated['rejection_reason']
                        )
                    );
                }

                // Create notification
                NotificationService::applicationRejected($requestModel, $validated['rejection_reason'], auth()->user());

                // Send SMS if contact number exists
                if ($requestModel->user && $requestModel->user->contact_number) {
                    app(\App\Services\SmsService::class)->sendApplicationRejected(
                        $requestModel->user->contact_number,
                        $requestModel->user->name,
                        $requestModel->id,
                        $validated['rejection_reason']
                    );
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send rejection notification: ' . $e->getMessage());
            }

            return back()->with('success', 'Application rejected and applicant has been notified.');
        }
    }

    /**
     * Get requirements for a specific project type
     */
    public function getRequirements(Request $request)
    {
        $projectType = $request->input('project_type');
        
        $requirements = \App\Constants\ApplicationRequirements::getRequirements($projectType);
        
        return response()->json([
            'requirements' => $requirements
        ]);
    }

    /**
     * Display all users with user_type 'applicant'
     */
    public function users(Request $request): Response
    {
        $perPage = $request->input('per_page', 25); // Increased default pagination
        
        $users = \App\Models\User::where('user_type', 'applicant')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    /**
     * Update user information
     */
    public function updateUser(Request $request, $userId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userId . ',id',
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
        ]);

        $user = \App\Models\User::findOrFail($userId);
        $user->update($validated);

        return back()->with('success', 'User updated successfully!');
    }

    /**
     * Delete a user
     */
    public function deleteUser($userId)
    {
        $user = \App\Models\User::findOrFail($userId);
        $user->delete();

        return back()->with('success', 'User deleted successfully!');
    }

    /**
     * Display all payments for verification
     */
    public function payments(Request $request): Response
    {
        $search = $request->input('search', '');
        $statusFilter = $request->input('payment_status', '');
        $methodFilter = $request->input('payment_method', '');
        
        $query = \App\Models\Payment::with(['request.user', 'request.applicant', 'request.project', 'verifiedByUser']);
        
        // Apply filters
        if ($search) {
            $query->whereHas('request.applicant', function($q) use ($search) {
                $q->where('applicant_name', 'like', '%' . $search . '%');
            })->orWhere('receipt_number', 'like', '%' . $search . '%');
        }
        
        if ($statusFilter) {
            $query->where('payment_status', $statusFilter);
        }
        
        if ($methodFilter) {
            $query->where('payment_method', $methodFilter);
        }
        
        $payments = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function($payment) {
                return [
                    'id' => $payment->id,
                    'request_id' => $payment->request_id,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'receipt_number' => $payment->receipt_number,
                    'receipt_file_path' => $payment->receipt_file_path,
                    'payment_date' => $payment->payment_date,
                    'payment_status' => $payment->payment_status,
                    'verified_by' => $payment->verified_by,
                    'verified_at' => $payment->verified_at,
                    'rejection_reason' => $payment->rejection_reason,
                    'notes' => $payment->notes,
                    'created_at' => $payment->created_at,
                    'request' => $payment->request ? [
                        'id' => $payment->request->id,
                        'applicant_name' => $payment->request->applicant->applicant_name ?? 'N/A',
                        'project_type' => $payment->request->project->project_type ?? 'N/A',
                    ] : null,
                    'verified_by_user' => $payment->verifiedByUser ? [
                        'name' => $payment->verifiedByUser->name,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Payments', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'payment_status' => $statusFilter,
                'payment_method' => $methodFilter,
            ],
        ]);
    }

    /**
     * Verify a payment
     */
    public function verifyPayment(Request $request, $paymentId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'receipt_number' => 'required|string',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $payment = \App\Models\Payment::findOrFail($paymentId);
        
        $payment->update([
            'payment_status' => 'verified',
            'amount' => $validated['amount'],
            'receipt_number' => $validated['receipt_number'],
            'payment_date' => $validated['payment_date'],
            'notes' => $validated['notes'] ?? $payment->notes,
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        // Log audit
        AuditLogService::logUpdate(
            'Payment',
            $payment->id,
            ['payment_status' => 'pending'],
            ['payment_status' => 'verified'],
            'Payment verified by admin'
        );

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
            $existingCertificate = \App\Models\Certificate::where('request_id', $requestModel->id)->first();
            
            if (!$existingCertificate) {
                // Generate unique certificate number
                $year = date('Y');
                $sequence = str_pad($requestModel->id, 6, '0', STR_PAD_LEFT);
                $certificateNumber = "CPDO-{$year}-{$sequence}";
                
                // Create certificate record
                $certificate = \App\Models\Certificate::create([
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
                
                // Log certificate creation
                AuditLogService::logCreate(
                    'Certificate',
                    $certificate->id,
                    $certificate->toArray(),
                    "Certificate {$certificateNumber} created after payment verification"
                );
                
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
     * Reject a payment
     */
    public function rejectPayment(Request $request, $paymentId)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string',
        ]);

        $payment = \App\Models\Payment::findOrFail($paymentId);
        
        $payment->update([
            'payment_status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        // Log audit
        AuditLogService::logUpdate(
            'Payment',
            $payment->id,
            ['payment_status' => $payment->getOriginal('payment_status')],
            ['payment_status' => 'rejected'],
            'Payment rejected by admin: ' . $validated['rejection_reason']
        );

        return back()->with('success', 'Payment rejected!');
    }

    /**
     * Display all certificates
     */
    public function certificates(Request $request): Response
    {
        $search = $request->input('search', '');
        $statusFilter = $request->input('status', '');
        
        $query = \App\Models\Certificate::with(['request.user', 'request.applicant', 'request.project', 'release']);
        
        // Apply filters
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('certificate_number', 'like', '%' . $search . '%')
                  ->orWhereHas('request.applicant', function($rq) use ($search) {
                      $rq->where('applicant_name', 'like', '%' . $search . '%');
                  });
            });
        }
        
        if ($statusFilter) {
            $query->where('status', $statusFilter);
        }
        
        $certificates = $query->orderBy('issued_at', 'desc')
            ->paginate(15)
            ->through(function($certificate) {
                return [
                    'id' => $certificate->id,
                    'request_id' => $certificate->request_id,
                    'certificate_number' => $certificate->certificate_number,
                    'status' => $certificate->status,
                    'issued_at' => $certificate->issued_at,
                    'valid_until' => $certificate->valid_until,
                    'created_at' => $certificate->created_at,
                    'request' => $certificate->request ? [
                        'id' => $certificate->request->id,
                        'applicant_name' => $certificate->request->applicant->applicant_name ?? 'N/A',
                        'project_type' => $certificate->request->project->project_type ?? 'N/A',
                    ] : null,
                    'release' => $certificate->release ? [
                        'collected_by_name' => $certificate->release->collected_by_name,
                        'relationship_to_applicant' => $certificate->release->relationship_to_applicant,
                        'valid_id_type' => $certificate->release->valid_id_type,
                        'valid_id_number' => $certificate->release->valid_id_number,
                        'release_date' => $certificate->release->release_date,
                        'release_time' => $certificate->release->release_time,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Certificates', [
            'certificates' => $certificates,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Mark certificate as ready for collection
     */
    public function markCertificateReady(Request $request, $certificateId)
    {
        $validated = $request->validate([
            'certificate_number' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $certificate = \App\Models\Certificate::findOrFail($certificateId);
        
        $certificate->update([
            'status' => 'ready_for_collection',
            'certificate_number' => $validated['certificate_number'],
        ]);

        // Log audit
        AuditLogService::logUpdate(
            'Certificate',
            $certificate->id,
            ['status' => $certificate->getOriginal('status')],
            ['status' => 'ready_for_collection'],
            'Certificate marked as ready for collection by admin'
        );

        return back()->with('success', 'Certificate marked as ready for collection!');
    }

    /**
     * Record certificate collection
     */
    public function releaseCertificate(Request $request, $certificateId)
    {
        $validated = $request->validate([
            'collected_by_name' => 'required|string',
            'relationship_to_applicant' => 'required|string',
            'valid_id_type' => 'required|string',
            'valid_id_number' => 'required|string',
            'release_date' => 'required|date',
            'release_time' => 'required',
            'remarks' => 'nullable|string',
        ]);

        $certificate = \App\Models\Certificate::findOrFail($certificateId);
        
        // Create release record
        \App\Models\CertificateRelease::create([
            'certificate_id' => $certificate->id,
            'collected_by_name' => $validated['collected_by_name'],
            'relationship_to_applicant' => $validated['relationship_to_applicant'],
            'valid_id_type' => $validated['valid_id_type'],
            'valid_id_number' => $validated['valid_id_number'],
            'release_date' => $validated['release_date'],
            'release_time' => $validated['release_time'],
            'released_by' => auth()->id(),
            'remarks' => $validated['remarks'] ?? null,
        ]);

        // Update certificate status
        $certificate->update([
            'status' => 'collected',
        ]);

        // Log audit
        AuditLogService::logUpdate(
            'Certificate',
            $certificate->id,
            ['status' => 'ready_for_collection'],
            ['status' => 'collected'],
            'Certificate collection recorded by admin'
        );

        return back()->with('success', 'Certificate collection recorded successfully!');
    }
    
    /**
     * Export payments to CSV or PDF
     */
    public function exportPayments(Request $request)
    {
        $status = $request->input('status', 'all');
        $format = $request->input('format', 'csv');
        
        $query = \App\Models\Payment::with(['request.user', 'request.applicant', 'verifier']);
        
        if ($status !== 'all') {
            $query->where('payment_status', $status);
        }
        
        $payments = $query->orderBy('created_at', 'desc')->get();
        
        if ($format === 'pdf') {
            return $this->exportPaymentsPDF($payments, $status);
        }
        
        // CSV Export
        $filename = 'payments_export_' . now()->format('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];
        
        $callback = function() use ($payments) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, [
                'Payment ID',
                'Applicant Name',
                'Email Address',
                'Request ID',
                'Payment Method',
                'Receipt Number',
                'Payment Date',
                'Payment Status',
                'Current Status',
                'Total Amount',
                'Processing Fee',
                'Submission Date',
                'Verified By',
                'Verification Date',
                'Receipt Document',
                'Rejection Reason',
                'Notes'
            ]);
            
            // Data
            foreach ($payments as $payment) {
                $subtotal = $payment->amount ?? 0;
                $processingFee = 0; // Assuming no processing fee for now
                $totalAmount = $subtotal + $processingFee;
                
                // Access applicant name through relationship
                $applicantName = $payment->request && $payment->request->applicant 
                    ? $payment->request->applicant->applicant_name 
                    : '';
                
                fputcsv($file, [
                    $payment->id,
                    $applicantName,
                    $payment->request?->user?->email ?? '',
                    '#' . $payment->request_id,
                    ucfirst($payment->payment_method ?? 'cash'),
                    $payment->receipt_number ?? 'N/A',
                    $payment->payment_date ? \Carbon\Carbon::parse($payment->payment_date)->format('M j, Y') : '',
                    ucfirst($payment->payment_status ?? 'pending'),
                    ucfirst($payment->payment_status ?? 'pending'),
                    $totalAmount ? 'PHP ' . number_format($totalAmount, 2) : '',
                    'PHP ' . number_format($processingFee, 2),
                    $payment->created_at ? $payment->created_at->format('M j, Y') : '',
                    $payment->verifier?->name ?? '',
                    $payment->verified_at ? \Carbon\Carbon::parse($payment->verified_at)->format('M j, Y') : '',
                    $payment->receipt_file_path ? 'View Receipt Document' : 'No Receipt',
                    $payment->rejection_reason ?? '',
                    $payment->notes ?? '',
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export payments to PDF
     */
    private function exportPaymentsPDF($payments, $status)
    {
        $data = [
            'payments' => $payments,
            'status' => $status,
            'exportDate' => now()->format('F j, Y'),
            'totalPayments' => $payments->count(),
            'totalAmount' => $payments->sum('amount'),
        ];

        $pdf = \PDF::loadView('exports.payments-pdf', $data);
        $pdf->setPaper('a4', 'landscape');
        $filename = 'payments_export_' . now()->format('Y-m-d_His') . '.pdf';
        
        return $pdf->download($filename);
    }
    
    /**
     * Export applications to CSV or PDF
     */
    public function exportApplications(Request $request)
    {
        $status = $request->input('status', 'all');
        $format = $request->input('format', 'csv');
        
        // Get all requests with their related data and reports (using normalized structure)
        $requests = RequestModel::with([
            'user', 
            'reports', 
            'applicant.corporation', 
            'project', 
            'location', 
            'property'
        ])->orderBy('created_at', 'desc')->get();
        
        $applications = $requests->map(function($request) {
            // Get the latest report for this request
            $report = $request->reports->first();
            
            // Build project location
            $projectLocation = collect([
                $request->location->street_address ?? null,
                $request->location->barangay ?? null,
                $request->location->city_municipality ?? null,
                $request->location->province ?? null
            ])->filter()->implode(', ');
            
            return (object)[
                'id' => $request->id,
                'full_name' => $request->user?->name,
                'email_address' => $request->user?->email,
                'applicant_name' => $request->applicant->applicant_name ?? 'N/A',
                'corporation_name' => $request->applicant->corporation->corporation_name ?? null,
                'applicant_address' => $request->applicant->applicant_address ?? 'N/A',
                'current_status' => $report?->evaluation ?? $request->status,
                'submission_date' => $request->created_at?->format('M j, Y'),
                'project_type' => $request->project->project_type ?? 'N/A',
                'project_nature' => $request->project->project_nature ?? 'N/A',
                'project_location' => $projectLocation,
                'project_area' => $request->property->lot_area_sqm ?? null,
                'lot_area' => $request->property->lot_area_sqm ?? null,
                'building_area' => $request->property->bldg_improvement_sqm ?? null,
                'project_cost' => $request->project->project_cost ? '₱' . number_format($request->project->project_cost, 2) : '',
                'right_over_land' => $request->property->right_over_land ?? 'Owner',
                'project_duration' => $request->project->project_nature_duration ?? 'Permanent',
                'existing_land_use' => $request->property->existing_land_use ?? 'Not Tenanted',
                'written_notice_to_tenants' => $request->property->has_written_notice ? 'YES' : 'NO',
                'similar_application_filed' => $request->property->has_similar_application ? 'YES' : 'NO',
                'release_preference' => $request->preferred_release_mode ?? 'mail applicant',
                'authorized_representative' => $request->authorization_letter_path ? 'Yes' : 'No Authorized Representative',
                'authorization_note' => $request->authorization_letter_path ? 'Has authorized representative' : 'This application was submitted directly by the applicant',
                'created_at' => $request->created_at,
            ];
        });
        
        if ($status !== 'all') {
            $applications = $applications->filter(function($app) use ($status) {
                return $app->current_status === $status;
            });
        }

        if ($format === 'pdf') {
            return $this->exportApplicationsPDF($applications, $status);
        }
        
        // CSV Export
        $filename = 'applications_export_' . now()->format('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];
        
        $callback = function() use ($applications) {
            $file = fopen('php://output', 'w');
            
            // Headers - User Information
            fputcsv($file, [
                'Request ID',
                'Full Name',
                'Email Address',
                'Applicant Name',
                'Corporation Name',
                'Corporation Address',
                'Current Status',
                'Submission Date',
                'Project Type',
                'Project Nature',
                'Project Location',
                'Project Area (sqm)',
                'Lot Area (sqm)',
                'Building Area (sqm)',
                'Project Cost',
                'Right Over Land',
                'Project Duration',
                'Existing Land Use',
                'Written Notice to Tenants',
                'Similar Application Filed',
                'Release Preference',
                'Authorized Representative',
                'Authorization Note'
            ]);
            
            // Data
            foreach ($applications as $app) {
                fputcsv($file, [
                    $app->id,
                    $app->full_name ?? '',
                    $app->email_address ?? '',
                    $app->applicant_name ?? '',
                    $app->corporation_name ?? '',
                    $app->applicant_address ?? '',
                    ucfirst($app->current_status ?? 'Pending'),
                    $app->submission_date ?? '',
                    $app->project_type ?? '',
                    $app->project_nature ?? '',
                    $app->project_location ?? '',
                    $app->project_area ?? '',
                    $app->lot_area ?? '',
                    $app->building_area ?? '',
                    $app->project_cost ?? '',
                    $app->right_over_land ?? '',
                    $app->project_duration ?? '',
                    $app->existing_land_use ?? '',
                    $app->written_notice_to_tenants ?? '',
                    $app->similar_application_filed ?? '',
                    $app->release_preference ?? '',
                    $app->authorized_representative ?? '',
                    $app->authorization_note ?? '',
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export applications to PDF
     */
    private function exportApplicationsPDF($applications, $status)
    {
        $data = [
            'applications' => $applications,
            'status' => $status,
            'exportDate' => now()->format('F j, Y'),
            'totalApplications' => $applications->count(),
        ];

        $pdf = \PDF::loadView('exports.applications-pdf', $data);
        $pdf->setPaper('a4', 'landscape');
        $filename = 'applications_export_' . now()->format('Y-m-d_His') . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Global search across all modules
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $results = [];

        // Search Requests - use normalized tables
        $requests = RequestModel::leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_corporations', 'applicants.id', '=', 'normalized_corporations.applicant_id')
            ->leftJoin('locations', 'requests.id', '=', 'locations.request_id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->where(function($q) use ($query) {
                $q->where('applicants.applicant_name', 'LIKE', "%{$query}%")
                  ->orWhere('normalized_corporations.corporation_name', 'LIKE', "%{$query}%")
                  ->orWhere('locations.barangay', 'LIKE', "%{$query}%")
                  ->orWhere('requests.id', 'LIKE', "%{$query}%");
            })
            ->select([
                'requests.id',
                'applicants.applicant_name',
                'normalized_projects.project_type',
                'locations.barangay'
            ])
            ->limit(5)
            ->get();

        foreach ($requests as $req) {
            $results[] = [
                'type' => 'request',
                'title' => $req->applicant_name ?? 'Request #' . $req->id,
                'description' => "Request #{$req->id} - " . ($req->project_type ?? 'N/A'),
                'meta' => $req->barangay ?? '',
                'url' => route('admin.requests'),
            ];
        }

        // Search Payments
        $payments = Payment::with(['request.applicant'])
            ->whereHas('request.applicant', function($q) use ($query) {
                $q->where('applicant_name', 'LIKE', "%{$query}%");
            })
            ->orWhere('receipt_number', 'LIKE', "%{$query}%")
            ->orWhere('id', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($payments as $payment) {
            $applicantName = $payment->request && $payment->request->applicant 
                ? $payment->request->applicant->applicant_name 
                : 'Payment';
                
            $results[] = [
                'type' => 'payment',
                'title' => $applicantName,
                'description' => "Payment #{$payment->id} - ₱" . number_format($payment->amount, 2),
                'meta' => ucfirst($payment->payment_status),
                'url' => route('admin.payments'),
            ];
        }

        // Search Users
        $users = User::where('name', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($users as $user) {
            $results[] = [
                'type' => 'user',
                'title' => $user->name,
                'description' => $user->email,
                'meta' => ucfirst($user->user_type),
                'url' => route('admin.users'),
            ];
        }

        return response()->json($results);
    }

    /**
     * Export requests to CSV or PDF
     */
    public function exportRequests(Request $request)
    {
        $status = $request->input('status', 'all');
        $format = $request->input('format', 'pdf');
        
        // Get all requests with their related data and reports (using normalized structure)
        $requestsData = RequestModel::with([
            'user', 
            'reports', 
            'applicant.corporation', 
            'applicant.representative',
            'project', 
            'location', 
            'property'
        ])->orderBy('created_at', 'desc')->get();
        
        $requests = $requestsData->map(function($request) {
            // Get the latest report for this request
            $report = $request->reports->first();
            
            return (object)[
                'id' => $request->id,
                'applicant_name' => $request->applicant->applicant_name ?? 'N/A',
                'applicant_address' => $request->applicant->applicant_address ?? 'N/A',
                'corporation_name' => $request->applicant->corporation->corporation_name ?? null,
                'corporation_address' => $request->applicant->corporation->corporation_address ?? null,
                'authorized_representative_name' => $request->applicant->representative->representative_name ?? null,
                'authorized_representative_address' => $request->applicant->representative->representative_address ?? null,
                'authorization_letter_path' => $request->authorization_letter_path,
                'project_type' => $request->project->project_type ?? 'N/A',
                'project_nature' => $request->project->project_nature ?? 'N/A',
                'project_location_number' => $request->location->lot_number ?? null,
                'project_location_street' => $request->location->street_address ?? null,
                'project_location_barangay' => $request->location->barangay ?? null,
                'project_location_municipality' => $request->location->city_municipality ?? null,
                'project_location_city' => $request->location->city_municipality ?? null,
                'project_location_province' => $request->location->province ?? null,
                'project_area_sqm' => $request->property->lot_area_sqm ?? null,
                'lot_area_sqm' => $request->property->lot_area_sqm ?? null,
                'bldg_improvement_sqm' => $request->property->bldg_improvement_sqm ?? null,
                'right_over_land' => $request->property->right_over_land ?? null,
                'project_nature_duration' => $request->project->project_nature_duration ?? null,
                'project_nature_years' => $request->project->project_nature_years ?? null,
                'project_cost' => $request->project->project_cost ?? null,
                'existing_land_use' => $request->property->existing_land_use ?? null,
                'has_written_notice' => $request->property->has_written_notice ?? false,
                'notice_officer_name' => $request->property->notice_officer_name ?? null,
                'notice_dates' => $request->property->notice_dates ?? null,
                'has_similar_application' => $request->property->has_similar_application ?? false,
                'similar_application_offices' => $request->property->similar_application_offices ?? null,
                'similar_application_dates' => $request->property->similar_application_dates ?? null,
                'preferred_release_mode' => $request->preferred_release_mode,
                'release_address' => $request->release_address,
                'user_name' => $request->user?->name,
                'user_email' => $request->user?->email,
                'status' => $report?->evaluation ?? $request->status,
                'created_at' => $request->created_at,
            ];
        });
        
        if ($status !== 'all') {
            $requests = $requests->filter(function($req) use ($status) {
                return $req->status === $status;
            });
        }

        if ($format === 'pdf') {
            return $this->exportRequestsPDF($requests, $status);
        }
        
        // CSV Export
        $filename = 'requests_export_' . now()->format('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];
        
        $callback = function() use ($requests) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, [
                'ID',
                'Applicant Name',
                'Corporation',
                'Address',
                'Project Type',
                'Project Nature',
                'Location Street',
                'Location Barangay',
                'Location City',
                'Location Municipality',
                'Location Province',
                'Lot Area (sqm)',
                'Project Cost',
                'User Name',
                'User Email',
                'Status',
                'Has Authorization Letter',
                'Submitted At'
            ]);
            
            // Data
            foreach ($requests as $req) {
                fputcsv($file, [
                    $req->id,
                    $req->applicant_name,
                    $req->corporation_name ?? '',
                    $req->applicant_address,
                    $req->project_type ?? '',
                    $req->project_nature ?? '',
                    $req->project_location_street ?? '',
                    $req->project_location_barangay ?? '',
                    $req->project_location_city ?? '',
                    $req->project_location_municipality ?? '',
                    $req->project_location_province ?? '',
                    $req->lot_area_sqm ?? '',
                    $req->project_cost ?? '',
                    $req->user_name,
                    $req->user_email,
                    $req->status,
                    $req->authorization_letter_path ? 'Yes' : 'No',
                    $req->created_at,
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export requests to PDF
     */
    private function exportRequestsPDF($requests, $status)
    {
        $data = [
            'requests' => $requests,
            'status' => $status,
            'exportDate' => now()->format('F j, Y'),
            'totalRequests' => $requests->count(),
        ];

        $pdf = \PDF::loadView('exports.requests-pdf', $data);
        $pdf->setPaper('a4', 'landscape');
        $filename = 'requests_export_' . now()->format('Y-m-d_His') . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Export users to CSV or PDF
     */
    public function exportUsers(Request $request)
    {
        $userType = $request->input('user_type', 'all');
        $format = $request->input('format', 'csv');
        
        $query = \App\Models\User::query();
        
        if ($userType !== 'all') {
            $query->where('user_type', $userType);
        }
        
        $users = $query->orderBy('created_at', 'desc')->get();

        if ($format === 'pdf') {
            return $this->exportUsersPDF($users, $userType);
        }
        
        // CSV Export
        $filename = 'users_export_' . now()->format('Y-m-d_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];
        
        $callback = function() use ($users) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, [
                'User ID',
                'Full Name',
                'Email Address',
                'Contact Number',
                'Address',
                'User Type',
                'Email Verified',
                'Registration Date'
            ]);
            
            // Data
            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name ?? '',
                    $user->email ?? '',
                    $user->contact_number ?? '',
                    $user->address ?? '',
                    ucfirst($user->user_type ?? 'applicant'),
                    $user->email_verified_at ? 'Yes' : 'No',
                    $user->created_at ? $user->created_at->format('M j, Y') : '',
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export users to PDF
     */
    private function exportUsersPDF($users, $userType)
    {
        $data = [
            'users' => $users,
            'userType' => $userType,
            'exportDate' => now()->format('F j, Y'),
            'totalUsers' => $users->count(),
        ];

        $pdf = \PDF::loadView('exports.users-pdf', $data);
        $filename = 'users_export_' . now()->format('Y-m-d_His') . '.pdf';
        
        return $pdf->download($filename);
    }

    /**
     * Get detailed evaluation distribution data
     */
    private function getEvaluationDistribution()
    {
        // Use the same logic as the main stats calculation (using normalized structure)
        $allRequests = RequestModel::with(['user', 'reports'])->get();

        $statusCounts = ['pending' => 0, 'approved' => 0, 'rejected' => 0];
        $requestsWithoutReports = 0;
        $requestsWithReports = 0;
        
        foreach ($allRequests as $request) {
            // Get the latest report for this request
            $report = $request->reports->first();
            
            // Use report evaluation if available, otherwise use request status
            $status = $report?->evaluation ?? $request->status;
            
            if (isset($statusCounts[$status])) {
                $statusCounts[$status]++;
            }
            
            // Track if request has report or not
            if ($report) {
                $requestsWithReports++;
            } else {
                $requestsWithoutReports++;
            }
        }

        $total = array_sum($statusCounts);

        return [
            'pending' => $statusCounts['pending'],
            'approved' => $statusCounts['approved'],
            'rejected' => $statusCounts['rejected'],
            'total' => $total,
            'percentages' => [
                'pending' => $total > 0 ? round(($statusCounts['pending'] / $total) * 100, 1) : 0,
                'approved' => $total > 0 ? round(($statusCounts['approved'] / $total) * 100, 1) : 0,
                'rejected' => $total > 0 ? round(($statusCounts['rejected'] / $total) * 100, 1) : 0,
            ],
            'raw_data' => [
                'requests_with_reports' => $requestsWithReports,
                'requests_without_reports' => $requestsWithoutReports,
                'status_breakdown' => $statusCounts,
            ]
        ];
    }

    /**
     * Bulk approve requests
     */
    public function bulkApprove(Request $request)
    {
        $request->validate([
            'request_ids' => 'required|array',
            'request_ids.*' => 'integer|exists:requests,id'
        ]);

        $successCount = 0;
        $errors = [];

        foreach ($request->request_ids as $requestId) {
            try {
                $requestModel = RequestModel::with('reports')->findOrFail($requestId);
                
                // Find the report for this request
                $report = $requestModel->reports->first();

                if (!$report) {
                    $errors[] = "No report found for request #{$requestId}";
                    continue;
                }

                $report->evaluation = 'approved';
                $report->issued_by = auth()->user()->name ?? 'Admin';
                $report->date_reported = now();
                $report->save();

                // Load relationships for email
                $requestModel->load(['applicant']);

                // Send approval email
                try {
                    \Mail::to($requestModel->user->email)->send(new \App\Mail\ApplicationApproved(
                        $application,
                        $requestModel->applicant->applicant_name ?? 'Applicant',
                        $requestModel->id
                    ));
                    
                    // Schedule automatic payment reminder for 3 days
                    app(\App\Services\ReminderService::class)->schedulePaymentReminder(
                        $requestModel->id,
                        $requestModel->user_id,
                        3
                    );
                    \Log::info('Payment reminder scheduled for request ID: ' . $requestModel->id . ' (3 days)');
                } catch (\Exception $e) {
                    \Log::error("Failed to send approval email for request {$requestId}: " . $e->getMessage());
                }

                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to approve request #{$requestId}: " . $e->getMessage();
            }
        }

        $flashData = ['success' => "Successfully approved {$successCount} request(s)."];
        
        if (!empty($errors)) {
            $flashData['error'] = 'Some requests failed: ' . implode(', ', $errors);
        }
        
        return redirect()->back()->with($flashData);
    }

    /**
     * Bulk reject requests
     */
    public function bulkReject(Request $request)
    {
        $request->validate([
            'request_ids' => 'required|array',
            'request_ids.*' => 'integer|exists:requests,id',
            'reason' => 'required|string|max:1000'
        ]);

        $successCount = 0;
        $errors = [];

        foreach ($request->request_ids as $requestId) {
            try {
                $requestModel = RequestModel::with(['applicant', 'reports'])->findOrFail($requestId);
                
                // Get or create report for this request
                $report = $requestModel->reports->first();
                
                if (!$report) {
                    $report = new Report();
                    $report->request_id = $requestModel->id;
                }

                $report->evaluation = 'rejected';
                $report->description = $request->reason;
                $report->issued_by = auth()->user()->name ?? 'Admin';
                $report->date_reported = now();
                $report->save();

                // Send rejection email
                try {
                    \Mail::to($requestModel->user->email)->send(new ApplicationRejected(
                        $requestModel,
                        $requestModel->applicant->applicant_name ?? 'Applicant',
                        $requestModel->id,
                        $request->reason
                    ));
                } catch (\Exception $e) {
                    \Log::error("Failed to send rejection email for request {$requestId}: " . $e->getMessage());
                }

                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to reject request #{$requestId}: " . $e->getMessage();
            }
        }

        $flashData = ['success' => "Successfully rejected {$successCount} request(s)."];
        
        if (!empty($errors)) {
            $flashData['error'] = 'Some requests failed: ' . implode(', ', $errors);
        }
        
        return redirect()->back()->with($flashData);
    }

    /**
     * Bulk delete requests
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'request_ids' => 'required|array',
            'request_ids.*' => 'integer|exists:requests,id'
        ]);

        $successCount = 0;
        $errors = [];

        foreach ($request->request_ids as $requestId) {
            try {
                $requestModel = RequestModel::with(['reports'])->findOrFail($requestId);
                
                // Delete related reports
                if ($requestModel->reports) {
                    $requestModel->reports()->delete();
                }

                // Delete the request (cascade will handle normalized tables if set up)
                $requestModel->delete();
                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to delete request #{$requestId}: " . $e->getMessage();
            }
        }

        $flashData = ['success' => "Successfully deleted {$successCount} request(s)."];
        
        if (!empty($errors)) {
            $flashData['error'] = 'Some requests failed: ' . implode(', ', $errors);
        }
        
        return redirect()->back()->with($flashData);
    }

    /**
     * Display audit logs
     */
    public function auditLogs(Request $request): Response
    {
        $perPage = $request->input('per_page', 25);
        
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
        $users = \App\Models\User::select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $actions = AuditLog::select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        $modelTypes = AuditLog::select('model_type')
            ->distinct()
            ->whereNotNull('model_type')
            ->orderBy('model_type')
            ->pluck('model_type');

        // Log this view
        AuditLogService::log(
            'viewed',
            'Viewed audit logs page',
            'AuditLog',
            null
        );

        return Inertia::render('Admin/AuditLogs', [
            'logs' => $logs,
            'users' => $users,
            'actions' => $actions,
            'modelTypes' => $modelTypes,
            'filters' => $request->only(['user_id', 'action', 'model_type', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Export audit logs
     */
    public function exportAuditLogs(Request $request)
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        // Apply same filters as the view
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

        $logs = $query->get();

        // Log this export
        AuditLogService::logExport('audit_logs', $logs->count(), 'pdf');

        $pdf = Pdf::loadView('exports.audit-logs-pdf', ['logs' => $logs])
            ->setPaper('a4', 'landscape');

        return $pdf->download('audit-logs-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * View single audit log details
     */
    public function viewAuditLog($id)
    {
        $log = AuditLog::with('user')->findOrFail($id);

        return response()->json($log);
    }
}
