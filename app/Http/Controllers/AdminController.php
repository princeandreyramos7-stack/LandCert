<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
                DB::raw("CASE WHEN requests.status IN ('payment_confirmed','certificate_preparing','certificate_ready','released') THEN requests.status ELSE COALESCE(reports.evaluation, requests.status) END as status")
            )
            ->orderBy('requests.created_at', 'desc')
            ->paginate($perPage);

        // Get cached stats and evaluation distribution
        $stats = $this->cacheService->getStats();
        $evaluationDistribution = $this->cacheService->getEvaluationDistribution();

        return Inertia::render('Admin/Dashboard', [
            'applications' => $requests,
            'stats' => $stats,
            'analytics' => $analytics,
            'evaluationDistribution' => $evaluationDistribution,
        ]);
    }
    

    /**
     * Display all requests for admin
     */
    public function requests(Request $request): Response
    {
        // Get ALL requests with their related data (using normalized structure)
        $requestsData = RequestModel::with(['user', 'reports', 'applicant', 'project', 'location'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Merge the data
        $requests = $requestsData->map(function($request) {
            // Get the latest report for this request
            $report = $request->reports->first();
            
            // Convert to array and add additional fields
            $requestArray = $request->toArray();
            $requestArray['application_id']           = $request->id;
            $requestArray['authorization_letter_path']= $request->authorization_letter_path ?? null;
            $requestArray['report_id']                = $report?->report_id;
            $requestArray['evaluation']               = $report?->evaluation;
            $requestArray['user_name']                = $request->user?->name;
            $requestArray['user_email']               = $request->user?->email;
            $requestArray['status']                   = RequestModel::deriveStatus($request->status, $report?->evaluation);

            // Applicant
            $requestArray['applicant_name']           = $request->applicant?->applicant_name;

            // Locational Clearance from normalized_projects
            $requestArray['project_type']             = $request->project?->project_type;

            // Location fields from locations table
            $requestArray['project_location_street']      = $request->location?->street_address;
            $requestArray['project_location_barangay']    = $request->location?->barangay;
            $requestArray['project_location_city']        = $request->location?->city_municipality;
            $requestArray['project_location_municipality']= $request->location?->city_municipality;
            $requestArray['project_location_province']    = $request->location?->province;
            
            return $requestArray;
        });

        return Inertia::render('Admin/Request', [
            'requests' => $requests,
        ]);
    }

    /**
     * Print-preview page for the CPD-001-0 application form
     */
    public function printForm($id): Response
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

        // Security: applicants can only print their own applications
        $currentUser = auth()->user();
        if (!in_array($currentUser->user_type, ['admin', 'super_admin'])) {
            abort_if($request->user_id !== $currentUser->id, 403, 'You are not authorized to print this application.');
        }

        $report = $request->reports->first();

        $data = [
            'id'             => $request->id,
            'application_number' => $request->application_number ?? sprintf('TPZ-%s-%04d', date('m-y'), $request->id),
            'created_at'     => $request->created_at?->format('F j, Y'),

            // Applicant
            'applicant_name'    => $request->applicant?->applicant_name ?? '',
            'applicant_address' => $request->applicant?->applicant_address ?? '',

            // Corporation
            'corporation_name'    => $request->applicant?->corporation?->corporation_name ?? '',
            'corporation_address' => $request->applicant?->corporation?->corporation_address ?? '',

            // Representative
            'representative_name'    => $request->applicant?->primaryRepresentative?->representative_name ?? '',
            'representative_address' => $request->applicant?->primaryRepresentative?->representative_address ?? '',

            // Project
            'project_type'             => $request->project?->project_type ?? '',
            'project_nature'           => $request->project?->project_nature ?? '',
            'project_nature_duration'  => $request->project?->project_nature_duration ?? '',
            'project_nature_years'     => $request->project?->project_nature_years ?? '',
            'project_cost'             => $request->project?->project_cost ?? null,

            // Location
            'location_number'       => $request->property?->lot_number ?? '',
            'location_street'       => $request->location?->street_address ?? '',
            'location_barangay'     => $request->location?->barangay ?? '',
            'location_city'         => $request->location?->city_municipality ?? 'City of Ilagan',
            'location_province'     => $request->location?->province ?? 'Isabela',

            // Property
            'lot_area_sqm'            => $request->property?->lot_area_sqm ?? '',
            'bldg_improvement_sqm'    => $request->property?->bldg_improvement_sqm ?? '',
            'right_over_land'         => $request->property?->right_over_land ?? '',
            'existing_land_use'       => $request->property?->existing_land_use ?? '',

            // Land use / notices
            'has_written_notice'          => $request->has_written_notice ?? '',
            'notice_officer_name'         => $request->notice_officer_name ?? '',
            'notice_dates'                => $request->notice_dates?->format('F j, Y') ?? '',
            'has_similar_application'     => $request->has_similar_application ?? '',
            'similar_application_offices' => $request->similar_application_offices ?? '',
            'similar_application_dates'   => $request->similar_application_dates?->format('F j, Y') ?? '',

            // Release
            'preferred_release_mode' => $request->preferred_release_mode ?? '',
            'release_address'        => $request->release_address ?? '',

            // Report info (for receipt fields — may be empty for unprocessed requests)
            'or_number'  => $report?->or_number ?? '',
            'amount_paid' => $report?->amount ?? '',
            'evaluation' => $report?->evaluation ?? $request->status ?? 'pending',
        ];

        return Inertia::render('Admin/PrintForm', [
            'application' => $data,
            'auth' => [
                'user' => [
                    'id' => $currentUser->id,
                    'name' => $currentUser->name,
                    'email' => $currentUser->email,
                    'user_type' => $currentUser->user_type,
                    'role' => $currentUser->user_type, // Alias for backward compatibility
                ],
            ],
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
        $requestData['status'] = RequestModel::deriveStatus($request->status, $report?->evaluation);
        
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
            'property',
            'requirementDocuments' // Add requirement documents
        ])->findOrFail($id);
        
        // Get the latest report for this request
        $report = $request->reports->first();
        
        // Build the request data with normalized relationships
        $requestData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'status' => RequestModel::deriveStatus($request->status, $report?->evaluation),
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            
            // User info
            'user_id' => $request->user_id,
            'user_name' => $request->user?->name,
            'user_email' => $request->user?->email,
            
            // Applicant info
            'applicant_name' => $request->applicant?->applicant_name,
            'applicant_address' => $request->applicant?->applicant_address,
            // Fall back to the account's contact number when the form did not carry one.
            'applicant_contact' => $request->applicant?->applicant_contact ?: $request->user?->contact_number,

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

            // Full requirements list for this project type, so the frontend can
            // group uploaded documents into "Main" vs "Additional" sections.
            'requirements_reference' => \App\Constants\ApplicationRequirements::getRequirements(
                $request->project?->project_type ?? 'ZONING CLEARANCE'
            ),
            // Verified requirements toggle state
            'verified_requirements' => $request->verified_requirements ?? [],
            'rejection_reason' => $report?->description ?? null,
        ];
        
        // Debug logging
        \Log::info('Admin ReviewRequest Data', [
            'request_id' => $id,
            'uploaded_requirements_count' => count($requestData['uploaded_requirements']),
            'requirements_reference_count' => count($requestData['requirements_reference']),
            'project_type' => $request->project?->project_type,
        ]);
        
        return Inertia::render('Admin/ReviewRequest', [
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
            'requirementDocuments',
        ])->findOrFail($id);

        // The officer reads the Lot Number and Tax Declaration No. off the
        // applicant's uploads, so every submitted document is listed on this page.
        // Scoping this to the CZC-only "Right Over Land" group meant a ZC or TUP
        // application showed nothing at all.
        $requirementList = collect(\App\Constants\ApplicationRequirements::getRequirements(
            $request->project?->project_type ?: 'ZONING CLEARANCE'
        ));
        $documentsByRequirement = $request->requirementDocuments->groupBy('requirement_id');
        $knownIds = $requirementList->pluck('id');

        // Reference order first, then anything filed against a requirement the
        // current list no longer knows about, so nothing is ever hidden.
        $uploadedRequirements = $requirementList
            ->reject(fn ($r) => !empty($r['is_group']))
            ->map(fn ($r) => ['id' => $r['id'], 'name' => $r['name']])
            ->concat(
                $documentsByRequirement->keys()
                    ->reject(fn ($id) => $knownIds->contains($id))
                    ->map(fn ($id) => [
                        'id' => $id,
                        'name' => $documentsByRequirement->get($id)->first()->requirement_name
                            ?: "Requirement #{$id}",
                    ])
            )
            ->map(fn ($r) => array_merge($r, [
                'files' => ($documentsByRequirement->get($r['id']) ?? collect())
                    ->map(fn ($doc) => [
                        'id' => $doc->id,
                        'original_filename' => $doc->original_filename,
                    ])->values()->all(),
            ]))
            ->values();

        // Only the documents the officer reads while filling in Property Details:
        // the Title and Tax Declaration carry the lot and tax numbers, and the cost
        // estimate backs the fee. Matched by name so it works in every category.
        $wanted = ['title', 'tax declaration', 'estimated project cost', 'bill of materials'];
        $uploadedRequirements = $uploadedRequirements
            ->filter(function ($r) use ($wanted) {
                $name = mb_strtolower($r['name']);
                foreach ($wanted as $needle) {
                    if (str_contains($name, $needle)) {
                        return true;
                    }
                }
                return false;
            })
            ->values();

        $report = $request->reports->first();
        
        // Build the request data - same as reviewRequest but for ViewApplication page
        $requestData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'status' => RequestModel::deriveStatus($request->status, $report?->evaluation),
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            
            // User info
            'user_id' => $request->user_id,
            'user_name' => $request->user?->name,
            'user_email' => $request->user?->email,
            
            // Applicant info
            'applicant_name' => $request->applicant?->applicant_name,
            'applicant_address' => $request->applicant?->applicant_address,
            // Fall back to the account's contact number when the form did not carry one.
            'applicant_contact' => $request->applicant?->applicant_contact ?: $request->user?->contact_number,

            // Corporation info
            'corporation_name' => $request->applicant?->corporation?->corporation_name,
            'corporation_address' => $request->applicant?->corporation?->corporation_address,
            
            // Representative info
            'authorized_representative_name' => $request->applicant?->primaryRepresentative?->representative_name,
            'authorized_representative_address' => $request->applicant?->primaryRepresentative?->representative_address,
            'authorized_representative_email' => $request->applicant?->primaryRepresentative?->representative_email,
            'authorization_letter_path' => $request->applicant?->primaryRepresentative?->authorization_letter_path,

            // Project info
            'application_category' => $request->project?->project_type,
            'project_type' => $request->project?->project_type,
            'project_nature' => $request->project?->project_nature,
            'project_nature_duration' => $request->project?->project_nature_duration,
            'project_nature_years' => $request->project?->project_nature_years,
            'project_description' => $request->project?->project_description,
            'project_cost' => $request->project?->project_cost,

            // Location info
            'project_location_number' => $request->property?->lot_number,
            'project_location_street' => $request->location?->street_address,
            'project_location_barangay' => $request->location?->barangay,
            'project_location_municipality' => $request->location?->city_municipality,
            'project_location_province' => $request->location?->province,

            // Property info
            'project_area_sqm' => ($request->property?->lot_area_sqm + $request->property?->bldg_improvement_sqm),
            'lot_area_sqm' => $request->property?->lot_area_sqm,
            'bldg_improvement_sqm' => $request->property?->bldg_improvement_sqm,
            'lot_number' => $request->property?->lot_number,
            'title_number' => $request->property?->title_number,
            'tax_declaration_no' => $request->property?->tax_declaration_no,
            'zone_classification' => $request->property?->zone_classification ?: $request->property?->existing_land_use,
            'right_over_land' => $request->property?->right_over_land,

            // Land use info
            'existing_land_use' => $request->property?->existing_land_use,
            'has_written_notice' => $request->has_written_notice,
            'notice_officer_name' => $request->notice_officer_name,
            'notice_dates' => $request->notice_dates,
            'has_similar_application' => $request->has_similar_application,
            'similar_application_offices' => $request->similar_application_offices,
            'similar_application_dates' => $request->similar_application_dates,

            // Release preference
            'preferred_release_mode' => $request->preferred_release_mode,
            'release_address' => $request->release_address,

            // Report info
            'decision_number' => $request->decision_number,
            'rejection_reason' => $report?->evaluation === 'rejected' ? $report?->description : null,
            'payment_amount' => $report?->payment_amount,
            'admin_notes' => $report?->admin_notes,
            'application_id' => $request->id,
        ];
        
        return Inertia::render('Admin/ViewApplication', [
            'request' => $requestData,
            'uploadedRequirements' => $uploadedRequirements,
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
            'status' => RequestModel::deriveStatus($request->status, $report?->evaluation),
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
            
            // Review/denial info
            'rejection_reason' => $report?->description ?? null,
            'admin_notes' => $report?->admin_notes ?? null,
            
            // Report info
            'report_id' => $report?->report_id,
            'application_id' => $request->id,
        ];
        
        return Inertia::render('Admin/DocumentVerification', [
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
                                    $requestModel->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($requestModel->id, 4, '0', STR_PAD_LEFT)
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
                            $rejectionReason = $validated['description'] ?? 'Your application has been denied. Please review and resubmit with the necessary corrections.';
                            
                            // Send denial email immediately (not queued)
                            \Mail::to($user->email)->send(
                                new ApplicationRejected(
                                    $requestModel, // Pass request instead of application
                                    $requestModel->applicant->applicant_name ?? 'Applicant',
                                    $requestModel->id,
                                    $rejectionReason
                                )
                            );
                            
                            // Create notification for denial
                            NotificationService::applicationRejected($requestModel, $rejectionReason, auth()->user());
                            
                            // Send SMS notification
                            if ($user->contact_number) {
                                app(\App\Services\SmsService::class)->sendApplicationRejected(
                                    $user->contact_number,
                                    $user->name,
                                    $requestModel->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($requestModel->id, 4, '0', STR_PAD_LEFT),
                                    $rejectionReason
                                );
                            }
                            
                            // Log the email sending for debugging
                            \Log::info('Application denial email sent to: ' . $user->email . ' for request ID: ' . $requestModel->id);
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
     * Allows admin to review or deny with one action
     */
    public function reviewApplication(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:requests,id',
            'action' => 'required|in:reviewed,rejected',
            
            // For "reviewed" action
            'payment_amount' => 'required_if:action,reviewed|nullable|numeric|min:0',
            'admin_notes' => 'nullable|string|max:1000',
            
            // For "rejected" action
            'rejection_reason' => 'required_if:action,rejected|nullable|string|max:1000'
        ]);

        \Log::info('Review Application - Request Data:', $request->all());
        \Log::info('Review Application - Validated Data:', $validated);

        $requestModel = RequestModel::with(['applicant', 'project', 'user', 'property'])->findOrFail($validated['request_id']);

        // Once the SuperAdmin has approved (or the certificate flow has started), the
        // Zoning Officer's decision is final and cannot be changed.
        $lockedStatuses = ['approved', 'certificate_preparing', 'certificate_ready', 'released'];
        if (in_array(strtolower((string) $requestModel->status), $lockedStatuses, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'action' => 'This application has already been approved. The decision can no longer be changed.',
            ]);
        }

        if ($validated['action'] === 'reviewed') {
            // The Locational Clearance must be set before an application can be marked as
            // reviewed — it drives the fee and the certificate wording.
            $locationalClearance = strtoupper(trim((string) optional($requestModel->project)->project_type));
            if ($locationalClearance === '' || $locationalClearance === 'N/A' || $locationalClearance === 'NA') {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'project_type' => 'Set the Locational Clearance before marking this application as reviewed.',
                ]);
            }

            // The Lot Number and Tax Declaration No. must be recorded first — they
            // are printed on the clearance/certificate and cannot be added later
            // without re-opening the application. Set them on the View Application
            // page (Step 2 → Property Details).
            $lotNumber = trim((string) optional($requestModel->property)->lot_number);
            $taxDeclarationNo = trim((string) optional($requestModel->property)->tax_declaration_no);
            if ($lotNumber === '' || $taxDeclarationNo === '') {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'property' => 'Set the Lot Number and Tax Declaration No. (View Application → Step 2 → Property Details) before marking this application as reviewed.',
                ]);
            }

            // Create or update report with review details including payment info
            $report = Report::updateOrCreate(
                ['request_id' => $requestModel->id],
                [
                    'evaluation' => 'reviewed',
                    'issued_by' => auth()->user()->name,
                    // Link the report to the reviewing officer's account so the
                    // right e-signature lands on the certificate/clearance.
                    'reviewed_by' => auth()->id(),
                    'date_reported' => now(),
                    'description' => 'Application reviewed by ' . auth()->user()->name . '. Pending SuperAdmin approval.',
                    'payment_amount' => $validated['payment_amount'] ?? null,
                    'admin_notes' => $validated['admin_notes'] ?? null,
                ]
            );

            // Update request status
            $requestModel->status = 'reviewed';
            $requestModel->save();

            // Log the action
            AuditLogService::logCreate(
                'Report',
                $report->id,
                $report->toArray(),
                "Admin reviewed application #{$requestModel->id} - Pending SuperAdmin approval"
            );

            // Notify SuperAdmins
            $superAdmins = User::where('user_type', 'super_admin')->get();
            foreach ($superAdmins as $superAdmin) {
                \App\Models\Notification::createForUser(
                    $superAdmin->id,
                    'application_pending_approval',
                    'Application Pending Your Approval',
                    "Application #{$requestModel->id} from " . ($requestModel->applicant->applicant_name ?? 'Applicant') . " has been reviewed and requires your approval. Payment details have been set by admin.",
                    "/super-admin/requests/{$requestModel->id}/review",
                    [
                        'request_id' => $requestModel->id,
                        'applicant_name' => $requestModel->applicant->applicant_name ?? 'N/A',
                        'project_type' => $requestModel->project->project_type ?? 'N/A',
                        'payment_amount' => $validated['payment_amount'] ?? null,
                    ]
                );
            }

            // Note: SMS will be sent to applicant ONLY after SuperAdmin approves
            return back()->with('success', 'Application marked as reviewed with payment details! Sent to SuperAdmin for final approval. SMS will be sent to applicant after approval.');

        } else {
            // Denial flow
            $report = Report::updateOrCreate(
                ['request_id' => $requestModel->id],
                [
                    'evaluation' => 'rejected',
                    'issued_by' => auth()->user()->name,
                    'reviewed_by' => auth()->id(),
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
                "Admin denied application #{$requestModel->id}"
            );

            // Send immediate denial email and notification
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
                        $requestModel->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($requestModel->id, 4, '0', STR_PAD_LEFT),
                        $validated['rejection_reason']
                    );
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send denial notification: ' . $e->getMessage());
            }

            return back()->with('success', 'Application denied and applicant has been notified.');
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
        // Applicants only — staff accounts are the super-admin's to manage — but
        // the whole list rather than a page of it. The screen counts, filters and
        // searches in the browser, so a server-side page of 25 made the summary
        // cards report 25 users however many were actually registered.
        $users = \App\Models\User::query()
            ->select(['id', 'name', 'email', 'contact_number', 'address', 'user_type', 'created_at'])
            ->where('user_type', 'applicant')
            ->orderBy('created_at', 'desc')
            ->get();

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
     * Unified payments page with tabs for pending, verified, and all payments
     */
    public function payments(Request $request): Response
    {
        // Get ALL approved requests (by Super Admin) - these are requests awaiting payment
        $approvedRequests = RequestModel::with(['applicant', 'project', 'location', 'user', 'payments', 'report'])
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
                    'expected_amount' => $this->getExpectedAmount($request),
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
        $verifiedPayments = \App\Models\Payment::with(['request.applicant', 'verifiedByUser'])
            ->where('payment_status', 'verified')
            ->orderBy('verified_at', 'desc')
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'request_id' => $payment->request_id,
                    'application_number' => $payment->request->application_number ?? null,
                    'decision_number' => $payment->request->decision_number ?? null,
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
        
        // Get ALL payments (including pending, verified, denied)
        $allPayments = \App\Models\Payment::with(['request.applicant', 'verifiedByUser'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($payment) {
                return [
                    'id' => $payment->id,
                    'request_id' => $payment->request_id,
                    'application_number' => $payment->request->application_number ?? null,
                    'decision_number' => $payment->request->decision_number ?? null,
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

        return Inertia::render('Admin/PaymentsUnified', [
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

        $payment = \App\Models\Payment::findOrFail($validated['payment_id']);

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

        // Clear dashboard cache so analytics refresh immediately
        $this->cacheService->clearCache();

        // Send payment-verified SMS immediately
        try {
            $pmtReq = $payment->request()->with('user')->first();
            if ($pmtReq && $pmtReq->user && $pmtReq->user->contact_number) {
                app(\App\Services\SmsService::class)->sendPaymentVerified(
                    $pmtReq->user->contact_number,
                    $pmtReq->user->name,
                    $pmtReq->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($pmtReq->id, 4, '0', STR_PAD_LEFT),
                    (float) $payment->amount
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send payment verified SMS (Admin): ' . $e->getMessage());
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

            // Payment verified → the application enters the certificate stage.
            // This is what makes all three Applications views (applicant, Zoning
            // Officer, Zoning Administrator) reflect the certificate progress and
            // drop the "pay" actions.
            if (in_array($requestModel->status, ['approved', 'payment_confirmed'], true)) {
                $requestModel->update(['status' => 'certificate_preparing']);
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
     * Deny a payment
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

        // Clear dashboard cache so analytics refresh immediately
        $this->cacheService->clearCache();

        // Log audit
        AuditLogService::logUpdate(
            'Payment',
            $payment->id,
            ['payment_status' => $payment->getOriginal('payment_status')],
            ['payment_status' => 'rejected'],
            'Payment denied by admin: ' . $validated['rejection_reason']
        );

        // Notify applicant of payment denial
        try {
            $rejReq = $payment->request()->with('user')->first();
            if ($rejReq && $rejReq->user) {
                if ($rejReq->user->contact_number) {
                    app(\App\Services\SmsService::class)->sendPaymentRejected(
                        $rejReq->user->contact_number,
                        $rejReq->user->name,
                        $rejReq->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($rejReq->id, 4, '0', STR_PAD_LEFT),
                        $validated['rejection_reason']
                    );
                }
                if ($rejReq->user->email) {
                    try {
                        \Mail::to($rejReq->user->email)->send(new \App\Mail\PaymentRejected($payment, $rejReq));
                    } catch (\Exception $e) {
                        \Log::error('Failed to send payment denial email: ' . $e->getMessage());
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send payment denial SMS: ' . $e->getMessage());
        }

        return back()->with('success', 'Payment denied! Applicant has been notified.');
    }

    /**
     * Display all certificates
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

        return Inertia::render('Admin/Certificates', [
            'certificates' => $certificates,
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status', 'all'),
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

        // The certificate number is the one thing this screen sets that the
        // service does not, so it is applied first.
        $certificate->update(['certificate_number' => $validated['certificate_number']]);

        // CertificateService owns the transition: it writes the status value the
        // enum actually allows, stamps ready_at, moves the request to
        // certificate_ready, and writes the audit log. Duplicating that here is
        // what let this method drift onto a status the column rejects.
        $certificate = app(\App\Services\CertificateService::class)
            ->markReady($certificate, $validated['notes'] ?? null);

        // Notify applicant certificate is ready for pickup
        try {
            $certificate->load('request.user');
            $certUser = $certificate->request?->user;
            if ($certUser && $certUser->contact_number) {
                app(\App\Services\SmsService::class)->sendCertificateReady(
                    $certUser->contact_number,
                    $certUser->name,
                    $certificate->request_id,
                    $validated['certificate_number']
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send certificate ready SMS: ' . $e->getMessage());
        }

        return back()->with('success', 'Certificate marked as ready for collection! Applicant has been notified.');
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

        // The release details live on the certificate itself — the separate
        // certificate_releases table this used to write to was dropped, taking
        // its model with it, so every call here was fatal.
        $certificate = app(\App\Services\CertificateService::class)->recordRelease($certificate, [
            'released_to_name'      => $validated['collected_by_name'],
            'released_to_id_type'   => $validated['valid_id_type'],
            'released_to_id_number' => $validated['valid_id_number'],
        ]);

        $certificate->update([
            'collection_notes' => trim(sprintf(
                "Released %s %s to %s (%s). %s",
                $validated['release_date'],
                $validated['release_time'],
                $validated['collected_by_name'],
                $validated['relationship_to_applicant'],
                $validated['remarks'] ?? ''
            )),
        ]);

        // Notify applicant certificate has been released
        try {
            $certificate->load('request.user');
            $relUser = $certificate->request?->user;
            if ($relUser && $relUser->contact_number) {
                app(\App\Services\SmsService::class)->sendCertificateReleased(
                    $relUser->contact_number,
                    $relUser->name,
                    $certificate->certificate_number ?? $certificate->id
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send certificate released SMS: ' . $e->getMessage());
        }

        return back()->with('success', 'Certificate collection recorded successfully!');
    }
    
    /**
     * Export payments to CSV or PDF
     */
    public function exportPayments(Request $request)
    {
        $status = $request->input('status', 'all');
        $format = $request->input('format', 'csv');
        
        $query = \App\Models\Payment::with(['request.user', 'request.applicant', 'verifiedBy']);
        
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
                'Denial Reason',
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
                    $payment->verifiedBy?->name ?? '',
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
                'status' => RequestModel::deriveStatus($request->status, $report?->evaluation),
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
                'Locational Clearance',
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
            $status = RequestModel::deriveStatus($request->status, $report?->evaluation);
            
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
     * Bulk deny requests
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

                // Send denial email
                try {
                    \Mail::to($requestModel->user->email)->send(new ApplicationRejected(
                        $requestModel,
                        $requestModel->applicant->applicant_name ?? 'Applicant',
                        $requestModel->id,
                        $request->reason
                    ));
                } catch (\Exception $e) {
                    \Log::error("Failed to send denial email for request {$requestId}: " . $e->getMessage());
                }

                $successCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to deny request #{$requestId}: " . $e->getMessage();
            }
        }

        $flashData = ['success' => "Successfully denied {$successCount} request(s)."];
        
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

    /**
     * Update the application number and project cost from the View Application page.
     *
     * Both are corrections staff make after the fact: an application number that
     * has to match a paper record, and a project cost the applicant mis-keyed.
     */
    public function updateApplicationDetails(Request $request, $id)
    {
        $requestModel = RequestModel::findOrFail($id);

        $validated = $request->validate([
            'application_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('requests', 'application_number')->ignore($requestModel->id),
            ],
            'project_cost' => 'nullable|numeric|min:0|max:999999999999.99',
        ]);

        $oldNumber = $requestModel->application_number;
        if (array_key_exists('application_number', $validated)) {
            $requestModel->update([
                'application_number' => $validated['application_number'] ?: null,
            ]);
        }

        $project = $requestModel->project;
        $oldCost = $project?->project_cost;
        if ($project && array_key_exists('project_cost', $validated)) {
            $project->update([
                'project_cost' => $validated['project_cost'],
            ]);
        }

        AuditLogService::logUpdate(
            'Request',
            $requestModel->id,
            ['application_number' => $oldNumber, 'project_cost' => $oldCost],
            ['application_number' => $requestModel->application_number, 'project_cost' => $project?->fresh()?->project_cost],
            "Updated application details for request #{$requestModel->id}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Application details updated successfully',
            'application_number' => $requestModel->application_number,
            'project_cost' => $project?->fresh()?->project_cost,
        ]);
    }

    /**
     * Release the decision to the applicant, or take it back.
     *
     * Until the office does this the applicant has no way to print their
     * clearance or certificate — the document is only theirs to take once the
     * office says it is finished.
     */
    public function releaseToApplicant(Request $request, $id)
    {
        $validated = $request->validate([
            'released' => 'required|boolean',
        ]);

        $requestModel = RequestModel::with(['user', 'applicant', 'project'])->findOrFail($id);

        $releasable = ['approved', 'payment_confirmed', 'certificate_preparing', 'certificate_ready', 'released'];
        if ($validated['released'] && !in_array(strtolower((string) $requestModel->status), $releasable, true)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'released' => 'Only an approved application can be released to the applicant.',
            ]);
        }

        $staff = auth()->user();

        $requestModel->update([
            'released_to_applicant_at' => $validated['released'] ? now() : null,
            // Kept even after a withdrawal — "who last touched this" stays on the
            // record; only the timestamp that gates the applicant's button is cleared.
            'released_by' => $validated['released'] ? $staff->id : $requestModel->released_by,
        ]);

        AuditLogService::logUpdate(
            'Request',
            $requestModel->id,
            [],
            [
                'released_to_applicant_at' => $requestModel->released_to_applicant_at,
                'released_by' => $staff->name,
            ],
            $validated['released']
                ? "Released the decision for request #{$requestModel->id} to the applicant ({$staff->name})"
                : "Withdrew the decision for request #{$requestModel->id} from the applicant ({$staff->name})"
        );

        // Tell the applicant their document is ready to print — in-app and by SMS,
        // the same two channels every other stage-change notification uses.
        if ($validated['released']) {
            $certNumber = $requestModel->decision_number ?: $requestModel->application_number ?: (string) $requestModel->id;
            $applicantName = $requestModel->applicant?->applicant_name ?? $requestModel->user?->name ?? 'Applicant';

            try {
                if ($requestModel->user_id) {
                    \App\Models\Notification::createForUser(
                        $requestModel->user_id,
                        'certificate_released',
                        'Your document is ready 📄',
                        "Your " . ($requestModel->project?->project_type ?: 'application') . " document for #{$requestModel->application_number} has been released. You can now print it from My Applications.",
                        '/my-applications',
                        ['application_id' => $requestModel->id]
                    );
                }

                if ($requestModel->user?->contact_number) {
                    app(\App\Services\SmsService::class)->sendCertificateReleased(
                        $requestModel->user->contact_number,
                        $applicantName,
                        $certNumber
                    );
                }
            } catch (\Exception $e) {
                \Log::error('Failed to notify applicant of release: ' . $e->getMessage());
            }
        }

        return back()->with('success', $validated['released']
            ? 'Released to the applicant. They can now print the document.'
            : 'Withdrawn. The applicant can no longer print the document.');
    }

    /**
     * Update project type for a request
     */
    public function updateProjectType(Request $request, $id)
    {
        $validated = $request->validate([
            'project_type' => 'nullable|string|in:N/A,CZC,TUP,SUP,ZC,Zoning',
        ]);

        $requestModel = RequestModel::findOrFail($id);
        
        // Update the project type in normalized_projects table
        $project = $requestModel->project;
        if ($project) {
            $oldProjectType = $project->project_type;
            $project->update([
                'project_type' => $validated['project_type'] ?? null
            ]);
            
            // Log the update
            AuditLogService::logUpdate(
                'Project',
                $project->id,
                ['project_type' => $oldProjectType],
                ['project_type' => $validated['project_type']],
                "Updated project type from '{$oldProjectType}' to '{$validated['project_type']}'"
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Locational Clearance updated successfully',
            'project_type' => $validated['project_type']
        ]);
    }

    /**
     * Show admin profile page
     */
    public function profile()
    {
        return Inertia::render('Admin/Profile', [
            'mustVerifyEmail' => false,
            'status' => session('status'),
        ]);
    }

    /**
     * Update admin profile information
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
     * Update admin password
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
     * The fee this application is actually due to pay.
     *
     * The Zoning Officer sets the amount on the report during review, and that
     * figure is what goes on the Order of Payment the applicant is handed - so
     * it is the only correct "expected amount" to show the cashier. The
     * project-type table below is a fallback for applications approved before
     * an amount was entered; it is a default, not the fee.
     *
     * Note reports.amount is the project cost/capitalization, NOT the fee.
     */
    private function getExpectedAmount(\App\Models\Request $request): float
    {
        $officerSetAmount = $request->report?->payment_amount;

        if ($officerSetAmount !== null && $officerSetAmount !== "") {
            return (float) $officerSetAmount;
        }

        $projectType = $request->project?->project_type;

        if (!$projectType) {
            return 500.00; // Default amount
        }

        return match (strtoupper(trim($projectType))) {
            'SUP', 'SPECIAL USE PERMIT' => 750.00,
            'TUP', 'TEMPORARY USE PERMIT' => 350.00,
            'ZC', 'ZONING CERTIFICATION' => 500.00,
            'CZC', 'CERTIFICATE OF ZONING COMPLIANCE', 'ZONING CLEARANCE', 'LOCATIONAL CLEARANCE', 'ZONING' => 500.00,
            default => 500.00, // Default for any other type
        };
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
     * Upload requirement document by admin
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
            \Log::error('Admin upload requirement document failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Save the details the Zoning Officer supplies when issuing a certificate.
     *
     * The Tax Declaration number, lot number and zoning classification are not
     * collected from the applicant — they come from the City Assessor's records
     * and the zoning map, so the officer enters them on the generate screen.
     */
    public function saveCertificateDetails(Request $request, $id)
    {
        $validated = $request->validate([
            'lot_number' => 'nullable|string|max:100',
            'tax_declaration_no' => 'nullable|string|max:100',
            'zone_classification' => 'nullable|string|max:150',
        ]);

        $requestModel = RequestModel::findOrFail($id);

        // Not every request has a properties row yet, so create one on demand.
        $property = \App\Models\Property::firstOrNew(['request_id' => $requestModel->id]);
        $property->fill($validated);
        $property->save();

        AuditLogService::logUpdate(
            'Request',
            $requestModel->id,
            [],
            $validated,
            "Certificate details set for request #{$requestModel->id}"
        );

        return back()->with('success', 'Certificate details saved.');
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

        // A certificate can be produced once the application is approved and at every
        // later stage of the certificate lifecycle (a Certificate row only exists after
        // approval, and creating it bumps the request to certificate_preparing). Only
        // pre-approval and denied applications are blocked.
        $generatableStatuses = ['approved', 'certificate_preparing', 'certificate_ready', 'released'];
        if (!in_array(strtolower((string) $request->status), $generatableStatuses, true)) {
            return redirect()->back()->with('error', 'Certificate can only be generated for approved applications');
        }

        $payment = $request->payments->first();
        
        // Get the reviewer (admin who reviewed the application)
        $report = \App\Models\Report::where('request_id', $id)
            ->whereIn('evaluation', ['approved', 'reviewed'])
            ->latest()
            ->first();
            
        $reviewer = $report ? $report->resolveReviewer() : null;

        // Signer for the "Prepared & Evaluated by" block: the officer who
        // actually reviewed this application, with their e-signature if on file.
        $reviewerName = $reviewer->name ?? null;
        $reviewerSignature = $reviewer->signature_url ?? null;

        // Signer for the "Approved by" block: the Zoning Administrator.
        $zoningAdministrator = \App\Models\User::where('user_type', 'super_admin')
            ->whereNotNull('signature_path')
            ->first();

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
            'lot_area_sqm' => $request->property?->lot_area_sqm,
            // Filled in by the Zoning Officer at issuance time.
            'lot_number' => $request->property?->lot_number,
            'tax_declaration_no' => $request->property?->tax_declaration_no,
            'zone_classification' => $request->property?->zone_classification ?: $request->property?->existing_land_use,
        ];

        return \Inertia\Inertia::render('Admin/GenerateCertificate', [
            'application' => $applicationData,
            'payment' => $payment,
            'reviewer' => $reviewer ? [
                'name' => $reviewerName,
                'signature_url' => $reviewerSignature,
            ] : null,
            'zoningAdministrator' => $zoningAdministrator ? [
                'name' => $zoningAdministrator->name,
                'signature_url' => $zoningAdministrator->signature_url,
            ] : null,
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

        // See generateCertificate() — same lifecycle gate.
        $generatableStatuses = ['approved', 'certificate_preparing', 'certificate_ready', 'released'];
        if (!in_array(strtolower((string) $request->status), $generatableStatuses, true)) {
            return redirect()->back()->with('error', 'Clearance can only be generated for approved applications');
        }

        $payment = $request->payments->first();
        
        // Get the reviewer (admin who reviewed the application)
        $report = \App\Models\Report::where('request_id', $id)
            ->whereIn('evaluation', ['approved', 'reviewed'])
            ->latest()
            ->first();
            
        $reviewer = $report ? $report->resolveReviewer() : null;

        // Signer for the "Prepared & Evaluated by" block: the officer who
        // actually reviewed this application, with their e-signature if on file.
        $reviewerName = $reviewer->name ?? null;
        $reviewerSignature = $reviewer->signature_url ?? null;

        // Signer for the "Approved by" block: the Zoning Administrator.
        $zoningAdministrator = \App\Models\User::where('user_type', 'super_admin')
            ->whereNotNull('signature_path')
            ->first();

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
            'lot_area_sqm' => $request->property?->lot_area_sqm,
            // Filled in by the Zoning Officer at issuance time.
            'lot_number' => $request->property?->lot_number,
            'tax_declaration_no' => $request->property?->tax_declaration_no,
            'zone_classification' => $request->property?->zone_classification ?: $request->property?->existing_land_use,
        ];

        return \Inertia\Inertia::render('Admin/GenerateClearance', [
            'application' => $applicationData,
            'payment' => $payment,
            'reviewer' => $reviewer ? [
                'name' => $reviewerName,
                'signature_url' => $reviewerSignature,
            ] : null,
            'zoningAdministrator' => $zoningAdministrator ? [
                'name' => $zoningAdministrator->name,
                'signature_url' => $zoningAdministrator->signature_url,
            ] : null,
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

        // The order of payment exists from approval onwards: it is the slip the
        // applicant pays against, and it stays printable once the payment has
        // been recorded and the certificate is being prepared — that is where
        // the Payments page links to it from.
        $printableStatuses = array_merge(['approved'], RequestModel::CERT_LIFECYCLE_STATUSES);
        if (!in_array(strtolower($request->status), $printableStatuses, true)) {
            return redirect()->back()->with('error', 'Order of payment can only be generated for approved applications');
        }

        $payment = $request->payments->first();
        
        // Get the reviewer (admin who reviewed the application)
        $report = \App\Models\Report::where('request_id', $id)
            ->latest()
            ->first();
            
        $reviewer = $report ? $report->resolveReviewer() : null;

        // Signer for the "Prepared & Evaluated by" block: the officer who
        // actually reviewed this application, with their e-signature if on file.
        $reviewerName = $reviewer->name ?? null;
        $reviewerSignature = $reviewer->signature_url ?? null;

        // Signer for the "Approved by" block: the Zoning Administrator.
        $zoningAdministrator = \App\Models\User::where('user_type', 'super_admin')
            ->whereNotNull('signature_path')
            ->first();

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
            'lot_area_sqm' => $request->property?->lot_area_sqm,
            // Filled in by the Zoning Officer at issuance time.
            'lot_number' => $request->property?->lot_number,
            'tax_declaration_no' => $request->property?->tax_declaration_no,
            'zone_classification' => $request->property?->zone_classification ?: $request->property?->existing_land_use,
        ];

        return \Inertia\Inertia::render('Admin/GenerateOrderOfPayment', [
            'application' => $applicationData,
            'payment' => $payment,
            'reviewer' => $reviewer ? [
                'name' => $reviewerName,
                'signature_url' => $reviewerSignature,
            ] : null,
            'zoningAdministrator' => $zoningAdministrator ? [
                'name' => $zoningAdministrator->name,
                'signature_url' => $zoningAdministrator->signature_url,
            ] : null,
        ]);
    }

}
