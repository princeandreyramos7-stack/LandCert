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
                DB::raw('COALESCE(reports.evaluation, requests.status) as status')
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
                'requests.control_number',
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
                DB::raw('COALESCE(reports.evaluation, requests.status) as status')
            )
            ->orderBy('requests.created_at', 'desc')
            ->paginate(10); // Changed from ->get() to ->paginate(10)

        return Inertia::render('MyApplications', [
            'applications' => $applications
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
            ]);

            // Assign unique CPD control number immediately after creation
            $newRequest->update([
                'control_number' => RequestModel::generateControlNumber(),
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
                    $result['request']->control_number ?? 'CPD-' . str_pad($result['request']->id, 4, '0', STR_PAD_LEFT)
                );
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the request
            \Log::error('Failed to send application email: ' . $e->getMessage());
        }

        // Return with application data for the success dialog
        return back()->with([
            'success' => 'Request submitted successfully! Your request ID is #' . $result['request']->id,
            'application' => [
                'id' => $result['request']->id,
                'control_number' => $result['request']->control_number,
            ]
        ]);
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
}
