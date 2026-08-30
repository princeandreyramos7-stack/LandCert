<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Corporation;
use App\Models\Project;
use App\Models\Report;
use App\Models\Request as RequestModel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\ApplicationSubmitted;

class RequestController extends Controller
{
    /**
     * Display the dashboard with requests for the current user only.
     */
    public function dashboard()
    {
        $user = auth()->user();
        
        // Check if user is super admin and redirect to super admin dashboard
        if ($user->user_type === 'super_admin' || $user->hasRole('super_admin')) {
            return redirect()->route('super-admin.dashboard');
        }
        
        // Check if user is admin and redirect to admin dashboard
        if ($user->user_type === 'admin' || $user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        // Get requests for the currently logged-in user with related data from normalized tables
        $requests = RequestModel::where('requests.user_id', auth()->id())
            ->leftJoin('reports', 'requests.id', '=', 'reports.request_id')
            ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->leftJoin('locations', 'requests.id', '=', 'locations.request_id')
            ->select(
                'requests.id',
                'requests.user_id',
                'requests.status as request_status',
                'requests.created_at',
                'requests.updated_at',
                'applicants.applicant_name',
                'normalized_projects.project_type',
                'normalized_projects.project_nature',
                'locations.city_municipality as project_location_city',
                DB::raw("CASE WHEN requests.status IN ('payment_confirmed','certificate_preparing','certificate_ready','released') THEN requests.status ELSE COALESCE(reports.evaluation, requests.status) END as status")
            )
            ->orderBy('requests.created_at', 'desc')
            ->get();

        return Inertia::render('Dashboard', [
            'requests' => $requests
        ]);
    }

    /**
     * Display the request form page.
     */
    public function index(): Response
    {
        return Inertia::render('Request/index');
    }

    /**
     * Display all applications for the current user.
     */
    public function myApplications(): Response
    {
        // Get all requests for the currently logged-in user with related data from normalized tables
        $applications = RequestModel::where('requests.user_id', auth()->id())
            ->leftJoin('reports', 'requests.id', '=', 'reports.request_id')
            ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->leftJoin('locations', 'requests.id', '=', 'locations.request_id')
            ->leftJoin('properties', 'requests.id', '=', 'properties.request_id')
            ->leftJoin('normalized_corporations', 'applicants.id', '=', 'normalized_corporations.applicant_id')
            ->leftJoin('representatives', 'applicants.id', '=', 'representatives.applicant_id')
            ->select(
                'requests.id',
                'requests.id as application_id',
                'requests.user_id',
                'requests.status as request_status',
                'requests.application_number',
                'requests.decision_number',
                'requests.has_written_notice',
                'requests.notice_officer_name',
                'requests.notice_dates',
                'requests.has_similar_application',
                'requests.similar_application_offices',
                'requests.similar_application_dates',
                'requests.preferred_release_mode',
                'requests.release_address',
                'requests.created_at',
                'requests.updated_at',
                // Applicant fields
                'applicants.applicant_name',
                'applicants.applicant_address',
                'applicants.applicant_contact',
                // Corporation fields
                'normalized_corporations.corporation_name',
                'normalized_corporations.corporation_address',
                // Representative fields
                'representatives.representative_name as authorized_representative_name',
                'representatives.representative_address as authorized_representative_address',
                // Project fields
                'normalized_projects.project_type',
                'normalized_projects.project_nature',
                'normalized_projects.project_nature_duration',
                'normalized_projects.project_nature_years',
                'normalized_projects.project_cost',
                // Location fields
                'locations.street_address as project_location_street',
                'locations.barangay as project_location_barangay',
                'locations.city_municipality as project_location_city',
                'locations.province as project_location_province',
                // Property fields
                'properties.lot_area_sqm',
                'properties.bldg_improvement_sqm',
                'properties.lot_number as project_location_number',
                'properties.right_over_land',
                'properties.existing_land_use',
                // Note: project_area_sqm doesn't exist in normalized structure
                DB::raw('properties.lot_area_sqm as project_area_sqm'),
                // Report fields
                'reports.evaluation',
                'reports.amount as report_amount',
                DB::raw("CASE WHEN requests.status IN ('payment_confirmed','certificate_preparing','certificate_ready','released') THEN requests.status ELSE COALESCE(reports.evaluation, requests.status) END as status"),
                // Requirement #1 (notarized application form) is uploaded after
                // submission, so the list needs to know whether it is still missing.
                DB::raw('EXISTS(SELECT 1 FROM requirement_documents rd WHERE rd.request_id = requests.id AND rd.requirement_id = 1) as has_notarized_form')
            )
            ->orderBy('requests.created_at', 'desc')
            ->paginate(10); // Changed from ->get() to ->paginate(10)

        return Inertia::render('MyApplications', [
            'applications' => $applications
        ]);
    }

    /**
     * Show the form for editing a denied/returned application.
     * Only allows editing applications with 'rejected' or 'returned' status.
     */
    public function edit($id)
    {
        $request = RequestModel::with([
            'applicant.corporation',
            'applicant.primaryRepresentative',
            'project',
            'location',
            'property',
            'requirementDocuments', // Load existing documents
        ])->findOrFail($id);

        // Authorization: only the applicant who owns the request can edit it
        if ($request->user_id !== auth()->id()) {
            abort(403, 'You are not authorized to edit this application.');
        }

        // Only allow editing if status is denied or returned
        $editableStatuses = ['rejected', 'returned'];
        if (!in_array(strtolower($request->status), $editableStatuses)) {
            return redirect()->route('my-applications.index')
                ->with('error', 'Only denied or returned applications can be edited.');
        }

        // Prepare the application data for the form
        $applicationData = [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'decision_number' => $request->decision_number,
            'status' => $request->status,
            
            // Applicant information
            'applicant_name' => $request->applicant->applicant_name ?? '',
            'applicant_address' => $request->applicant->applicant_address ?? '',
            'applicant_type' => $request->applicant->applicant_type ?? 'individual',
            
            // Corporation information
            'corporation_name' => $request->applicant->corporation->corporation_name ?? '',
            'corporation_address' => $request->applicant->corporation->corporation_address ?? '',
            
            // Representative information
            'authorized_representative_name' => $request->applicant->primaryRepresentative->representative_name ?? '',
            'authorized_representative_address' => $request->applicant->primaryRepresentative->representative_address ?? '',
            
            // Project details
            'project_type' => $request->project->project_type ?? '',
            'project_nature' => $request->project->project_nature ?? '',
            'project_nature_duration' => $request->project->project_nature_duration ?? '',
            'project_nature_years' => $request->project->project_nature_years ?? null,
            'project_cost' => $request->project->project_cost ?? null,
            
            // Location details
            'project_location_number' => $request->property->lot_number ?? '',
            'project_location_street' => $request->location->street_address ?? '',
            'project_location_barangay' => $request->location->barangay ?? '',
            'project_location_city' => $request->location->city_municipality ?? '',
            'project_location_municipality' => $request->location->city_municipality ?? '',
            'project_location_province' => $request->location->province ?? '',
            
            // Property details
            'project_area_sqm' => $request->property->lot_area_sqm ?? null,
            'lot_area_sqm' => $request->property->lot_area_sqm ?? null,
            'bldg_improvement_sqm' => $request->property->bldg_improvement_sqm ?? null,
            'right_over_land' => $request->property->right_over_land ?? '',
            
            // Land use
            'existing_land_use' => $request->property->existing_land_use ?? '',
            
            // Additional information
            'has_written_notice' => $request->has_written_notice ?? 'no',
            'notice_officer_name' => $request->notice_officer_name ?? '',
            'notice_dates' => $request->notice_dates ?? null,
            'has_similar_application' => $request->has_similar_application ?? 'no',
            'similar_application_offices' => $request->similar_application_offices ?? '',
            'similar_application_dates' => $request->similar_application_dates ?? null,
            'preferred_release_mode' => $request->preferred_release_mode ?? 'pickup',
            'release_address' => $request->release_address ?? '',
            
            // Existing requirement documents
            'existing_documents' => $request->requirementDocuments->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'requirement_id' => $doc->requirement_id,
                    'requirement_name' => $doc->requirement_name,
                    'original_filename' => $doc->original_filename,
                    'file_path' => $doc->file_path,
                    'mime_type' => $doc->mime_type,
                    'file_size' => $doc->file_size,
                    'uploaded_at' => $doc->created_at->format('M d, Y'),
                ];
            })->groupBy('requirement_id')->toArray(),
            
            // Verified requirements (toggle states)
            'verified_requirements' => $request->verified_requirements ?? [],
        ];

        return Inertia::render('Request/index', [
            'isEditing' => true,
            'existingApplication' => $applicationData,
        ]);
    }

    /**
     * Store a new request.
     */
    public function store(Request $request)
    {
        // Check for recent duplicate submissions (within last 5 minutes)
        // Since applicant_name was moved to applicants table, check by user_id and time only
        $recentRequest = RequestModel::where('user_id', auth()->id())
            ->where('created_at', '>=', now()->subMinutes(5))
            ->first();
            
        if ($recentRequest) {
            return back()->withErrors(['duplicate' => 'A similar request was recently submitted. Please wait before submitting again.']);
        }

        $validated = $request->validate([
            // Page 1: Applicant Information
            'applicant_name' => 'required|string|max:255',
            'corporation_name' => 'nullable|string|max:255',
            'applicant_address' => 'required|string',
            'corporation_address' => 'nullable|string',
            'authorized_representative_name' => 'nullable|string|max:255',
            'authorized_representative_address' => 'nullable|string',
            'authorization_letter' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            
            // Page 2: Project Details
            'project_type' => 'nullable|string|max:255',
            'project_nature' => 'nullable|string|max:255',
            'project_location_number' => 'nullable|string|max:255',
            'project_location_street' => 'nullable|string|max:255',
            'project_location_barangay' => 'nullable|string|max:255',
            'project_location_city' => 'nullable|string|max:255',
            'project_location_municipality' => 'nullable|string|max:255',
            'project_location_province' => 'nullable|string|max:255',
            'project_area_sqm' => 'nullable|numeric|min:0',
            'lot_area_sqm' => 'nullable|numeric|min:0',
            'bldg_improvement_sqm' => 'nullable|numeric|min:0',
            'right_over_land' => 'nullable|in:Owner,Lessee',
            'project_nature_duration' => 'nullable|in:Permanent,Temporary',
            'project_nature_years' => 'nullable|integer|min:1',
            'project_cost' => 'nullable|numeric|min:0',
            
            // Page 3: Land Uses
            'existing_land_use' => 'nullable|in:Residential,Institutional,Commercial,Industrial,Tenanted,Vacant,Agricultural,Not Tenanted',
            'has_written_notice' => 'nullable|in:yes,no',
            'notice_officer_name' => 'nullable|string|max:255',
            'notice_dates' => 'nullable|date',
            'has_similar_application' => 'nullable|in:yes,no',
            'similar_application_offices' => 'nullable|string',
            'similar_application_dates' => 'nullable|date',
            'preferred_release_mode' => 'nullable|in:pickup,mail_applicant,mail_representative,mail_other',
            'release_address' => 'nullable|string',
            
            // Page 4: Requirements Upload
            'requirement_uploads' => 'nullable|array',
            'requirement_uploads.*' => 'nullable|array',
            'requirement_uploads.*.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120',
            'requirement_names' => 'nullable|array',
            'verified_requirements' => 'nullable|array',
        ]);

        // Use a database transaction to ensure all records are created together
        $result = DB::transaction(function () use ($validated, $request) {
            // 1. Create Applicant record
            $applicant = \App\Models\Applicant::create([
                'applicant_name' => $validated['applicant_name'],
                'applicant_address' => $validated['applicant_address'],
                'applicant_type' => isset($validated['corporation_name']) ? 'corporate' : 'individual',
            ]);

            // 2. Create the Request record
            $newRequest = RequestModel::create([
                'user_id' => auth()->id(),
                'applicant_id' => $applicant->id,
                'status' => 'pending',
                'has_written_notice' => $validated['has_written_notice'] ?? 'no',
                'notice_officer_name' => $validated['notice_officer_name'] ?? null,
                'notice_dates' => $validated['notice_dates'] ?? null,
                'has_similar_application' => $validated['has_similar_application'] ?? 'no',
                'similar_application_offices' => $validated['similar_application_offices'] ?? null,
                'similar_application_dates' => $validated['similar_application_dates'] ?? null,
                'preferred_release_mode' => $validated['preferred_release_mode'] ?? 'pickup',
                'release_address' => $validated['release_address'] ?? null,
                // Verification is the officer's decision, never seeded from the applicant.
                'verified_requirements' => json_encode([]),
            ]);

            // Assign unique application number immediately after creation.
            // MM-YY is taken from the record's own creation timestamp.
            $newRequest->update([
                'application_number' => RequestModel::generateApplicationNumber(
                    $applicant->id,
                    $newRequest->created_at
                ),
            ]);

            // 3. Create Corporation record if applicable
            if (isset($validated['corporation_name']) && !empty($validated['corporation_name'])) {
                \App\Models\NormalizedCorporation::create([
                    'applicant_id' => $applicant->id,
                    'corporation_name' => $validated['corporation_name'],
                    'corporation_address' => $validated['corporation_address'] ?? '',
                ]);
            }

            // 4. Create Representative record if applicable
            if (isset($validated['authorized_representative_name']) && !empty($validated['authorized_representative_name'])) {
                \App\Models\Representative::create([
                    'applicant_id' => $applicant->id,
                    'representative_name' => $validated['authorized_representative_name'],
                    'representative_address' => $validated['authorized_representative_address'] ?? '',
                    'is_primary' => true,
                ]);
            }

            // 5. Create Project record
            if (isset($validated['project_type']) || isset($validated['project_nature'])) {
                \App\Models\NormalizedProject::create([
                    'request_id' => $newRequest->id,
                    'project_type' => $validated['project_type'] ?? '',
                    'project_nature' => $validated['project_nature'] ?? '',
                    'project_nature_duration' => $validated['project_nature_duration'] ?? null,
                    'project_nature_years' => $validated['project_nature_years'] ?? null,
                    'project_cost' => $validated['project_cost'] ?? null,
                ]);
            }

            // 6. Create Location record
            if (isset($validated['project_location_barangay']) || isset($validated['project_location_city'])) {
                \App\Models\Location::create([
                    'request_id' => $newRequest->id,
                    'street_address' => $validated['project_location_street'] ?? '',
                    'barangay' => $validated['project_location_barangay'] ?? '',
                    'city_municipality' => $validated['project_location_city'] ?? $validated['project_location_municipality'] ?? '',
                    'province' => $validated['project_location_province'] ?? '',
                ]);
            }

            // 7. Create Property record (includes lot area, land use, right over land)
            \App\Models\Property::create([
                'request_id' => $newRequest->id,
                'lot_area_sqm' => $validated['lot_area_sqm'] ?? null,
                'bldg_improvement_sqm' => $validated['bldg_improvement_sqm'] ?? null,
                'lot_number' => $validated['project_location_number'] ?? null,
                'right_over_land' => $validated['right_over_land'] ?? null,
                'existing_land_use' => $validated['existing_land_use'] ?? null,
            ]);

            // 8. Create Report with default pending status linked to the request
            $report = Report::create([
                'request_id' => $newRequest->id,
                'description' => $validated['project_nature'] ?? null,
                'amount' => $validated['project_cost'] ?? null,
                'evaluation' => 'pending',
            ]);

            // 9. Handle requirement document uploads (Step 4)
            // The wizard sends the human-readable name alongside each requirement so
            // the stored document is self-describing and does not depend on a
            // requirement list that may be re-resolved differently later.
            $requirementNames = $request->input('requirement_names', []);

            // NOTE: do NOT gate this on $request->hasFile('requirement_uploads').
            // The uploads arrive two levels deep (requirement_uploads[id][index]),
            // and Laravel's hasFile() only inspects the outer array — every element
            // is itself an array rather than an SplFileInfo, so it always returns
            // false and every upload would be silently dropped.
            $allFiles = $request->allFiles();
            $requirementFiles = $allFiles['requirement_uploads'] ?? [];

            foreach ($requirementFiles as $requirementId => $files) {
                // Tolerate both a single file and a list of files per requirement.
                foreach (is_array($files) ? $files : [$files] as $file) {
                    if (!$file instanceof \Illuminate\Http\UploadedFile) {
                        continue;
                    }

                    $path = $file->store('requirements', 'local');

                    \App\Models\RequirementDocument::create([
                        'request_id' => $newRequest->id,
                        'requirement_id' => $requirementId,
                        'requirement_name' => $requirementNames[$requirementId] ?? 'Requirement #' . $requirementId,
                        'file_path' => $path,
                        'original_filename' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            return [
                'request' => $newRequest,
                'applicant' => $applicant,
                'report' => $report,
            ];
        });

        // Send email notification to the user
        try {
            Mail::to(auth()->user()->email)->send(
                new ApplicationSubmitted($result['request'], auth()->user()->name)
            );
            
            // Send SMS notification
            if (auth()->user()->contact_number) {
                app(\App\Services\SmsService::class)->sendApplicationSubmitted(
                    auth()->user()->contact_number,
                    auth()->user()->name,
                    $result['request']->application_number ?? 'TPZ-' . date('m-y') . '-' . str_pad($result['request']->id, 4, '0', STR_PAD_LEFT)
                );
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the request
            \Log::error('Failed to send application email: ' . $e->getMessage());
        }

        // Redirect to My Applications page with success message
        return redirect()->route('my-applications')->with([
            'success' => 'Application submitted successfully! Your application number is ' . $result['request']->application_number,
        ]);
    }

    /**
     * Update an existing denied/returned application - FRESH IMPLEMENTATION
     */
    public function update(Request $request, $id)
    {
        // AGGRESSIVE LOGGING - Check if method is even called
        error_log("====== UPDATE METHOD HIT ======");
        error_log("Request ID: " . $id);
        error_log("User ID: " . auth()->id());
        error_log("Method: " . $request->method());
        
        \Log::error('UPDATE METHOD CALLED', [
            'request_id' => $id,
            'user_id' => auth()->id(),
            'method' => $request->method(),
        ]);
        
        // Find the request with all relationships
        $existingRequest = RequestModel::with([
            'applicant.corporation',
            'applicant.primaryRepresentative',
            'project',
            'location',
            'property',
            'report'
        ])->findOrFail($id);

        // Authorization check
        if ($existingRequest->user_id !== auth()->id()) {
            abort(403, 'Unauthorized to update this application.');
        }

        // Status check - only allow editing denied or returned applications
        if (!in_array($existingRequest->status, ['rejected', 'returned'])) {
            return back()->withErrors(['error' => 'Only denied or returned applications can be edited.']);
        }

        // Validate input
        $validated = $request->validate([
            // Step 1
            'applicant_name' => 'required|string|max:255',
            'corporation_name' => 'nullable|string|max:255',
            'applicant_address' => 'required|string',
            'corporation_address' => 'nullable|string',
            'authorized_representative_name' => 'nullable|string|max:255',
            'authorized_representative_address' => 'nullable|string',
            'authorized_representative_email' => 'nullable|email',
            
            // Step 2
            'project_type' => 'nullable|string|max:255',
            'project_nature' => 'nullable|string|max:255',
            'project_location_number' => 'nullable|string|max:255',
            'project_location_street' => 'nullable|string|max:255',
            'project_location_barangay' => 'nullable|string|max:255',
            'project_location_municipality' => 'nullable|string|max:255',
            'project_location_province' => 'nullable|string|max:255',
            'project_area_sqm' => 'nullable|numeric|min:0',
            'lot_area_sqm' => 'nullable|numeric|min:0',
            'bldg_improvement_sqm' => 'nullable|numeric|min:0',
            'right_over_land' => 'nullable|string',
            'project_nature_duration' => 'nullable|string',
            'project_nature_years' => 'nullable|integer|min:1',
            'project_cost' => 'nullable|numeric|min:0',
            'existing_land_use' => 'nullable|string',
            
            // Step 3
            'has_written_notice' => 'nullable|string',
            'notice_officer_name' => 'nullable|string|max:255',
            'notice_dates' => 'nullable|string',
            'has_similar_application' => 'nullable|string',
            'similar_application_offices' => 'nullable|string',
            'similar_application_dates' => 'nullable|string',
            'preferred_release_mode' => 'nullable|string',
            'release_address' => 'nullable|string',
            
            // Step 4
            'requirement_uploads' => 'nullable|array',
            'requirement_uploads.*' => 'nullable|array',
            'requirement_uploads.*.*' => 'file|max:5120',
            'requirement_names' => 'nullable|array',
            'verified_requirements' => 'nullable|array',
        ]);

        try {
            DB::beginTransaction();
            
            // Log file upload status
            \Log::info('Update request - file check', [
                'request_id' => $id,
                'hasFile' => $request->hasFile('requirement_uploads'),
                'all_files' => $request->allFiles(),
                'input_keys' => array_keys($request->all()),
            ]);

            // Update Applicant
            $existingRequest->applicant->update([
                'applicant_name' => $validated['applicant_name'],
                'applicant_address' => $validated['applicant_address'],
                'applicant_type' => !empty($validated['corporation_name']) ? 'corporate' : 'individual',
            ]);

            // Update Corporation
            if (!empty($validated['corporation_name'])) {
                \App\Models\NormalizedCorporation::updateOrCreate(
                    ['applicant_id' => $existingRequest->applicant_id],
                    [
                        'corporation_name' => $validated['corporation_name'],
                        'corporation_address' => $validated['corporation_address'] ?? '',
                    ]
                );
            } else {
                \App\Models\NormalizedCorporation::where('applicant_id', $existingRequest->applicant_id)->delete();
            }

            // Update Representative
            if (!empty($validated['authorized_representative_name'])) {
                \App\Models\Representative::updateOrCreate(
                    ['applicant_id' => $existingRequest->applicant_id, 'is_primary' => true],
                    [
                        'representative_name' => $validated['authorized_representative_name'],
                        'representative_address' => $validated['authorized_representative_address'] ?? '',
                        'representative_email' => $validated['authorized_representative_email'] ?? '',
                    ]
                );
            } else {
                \App\Models\Representative::where('applicant_id', $existingRequest->applicant_id)->delete();
            }

            // Update Project
            \App\Models\NormalizedProject::updateOrCreate(
                ['request_id' => $existingRequest->id],
                [
                    'project_type' => $validated['project_type'] ?? '',
                    'project_nature' => $validated['project_nature'] ?? '',
                    'project_nature_duration' => $validated['project_nature_duration'] ?? null,
                    'project_nature_years' => $validated['project_nature_years'] ?? null,
                    'project_cost' => $validated['project_cost'] ?? null,
                ]
            );

            // Update Location
            \App\Models\Location::updateOrCreate(
                ['request_id' => $existingRequest->id],
                [
                    'street_address' => $validated['project_location_street'] ?? '',
                    'barangay' => $validated['project_location_barangay'] ?? '',
                    'city_municipality' => $validated['project_location_municipality'] ?? '',
                    'province' => $validated['project_location_province'] ?? '',
                ]
            );

            // Update Property
            \App\Models\Property::updateOrCreate(
                ['request_id' => $existingRequest->id],
                [
                    'lot_area_sqm' => $validated['lot_area_sqm'] ?? null,
                    'bldg_improvement_sqm' => $validated['bldg_improvement_sqm'] ?? null,
                    'lot_number' => $validated['project_location_number'] ?? null,
                    'right_over_land' => $validated['right_over_land'] ?? null,
                    'existing_land_use' => $validated['existing_land_use'] ?? null,
                ]
            );

            // Update Request status and fields
            $existingRequest->update([
                'status' => 'in_applicant',
                'has_written_notice' => $validated['has_written_notice'] ?? 'no',
                'notice_officer_name' => $validated['notice_officer_name'] ?? null,
                'notice_dates' => $validated['notice_dates'] ?? null,
                'has_similar_application' => $validated['has_similar_application'] ?? 'no',
                'similar_application_offices' => $validated['similar_application_offices'] ?? null,
                'similar_application_dates' => $validated['similar_application_dates'] ?? null,
                'preferred_release_mode' => $validated['preferred_release_mode'] ?? 'pickup',
                'release_address' => $validated['release_address'] ?? null,
                // Verification is the officer's decision, never seeded from the applicant.
                'verified_requirements' => json_encode([]),
            ]);

            // Update Report if exists
            if ($existingRequest->report) {
                $existingRequest->report->update([
                    'description' => $validated['project_nature'] ?? null,
                    'amount' => $validated['project_cost'] ?? null,
                    'evaluation' => 'pending',
                ]);
            }

            // Handle new file uploads - FIXED TO DETECT FILES PROPERLY
            $allFiles = $request->allFiles();
            \Log::info('Checking for file uploads', [
                'hasFile' => $request->hasFile('requirement_uploads'),
                'all_files' => $allFiles,
                'requirement_uploads_exists' => isset($allFiles['requirement_uploads']),
            ]);
            
            if (isset($allFiles['requirement_uploads']) && is_array($allFiles['requirement_uploads'])) {
                \Log::info('Processing file uploads from allFiles()');
                
                foreach ($allFiles['requirement_uploads'] as $requirementId => $files) {
                    if (is_array($files)) {
                        foreach ($files as $file) {
                            $path = $file->store('requirements', 'local');
                            
                            \App\Models\RequirementDocument::create([
                                'request_id' => $existingRequest->id,
                                'requirement_id' => $requirementId,
                                'requirement_name' => $request->input("requirement_names.{$requirementId}")
                                    ?? 'Requirement #' . $requirementId,
                                'file_path' => $path,
                                'original_filename' => $file->getClientOriginalName(),
                                'mime_type' => $file->getMimeType(),
                                'file_size' => $file->getSize(),
                            ]);
                            
                            \Log::info('File saved', [
                                'requirement_id' => $requirementId,
                                'filename' => $file->getClientOriginalName(),
                            ]);
                        }
                    }
                }
            } else {
                \Log::info('No files in allFiles()');
            }

            DB::commit();

            return redirect()->route('my-applications.index')->with('success', 'Application updated and resubmitted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors(['error' => 'Failed to update application: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Stream/download the authorization letter for a request.
     * Only the owning applicant or admin/super_admin may access the file.
     */
    public function authorizationLetter($id)
    {
        $request = RequestModel::with('applicant.primaryRepresentative')->findOrFail($id);

        $currentUser = auth()->user();
        if ($currentUser->user_type === 'applicant' && $request->user_id !== $currentUser->id) {
            abort(403, 'You are not authorized to view this file.');
        }

        $path = $request->applicant?->primaryRepresentative?->authorization_letter_path;

        if (!$path || !\Storage::disk('local')->exists($path)) {
            abort(404, 'Authorization letter not found.');
        }

        return \Storage::disk('local')->response($path);
    }

    /**
     * Generate order of payment for applicant's approved application
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

        // Check if this request belongs to the logged-in user
        if ($request->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Unauthorized access');
        }

        // The Order of Payment is the document the applicant brings to the Treasury,
        // so it is only issued once the Zoning Administrator has approved the
        // application — not while it is still awaiting that approval.
        $orderOfPaymentStatuses = ['approved'];
        if (!in_array(strtolower((string) $request->status), $orderOfPaymentStatuses, true)) {
            return redirect()->back()->with('error', 'The Order of Payment is available once your application has been approved by the Zoning Administrator.');
        }

        $payment = $request->payments->first();

        // The officer who reviewed this application — their e-signature is stamped
        // on the Order of Payment as "Prepared by".
        $report = \App\Models\Report::where('request_id', $id)->latest()->first();
        $reviewer = $report?->resolveReviewer();

        // "Approved by" is the Zoning Administrator.
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
        ];

        return \Inertia\Inertia::render('Admin/GenerateOrderOfPayment', [
            'application' => $applicationData,
            'payment' => $payment,
            'reviewer' => $reviewer ? [
                'name' => $reviewer->name ?? null,
                'signature_url' => $reviewer->signature_url ?? null,
            ] : null,
            'zoningAdministrator' => $zoningAdministrator ? [
                'name' => $zoningAdministrator->name,
                'signature_url' => $zoningAdministrator->signature_url,
            ] : null,
            // The fee the Zoning Officer set at review time. At "For Payment" there
            // is no Payment record yet, so this is the only source for the amount.
            'paymentAmount' => $payment?->amount ?? $report?->payment_amount,
        ]);
    }

    /**
     * Print certificate for applicant (standalone page)
     */
    public function printCertificate($id)
    {
        $request = \App\Models\Request::with([
            'applicant',
            'project',
            'property',
            'location',
            'payments' => function ($query) {
                $query->where('payment_status', 'verified')->latest();
            }
        ])->findOrFail($id);

        // Check ownership
        if ($request->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this certificate');
        }

        // Get the latest verified payment
        $payment = $request->payments->first();

        // Get reviewer (admin who processed this)
        $reviewer = \App\Models\User::whereIn('user_type', ['admin', 'super_admin'])->first();

        return inertia('Applicant/PrintCertificate', [
            'application' => $this->formatApplicationData($request),
            'payment' => $payment,
            'reviewer' => $reviewer,
        ]);
    }

    /**
     * Print clearance for applicant (standalone page)
     */
    public function printClearance($id)
    {
        $request = \App\Models\Request::with([
            'applicant',
            'project',
            'property',
            'location',
            'payments' => function ($query) {
                $query->where('payment_status', 'verified')->latest();
            }
        ])->findOrFail($id);

        // Check ownership
        if ($request->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this clearance');
        }

        // Get the latest verified payment
        $payment = $request->payments->first();

        // Get reviewer (admin who processed this)
        $reviewer = \App\Models\User::whereIn('user_type', ['admin', 'super_admin'])->first();

        return inertia('Applicant/PrintClearance', [
            'application' => $this->formatApplicationData($request),
            'payment' => $payment,
            'reviewer' => $reviewer,
        ]);
    }

    /**
     * Applicant-facing detail page for one of their own applications.
     * Shows the full application alongside the requirement documents.
     */
    public function showApplication($id): Response
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
            'payments' => function ($query) {
                $query->latest();
            },
        ])->findOrFail($id);

        // Applicants may only view their own applications.
        abort_if($request->user_id !== auth()->id(), 403, 'You are not authorized to view this application.');

        $report = $request->reports->first();

        // The requirement list is driven by the project type, same as the wizard.
        $requirementsReference = \App\Constants\ApplicationRequirements::getRequirements(
            $request->project?->project_type ?: 'ZONING CLEARANCE'
        );

        // Group uploaded documents by the requirement they belong to.
        $grouped = $request->requirementDocuments->groupBy('requirement_id');

        $documentsByRequirement = $grouped->map(function ($docs) {
            return $docs->map(fn ($doc) => [
                'id' => $doc->id,
                'original_filename' => $doc->original_filename,
                'file_size' => $doc->file_size,
                'mime_type' => $doc->mime_type,
                'uploaded_at' => $doc->created_at?->format('M d, Y g:i A'),
            ])->values();
        });

        // The wizard collects documents against its own generic requirement list,
        // while the reference list above varies by project type — and the project
        // type is often only set by staff after submission. Prefer the name that
        // was stored with the document, and append any uploaded requirement that
        // the reference list does not know about, so nothing is ever hidden.
        $requirementsReference = collect($requirementsReference)
            ->map(function ($req) use ($grouped) {
                $stored = $grouped->get($req['id']);
                if ($stored && $stored->first()->requirement_name) {
                    $req['name'] = $stored->first()->requirement_name;
                }
                return $req;
            });

        $knownIds = $requirementsReference->pluck('id')->map(fn ($id) => (string) $id);

        $orphans = $grouped->keys()
            ->reject(fn ($id) => $knownIds->contains((string) $id))
            ->map(fn ($id) => [
                'id' => $id,
                'name' => $grouped->get($id)->first()->requirement_name ?: "Requirement #{$id}",
                'required' => false,
                'section' => 'additional',
                'description' => '',
            ]);

        $requirementsReference = $requirementsReference->concat($orphans)->values()->all();

        return Inertia::render('Applicant/ApplicationDetails', [
            'application' => [
                'id' => $request->id,
                'application_number' => $request->application_number,
                'decision_number' => $request->decision_number,
                'status' => RequestModel::deriveStatus($request->status, $report?->evaluation),
                'request_status' => $request->status,
                'created_at' => $request->created_at?->format('F j, Y'),
                'updated_at' => $request->updated_at?->format('F j, Y'),

                // Applicant — fall back to the account contact number when the form
                // did not carry one.
                'applicant_name' => $request->applicant?->applicant_name,
                'applicant_address' => $request->applicant?->applicant_address,
                'applicant_contact' => $request->applicant?->applicant_contact
                    ?: $request->user?->contact_number,
                'applicant_email' => $request->user?->email,

                'corporation_name' => $request->applicant?->corporation?->corporation_name,
                'corporation_address' => $request->applicant?->corporation?->corporation_address,

                'representative_name' => $request->applicant?->primaryRepresentative?->representative_name,
                'representative_address' => $request->applicant?->primaryRepresentative?->representative_address,

                'project_type' => $request->project?->project_type,
                'project_nature' => $request->project?->project_nature,
                'project_nature_duration' => $request->project?->project_nature_duration,
                'project_nature_years' => $request->project?->project_nature_years,
                'project_description' => $request->project?->project_description,
                'project_cost' => $request->project?->project_cost,

                'project_location_street' => $request->location?->street_address,
                'project_location_barangay' => $request->location?->barangay,
                'project_location_city' => $request->location?->city_municipality,
                'project_location_province' => $request->location?->province,
                'project_location_district' => $request->location?->district,
                'project_location_postal_code' => $request->location?->postal_code,

                'lot_area_sqm' => $request->property?->lot_area_sqm,
                'bldg_improvement_sqm' => $request->property?->bldg_improvement_sqm,
                'lot_number' => $request->property?->lot_number,
                'title_number' => $request->property?->title_number,
                'tax_declaration_no' => $request->property?->tax_declaration_no,
                'zone_classification' => $request->property?->zone_classification,
                'right_over_land' => $request->property?->right_over_land,
                'existing_land_use' => $request->property?->existing_land_use,

                'has_written_notice' => $request->has_written_notice,
                'notice_officer_name' => $request->notice_officer_name,
                'notice_dates' => optional($request->notice_dates)->format('F j, Y') ?? $request->notice_dates,
                'has_similar_application' => $request->has_similar_application,
                'similar_application_offices' => $request->similar_application_offices,
                'similar_application_dates' => optional($request->similar_application_dates)->format('F j, Y') ?? $request->similar_application_dates,

                // Release — a pickup application is collected at the CPDO office.
                'preferred_release_mode' => $request->preferred_release_mode,
                'release_address' => $request->release_address
                    ?: 'City Planning and Development Office, Ground Floor, City Hall Bldg, City of Ilagan, Isabela',

                'rejection_reason' => $report?->evaluation === 'rejected' ? $report?->description : null,
                'payment_amount' => $report?->payment_amount,
                'admin_notes' => $report?->admin_notes,
            ],
            'requirements' => $requirementsReference,
            'documents' => $documentsByRequirement,
        ]);
    }

    /**
     * Format application data for certificate/clearance generation
     */
    private function formatApplicationData($request)
    {
        return [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'decision_number' => $request->decision_number,
            'applicant_name' => $request->applicant->applicant_name ?? 'N/A',
            'applicant_address' => $request->applicant->applicant_address ?? 'N/A',
            'corporation_name' => $request->applicant->normalizedCorporation->corporation_name ?? null,
            'corporation_address' => $request->applicant->normalizedCorporation->corporation_address ?? null,
            'project_type' => $request->project->project_type ?? 'N/A',
            'project_nature' => $request->project->project_nature ?? null,
            'project_location_barangay' => $request->location->barangay ?? 'N/A',
            'project_location_municipality' => $request->location->municipality ?? 'City of Ilagan, Isabela',
            'right_over_land' => $request->property->right_over_land ?? 'OWNER',
            'status' => $request->status,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
        ];
    }
}
