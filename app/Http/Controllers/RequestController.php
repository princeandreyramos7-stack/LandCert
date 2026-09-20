<?php

namespace App\Http\Controllers;

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
                'requests.released_to_applicant_at',
                'requests.application_number',
                'requests.created_at',
                'requests.updated_at',
                'applicants.applicant_name',
                'normalized_projects.project_type',
                'normalized_projects.project_nature',
                'locations.barangay as project_location_barangay',
                'locations.city_municipality as project_location_city',
                // Whether the notarized form (requirement #1) is in yet: the
                // dashboard says the same thing about it as My Applications.
                DB::raw('EXISTS(SELECT 1 FROM requirement_documents rd WHERE rd.request_id = requests.id AND rd.requirement_id = 1) as has_notarized_form'),
                // The office's note for the applicant, once approved - the same
                // one My Applications shows, so the dashboard row says it too.
                DB::raw("CASE WHEN COALESCE(reports.evaluation, requests.status) = 'approved' OR requests.status IN ('payment_confirmed','certificate_preparing','certificate_ready','released') THEN reports.admin_notes END as office_note"),
                // What the applicant last did about the fee: a receipt awaiting
                // the office (pending), one it refused (rejected), or one it
                // accepted (verified) - so the tracker can say "receipt uploaded,
                // awaiting verification" instead of asking them to pay again.
                DB::raw("(SELECT p.payment_status FROM payments p WHERE p.request_id = requests.id ORDER BY p.id DESC LIMIT 1) as latest_payment_status"),
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
        self::rememberAddressOnAccount(auth()->user());

        return Inertia::render('Request/index');
    }

    /**
     * Field 3 of the form starts out as the address on the applicant's
     * account. An account made before the address picker - or without an
     * address at sign-up - has nothing to offer, so the address they gave on
     * their last application is copied onto the account. Filing an
     * application does the same (see createApplication), so from then on the
     * form is filled in for them and they only change it when this
     * application is for somewhere else.
     */
    private static function rememberAddressOnAccount(?\App\Models\User $user, ?\App\Models\Applicant $from = null): void
    {
        if (!$user || $user->address_barangay_code) {
            return;
        }

        $from ??= \App\Models\Applicant::where('user_id', $user->id)
            ->whereNotNull('address_barangay_code')
            ->latest('id')
            ->first();

        if (!$from) {
            return;
        }

        $user->forceFill([
            'address' => $from->applicant_address,
            'address_region_code' => $from->address_region_code,
            'address_province_code' => $from->address_province_code,
            'address_city_code' => $from->address_city_code,
            'address_barangay_code' => $from->address_barangay_code,
            'address_street' => $from->address_street,
        ])->save();
    }

    /**
     * The project location a Zoning Certification is issued for.
     *
     * A ZC has no project step: it certifies the applicant's own parcel, so
     * the location is the applicant's address - written to the locations
     * table like any other application's, so the certificate, the summary and
     * the reports all find a barangay there.
     */
    private static function locationForZoningCertification(array $validated, ?array $applicantAddress): ?array
    {
        if (strtoupper(trim((string) ($validated['project_type'] ?? ''))) !== 'ZC' || !$applicantAddress) {
            return null;
        }
        if (filled($validated['project_location_barangay'] ?? null)) {
            return null;
        }

        $city = \App\Models\Psgc\CityMunicipality::with('province')->find($applicantAddress['city_code']);
        $barangay = \App\Models\Psgc\Barangay::find($applicantAddress['barangay_code']);

        return [
            'street_address' => $applicantAddress['street'] ?? '',
            'barangay' => $barangay?->name ?? '',
            'city_municipality' => $city?->name ?? 'City of Ilagan',
            'province' => $city?->province?->name ?? 'Isabela',
        ];
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
                'requests.released_to_applicant_at',
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
                // The Treasury fee the officer set and the note for the
                // applicant - but only once the Administrator has approved,
                // which is when they become the applicant's business.
                // (reports.amount is the project cost the resubmit path
                // writes, not the fee; the card used to show that.)
                DB::raw("CASE WHEN COALESCE(reports.evaluation, requests.status) = 'approved' OR requests.status IN ('payment_confirmed','certificate_preparing','certificate_ready','released') THEN reports.payment_amount END as report_amount"),
                DB::raw("CASE WHEN COALESCE(reports.evaluation, requests.status) = 'approved' OR requests.status IN ('payment_confirmed','certificate_preparing','certificate_ready','released') THEN reports.admin_notes END as office_note"),
                // What the applicant last did about the fee: a receipt awaiting
                // the office (pending), one it refused (rejected), or one it
                // accepted (verified) - so the tracker can say "receipt uploaded,
                // awaiting verification" instead of asking them to pay again.
                DB::raw("(SELECT p.payment_status FROM payments p WHERE p.request_id = requests.id ORDER BY p.id DESC LIMIT 1) as latest_payment_status"),
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
            // The selections behind the address, so re-opening a returned
            // application shows the address already picked rather than four
            // empty dropdowns. Blank for anything filed before the picker.
            'applicant_address_province_code' => $request->applicant->address_province_code ?? '',
            'applicant_address_city_code' => $request->applicant->address_city_code ?? '',
            'applicant_address_barangay_code' => $request->applicant->address_barangay_code ?? '',
            'applicant_address_street' => $request->applicant->address_street ?? '',
            'applicant_type' => $request->applicant->applicant_type ?? 'individual',
            
            // Corporation information
            'corporation_name' => $request->applicant->corporation->corporation_name ?? '',
            'corporation_address' => $request->applicant->corporation->corporation_address ?? '',
            
            // Representative information
            'authorized_representative_name' => $request->applicant->primaryRepresentative->representative_name ?? '',
            'authorized_representative_address' => $request->applicant->primaryRepresentative->representative_address ?? '',
            'authorized_representative_address_province_code' => $request->applicant->primaryRepresentative->address_province_code ?? '',
            'authorized_representative_address_city_code' => $request->applicant->primaryRepresentative->address_city_code ?? '',
            'authorized_representative_address_barangay_code' => $request->applicant->primaryRepresentative->address_barangay_code ?? '',
            'authorized_representative_address_street' => $request->applicant->primaryRepresentative->address_street ?? '',
            'authorized_representative_email' => $request->applicant->primaryRepresentative->representative_email ?? '',
            // The letter already on file stays unless a new one is chosen, so
            // the form shows it rather than asking for it again.
            'authorization_letter_on_file' => $request->applicant->primaryRepresentative?->authorization_letter_path
                ? basename($request->applicant->primaryRepresentative->authorization_letter_path)
                : null,
            
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
        // Log the submission attempt for debugging
        \Log::info('Application submission started', [
            'user_id' => auth()->id(),
            'user_email' => auth()->user()->email,
            'has_declaration' => $request->has('declaration'),
            'declaration_value' => $request->input('declaration'),
        ]);

        // Catch a double submission — the same form sent twice from a
        // double-click or a retry — without refusing a genuine second
        // application. The old check blocked *any* filing within five minutes
        // of the last one, so an applicant with two properties was turned
        // away. Now it only matches when the project location is the same:
        // that is the same application again, not a new one.
        $recentDuplicate = RequestModel::where('user_id', auth()->id())
            ->where('created_at', '>=', now()->subMinutes(5))
            ->whereHas('location', function ($q) use ($request) {
                $q->where('street_address', $request->input('project_location_street'))
                  ->where('barangay', $request->input('project_location_barangay'));
            })
            ->exists();

        if ($recentDuplicate) {
            \Log::warning('Duplicate submission blocked', ['user_id' => auth()->id()]);
            return back()->withErrors(['duplicate' => 'This application was already submitted a moment ago. Check My Applications before filing it again.']);
        }

        // The two addresses are picked from the PSGC list, so what arrives is
        // four codes and a street rather than a line of text. The line itself
        // is composed here from the codes - never taken from the browser - so
        // what the certificate prints is what was actually selected.
        $hasRepresentative = filled($request->input('authorized_representative_name'));

        $validated = $request->validate(array_merge([
            // The applicant certifies the form is true before it is
            // filed. Enforced here and not only in the browser: a
            // declaration that can be skipped by posting the form
            // directly is not a declaration.
            'declaration' => ['accepted'],

            // Page 1: Applicant Information
            'applicant_name' => 'required|string|max:255',
            'corporation_name' => 'nullable|string|max:255',
            'corporation_address' => 'nullable|string',
            'authorized_representative_name' => 'nullable|string|max:255',
            'authorized_representative_email' => 'nullable|email|max:255',
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
        ],
            \App\Support\PhilippineAddress::rules('applicant_address'),
            \App\Support\PhilippineAddress::rules('corporation_address', false),
            \App\Support\PhilippineAddress::rules('authorized_representative_address', $hasRepresentative)
        ), [], array_merge(
            \App\Support\PhilippineAddress::attributes('applicant_address', 'applicant'),
            \App\Support\PhilippineAddress::attributes('corporation_address', 'corporation'),
            \App\Support\PhilippineAddress::attributes('authorized_representative_address', 'representative')
        ));

        // Each selection has to sit under the one above it. The browser only
        // ever offers valid combinations; a request made by hand does not.
        $chain = \Illuminate\Support\Facades\Validator::make($request->all(), []);
        \App\Support\PhilippineAddress::checkChain($chain, 'applicant_address');
        \App\Support\PhilippineAddress::checkChain($chain, 'corporation_address');
        if ($hasRepresentative) {
            \App\Support\PhilippineAddress::checkChain($chain, 'authorized_representative_address');
        }
        if ($chain->errors()->isNotEmpty()) {
            return back()->withInput()->withErrors($chain->errors());
        }

        $validated['applicant_address'] = \App\Support\PhilippineAddress::resolve($validated, 'applicant_address')['line'] ?? '';
        $validated['corporation_address'] = \App\Support\PhilippineAddress::resolve($validated, 'corporation_address')['line'] ?? '';
        $validated['authorized_representative_address'] = \App\Support\PhilippineAddress::resolve($validated, 'authorized_representative_address')['line'] ?? null;

        // Use a database transaction to ensure all records are created together.
        //
        // Submissions that arrive at the same moment take turns at the number:
        // underNumberLock() holds a database lock from reading the highest
        // number to the commit, so each one sees the one before it. The retry
        // is the fallback should the lock not be had in time: the unique index
        // refuses a repeated number, and the retry recomputes it with the
        // earlier insert now committed.
        $result = null;
        $attempts = 0;

        while ($result === null) {
            try {
                $result = RequestModel::underNumberLock(fn () => $this->createApplication($validated, $request));
            } catch (\Illuminate\Database\QueryException $e) {
                $isDuplicateKey = ($e->errorInfo[1] ?? null) === 1062;
                if (!$isDuplicateKey || ++$attempts >= 5) {
                    \Log::error('Application submission failed', [
                        'user_id' => auth()->id(),
                        'attempt' => $attempts,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);

                    return back()
                        ->withInput()
                        ->withErrors(['submit' => 'The system was busy and could not file your application. Nothing was saved — please try again.']);
                }
            }
        }

        \Log::info('Application submission successful', [
            'user_id' => auth()->id(),
            'application_id' => $result['request']->id ?? 'N/A',
            'application_number' => $result['request']->application_number ?? 'N/A',
        ]);

        return $this->finishSubmission($result);
    }

    /**
     * Everything the submission writes, as one transaction. Split out so that
     * store() can retry it when an application number collides.
     */
    /**
     * The project's tenure as it will be stored: [duration, years].
     *
     * A Temporary Use Permit is issued for one year, so for one the tenure is
     * fixed at "Temporary" for 1 year whatever the form sent - the browser
     * sets the same, but the rule belongs here, not only in the browser.
     */
    private static function projectTenure(array $validated): array
    {
        if (strtoupper(trim((string) ($validated['project_type'] ?? ''))) === 'TUP') {
            return ['Temporary', 1];
        }

        return [$validated['project_nature_duration'] ?? null, $validated['project_nature_years'] ?? null];
    }

    private function createApplication(array $validated, Request $request): array
    {
        return DB::transaction(function () use ($validated, $request) {
            $applicantAddress = \App\Support\PhilippineAddress::resolve($validated, 'applicant_address');
            $corporationAddress = \App\Support\PhilippineAddress::resolve($validated, 'corporation_address');

            // 1. Create Applicant record
            $applicant = \App\Models\Applicant::create(array_merge(
                \App\Support\PhilippineAddress::columns($applicantAddress, 'applicant_address'),
                \App\Support\PhilippineAddress::columns($corporationAddress, 'corporation_address'),
                [
                    'applicant_name' => $validated['applicant_name'],
                    'applicant_address' => $validated['applicant_address'],
                    'applicant_type' => isset($validated['corporation_name']) ? 'corporate' : 'individual',
                ]
            ));

            // 2. Create the Request record
            $newRequest = RequestModel::create([
                'user_id' => auth()->id(),
                'applicant_id' => $applicant->id,
                'status' => 'pending',
                // When the declaration above was made, and against
                // which edition of the published notices.
                'declared_at' => now(),
                'declaration_version' => \App\Support\LegalDocuments::VERSION,
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
                \App\Models\NormalizedCorporation::create(array_merge(
                    \App\Support\PhilippineAddress::columns($corporationAddress, 'corporation_address'),
                    [
                        'applicant_id' => $applicant->id,
                        'corporation_name' => $validated['corporation_name'],
                        'corporation_address' => $validated['corporation_address'] ?? '',
                    ]
                ));
            }

            // 4. Create Representative record if applicable
            if (isset($validated['authorized_representative_name']) && !empty($validated['authorized_representative_name'])) {
                \App\Models\Representative::create(\App\Support\PhilippineAddress::columns(
                    \App\Support\PhilippineAddress::resolve($validated, 'authorized_representative_address'),
                    'representative_address'
                ) + [
                    'applicant_id' => $applicant->id,
                    'representative_name' => $validated['authorized_representative_name'],
                    'representative_address' => $validated['authorized_representative_address'] ?? '',
                    'representative_email' => $validated['authorized_representative_email'] ?? null,
                    // The letter used to be validated and then dropped on the
                    // floor - nothing ever wrote the path.
                    'authorization_letter_path' => $request->hasFile('authorization_letter')
                        ? $request->file('authorization_letter')->store('authorization_letters', 'local')
                        : null,
                    'is_primary' => true,
                ]);
            }

            // 5. Create Project record
            if (isset($validated['project_type']) || isset($validated['project_nature'])) {
                [$duration, $years] = self::projectTenure($validated);
                \App\Models\NormalizedProject::create([
                    'request_id' => $newRequest->id,
                    'project_type' => $validated['project_type'] ?? '',
                    'project_nature' => $validated['project_nature'] ?? '',
                    'project_nature_duration' => $duration,
                    'project_nature_years' => $years,
                    'project_cost' => $validated['project_cost'] ?? null,
                ]);
            }

            // 6. Create Location record. A Zoning Certification has no project
            //    step, so its location is the applicant's own address.
            if ($zcLocation = self::locationForZoningCertification($validated, $applicantAddress)) {
                \App\Models\Location::create(['request_id' => $newRequest->id] + $zcLocation);
            } elseif (isset($validated['project_location_barangay']) || isset($validated['project_location_city'])) {
                \App\Models\Location::create([
                    'request_id' => $newRequest->id,
                    'street_address' => $validated['project_location_street'] ?? '',
                    'barangay' => $validated['project_location_barangay'] ?? '',
                    'city_municipality' => $validated['project_location_city'] ?? $validated['project_location_municipality'] ?? '',
                    'province' => $validated['project_location_province'] ?? '',
                ]);
            }

            // The address given here becomes the account's, if it had none.
            self::rememberAddressOnAccount(auth()->user(), $applicant);

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
    }

    /**
     * Notify the applicant and send them to their list. Kept apart from the
     * write so a notification failure can never roll back a filed application.
     */
    private function finishSubmission(array $result)
    {
        // The e-mail is the RequestObserver's, sent once the application is
        // committed; sending it here as well had the applicant get it twice.
        try {
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
            \Log::error('Failed to send application SMS: ' . $e->getMessage());
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
        // Whose application it is, before anything else: a stranger is refused
        // outright rather than told what their forged submission got wrong.
        abort_if(RequestModel::where('id', $id)->value('user_id') !== auth()->id(), 403, 'Unauthorized to update this application.');

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
        $hasRepresentative = filled($request->input('authorized_representative_name'));

        $validated = $request->validate(array_merge([
            // Certified again on resubmission - see store().
            'declaration' => ['accepted'],

            // Step 1
            'applicant_name' => 'required|string|max:255',
            'corporation_name' => 'nullable|string|max:255',
            'corporation_address' => 'nullable|string',
            'authorized_representative_name' => 'nullable|string|max:255',
            'authorized_representative_email' => 'nullable|email|max:255',
            'authorization_letter' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            
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
            'requirement_uploads.*.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120',
            'requirement_names' => 'nullable|array',
            'verified_requirements' => 'nullable|array',
        ],
            \App\Support\PhilippineAddress::rules('applicant_address'),
            \App\Support\PhilippineAddress::rules('authorized_representative_address', $hasRepresentative)
        ), [], array_merge(
            \App\Support\PhilippineAddress::attributes('applicant_address', 'applicant'),
            \App\Support\PhilippineAddress::attributes('authorized_representative_address', 'representative')
        ));

        $chain = \Illuminate\Support\Facades\Validator::make($request->all(), []);
        \App\Support\PhilippineAddress::checkChain($chain, 'applicant_address');
        if ($hasRepresentative) {
            \App\Support\PhilippineAddress::checkChain($chain, 'authorized_representative_address');
        }
        if ($chain->errors()->isNotEmpty()) {
            return back()->withInput()->withErrors($chain->errors());
        }

        $validated['applicant_address'] = \App\Support\PhilippineAddress::resolve($validated, 'applicant_address')['line'] ?? '';
        $validated['authorized_representative_address'] = \App\Support\PhilippineAddress::resolve($validated, 'authorized_representative_address')['line'] ?? null;

        try {
            DB::beginTransaction();
            
            // Log file upload status
            \Log::info('Update request - file check', [
                'request_id' => $id,
                'hasFile' => $request->hasFile('requirement_uploads'),
                'all_files' => $request->allFiles(),
                'input_keys' => array_keys($request->all()),
            ]);

            $applicantAddress = \App\Support\PhilippineAddress::resolve($validated, 'applicant_address');

            // Update Applicant
            $existingRequest->applicant->update(\App\Support\PhilippineAddress::columns(
                $applicantAddress,
                'applicant_address'
            ) + [
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

            // Update Representative. The authorization letter on file is kept
            // unless a new one was chosen - editing the email used to lose it.
            if (!empty($validated['authorized_representative_name'])) {
                $letter = $request->hasFile('authorization_letter')
                    ? ['authorization_letter_path' => $request->file('authorization_letter')->store('authorization_letters', 'local')]
                    : [];

                \App\Models\Representative::updateOrCreate(
                    ['applicant_id' => $existingRequest->applicant_id, 'is_primary' => true],
                    \App\Support\PhilippineAddress::columns(
                        \App\Support\PhilippineAddress::resolve($validated, 'authorized_representative_address'),
                        'representative_address'
                    ) + $letter + [
                        'representative_name' => $validated['authorized_representative_name'],
                        'representative_address' => $validated['authorized_representative_address'] ?? '',
                        'representative_email' => $validated['authorized_representative_email'] ?? '',
                    ]
                );
            } else {
                \App\Models\Representative::where('applicant_id', $existingRequest->applicant_id)->delete();
            }

            // Update Project
            [$duration, $years] = self::projectTenure($validated);
            \App\Models\NormalizedProject::updateOrCreate(
                ['request_id' => $existingRequest->id],
                [
                    'project_type' => $validated['project_type'] ?? '',
                    'project_nature' => $validated['project_nature'] ?? '',
                    'project_nature_duration' => $duration,
                    'project_nature_years' => $years,
                    'project_cost' => $validated['project_cost'] ?? null,
                ]
            );

            // Update Location (a Zoning Certification's is the applicant's address)
            \App\Models\Location::updateOrCreate(
                ['request_id' => $existingRequest->id],
                self::locationForZoningCertification($validated, $applicantAddress) ?? [
                    'street_address' => $validated['project_location_street'] ?? '',
                    'barangay' => $validated['project_location_barangay'] ?? '',
                    'city_municipality' => $validated['project_location_municipality'] ?? '',
                    'province' => $validated['project_location_province'] ?? '',
                ]
            );

            self::rememberAddressOnAccount(auth()->user(), $existingRequest->applicant);

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

        // Someone else's application is a refusal, not a redirect: this page
        // is reached through a bounce from the id-bearing route, so "back" is
        // that route, which bounces here again, for ever.
        abort_if($request->user_id !== auth()->id(), 403, 'You are not authorized to view this order of payment.');

        // The Order of Payment is the document the applicant brings to the Treasury,
        // so it is only issued once the Zoning Administrator has approved the
        // application — not while it is still awaiting that approval.
        $orderOfPaymentStatuses = ['approved'];
        if (!in_array(strtolower((string) $request->status), $orderOfPaymentStatuses, true)) {
            // To the list, never back(): see above.
            return redirect()->route('my-applications')->with('error', 'The Order of Payment is available once your application has been approved by the Zoning Administrator.');
        }

        $payment = $request->payments->first();

        // The officer who reviewed this application — their e-signature is stamped
        // on the Order of Payment as "Prepared by".
        $report = \App\Models\Report::where('request_id', $id)->latest()->first();
        $reviewer = $report?->resolveReviewer();

        // "Approved by" is the Zoning Administrator.
        $zoningAdministrator = \App\Support\Signatories::zoningAdministrator();

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
            // Signed as of the issue date: an old certificate keeps the
            // signatures and titles it was issued with (App\Support\Signatories).
            ...\App\Services\ApplicationDocuments::signers($request),
            // The fee the Zoning Officer set at review time. At "For Payment" there
            // is no Payment record yet, so this is the only source for the amount.
            'paymentAmount' => $payment?->amount ?? $report?->payment_amount,
        ]);
    }

    /**
     * The applicant's own copy of the Zoning Certification.
     *
     * The same sheet the office issued (CertificateSheet), drawn from the same
     * data and signed by the same people - the officer who reviewed it and the
     * Zoning Administrator - so the copy the applicant downloads carries the
     * e-signatures the issued document does. It used to be a hand-drawn copy
     * with no signatures, naming whichever staff account came first in the
     * table as the reviewer.
     */
    public function printCertificate($id)
    {
        [$request, $payment] = $this->releasedDocument($id);

        return inertia('Applicant/PrintCertificate', [
            'application' => \App\Services\ApplicationDocuments::issuance($request),
            'payment' => $payment,
            ...\App\Services\ApplicationDocuments::signers($request),
            // Dated as the office issued it, not the day the applicant prints it.
            'issuedOn' => optional($request->certificates->sortByDesc('id')->first()?->issued_at ?? $request->released_to_applicant_at)->format('F j, Y'),
        ]);
    }

    /**
     * The applicant's own copy of the Zoning Clearance / Temporary Use Permit.
     * See printCertificate: the same sheet and signers as the office's.
     */
    public function printClearance($id)
    {
        [$request, $payment] = $this->releasedDocument($id);

        return inertia('Applicant/PrintClearance', [
            'application' => \App\Services\ApplicationDocuments::issuance($request),
            'payment' => $payment,
            ...\App\Services\ApplicationDocuments::signers($request),
        ]);
    }

    /**
     * An application whose document the signed-in applicant may print: their
     * own, and released to them by the office. Until the office releases it
     * (AdminController::releaseToApplicant) there is nothing to print - the
     * URL used to hand out a clearance for any approved application, paid or
     * not, to anyone who typed the address.
     *
     * @return array{0: \App\Models\Request, 1: \App\Models\Payment|null}
     */
    private function releasedDocument($id): array
    {
        $request = \App\Models\Request::with(array_merge(
            \App\Services\ApplicationDocuments::ISSUANCE_RELATIONS,
            ['certificates', 'payments' => fn ($query) => $query->where('payment_status', 'verified')->latest()],
        ))->findOrFail($id);

        if ($request->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this document');
        }

        if (!$request->released_to_applicant_at) {
            abort(403, 'This document has not been released by the office yet.');
        }

        return [$request, $request->payments->first()];
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

        // Applicants may only view their own applications. Staff are exempt —
        // reviewing other people's applications is their job, and the sibling
        // check on the document viewer already reads this way. Without the
        // exemption an officer following a link to this page was refused with
        // "You are not authorized to view this application."
        $currentUser = auth()->user();
        abort_if(
            $currentUser?->user_type === 'applicant' && $request->user_id !== $currentUser->id,
            403,
            'You are not authorized to view this application.'
        );

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
        // type is often only set by staff after submission. Keep the authoritative
        // name from the reference list to prevent confusion when a document was
        // uploaded with the wrong requirement_id. Only use stored names for true
        // orphans (IDs not in the reference list).
        $requirementsReference = collect($requirementsReference);

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

        $derivedStatus = RequestModel::deriveStatus($request->status, $report?->evaluation);

        // The officer's note is part of the approval notice, so the applicant
        // reads it once the Zoning Administrator has approved — the same point
        // the fee becomes theirs to pay. Before that the field can hold the
        // Administrator's reason for sending the application back to the
        // officer, which is the office's business, not the applicant's.
        $decided = $derivedStatus === 'approved'
            || in_array($derivedStatus, RequestModel::CERT_LIFECYCLE_STATUSES, true);

        return Inertia::render('Applicant/ApplicationDetails', [
            'application' => [
                'id' => $request->id,
                'application_number' => $request->application_number,
                'decision_number' => $request->decision_number,
                'status' => $derivedStatus,
                'request_status' => $request->status,
                // For the "where it stands" panel: the same flags My Applications reads.
                'released_to_applicant_at' => $request->released_to_applicant_at,
                'latest_payment_status' => $request->payments->first()?->payment_status,
                'has_notarized_form' => $request->requirementDocuments->contains(fn ($d) => (int) $d->requirement_id === 1),
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
                // Applicants never supply a zone classification — the office sets
                // it during review. Until then fall back to the land use they did
                // declare, matching what the admin screens show.
                'zone_classification' => $request->property?->zone_classification ?: $request->property?->existing_land_use,
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
                'payment_amount' => $decided ? $report?->payment_amount : null,
                'admin_notes' => $decided ? $report?->admin_notes : null,
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
