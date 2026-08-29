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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Services\DashboardCacheService;
use App\Services\NotificationService;
use App\Services\AuditLogService;
use App\Models\AuditLog;
use App\Mail\ApplicationApprovedWithDetails;
use App\Mail\ApplicationRejected;
use Illuminate\Support\Facades\Mail;

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
    /**
     * Get admin workflow and activity metrics
     */
    private function getAdminWorkflowMetrics()
    {
        // Get all admin users
        $admins = User::whereIn('user_type', ['admin', 'super_admin'])->get();

        // Admin performance by reviews
        $adminPerformance = Report::select(
                'issued_by',
                DB::raw('COUNT(*) as total_reviews'),
                DB::raw('SUM(CASE WHEN evaluation = "approved" THEN 1 ELSE 0 END) as approved_count'),
                DB::raw('SUM(CASE WHEN evaluation = "rejected" THEN 1 ELSE 0 END) as rejected_count'),
                DB::raw('SUM(CASE WHEN evaluation = "pending" THEN 1 ELSE 0 END) as pending_count'),
                DB::raw('AVG(DATEDIFF(date_reported, (SELECT created_at FROM requests WHERE requests.id = reports.request_id))) as avg_review_time')
            )
            ->whereNotNull('issued_by')
            ->groupBy('issued_by')
            ->get()
            ->map(function($item) use ($admins) {
                $admin = $admins->firstWhere('name', $item->issued_by);
                return [
                    'admin_name' => $item->issued_by,
                    'admin_email' => $admin?->email ?? 'N/A',
                    'total_reviews' => $item->total_reviews,
                    'approved' => $item->approved_count,
                    'rejected' => $item->rejected_count,
                    'pending' => $item->pending_count,
                    'avg_review_time' => round($item->avg_review_time ?? 0, 1),
                    'approval_rate' => $item->total_reviews > 0 ? round(($item->approved_count / $item->total_reviews) * 100, 1) : 0,
                ];
            });

        // Recent admin actions from audit logs
        $recentAdminActions = AuditLog::with('user')
            ->whereHas('user', function($query) {
                $query->whereIn('user_type', ['admin', 'super_admin']);
            })
            ->latest()
            ->take(20)
            ->get()
            ->map(function($log) {
                return [
                    'id' => $log->id,
                    'admin_name' => $log->user?->name ?? 'Unknown',
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'entity_id' => $log->entity_id,
                    'description' => $log->description,
                    'created_at' => $log->created_at,
                ];
            });

        // Admin activity by hour (last 7 days)
        $adminActivityByHour = AuditLog::whereHas('user', function($query) {
                $query->whereIn('user_type', ['admin', 'super_admin']);
            })
            ->where('created_at', '>=', now()->subDays(7))
            ->select(
                DB::raw('HOUR(created_at) as hour'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // Admin activity by day of week
        $adminActivityByDay = AuditLog::whereHas('user', function($query) {
                $query->whereIn('user_type', ['admin', 'super_admin']);
            })
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DAYOFWEEK(created_at) as day'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Reviews by status over time (last 6 months)
        $reviewTrend = Report::where('date_reported', '>=', now()->subMonths(6))
            ->select(
                DB::raw('DATE_FORMAT(date_reported, "%Y-%m") as month'),
                'evaluation',
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('month', 'evaluation')
            ->orderBy('month')
            ->get()
            ->groupBy('month')
            ->map(function($monthData, $month) {
                $result = ['month' => $month];
                foreach ($monthData as $item) {
                    $result[$item->evaluation] = $item->count;
                }
                return $result;
            })
            ->values();

        // Certificate issuance by admin
        $certificatesByAdmin = \App\Models\Certificate::select(
                'issued_by',
                DB::raw('COUNT(*) as total_issued'),
                DB::raw('SUM(CASE WHEN status = "released" THEN 1 ELSE 0 END) as released_count')
            )
            ->whereNotNull('issued_by')
            ->groupBy('issued_by')
            ->get();

        // Admin response time metrics
        $adminResponseMetrics = [
            'fastest_review' => Report::whereNotNull('date_reported')
                ->join('requests', 'reports.request_id', '=', 'requests.id')
                ->selectRaw('MIN(DATEDIFF(reports.date_reported, requests.created_at)) as min_days')
                ->value('min_days') ?? 0,
            'slowest_review' => Report::whereNotNull('date_reported')
                ->join('requests', 'reports.request_id', '=', 'requests.id')
                ->selectRaw('MAX(DATEDIFF(reports.date_reported, requests.created_at)) as max_days')
                ->value('max_days') ?? 0,
            'avg_review' => Report::whereNotNull('date_reported')
                ->join('requests', 'reports.request_id', '=', 'requests.id')
                ->selectRaw('AVG(DATEDIFF(reports.date_reported, requests.created_at)) as avg_days')
                ->value('avg_days') ?? 0,
        ];

        return [
            'admin_performance' => $adminPerformance,
            'recent_actions' => $recentAdminActions,
            'activity_by_hour' => $adminActivityByHour,
            'activity_by_day' => $adminActivityByDay,
            'review_trend' => $reviewTrend,
            'certificates_by_admin' => $certificatesByAdmin,
            'response_metrics' => $adminResponseMetrics,
        ];
    }

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

        // Get admin workflow and activity metrics
        $adminActivity = $this->getAdminWorkflowMetrics();

        return Inertia::render('SuperAdmin/Dashboard', [
            'applications' => $requests,
            'stats' => $stats,
            'analytics' => $analytics,
            'evaluationDistribution' => $evaluationDistribution,
            'systemStats' => $systemStats,
            'adminActivity' => $adminActivity,
        ]);
    }

    /**
     * Display all requests for super admin with approve/reject actions
     */
    public function requests(Request $request): Response
    {
        // Get ALL requests with their related data and reports (using normalized structure)
        $requestsData = RequestModel::with(['user', 'reports', 'applicant', 'project', 'location'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $requests = $requestsData->map(function($request) {
            // Get the latest report for this request
            $report = $request->reports->first();
            
            $requestArray = $request->toArray();
            $requestArray['application_id']           = $request->id;
            $requestArray['authorization_letter_path']= $request->authorization_letter_path ?? null;
            $requestArray['report_id']                = $report?->report_id;
            $requestArray['evaluation']               = $report?->evaluation;
            $requestArray['user_name']                = $request->user?->name;
            $requestArray['user_email']               = $request->user?->email;
            $requestArray['status']                   = $report?->evaluation ?? $request->status;

            // Applicant
            $requestArray['applicant_name']           = $request->applicant?->applicant_name;

            // Project type from normalized_projects
            $requestArray['project_type']             = $request->project?->project_type;

            // Location fields from locations table
            $requestArray['project_location_street']      = $request->location?->street_address;
            $requestArray['project_location_barangay']    = $request->location?->barangay;
            $requestArray['project_location_city']        = $request->location?->city_municipality;
            $requestArray['project_location_municipality']= $request->location?->city_municipality;
            $requestArray['project_location_province']    = $request->location?->province;
            
            return $requestArray;
        });

        return Inertia::render('SuperAdmin/Requests', [
            'requests' => $requests,
        ]);
    }

    /**
     * Export requests to CSV/Excel
     */
    public function exportRequests(Request $request)
    {
        $status = $request->input('status', 'all');
        $format = $request->input('format', 'csv');
        
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
                'application_number' => $request->application_number,
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
                'Control Number',
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
                    $req->application_number ?? "#" . $req->id,
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
            'property',
            'requirementDocuments' // Add requirement documents
        ])->findOrFail($id);
        
        // Get the latest report for this request
        $report = $request->reports->first();
        
        // Build the request data with normalized relationships
        $requestData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
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
            
            // Requirement documents
            'uploaded_requirements' => $request->requirementDocuments->map(function($doc) {
                return [
                    'id' => $doc->id,
                    'requirement_id' => $doc->requirement_id,
                    'requirement_name' => $doc->requirement_name,
                    'original_filename' => $doc->original_filename,
                    'file_path' => $doc->file_path,
                    'mime_type' => $doc->mime_type,
                    'file_size' => $doc->file_size,
                    'created_at' => $doc->created_at,
                ];
            }),

            // Full requirements list for this project type, so the frontend can
            // group uploaded documents into "Main" vs "Additional" sections.
            'requirements_reference' => \App\Constants\ApplicationRequirements::getRequirements(
                $request->project?->project_type ?? 'ZONING CLEARANCE'
            ),
        ];
        
        return Inertia::render('SuperAdmin/ReviewRequest', [
            'request' => $requestData,
        ]);
    }

    /**
     * Show view application page (Steps 1-3 only)
     */
    public function viewApplication($id): Response
    {
        $request = RequestModel::with([
            'user', 
            'reports',
            'applicant.corporation',
            'applicant.primaryRepresentative',
            'project',
            'location',
            'property',
        ])->findOrFail($id);
        
        // Get the latest report for this request
        $report = $request->reports->first();
        
        // Build the request data - same as reviewRequest but for ViewApplication page
        $requestData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
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
            'application_id' => $request->id,
        ];
        
        return Inertia::render('SuperAdmin/ViewApplication', [
            'request' => $requestData,
        ]);
    }

    /**
     * Show document verification page (Step 4 + Review form)
     */
    public function documentVerification($id): Response
    {
        $request = RequestModel::with([
            'user', 
            'reports',
            'applicant.corporation',
            'applicant.primaryRepresentative',
            'project',
            'location',
            'property',
            'requirementDocuments'
        ])->findOrFail($id);
        
        // Get the latest report for this request
        $report = $request->reports->first();
        
        // Build the request data with requirements focus
        $requestData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'status' => $report?->evaluation ?? $request->status,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            
            // Project info (minimal - needed for requirements)
            'application_category' => $request->project?->project_type,
            'project_type' => $request->project?->project_type,
            
            // Requirement documents
            'uploaded_requirements' => $request->requirementDocuments->map(function($doc) {
                return [
                    'id' => $doc->id,
                    'requirement_id' => $doc->requirement_id,
                    'requirement_name' => $doc->requirement_name,
                    'original_filename' => $doc->original_filename,
                    'file_path' => $doc->file_path,
                    'mime_type' => $doc->mime_type,
                    'file_size' => $doc->file_size,
                    'created_at' => $doc->created_at,
                ];
            })->toArray(),

            // Full requirements list
            'requirements_reference' => \App\Constants\ApplicationRequirements::getRequirements(
                $request->project?->project_type ?? 'ZONING CLEARANCE'
            ),
            
            // Verified requirements toggle state
            'verified_requirements' => $request->verified_requirements ?? [],
            
            // Review/rejection info
            'rejection_reason' => $report?->description ?? null,
            'admin_notes' => $report?->admin_notes ?? null,
            
            // Report info
            'report_id' => $report?->report_id,
            'application_id' => $request->id,
        ];
        
        return Inertia::render('SuperAdmin/DocumentVerification', [
            'request' => $requestData,
        ]);
    }

    /**
     * Save requirement verification toggle state to database
     */
    public function saveRequirementVerification(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:requests,id',
            'verified_requirements' => 'required|array',
        ]);

        $requestModel = RequestModel::findOrFail($validated['request_id']);
        $requestModel->verified_requirements = $validated['verified_requirements'];
        $requestModel->save();

        return response()->json([
            'success' => true,
            'message' => 'Requirement verification saved successfully',
            'verified_requirements' => $requestModel->verified_requirements,
        ]);
    }

    /**
     * Upload requirement document by super admin
     */
    public function uploadRequirementDocument(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // 10MB max
            'request_id' => 'required|exists:requests,id',
            'requirement_id' => 'required',
            'requirement_name' => 'required|string',
        ]);

        try {
            $requestModel = RequestModel::findOrFail($validated['request_id']);
            $file = $request->file('file');
            
            // Store the file
            $path = $file->store('requirements', 'public');
            
            // Create requirement document record
            $requirementDoc = \App\Models\RequirementDocument::create([
                'request_id' => $validated['request_id'],
                'requirement_id' => $validated['requirement_id'],
                'requirement_name' => $validated['requirement_name'],
                'original_filename' => $file->getClientOriginalName(),
                'stored_filename' => basename($path),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'uploaded_by_admin' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'document' => $requirementDoc,
            ]);
        } catch (\Exception $e) {
            \Log::error('SuperAdmin upload requirement document failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Approve a request (Super Admin only) - UPDATED FOR NEW WORKFLOW
     * After admin review, SuperAdmin gives final approval and applicant gets notified
     */
    /**
     * Quick approve a request (creates report if doesn't exist)
     */
    public function quickApprove(Request $request, $requestId)
    {
        $requestModel = RequestModel::with(['applicant', 'project', 'user', 'reports'])->findOrFail($requestId);

        // Check if report exists, create one if it doesn't
        $report = $requestModel->reports()->first();
        
        if (!$report) {
            // Create a new report for this request
            $report = Report::create([
                'request_id' => $requestModel->id,
                'evaluation' => 'approved',
                'approved_by' => auth()->user()->name,
                'approved_at' => now(),
                'description' => 'Quick approved by SuperAdmin ' . auth()->user()->name,
                'issued_by' => auth()->user()->name,
                'date_reported' => now(),
            ]);
        } else {
            // Update existing report
            $report->evaluation = 'approved';
            $report->approved_by = auth()->user()->name;
            $report->approved_at = now();
            $report->description = ($report->description ? $report->description . ' | ' : '') . 'Quick approved by SuperAdmin ' . auth()->user()->name;
            $report->save();
        }

        // Update request status
        $requestModel->status = 'approved';
        
        // Generate decision number if not already generated
        if (empty($requestModel->decision_number)) {
            $projectType = $requestModel->project->project_type ?? null;
            // Handle empty string as well
            if (empty($projectType)) {
                $projectType = 'CZC';
            }
            $requestModel->decision_number = $requestModel->generateDecisionNumber($projectType);
        }
        
        $requestModel->save();

        // Log the action
        AuditLogService::log(
            'quick_approve',
            "SuperAdmin quick approved application #{$requestModel->id} (App#: {$requestModel->application_number})",
            'Request',
            $requestModel->id,
            null,
            [
                'admin_name' => auth()->user()->name,
                'request_id' => $requestModel->id,
                'application_number' => $requestModel->application_number,
            ]
        );

        // Send notifications
        try {
            if ($requestModel->user && $requestModel->user->email) {
                \Mail::to($requestModel->user->email)->send(
                    new \App\Mail\ApplicationApproved(
                        $requestModel,
                        $requestModel->applicant->applicant_name ?? 'Applicant',
                        $requestModel->id
                    )
                );
            }

            // Create in-app notification
            NotificationService::applicationReviewed($requestModel, 'approved', auth()->user());

            // Send SMS if available
            if ($requestModel->user && $requestModel->user->contact_number) {
                app(\App\Services\SmsService::class)->sendApplicationApproved(
                    $requestModel->user->contact_number,
                    $requestModel->user->name,
                    $requestModel->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($requestModel->id, 4, '0', STR_PAD_LEFT)
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send quick approval notifications: ' . $e->getMessage());
        }

        return back()->with('success', 'Request approved successfully! Applicant has been notified.');
    }

    /**
     * Quick reject a request (creates report if doesn't exist)
     */
    public function quickReject(Request $request, $requestId)
    {
        $validated = $request->validate([
            'description' => 'required|string|min:10',
        ]);

        $requestModel = RequestModel::with(['applicant', 'project', 'user', 'reports'])->findOrFail($requestId);

        // Check if report exists, create one if it doesn't
        $report = $requestModel->reports()->first();
        
        if (!$report) {
            // Create a new report for this request
            $report = Report::create([
                'request_id' => $requestModel->id,
                'evaluation' => 'rejected',
                'approved_by' => auth()->user()->name,
                'approved_at' => now(),
                'description' => $validated['description'],
                'issued_by' => auth()->user()->name,
                'date_reported' => now(),
            ]);
        } else {
            // Update existing report
            $report->evaluation = 'rejected';
            $report->approved_by = auth()->user()->name;
            $report->approved_at = now();
            $report->description = $validated['description'];
            $report->save();
        }

        // Update request status
        $requestModel->status = 'rejected';
        $requestModel->save();

        // Log the action
        AuditLogService::log(
            'quick_reject',
            "SuperAdmin quick rejected application #{$requestModel->id} (App#: {$requestModel->application_number})",
            'Request',
            $requestModel->id,
            null,
            [
                'admin_name' => auth()->user()->name,
                'request_id' => $requestModel->id,
                'application_number' => $requestModel->application_number,
                'reason' => $validated['description'],
            ]
        );

        // Send notifications
        try {
            if ($requestModel->user && $requestModel->user->email) {
                Mail::to($requestModel->user->email)->send(
                    new ApplicationRejected(
                        $requestModel,
                        $requestModel->applicant->applicant_name ?? 'Applicant',
                        $requestModel->id,
                        $validated['description']
                    )
                );

                if ($requestModel->user->contact_number) {
                    app(\App\Services\SmsService::class)->sendApplicationRejected(
                        $requestModel->user->contact_number,
                        $requestModel->user->name,
                        $requestModel->control_number ?? 'CPD-' . str_pad($requestModel->id, 4, '0', STR_PAD_LEFT),
                        $validated['description']
                    );
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send rejection notification: ' . $e->getMessage());
        }

        return back()->with('success', 'Request rejected successfully! Applicant has been notified.');
    }

    /**
     * Approve a request
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
        
        // Generate decision number if not already generated
        if (empty($requestModel->decision_number)) {
            $projectType = $requestModel->project->project_type ?? null;
            // Handle empty string as well
            if (empty($projectType)) {
                $projectType = 'CZC';
            }
            $requestModel->decision_number = $requestModel->generateDecisionNumber($projectType);
        }
        
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
                        null, // appointment_date removed
                        null, // appointment_time removed
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
                "Your application #{$requestModel->id} has been approved! Check your email for payment details and requirements.",
                "/my-applications",
                [
                    'request_id' => $requestModel->id,
                    'payment_amount' => $report->payment_amount,
                ]
            );

            // Send SMS if available
            if ($requestModel->user && $requestModel->user->contact_number) {
                try {
                    $smsService = app(\App\Services\SmsService::class);
                    
                    $paymentAmount = $report->payment_amount 
                        ? number_format((float)$report->payment_amount, 2)
                        : '0.00';
                    
                    // Build comprehensive SMS message
                    $message = "Hello {$requestModel->user->name},\n\n";
                    $message .= "Congratulations! Your CPDO application (Request #{$requestModel->id}) has been APPROVED!\n\n";
                    $message .= "PAYMENT DETAILS:\n";
                    $message .= "Amount: PHP {$paymentAmount}\n";
                    
                    if (!empty($report->admin_notes)) {
                        $message .= "\nNOTE FROM CPDO:\n{$report->admin_notes}\n";
                    }
                    
                    $message .= "\nNEXT STEP: Please proceed to the Treasury Office to pay the amount above. ";
                    $message .= "After payment, bring your Official Receipt (OR) and requirements to CPDO to continue processing.\n\n";
                    $message .= "Thank you!\n- CPDO";
                    
                    // Send the SMS
                    $smsService->send($requestModel->user->contact_number, $message);
                    
                    \Log::info('Approval SMS with payment details sent', [
                        'request_id' => $requestModel->id,
                        'contact_number' => $requestModel->user->contact_number,
                        'payment_amount' => $paymentAmount,
                    ]);
                } catch (\Exception $e) {
                    \Log::error('Failed to send approval SMS: ' . $e->getMessage(), [
                        'request_id' => $requestModel->id,
                        'error' => $e->getMessage(),
                    ]);
                }
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
        $requestModel = $report->request;
        $oldValues = ['evaluation' => $report->evaluation];
        
        $report->update([
            'evaluation' => 'rejected',
            'description' => $validated['description'],
            'date_reported' => now(),
            'issued_by' => auth()->user()->name,
        ]);

        // Log the rejection
        AuditLogService::logUpdate(
            'Report',
            $report->id,
            $oldValues,
            ['evaluation' => 'rejected'],
            "SuperAdmin rejected application #{$report->request_id} — Reason: " . $validated['description']
        );

        // Notify applicant
        try {
            if ($requestModel && $requestModel->user) {
                $requestModel->status = 'rejected';
                $requestModel->save();

                \Mail::to($requestModel->user->email)->send(
                    new \App\Mail\ApplicationRejected(
                        $requestModel,
                        $requestModel->applicant->applicant_name ?? 'Applicant',
                        $requestModel->id,
                        $validated['description']
                    )
                );

                if ($requestModel->user->contact_number) {
                    app(\App\Services\SmsService::class)->sendApplicationRejected(
                        $requestModel->user->contact_number,
                        $requestModel->user->name,
                        $requestModel->control_number ?? 'CPD-' . str_pad($requestModel->id, 4, '0', STR_PAD_LEFT),
                        $validated['description']
                    );
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send rejection notification: ' . $e->getMessage());
        }

        return back()->with('success', 'Request rejected successfully! Applicant has been notified.');
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
            ->leftJoin('requests', function($join) {
                $join->on('audit_logs.model_type', '=', \DB::raw("'Request'"))
                     ->on('audit_logs.model_id', '=', 'requests.id');
            })
            ->select('audit_logs.*', 'requests.application_number')
            ->orderBy('audit_logs.created_at', 'desc');

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
        // Build query for certificates
        $query = \App\Models\Certificate::with([
            'request.applicant',
            'request.project',
            'request.payments' => function($q) {
                $q->where('payment_status', 'verified')->latest();
            }
        ])
        ->orderBy('issued_at', 'desc');

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('certificate_number', 'like', "%{$search}%")
                  ->orWhereHas('request.applicant', function($q) use ($search) {
                      $q->where('applicant_name', 'like', "%{$search}%");
                  });
            });
        }

        // Apply status filter
        if ($request->filled('status') && $request->get('status') !== 'all') {
            $status = $request->get('status');
            if ($status === 'preparing') {
                $query->whereNull('certificate_file_path');
            } elseif ($status === 'released') {
                $query->whereNotNull('certificate_file_path');
            }
        }

        // Paginate results
        $certificates = $query->paginate(15)->through(function($certificate) {
            // Check if there's a verified payment for this request
            $verifiedPayment = $certificate->request->payments->first();
            
            return [
                'id' => $certificate->id,
                'request_id' => $certificate->request_id,
                'certificate_number' => $certificate->certificate_number,
                'request' => [
                    'id' => $certificate->request->id,
                    'application_number' => $certificate->request->application_number,
                    'applicant' => [
                        'applicant_name' => $certificate->request->applicant->applicant_name ?? 'N/A',
                    ],
                    'project_type' => $certificate->request->project->project_type ?? 'N/A',
                ],
                'issued_at' => $certificate->issued_at,
                'certificate_file_path' => $certificate->certificate_file_path,
                'has_verified_payment' => $verifiedPayment !== null,
                'payment_reference' => $verifiedPayment?->reference_number ?? null,
            ];
        });

        return Inertia::render('SuperAdmin/Certificates', [
            'certificates' => $certificates,
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status', 'all'),
            ],
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
     * Unified payments page with tabs for pending, verified, and all payments
     */
    public function payments(Request $request): Response
    {
        // Get ALL approved requests (by Super Admin) - these are requests awaiting payment
        $approvedRequests = RequestModel::with(['applicant', 'project', 'location', 'user', 'payments'])
            ->whereIn('status', ['approved', 'payment_confirmed'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function($request) {
                // Check if there's a verified payment
                $verifiedPayment = $request->payments->where('payment_status', 'verified')->first();
                
                // Calculate days waiting since approval
                $daysWaiting = $request->updated_at->diffInDays(now());
                
                return [
                    'request_id' => $request->id,
                    'application_number' => $request->application_number ?? '#' . $request->id,
                    'applicant_name' => $request->applicant->applicant_name ?? 'Unknown',
                    'expected_amount' => $this->getExpectedAmount($request->project_type),
                    'approved_at' => $request->updated_at->format('Y-m-d'),
                    'days_waiting' => $daysWaiting,
                    'project_type' => $request->project->project_type ?? 'N/A',
                    'payment_order_number' => "PO-{$request->id}",
                    'payment_status' => $verifiedPayment ? 'verified' : 'pending',
                    'has_payment' => $verifiedPayment !== null,
                    'payment_id' => $verifiedPayment?->id,
                    'status' => $request->status,
                ];
            });
        
        // Get ALL verified payments
        $verifiedPayments = Payment::with(['request.applicant', 'request.project', 'verifiedByUser'])
            ->where('payment_status', 'verified')
            ->orderBy('verified_at', 'desc')
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'request_id' => $payment->request_id,
                    'application_number' => $payment->request->application_number ?? '#' . $payment->request_id,
                    'control_number' => $payment->request->control_number ?? null,
                    'amount' => $payment->amount,
                    'payment_method' => $payment->payment_method,
                    'receipt_number' => $payment->receipt_number,
                    'payment_date' => $payment->payment_date,
                    'payment_status' => $payment->payment_status,
                    'verified_by' => $payment->verified_by,
                    'verified_at' => $payment->verified_at,
                    'notes' => $payment->notes,
                    'created_at' => $payment->created_at,
                    'applicant_name' => $payment->request->applicant->applicant_name ?? 'N/A',
                    'project_type' => $payment->request->project->project_type ?? 'N/A',
                    'verified_by_name' => $payment->verifiedByUser->name ?? 'N/A',
                ];
            });
        
        // Get ALL payments (including pending, verified, rejected)
        $allPayments = Payment::with(['request.applicant', 'request.project', 'verifiedByUser'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'request_id' => $payment->request_id,
                    'application_number' => $payment->request->application_number ?? '#' . $payment->request_id,
                    'control_number' => $payment->request->control_number ?? null,
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
                    'applicant_name' => $payment->request->applicant->applicant_name ?? 'N/A',
                    'project_type' => $payment->request->project->project_type ?? 'N/A',
                    'verified_by_name' => $payment->verifiedByUser->name ?? 'N/A',
                ];
            });

        return Inertia::render('SuperAdmin/PaymentsUnified', [
            'pendingPayments' => $approvedRequests, // ALL approved requests (with or without payment)
            'verifiedPayments' => $verifiedPayments,
            'allPayments' => $allPayments,
        ]);
    }

    /**
     * Upload payment receipt (image or PDF)
     */
    public function uploadReceipt(Request $request)
    {
        $validated = $request->validate([
            'payment_id' => 'required|exists:payments,id',
            'receipt_file' => 'required|file|mimes:jpeg,jpg,png,gif,pdf|max:5120', // 5MB max
        ]);

        $payment = Payment::findOrFail($validated['payment_id']);

        // Delete old receipt if exists
        if ($payment->receipt_file_path && \Storage::disk('local')->exists($payment->receipt_file_path)) {
            \Storage::disk('local')->delete($payment->receipt_file_path);
        }

        // Store the new receipt on the private disk with a non-guessable name
        $file = $request->file('receipt_file');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('receipts', $filename, 'local');

        // Update payment record
        $payment->update([
            'receipt_file_path' => $path,
            'receipt_uploaded_at' => now(),
            'receipt_uploaded_by' => auth()->id(),
        ]);

        // Log the action
        AuditLogService::logUpdate(
            'Payment',
            $payment->id,
            ['receipt_file_path' => null],
            ['receipt_file_path' => $path],
            "Uploaded payment receipt for Request #{$payment->request_id}"
        );

        return back()->with('success', 'Payment receipt uploaded successfully!');
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

        // Clear dashboard cache so analytics reflect this payment immediately
        $this->cacheService->clearCache();

        // Send payment-verified SMS immediately
        try {
            $pmtReq = $payment->request()->with('user')->first();
            if ($pmtReq && $pmtReq->user && $pmtReq->user->contact_number) {
                app(\App\Services\SmsService::class)->sendPaymentVerified(
                    $pmtReq->user->contact_number,
                    $pmtReq->user->name,
                    $pmtReq->control_number ?? 'CPD-' . str_pad($pmtReq->id, 4, '0', STR_PAD_LEFT),
                    (float) $payment->amount
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send payment verified SMS (SuperAdmin): ' . $e->getMessage());
        }

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

        // Clear dashboard cache so analytics reflect this payment immediately
        $this->cacheService->clearCache();

        // Notify applicant of payment rejection
        try {
            $rejReq = $payment->request()->with('user')->first();
            if ($rejReq && $rejReq->user && $rejReq->user->contact_number) {
                app(\App\Services\SmsService::class)->sendPaymentRejected(
                    $rejReq->user->contact_number,
                    $rejReq->user->name,
                    $rejReq->control_number ?? 'CPD-' . str_pad($rejReq->id, 4, '0', STR_PAD_LEFT),
                    $validated['rejection_reason']
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send payment rejected SMS (SuperAdmin): ' . $e->getMessage());
        }

        return back()->with('success', 'Payment rejected successfully! Applicant has been notified.');
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

    /**
     * Show super admin profile page
     */
    public function profile()
    {
        return Inertia::render('SuperAdmin/Profile', [
            'mustVerifyEmail' => false,
            'status' => session('status'),
        ]);
    }

    /**
     * Update super admin profile information
     */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . Auth::id()],
        ]);

        $user = Auth::user();
        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('status', 'profile-updated');
    }

    /**
     * Update super admin password
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('status', 'password-updated');
    }

    /**
     * Get expected payment amount based on project type
     */
    private function getExpectedAmount(?string $projectType): float
    {
        if (!$projectType) {
            return 500.00; // Default amount
        }

        return match (strtoupper(trim($projectType))) {
            'SUP', 'SPECIAL USE PERMIT' => 750.00,
            'TUP', 'TEMPORARY USE PERMIT' => 350.00,
            'CZC', 'CERTIFICATE OF ZONING COMPLIANCE', 'ZONING CLEARANCE', 'LOCATIONAL CLEARANCE', 'ZONING' => 500.00,
            default => 500.00, // Default for any other type
        };
    }

    /**
     * Generate certificate for approved application
     */
    public function generateCertificate($id)
    {
        $request = \App\Models\Request::with([
            'user',
            'applicant.corporation',
            'project',
            'location',
            'property',
            'payments' => function($query) {
                $query->where('payment_status', 'verified')->latest();
            }
        ])->findOrFail($id);

        // Allow generating certificate for approved applications
        if (strtolower($request->status) !== 'approved') {
            return redirect()->back()->with('error', 'Certificate can only be generated for approved applications');
        }

        $payment = $request->payments->first();
        
        // Get the reviewer (admin who reviewed the application)
        $report = \App\Models\Report::where('request_id', $id)
            ->whereIn('evaluation', ['approved', 'reviewed'])
            ->latest()
            ->first();
            
        $reviewer = null;
        if ($report) {
            // Try to get reviewer from issued_by (user ID) or reviewed_by (user ID)
            $reviewerId = $report->reviewed_by ?? $report->issued_by;
            if ($reviewerId) {
                $reviewer = \App\Models\User::find($reviewerId);
            }
            // If no ID found, try issued_by as name (legacy support)
            if (!$reviewer && $report->issued_by && !is_numeric($report->issued_by)) {
                $reviewer = (object)['name' => $report->issued_by];
            }
        }

        $applicationData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'decision_number' => $request->decision_number,
            'status' => $request->status,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            'applicant_name' => $request->applicant?->applicant_name,
            'applicant_address' => $request->applicant?->applicant_address,
            'corporation_name' => $request->applicant?->corporation?->corporation_name,
            'corporation_address' => $request->applicant?->corporation?->corporation_address,
            'project_type' => $request->project?->project_type,
            'project_nature' => $request->project?->project_nature,
            'project_cost' => $request->project?->project_cost,
            'project_location_street' => $request->location?->street_address,
            'project_location_barangay' => $request->location?->barangay,
            'project_location_municipality' => $request->location?->city_municipality,
            'right_over_land' => $request->property?->right_over_land,
        ];

        return \Inertia\Inertia::render('Admin/GenerateCertificate', [
            'application' => $applicationData,
            'payment' => $payment,
            'reviewer' => $reviewer,
        ]);
    }

    /**
     * Generate clearance for approved application
     */
    public function generateClearance($id)
    {
        $request = \App\Models\Request::with([
            'user',
            'applicant.corporation',
            'project',
            'location',
            'property',
            'payments' => function($query) {
                $query->where('payment_status', 'verified')->latest();
            }
        ])->findOrFail($id);

        // Allow generating clearance for approved applications
        if (strtolower($request->status) !== 'approved') {
            return redirect()->back()->with('error', 'Clearance can only be generated for approved applications');
        }

        $payment = $request->payments->first();
        
        // Get the reviewer (admin who reviewed the application)
        $report = \App\Models\Report::where('request_id', $id)
            ->whereIn('evaluation', ['approved', 'reviewed'])
            ->latest()
            ->first();
            
        $reviewer = null;
        if ($report) {
            // Try to get reviewer from issued_by (user ID) or reviewed_by (user ID)
            $reviewerId = $report->reviewed_by ?? $report->issued_by;
            if ($reviewerId) {
                $reviewer = \App\Models\User::find($reviewerId);
            }
            // If no ID found, try issued_by as name (legacy support)
            if (!$reviewer && $report->issued_by && !is_numeric($report->issued_by)) {
                $reviewer = (object)['name' => $report->issued_by];
            }
        }

        $applicationData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'decision_number' => $request->decision_number,
            'status' => $request->status,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            'applicant_name' => $request->applicant?->applicant_name,
            'applicant_address' => $request->applicant?->applicant_address,
            'corporation_name' => $request->applicant?->corporation?->corporation_name,
            'corporation_address' => $request->applicant?->corporation?->corporation_address,
            'project_type' => $request->project?->project_type,
            'project_nature' => $request->project?->project_nature,
            'project_cost' => $request->project?->project_cost,
            'project_location_street' => $request->location?->street_address,
            'project_location_barangay' => $request->location?->barangay,
            'project_location_municipality' => $request->location?->city_municipality,
            'right_over_land' => $request->property?->right_over_land,
        ];

        return \Inertia\Inertia::render('Admin/GenerateClearance', [
            'application' => $applicationData,
            'payment' => $payment,
            'reviewer' => $reviewer,
        ]);
    }

    /**
     * Generate order of payment for application
     */
    public function generateOrderOfPayment($id)
    {
        $request = \App\Models\Request::with([
            'user',
            'applicant.corporation',
            'project',
            'location',
            'property',
            'payments' => function($query) {
                $query->where('payment_status', 'verified')->latest();
            }
        ])->findOrFail($id);

        $payment = $request->payments->first();
        
        // Get the reviewer (admin who reviewed the application)
        $report = \App\Models\Report::where('request_id', $id)
            ->latest()
            ->first();
            
        $reviewer = null;
        if ($report) {
            // Try to get reviewer from issued_by (user ID) or reviewed_by (user ID)
            $reviewerId = $report->reviewed_by ?? $report->issued_by;
            if ($reviewerId) {
                $reviewer = \App\Models\User::find($reviewerId);
            }
            // If no ID found, try issued_by as name (legacy support)
            if (!$reviewer && $report->issued_by && !is_numeric($report->issued_by)) {
                $reviewer = (object)['name' => $report->issued_by];
            }
        }

        $applicationData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'decision_number' => $request->decision_number,
            'status' => $request->status,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            'applicant_name' => $request->applicant?->applicant_name,
            'applicant_address' => $request->applicant?->applicant_address,
            'corporation_name' => $request->applicant?->corporation?->corporation_name,
            'corporation_address' => $request->applicant?->corporation?->corporation_address,
            'project_type' => $request->project?->project_type,
            'project_nature' => $request->project?->project_nature,
            'project_cost' => $request->project?->project_cost,
            'project_location_street' => $request->location?->street_address,
            'project_location_barangay' => $request->location?->barangay,
            'project_location_municipality' => $request->location?->city_municipality,
            'right_over_land' => $request->property?->right_over_land,
        ];

        return \Inertia\Inertia::render('Admin/GenerateOrderOfPayment', [
            'application' => $applicationData,
            'payment' => $payment,
            'reviewer' => $reviewer,
        ]);
    }

}
