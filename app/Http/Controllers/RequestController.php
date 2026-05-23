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
        // Check if user has admin role and redirect to admin dashboard
        if (auth()->user()->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }

        // Get requests for the currently logged-in user only
        $requests = RequestModel::where('requests.user_id', auth()->id())
            ->leftJoin('applications', function($join) {
                $join->on('requests.applicant_name', '=', 'applications.applicant_name')
                     ->on('requests.applicant_address', '=', 'applications.applicant_address');
            })
            ->leftJoin('reports', 'applications.id', '=', 'reports.app_id')
            ->select(
                'requests.*',
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
        // Get all requests for the currently logged-in user with related data
        $applications = RequestModel::where('requests.user_id', auth()->id())
            ->leftJoin('applications', function($join) {
                $join->on('requests.applicant_name', '=', 'applications.applicant_name')
                     ->on('requests.applicant_address', '=', 'applications.applicant_address');
            })
            ->leftJoin('reports', 'applications.id', '=', 'reports.app_id')
            ->select(
                'requests.*',
                'applications.id as application_id',
                DB::raw('COALESCE(reports.evaluation, requests.status) as status')
            )
            ->orderBy('requests.created_at', 'desc')
            ->get();

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
        $recentRequest = RequestModel::where('user_id', auth()->id())
            ->where('applicant_name', $request->input('applicant_name'))
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
            $corpId = null;
            $projectId = null;
            $authorizationLetterPath = null;

            // Handle authorization letter upload
            if ($request->hasFile('authorization_letter')) {
                $authorizationLetterPath = $request->file('authorization_letter')->store('authorization_letters', 'public');
            }

            // Create Corporation if corporation_name is provided
            if (!empty($validated['corporation_name'])) {
                $corporation = Corporation::create([
                    'corporation_name' => $validated['corporation_name'],
                    'corporation_address' => $validated['corporation_address'] ?? '',
                ]);
                $corpId = $corporation->id;
            }

            // Build project location from individual fields
            $locationParts = array_filter([
                $validated['project_location_number'] ?? null,
                $validated['project_location_street'] ?? null,
                $validated['project_location_barangay'] ?? null,
                $validated['project_location_city'] ?? null,
                $validated['project_location_municipality'] ?? null,
                $validated['project_location_province'] ?? null,
            ]);
            $location = implode(', ', $locationParts);

            // Create Project
            $project = Project::create([
                'location' => $location ?: 'N/A',
                'lot' => $validated['lot_area_sqm'] ?? null,
                'bldg_improvement' => $validated['bldg_improvement_sqm'] ?? null,
                'right_over_land' => $validated['right_over_land'] ?? null,
                'nature' => $validated['project_nature'] ?? null,
                'existing_land_use' => $validated['existing_land_use'] ?? null,
                'cost' => $validated['project_cost'] ?? null,
                'question_1' => $validated['has_written_notice'] ?? null,
                'if_yes_a' => $validated['notice_officer_name'] ?? null,
                'if_yes_b' => $validated['notice_dates'] ?? null,
                'question_b' => $validated['has_similar_application'] ?? null,
                'if_yes_c' => $validated['similar_application_offices'] ?? null,
                'if_yes_d' => $validated['similar_application_dates'] ?? null,
            ]);
            $projectId = $project->id;

            // Create Application
            $application = Application::create([
                'corp_id' => $corpId,
                'project_id' => $projectId,
                'applicant_name' => $validated['applicant_name'],
                'applicant_address' => $validated['applicant_address'],
                'authorized_representative' => $validated['authorized_representative_name'] ?? null,
                'representative_address' => $validated['authorized_representative_address'] ?? null,
                'authorization_letter_path' => $authorizationLetterPath,
                'preffered_release' => $validated['preferred_release_mode'] ?? null,
            ]);

            // Create Report with default pending status
            $report = Report::create([
                'app_id' => $application->id,
                'description' => $validated['project_nature'] ?? null,
                'amount' => $validated['project_cost'] ?? null,
                'evaluation' => 'pending',
            ]);

            // Also create the request record for the new system
            $newRequest = RequestModel::create([
                'user_id' => auth()->id(),
                'status' => 'pending',
                ...$validated
            ]);

            return [
                'application' => $application,
                'report' => $report,
                'request' => $newRequest,
            ];
        });

        // Send email notification to the user
        try {
            Mail::to(auth()->user()->email)->send(
                new ApplicationSubmitted($result['application'], auth()->user()->name)
            );
        } catch (\Exception $e) {
            // Log the error but don't fail the request
            \Log::error('Failed to send application email: ' . $e->getMessage());
        }

        return back()->with('success', 'Request submitted successfully! Your request ID is #' . $result['application']->id);
    }
}
