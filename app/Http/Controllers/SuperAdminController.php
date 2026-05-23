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
     * Display zoning map with GIS features
     */
    public function zoningMap(Request $request): Response
    {
        // Get all property locations with zoning information
        $properties = \App\Models\PropertyLocation::with(['zoningRule'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'address' => $property->address,
                    'barangay' => $property->barangay,
                    'district' => $property->district,
                    'latitude' => $property->latitude,
                    'longitude' => $property->longitude,
                    'lot_area' => $property->lot_area,
                    'lot_number' => $property->lot_number,
                    'title_number' => $property->title_number,
                    'zone_classification' => $property->zoningRule?->zone_type ?? 'Unclassified',
                    'zone_name' => $property->zoningRule?->zone_name ?? 'N/A',
                    'zone_code' => $property->zoningRule?->zone_code ?? 'N/A',
                    'zoning_rule' => $property->zoningRule,
                ];
            });

        // Get all zoning rules
        $zoningRules = \App\Models\ZoningRule::where('is_active', true)->get();

        // Get statistics
        $propertiesByZone = \App\Models\PropertyLocation::with('zoningRule')
            ->get()
            ->groupBy(function ($property) {
                return $property->zoningRule?->zone_type ?? 'Unclassified';
            })
            ->map(function ($group) {
                return $group->count();
            });

        $stats = [
            'total_properties' => \App\Models\PropertyLocation::count(),
            'total_zones' => \App\Models\ZoningRule::where('is_active', true)->count(),
            'properties_by_zone' => $propertiesByZone,
        ];

        return Inertia::render('SuperAdmin/ZoningMap', [
            'properties' => $properties,
            'zoningRules' => $zoningRules,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a new property location
     */
    public function storeProperty(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'required|string|max:500',
            'barangay' => 'required|string|max:255',
            'zone_type' => 'required|string|in:residential,commercial,industrial,agricultural,institutional,mixed',
            'lot_area' => 'nullable|numeric|min:0',
        ]);

        // Find the first active zoning rule based on zone type
        $zoningRule = \App\Models\ZoningRule::where('zone_type', $validated['zone_type'])
            ->where('is_active', true)
            ->first();

        if (!$zoningRule) {
            return back()->with('error', 'No active zoning rule found for ' . $validated['zone_type']);
        }

        // Create the property
        $property = \App\Models\PropertyLocation::create([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'address' => $validated['address'],
            'barangay' => $validated['barangay'],
            'district' => 'District 1', // Default, can be made dynamic
            'zoning_rule_id' => $zoningRule->id,
            'lot_area' => $validated['lot_area'] ?? null,
        ]);

        return back()->with('success', 'Property added successfully with zone: ' . $zoningRule->zone_name);
    }
}
