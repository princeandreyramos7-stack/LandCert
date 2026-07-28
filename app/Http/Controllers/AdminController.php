<?php

namespace App\Http\Controllers;

use App\Models\Application;
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
        
        $perPage = $request->input('per_page', 25); // Increased default pagination
        
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

        // Get cached stats and evaluation distribution
        $stats = $this->cacheService->getStats();
        $evaluationDistribution = $this->cacheService->getEvaluationDistribution();

        return Inertia::render('Admin/Dashboard', [
            'applications' => $applications,
            'stats' => $stats,
            'analytics' => $analytics,
            'evaluationDistribution' => $evaluationDistribution,
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
            ->join('applications', 'reports.app_id', '=', 'applications.id')
            ->selectRaw('AVG(DATEDIFF(reports.date_reported, applications.created_at)) as avg_days')
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
        $projectTypes = RequestModel::select('project_type', DB::raw('COUNT(*) as count'))
            ->whereNotNull('project_type')
            ->groupBy('project_type')
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
        $perPage = $request->input('per_page', 25); // Increased default pagination
        
        // Get all requests with their related data
        $requests = RequestModel::with('user')->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Get applications and reports data
        $applicationsData = Application::with('report')->get()->keyBy(function($app) {
            return $app->applicant_name . '|' . $app->applicant_address;
        });
        
        // Merge the data
        $applications = $requests->map(function($request) use ($applicationsData) {
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
        
        // Get all requests with their related data including property location and DSS evaluation
        $requestsData = RequestModel::with([
            'user'
        ])->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Get applications and reports data
        $applicationsData = Application::with('report')->get()->keyBy(function($app) {
            return $app->applicant_name . '|' . $app->applicant_address;
        });
        
        // Merge the data
        $requests = $requestsData->through(function($request) use ($applicationsData) {
            $key = $request->applicant_name . '|' . $request->applicant_address;
            $application = $applicationsData->get($key);
            $report = $application?->report;
            
            // Convert to array and add additional fields
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

        return Inertia::render('Admin/Request', [
            'requests' => $requests,
        ]);
    }

    /**
     * View a single request details
     */
    public function viewRequest($id): Response
    {
        $request = RequestModel::with(['user'])
            ->findOrFail($id);
        
        // Get application data
        $key = $request->applicant_name . '|' . $request->applicant_address;
        $application = Application::with('report')
            ->where('applicant_name', $request->applicant_name)
            ->where('applicant_address', $request->applicant_address)
            ->first();
        
        $report = $application?->report;
        
        // Convert to array and add additional fields
        $requestData = $request->toArray();
        $requestData['application_id'] = $application?->id;
        $requestData['authorization_letter_path'] = $application?->authorization_letter_path;
        $requestData['report_id'] = $report?->getKey();
        $requestData['evaluation'] = $report?->evaluation;
        $requestData['user_name'] = $request->user?->name;
        $requestData['user_email'] = $request->user?->email;
        $requestData['status'] = $report?->evaluation ?? $request->status;
        
        return Inertia::render('Admin/RequestDetails', [
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
                // Get the application and request details
                $application = Application::find($report->app_id);
                \Log::info('Application found: ' . ($application ? 'Yes - ID: ' . $application->id : 'No'));
                
                if ($application) {
                    \Log::info('Looking for request with applicant_name: ' . $application->applicant_name . ' and applicant_address: ' . $application->applicant_address);
                    
                    // Find the request associated with this application
                    $requestModel = RequestModel::where('applicant_name', $application->applicant_name)
                        ->where('applicant_address', $application->applicant_address)
                        ->first();
                    
                    \Log::info('Request found: ' . ($requestModel ? 'Yes - ID: ' . $requestModel->id . ', User ID: ' . $requestModel->user_id : 'No'));
                    
                    if ($requestModel && $requestModel->user_id) {
                        $user = \App\Models\User::find($requestModel->user_id);
                        \Log::info('User found: ' . ($user ? 'Yes - Email: ' . $user->email : 'No'));
                        
                        if ($user) {
                            if ($validated['evaluation'] === 'approved') {
                                \Mail::to($user->email)->send(
                                    new \App\Mail\ApplicationApproved(
                                        $application,
                                        $application->applicant_name,
                                        $requestModel->id
                                    )
                                );
                                \Log::info('Application approval email sent to: ' . $user->email . ' for request ID: ' . $requestModel->id);
                                
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
                                        $application,
                                        $application->applicant_name,
                                        $requestModel->id,
                                        $rejectionReason
                                    )
                                );
                                
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
                        \Log::warning('Request not found or missing user_id for application: ' . $application->applicant_name);
                    }
                } else {
                    \Log::warning('Application not found for report app_id: ' . $report->app_id);
                }
            } catch (\Exception $e) {
                // Log the error but don't fail the request
                \Log::error('Failed to send status change email: ' . $e->getMessage());
            }
        }

        return back()->with('success', 'Application evaluation updated successfully!');
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
        
        $query = \App\Models\Payment::with(['request.user', 'verifiedByUser']);
        
        // Apply filters
        if ($search) {
            $query->whereHas('request', function($q) use ($search) {
                $q->where('applicant_name', 'like', '%' . $search . '%')
                  ->orWhere('receipt_number', 'like', '%' . $search . '%');
            });
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
                        'applicant_name' => $payment->request->applicant_name,
                        'project_type' => $payment->request->project_type,
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

        return back()->with('success', 'Payment verified successfully!');
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
        
        $query = \App\Models\Certificate::with(['request.user', 'release']);
        
        // Apply filters
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('certificate_number', 'like', '%' . $search . '%')
                  ->orWhereHas('request', function($rq) use ($search) {
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
                        'applicant_name' => $certificate->request->applicant_name,
                        'project_type' => $certificate->request->project_type,
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
        
        $query = \App\Models\Payment::with(['request.user', 'verifier']);
        
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
                
                fputcsv($file, [
                    $payment->id,
                    $payment->request?->applicant_name ?? '',
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
        
        $requests = RequestModel::with('user')->orderBy('created_at', 'desc')->get();
        $applicationsData = Application::with('report')->get()->keyBy(function($app) {
            return $app->applicant_name . '|' . $app->applicant_address;
        });
        
        $applications = $requests->map(function($request) use ($applicationsData) {
            $key = $request->applicant_name . '|' . $request->applicant_address;
            $application = $applicationsData->get($key);
            $report = $application?->report;
            
            // Build project location
            $projectLocation = collect([
                $request->project_location_street,
                $request->project_location_barangay,
                $request->project_location_city ?? $request->project_location_municipality,
                $request->project_location_province
            ])->filter()->implode(', ');
            
            return (object)[
                'id' => $request->id,
                'full_name' => $request->user?->name,
                'email_address' => $request->user?->email,
                'applicant_name' => $request->applicant_name,
                'corporation_name' => $request->corporation_name,
                'applicant_address' => $request->applicant_address,
                'current_status' => $report?->evaluation ?? $request->status,
                'submission_date' => $request->created_at?->format('M j, Y'),
                'project_type' => $request->project_type,
                'project_nature' => $request->project_nature,
                'project_location' => $projectLocation,
                'project_area' => $request->project_area_sqm,
                'lot_area' => $request->lot_area_sqm,
                'building_area' => $request->bldg_improvement_sqm,
                'project_cost' => $request->project_cost ? '₱' . number_format($request->project_cost, 2) : '',
                'right_over_land' => $request->right_over_land ?? 'Owner',
                'project_duration' => $request->project_nature_duration ?? 'Permanent',
                'existing_land_use' => $request->existing_land_use ?? 'Not Tenanted',
                'written_notice_to_tenants' => $request->has_written_notice ? 'YES' : 'NO',
                'similar_application_filed' => $request->has_similar_application ? 'YES' : 'NO',
                'release_preference' => $request->preferred_release_mode ?? 'mail applicant',
                'authorized_representative' => $application?->authorization_letter_path ? 'Yes' : 'No Authorized Representative',
                'authorization_note' => $application?->authorization_letter_path ? 'Has authorized representative' : 'This application was submitted directly by the applicant',
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

        // Search Requests
        $requests = RequestModel::where('applicant_name', 'LIKE', "%{$query}%")
            ->orWhere('corporation_name', 'LIKE', "%{$query}%")
            ->orWhere('project_location_barangay', 'LIKE', "%{$query}%")
            ->orWhere('id', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get();

        foreach ($requests as $req) {
            $results[] = [
                'type' => 'request',
                'title' => $req->applicant_name,
                'description' => "Request #{$req->id} - {$req->project_type}",
                'meta' => $req->project_location_barangay,
                'url' => route('admin.requests'),
            ];
        }

        // Search Payments
        $payments = Payment::whereHas('request', function($q) use ($query) {
                $q->where('applicant_name', 'LIKE', "%{$query}%");
            })
            ->orWhere('receipt_number', 'LIKE', "%{$query}%")
            ->orWhere('id', 'LIKE', "%{$query}%")
            ->with('request')
            ->limit(5)
            ->get();

        foreach ($payments as $payment) {
            $results[] = [
                'type' => 'payment',
                'title' => $payment->request->applicant_name ?? 'Payment',
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
        
        $requestsData = RequestModel::with('user')->orderBy('created_at', 'desc')->get();
        $applicationsData = Application::with('report')->get()->keyBy(function($app) {
            return $app->applicant_name . '|' . $app->applicant_address;
        });
        
        $requests = $requestsData->map(function($request) use ($applicationsData) {
            $key = $request->applicant_name . '|' . $request->applicant_address;
            $application = $applicationsData->get($key);
            $report = $application?->report;
            
            return (object)[
                'id' => $request->id,
                'applicant_name' => $request->applicant_name,
                'applicant_address' => $request->applicant_address,
                'corporation_name' => $request->corporation_name,
                'corporation_address' => $request->corporation_address,
                'authorized_representative_name' => $request->authorized_representative_name ?? $application?->authorized_representative_name,
                'authorized_representative_address' => $request->authorized_representative_address ?? $application?->authorized_representative_address,
                'authorization_letter_path' => $application?->authorization_letter_path,
                'project_type' => $request->project_type,
                'project_nature' => $request->project_nature,
                'project_location_number' => $request->project_location_number,
                'project_location_street' => $request->project_location_street,
                'project_location_barangay' => $request->project_location_barangay,
                'project_location_municipality' => $request->project_location_municipality,
                'project_location_city' => $request->project_location_city,
                'project_location_province' => $request->project_location_province,
                'project_area_sqm' => $request->project_area_sqm,
                'lot_area_sqm' => $request->lot_area_sqm,
                'bldg_improvement_sqm' => $request->bldg_improvement_sqm,
                'right_over_land' => $request->right_over_land,
                'project_nature_duration' => $request->project_nature_duration,
                'project_nature_years' => $request->project_nature_years,
                'project_cost' => $request->project_cost,
                'existing_land_use' => $request->existing_land_use,
                'has_written_notice' => $request->has_written_notice,
                'notice_officer_name' => $request->notice_officer_name,
                'notice_dates' => $request->notice_dates,
                'has_similar_application' => $request->has_similar_application,
                'similar_application_offices' => $request->similar_application_offices,
                'similar_application_dates' => $request->similar_application_dates,
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
        // Use the same logic as the main stats calculation
        $allRequests = RequestModel::with('user')->get();
        $applicationsData = Application::with('report')->get()->keyBy(function($app) {
            return $app->applicant_name . '|' . $app->applicant_address;
        });

        $statusCounts = ['pending' => 0, 'approved' => 0, 'rejected' => 0];
        $requestsWithoutReports = 0;
        $requestsWithReports = 0;
        
        foreach ($allRequests as $request) {
            $key = $request->applicant_name . '|' . $request->applicant_address;
            $application = $applicationsData->get($key);
            $report = $application?->report;
            
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
                $requestModel = RequestModel::findOrFail($requestId);
                
                // Find the application and report
                $application = Application::where('applicant_name', $requestModel->applicant_name)
                    ->where('applicant_address', $requestModel->applicant_address)
                    ->first();

                if (!$application || !$application->report) {
                    $errors[] = "No report found for request #{$requestId}";
                    continue;
                }

                $report = $application->report;
                $report->evaluation = 'approved';
                $report->issued_by = auth()->user()->name ?? 'Admin';
                $report->date_reported = now();
                $report->save();

                // Send approval email
                try {
                    \Mail::to($requestModel->user->email)->send(new \App\Mail\ApplicationApproved(
                        $application,
                        $requestModel->applicant_name,
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
                $requestModel = RequestModel::findOrFail($requestId);
                
                // Find the application and report
                $application = Application::where('applicant_name', $requestModel->applicant_name)
                    ->where('applicant_address', $requestModel->applicant_address)
                    ->first();

                if (!$application || !$application->report) {
                    $errors[] = "No report found for request #{$requestId}";
                    continue;
                }

                $report = $application->report;
                $report->evaluation = 'rejected';
                $report->description = $request->reason;
                $report->issued_by = auth()->user()->name ?? 'Admin';
                $report->date_reported = now();
                $report->save();

                // Send rejection email
                try {
                    \Mail::to($requestModel->user->email)->send(new ApplicationRejected(
                        $application,
                        $requestModel->applicant_name,
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
                $requestModel = RequestModel::findOrFail($requestId);
                
                // Find and delete related application and report
                $application = Application::where('applicant_name', $requestModel->applicant_name)
                    ->where('applicant_address', $requestModel->applicant_address)
                    ->first();

                if ($application) {
                    if ($application->report) {
                        $application->report->delete();
                    }
                    $application->delete();
                }

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
