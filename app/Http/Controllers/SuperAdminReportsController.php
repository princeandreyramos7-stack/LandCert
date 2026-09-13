<?php

namespace App\Http\Controllers;

use App\Models\Request as RequestModel;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Reports & Document Management for the Zoning Administrator.
 *
 * Three questions the office actually asks of its records:
 *   - what has this applicant filed with us?
 *   - what came through in a given month?
 *   - what has a given Zoning Officer reviewed?
 *
 * All three produce the same row shape from the same query, which is why they
 * share one builder: the difference between them is a filter, not a report.
 */
class SuperAdminReportsController extends Controller
{
    /**
     * Which reports this role may run. The Zoning Officer sees the applicant
     * and period reports; a report of who reviewed what is the Administrator's
     * oversight view, not the officer's own.
     */
    protected function allowedTypes(): array
    {
        return ['applicant', 'period', 'officer'];
    }

    /** Route-name prefix for the document links a report points at. */
    protected function routePrefix(): string
    {
        return 'super-admin';
    }

    /** The Inertia page this role's report screen lives on. */
    protected function pageComponent(): string
    {
        return 'SuperAdmin/Reports';
    }

    /** Widest a reproduced scan is embedded at, in pixels. */
    private const REPORT_IMAGE_WIDTH = 900;

    /** Above this, a scan is re-encoded even if its dimensions are modest. */
    private const REPORT_IMAGE_MAX_BYTES = 120 * 1024;

    /** Width of the faded seal watermark baked into every PDF, in pixels. */
    private const WATERMARK_WIDTH = 300;

    /** Most rows the on-screen preview will carry; downloads are never capped. */
    private const PREVIEW_ROW_LIMIT = 1000;

    /**
     * The page itself: the choices a report can be built from.
     */
    public function index(): Response
    {
        // Applicants, by the name on the application rather than the account -
        // one household account can file under several applicant names.
        $applicants = RequestModel::with('applicant:id,applicant_name')
            ->get(['id', 'applicant_id'])
            ->groupBy(fn ($request) => $request->applicant?->applicant_name ?: 'Unnamed applicant')
            ->map(fn ($group, $name) => [
                'name' => $name,
                'applications' => $group->count(),
            ])
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        // Only the role that can run the officer report needs the officer list.
        $officers = in_array('officer', $this->allowedTypes(), true)
            ? User::where('user_type', 'admin')
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(fn ($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ])
            : collect();

        // Only offer years that have applications in them - an empty year on the
        // dropdown is an invitation to generate an empty report.
        $years = RequestModel::selectRaw('YEAR(created_at) as year')
            ->whereNotNull('created_at')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->map(fn ($year) => (int) $year)
            ->values();

        return Inertia::render($this->pageComponent(), [
            'applicants' => $applicants,
            'officers' => $officers,
            'years' => $years->isEmpty() ? [(int) now()->year] : $years,
            'currentYear' => (int) now()->year,
            'currentMonth' => (int) now()->month,
            'reportTypes' => $this->allowedTypes(),
        ]);
    }

    /**
     * The report as JSON, for the on-screen panel.
     *
     * The panel is the primary way a report is read now - downloading is what
     * you do once you have looked at it - so this and generate() must describe
     * the same records. They share the builders below for exactly that reason.
     */
    public function preview(Request $request)
    {
        $validated = $this->validateReportRequest($request);
        $type = $validated['type'];

        // The applicant report is not a table of applications; it is a file on
        // a person, so it answers with each transaction in full.
        if ($type === 'applicant') {
            $applications = $this->applicantTransactions($validated['applicant']);

            // The absolute filesystem paths exist only so DomPDF can read the
            // images off disk. The browser reaches documents through their own
            // routes, so shipping these would disclose the server's layout for
            // no benefit.
            $applications = $applications->map(function ($app) {
                unset($app['payment']['receipt_path']);
                $app['requirements'] = collect($app['requirements'])
                    ->map(function ($doc) {
                        unset($doc['path']);
                        return $doc;
                    })
                    ->values();

                return $app;
            });

            return response()->json([
                'type' => 'applicant',
                'title' => 'Applicant Transaction Summary',
                'subtitle' => $validated['applicant'],
                'generated_on' => now()->format('F j, Y \a\t g:i A'),
                'applications' => $applications,
                'summary' => [
                    'applications' => $applications->count(),
                    'status_counts' => $applications->countBy('status'),
                ],
            ]);
        }

        [$rows, $title, $subtitle] = $type === 'period'
            ? $this->periodReport((int) $validated['year'], $validated['month'] ?? 'all')
            : $this->officerReport($validated['officer'] ?? 'all');

        // The panel pages in the browser, so every row used to travel in this
        // one response - a busy year could be megabytes. The summary is still
        // computed over the full set, so the counts stay honest; only the rows
        // shipped to the screen are capped. The PDF and CSV are built from the
        // full set and are unaffected.
        $total = $rows->count();
        $truncated = $total > self::PREVIEW_ROW_LIMIT;

        return response()->json([
            'type' => $type,
            'title' => $title,
            'subtitle' => $subtitle,
            'generated_on' => now()->format('F j, Y \a\t g:i A'),
            'rows' => $truncated ? $rows->take(self::PREVIEW_ROW_LIMIT)->values() : $rows,
            'truncated' => $truncated,
            'row_limit' => self::PREVIEW_ROW_LIMIT,
            'summary' => [
                'applications' => $total,
                'status_counts' => $rows->countBy('status'),
            ],
        ]);
    }

    /**
     * Build and hand back the chosen report as a PDF or CSV download.
     */
    public function generate(Request $request)
    {
        $validated = $this->validateReportRequest($request);
        $type = $validated['type'];
        $format = $validated['format'] ?? 'pdf';

        // The applicant PDF is the transaction file, not a one-line-per-application
        // table, so it gets its own document. The CSV stays tabular either way -
        // a spreadsheet of nested documents would not be usable.
        if ($type === 'applicant' && $format !== 'csv') {
            return $this->applicantPdf($validated['applicant']);
        }

        [$rows, $title, $subtitle, $slug] = match ($type) {
            'applicant' => $this->applicantReport($validated['applicant']),
            'period' => $this->periodReport((int) $validated['year'], $validated['month'] ?? 'all'),
            'officer' => $this->officerReport($validated['officer'] ?? 'all'),
        };

        return $format === 'csv'
            ? $this->csv($rows, $slug)
            : $this->pdf($rows, $title, $subtitle, $slug);
    }

    /**
     * Shared by preview() and generate() so the panel and the download can
     * never disagree about what a valid request looks like.
     */
    private function validateReportRequest(Request $request): array
    {
        return $request->validate([
            'type' => 'required|in:' . implode(',', $this->allowedTypes()),
            'format' => 'nullable|in:pdf,csv',
            'applicant' => 'required_if:type,applicant|nullable|string|max:255',
            'year' => 'required_if:type,period|nullable|integer|min:2000|max:2100',
            // "all" means the whole year, so this is not simply a month number.
            'month' => 'nullable|string|in:all,1,2,3,4,5,6,7,8,9,10,11,12',
            'officer' => 'nullable|string|max:32',
        ]);
    }

    /* ── The three reports ────────────────────────────────────────────────── */

    private function applicantReport(string $applicantName): array
    {
        $rows = $this->rows(function ($query) use ($applicantName) {
            $query->whereHas('applicant', fn ($a) => $a->where('applicant_name', $applicantName));
        });

        return [
            $rows,
            'Applications by Applicant',
            $applicantName,
            'applicant-' . $this->slug($applicantName),
        ];
    }

    private function periodReport(int $year, string $month): array
    {
        $monthNumber = ctype_digit($month) ? (int) $month : null;

        $rows = $this->rows(function ($query) use ($year, $monthNumber) {
            $query->whereYear('requests.created_at', $year);
            if ($monthNumber) {
                $query->whereMonth('requests.created_at', $monthNumber);
            }
        });

        $label = $monthNumber
            ? Carbon::create($year, $monthNumber, 1)->format('F Y')
            : "All of {$year}";

        return [
            $rows,
            'Applications Filed',
            $label,
            'period-' . ($monthNumber ? sprintf('%04d-%02d', $year, $monthNumber) : $year),
        ];
    }

    /**
     * Applications a Zoning Officer has reviewed or processed.
     *
     * "Reviewed" means the officer reached a decision on it. An evaluation of
     * "pending" is the absence of a review, not a review, so those are excluded
     * however far along the rest of the record looks.
     *
     * Attribution runs through Report::resolveReviewer(), which prefers the
     * reviewed_by FK and falls back to matching the legacy issued_by name - so
     * older rows still land against the right person rather than going missing.
     * Reviews carried out by the Zoning Administrator are left out: this report
     * is about the officer's caseload, and the Administrator is who it is for.
     */
    private function officerReport(string $officer): array
    {
        $wanted = $officer !== 'all' && ctype_digit($officer) ? (int) $officer : null;
        $officerName = $wanted ? (User::find($wanted)?->name ?? 'Unknown officer') : null;

        $rows = $this->rows(
            fn ($query) => $query->whereHas(
                'report',
                fn ($r) => $r->whereNotNull('evaluation')->where('evaluation', '!=', 'pending')
            ),
            function ($request, $report) use ($wanted) {
                $reviewer = $report?->resolveReviewer();

                if ($wanted) {
                    return isset($reviewer->id) && (int) $reviewer->id === $wanted;
                }

                return ($reviewer->user_type ?? null) !== 'super_admin';
            }
        );

        return [
            $rows,
            'Applications Reviewed by the Zoning Officer',
            $officerName ?? 'All Zoning Officers',
            'officer-' . ($officerName ? $this->slug($officerName) : 'all'),
        ];
    }

    /* ── Applicant transactions ───────────────────────────────────────────── */

    /**
     * Everything on file for one applicant, application by application: the
     * form itself, the order of payment, the receipt, and the requirements they
     * submitted. Oldest first, because the panel numbers them as steps and the
     * first application should be step 1.
     *
     * Documents are linked, not copied. Each one already has a controller that
     * renders or serves it with the right permissions; duplicating that here
     * would be a second place for the two to drift apart.
     */
    private function applicantTransactions(string $applicantName)
    {
        return RequestModel::with([
            'applicant:id,applicant_name,applicant_address,applicant_contact,applicant_type',
            'project:id,request_id,project_type,project_nature,project_cost',
            'location:id,request_id,street_address,barangay,city_municipality,province',
            'property:id,request_id,lot_number,lot_area_sqm,right_over_land,existing_land_use',
            'report',
            'payments',
            'requirementDocuments:id,request_id,requirement_name,original_filename,file_path,created_at',
            'certificates:id,request_id,certificate_number,status,issued_at,released_at',
        ])
            ->whereHas('applicant', fn ($a) => $a->where('applicant_name', $applicantName))
            ->orderBy('created_at')
            ->get()
            ->values()
            ->map(function ($request, $index) {
                $report = $request->report;
                $reviewer = $report?->resolveReviewer();
                $rawStatus = RequestModel::deriveStatus($request->status, $report?->evaluation);
                $fee = $report?->payment_amount ?? $report?->amount;

                // The order of payment is the slip the applicant pays against, so
                // it only exists from approval onwards - the same rule the
                // generator itself applies.
                $orderPayable = in_array(
                    strtolower((string) $request->status),
                    array_merge(['approved'], RequestModel::CERT_LIFECYCLE_STATUSES),
                    true
                );

                $payment = $request->payments
                    ->sortByDesc(fn ($p) => $p->payment_status === 'verified' ? 1 : 0)
                    ->sortByDesc('payment_date')
                    ->first();

                $certificate = $request->certificates->sortByDesc('issued_at')->first();

                return [
                    'step' => $index + 1,
                    'id' => $request->id,
                    'application_number' => $request->application_number ?: "TPZ-{$request->id}",
                    'decision_number' => $request->decision_number,
                    'status' => $this->statusLabel($rawStatus),
                    'filed_on' => $request->created_at,

                    'form' => [
                        'applicant_name' => $request->applicant?->applicant_name,
                        'applicant_type' => $request->applicant?->applicant_type,
                        'address' => $request->applicant?->applicant_address,
                        'contact' => $request->applicant?->applicant_contact,
                        'project_type' => $request->project?->project_type ?: 'Not set',
                        'project_nature' => $request->project?->project_nature,
                        'project_cost' => $request->project?->project_cost,
                        'location' => $this->location($request),
                        'lot_area_sqm' => $request->property?->lot_area_sqm,
                        'right_over_land' => $request->property?->right_over_land,
                        'existing_land_use' => $request->property?->existing_land_use,
                        'reviewed_by' => $reviewer->name ?? null,
                        'date_reviewed' => $report?->date_reported,
                        'print_url' => route($this->routePrefix() . '.requests.print', $request->id),
                    ],

                    'order_of_payment' => [
                        'available' => $orderPayable,
                        'amount' => $fee,
                        'url' => $orderPayable
                            ? route($this->routePrefix() . '.generate-order-of-payment', $request->id)
                            : null,
                        'note' => $orderPayable
                            ? null
                            : 'Issued once the application is approved.',
                    ],

                    'payment' => $payment ? [
                        'receipt_number' => $payment->receipt_number,
                        'amount' => $payment->amount,
                        'method' => $payment->payment_method,
                        'date' => $payment->payment_date,
                        'status' => $payment->payment_status,
                        'receipt_url' => $payment->receipt_file_path
                            ? route('payments.receipt.view', $payment->id)
                            : null,
                        // Payments carry no mime column, so the extension is all
                        // there is to go on.
                        'receipt_kind' => $this->fileKind(null, $payment->receipt_file_path),
                        'receipt_path' => $this->storagePath($payment->receipt_file_path),
                    ] : null,

                    'requirements' => $request->requirementDocuments->map(fn ($doc) => [
                        'id' => $doc->id,
                        'name' => $doc->requirement_name,
                        'filename' => $doc->original_filename,
                        'uploaded_at' => $doc->created_at,
                        'url' => route('requirements.view', $doc->id),
                        // Lets the panel show the document itself rather than a
                        // link to it: an image inline, a PDF in a frame.
                        'kind' => $this->fileKind($doc->mime_type, $doc->original_filename ?: $doc->file_path),
                        'path' => $this->storagePath($doc->file_path),
                        // The notarized application form is submitted as a
                        // requirement, so the printed pack can lead with it
                        // instead of burying it among the attachments.
                        'is_application_form' => str_contains(
                            strtolower((string) $doc->requirement_name),
                            'application form'
                        ),
                    ])->values(),

                    'certificate' => $certificate ? [
                        'number' => $certificate->certificate_number,
                        'status' => $certificate->status,
                        'issued_at' => $certificate->issued_at,
                        'released_at' => $certificate->released_at,
                    ] : null,

                    // The issued documents themselves. Both generators read the
                    // application rather than a stored file, so they are offered
                    // from the same point the decision was reached - an approved
                    // application has them, an undecided one has nothing to show.
                    'documents' => [
                        'available' => $orderPayable,
                        'certificate_url' => $orderPayable
                            ? route($this->routePrefix() . '.generate-certificate', $request->id)
                            : null,
                        'clearance_url' => $orderPayable
                            ? route($this->routePrefix() . '.generate-clearance', $request->id)
                            : null,
                        'note' => $orderPayable
                            ? null
                            : 'Issued once the application is approved.',
                    ],
                ];
            });
    }

    /* ── Shared row builder ───────────────────────────────────────────────── */

    /**
     * @param  callable  $scope   Applies the report's filter to the query.
     * @param  callable|null  $keep  Optional per-row filter for anything the
     *                               database cannot express (see officerReport).
     */
    private function rows(callable $scope, ?callable $keep = null)
    {
        $query = RequestModel::with([
            'applicant:id,applicant_name,applicant_address,applicant_contact',
            'project:id,request_id,project_type,project_nature',
            'location:id,request_id,street_address,barangay,city_municipality,province',
            // The lot number sits on properties, not locations.
            'property:id,request_id,lot_number',
            'report',
            'user:id,name,email',
        ])->orderByDesc('created_at');

        $scope($query);

        return $query->get()
            ->map(function ($request) use ($keep) {
                $report = $request->report;

                if ($keep && !$keep($request, $report)) {
                    return null;
                }

                $reviewer = $report?->resolveReviewer();

                return (object) [
                    'application_number' => $request->application_number ?: "TPZ-{$request->id}",
                    'applicant_name' => $request->applicant?->applicant_name ?: 'N/A',
                    'applicant_contact' => $request->applicant?->applicant_contact,
                    'project_type' => $request->project?->project_type ?: 'Not set',
                    'project_nature' => $request->project?->project_nature,
                    'location' => $this->location($request),
                    'status' => $this->statusLabel(
                        RequestModel::deriveStatus($request->status, $report?->evaluation)
                    ),
                    'reviewed_by' => $reviewer->name ?? null,
                    'date_reported' => $report?->date_reported,
                    'payment_amount' => $report?->payment_amount ?? $report?->amount,
                    'filed_on' => $request->created_at,
                ];
            })
            ->filter()
            ->values();
    }

    /**
     * How a stored document should be shown: "image", "pdf" or "other".
     *
     * Both document endpoints stream the file with its own Content-Type, so an
     * image can be dropped straight into an <img> and a PDF into a frame. The
     * mime column is trusted when present and the extension is the fallback,
     * because older rows were written before it was recorded.
     */
    /**
     * A faded city seal for the PDF watermark, generated once and cached.
     *
     * Pre-faded rather than dropped in at full strength under a CSS opacity:
     * DomPDF's support for opacity is patchy, and a seal that lands at full
     * strength over a report would make it unreadable. Baking the transparency
     * into the image takes the renderer out of the question.
     *
     * Returns null if it cannot be built - a report without a watermark is
     * still a report.
     */
    private function watermarkPath(): ?string
    {
        $cached = storage_path('app/report-watermark.png');
        if (is_file($cached)) {
            return $cached;
        }

        $source = public_path('images/ilagan1logo.png');
        if (!is_readable($source)) {
            return null;
        }

        try {
            $seal = @imagecreatefrompng($source);
            if (!$seal) {
                return null;
            }

            // Every PDF carries this, and at 6% opacity the detail is invisible,
            // so it is shrunk first: the full-size seal added a quarter of a
            // megabyte to each document for nothing anyone can see.
            $width = self::WATERMARK_WIDTH;
            $height = (int) round(imagesy($seal) * ($width / imagesx($seal)));

            $small = imagecreatetruecolor($width, $height);
            imagealphablending($small, false);
            imagesavealpha($small, true);
            imagefilledrectangle($small, 0, 0, $width, $height, imagecolorallocatealpha($small, 0, 0, 0, 127));
            imagecopyresampled($small, $seal, 0, 0, 0, 0, $width, $height, imagesx($seal), imagesy($seal));
            imagedestroy($seal);
            $seal = $small;

            // Scale every pixel's alpha towards transparent. GD's alpha runs
            // 0 (opaque) to 127 (clear), so this pushes each one most of the
            // way to clear while leaving the colours alone.
            for ($y = 0; $y < $height; $y++) {
                for ($x = 0; $x < $width; $x++) {
                    $colour = imagecolorat($seal, $x, $y);
                    $alpha = ($colour >> 24) & 0x7F;
                    // 0.92 leaves 8% opacity, matching the on-screen panel
                    // (SealWatermark.jsx) so paper and screen agree.
                    $faded = (int) round($alpha + (127 - $alpha) * 0.92);
                    imagesetpixel($seal, $x, $y, imagecolorallocatealpha(
                        $seal,
                        ($colour >> 16) & 0xFF,
                        ($colour >> 8) & 0xFF,
                        $colour & 0xFF,
                        min(127, $faded)
                    ));
                }
            }

            imagepng($seal, $cached, 9);
            imagedestroy($seal);

            return is_file($cached) ? $cached : null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Absolute path to a stored file, or null if it is not on either disk.
     *
     * DomPDF reads images off the filesystem, not over HTTP - the document
     * routes are behind auth, so a URL would come back as a redirect to the
     * login page rather than an image.
     */
    private function storagePath(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        foreach (['public', 'local'] as $disk) {
            if (\Storage::disk($disk)->exists($path)) {
                return \Storage::disk($disk)->path($path);
            }
        }

        return null;
    }

    private function fileKind(?string $mime, ?string $path): string
    {
        $mime = strtolower((string) $mime);

        if (str_starts_with($mime, 'image/')) {
            return 'image';
        }
        if ($mime === 'application/pdf') {
            return 'pdf';
        }

        $extension = strtolower(pathinfo((string) $path, PATHINFO_EXTENSION));

        return match ($extension) {
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp' => 'image',
            'pdf' => 'pdf',
            default => 'other',
        };
    }

    private function location($request): string
    {
        $parts = array_filter([
            $request->property?->lot_number,
            $request->location?->street_address,
            $request->location?->barangay,
            $request->location?->city_municipality,
            $request->location?->province,
        ]);

        return $parts ? implode(', ', $parts) : 'N/A';
    }

    /* ── Output ───────────────────────────────────────────────────────────── */

    private function applicantPdf(string $applicantName)
    {
        $applications = $this->applicantTransactions($applicantName);

        // Scans go in at their original resolution otherwise, which put one
        // applicant's file at 8 MB and twelve seconds to build - long enough to
        // trip the host's execution limit. They are reproduced for reference,
        // not for re-printing, so report resolution is enough.
        // A regular closure, not an arrow function: an arrow function captures
        // by value, so the temporaries it collected would never come back here
        // to be deleted.
        $temporary = [];
        $applications = $applications->map(function ($app) use (&$temporary) {
            return $this->shrinkScans($app, $temporary);
        });

        $pdf = Pdf::loadView('exports.applicant-report-pdf', [
            'applicant' => $applicantName,
            'applications' => $applications,
            'generatedOn' => now()->format('F j, Y \a\t g:i A'),
            'generatedBy' => auth()->user()?->name ?? 'Zoning Administrator',
            'statusCounts' => $applications->countBy('status'),
            'watermark' => $this->watermarkPath(),
        ]);
        $pdf->setPaper('a4', 'portrait');

        // download() renders the document, so the temporaries have done their
        // job by the time it returns.
        $response = $pdf->download(
            'cpdo-applicant-' . $this->slug($applicantName) . '-' . now()->format('Ymd-His') . '.pdf'
        );

        foreach ($temporary as $file) {
            @unlink($file);
        }

        // Anything a failed run left behind, so the directory cannot grow
        // without bound if a report ever dies mid-render.
        foreach (glob(storage_path('app/report-scans') . '/*.jpg') ?: [] as $stale) {
            if (@filemtime($stale) < now()->subHour()->getTimestamp()) {
                @unlink($stale);
            }
        }

        return $response;
    }

    /**
     * Swap each embedded scan for a downscaled copy, collecting the temporary
     * files so the caller can clean them up after the document is rendered.
     */
    private function shrinkScans(array $app, array &$temporary): array
    {
        if (($app['payment']['receipt_kind'] ?? null) === 'image') {
            $app['payment']['receipt_path'] = $this->downscale($app['payment']['receipt_path'], $temporary);
        }

        $app['requirements'] = collect($app['requirements'])
            ->map(function ($doc) use (&$temporary) {
                if ($doc['kind'] === 'image') {
                    $doc['path'] = $this->downscale($doc['path'], $temporary);
                }
                return $doc;
            })
            ->values()
            ->all();

        return $app;
    }

    /**
     * A JPEG copy of the image, no wider than REPORT_IMAGE_WIDTH, written to
     * the system temp directory.
     *
     * Re-encoding matters more than resizing here: the scans on file are
     * roughly 550x750 but 600-800 KB each, because they are PNG screenshots.
     * Width alone would leave them untouched, so anything above
     * REPORT_IMAGE_MAX_BYTES gets re-encoded whatever its dimensions.
     *
     * Returns the original path when it is already small, and on any failure -
     * a heavy report beats one that will not build.
     */
    private function downscale(?string $path, array &$temporary): ?string
    {
        if (!$path || !is_readable($path)) {
            return $path;
        }

        try {
            $size = @getimagesize($path);
            if (!$size) {
                return $path;
            }

            $oversized = $size[0] > self::REPORT_IMAGE_WIDTH;
            $heavy = @filesize($path) > self::REPORT_IMAGE_MAX_BYTES;
            if (!$oversized && !$heavy) {
                return $path;
            }

            [$width, $height, $type] = $size;
            $source = match ($type) {
                IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
                IMAGETYPE_PNG => @imagecreatefrompng($path),
                IMAGETYPE_GIF => @imagecreatefromgif($path),
                IMAGETYPE_WEBP => @imagecreatefromwebp($path),
                default => null,
            };
            if (!$source) {
                return $path;
            }

            // Never upscale: a 550px scan stays 550px and simply gets re-encoded.
            $targetWidth = min($width, self::REPORT_IMAGE_WIDTH);
            $targetHeight = (int) round($height * ($targetWidth / $width));
            $resized = imagecreatetruecolor($targetWidth, $targetHeight);

            // A scan on a transparent ground would otherwise come out black.
            imagefilledrectangle($resized, 0, 0, $targetWidth, $targetHeight, imagecolorallocate($resized, 255, 255, 255));
            imagecopyresampled($resized, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

            // Inside the project, not the system temp directory: DomPDF is
            // chrooted to the application root and silently refuses to load an
            // image from outside it - the document simply renders without the
            // picture, with no error to explain why.
            $directory = storage_path('app/report-scans');
            if (!is_dir($directory)) {
                @mkdir($directory, 0775, true);
            }

            $temp = $directory . DIRECTORY_SEPARATOR . uniqid('scan-', true) . '.jpg';
            imagejpeg($resized, $temp, 72);
            imagedestroy($resized);
            imagedestroy($source);

            $temporary[] = $temp;

            return $temp;
        } catch (\Throwable $e) {
            return $path;
        }
    }

    private function pdf($rows, string $title, string $subtitle, string $slug)
    {
        $pdf = Pdf::loadView('exports.reports-pdf', [
            'rows' => $rows,
            'title' => $title,
            'subtitle' => $subtitle,
            'generatedOn' => now()->format('F j, Y \a\t g:i A'),
            'generatedBy' => auth()->user()?->name ?? 'Zoning Administrator',
            'statusCounts' => $rows->countBy('status'),
            'watermark' => $this->watermarkPath(),
        ]);
        $pdf->setPaper('a4', 'landscape');

        return $pdf->download("cpdo-report-{$slug}-" . now()->format('Ymd-His') . '.pdf');
    }

    private function csv($rows, string $slug)
    {
        $filename = "cpdo-report-{$slug}-" . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, [
                'Application No.', 'Applicant', 'Contact', 'Locational Clearance',
                'Project Nature', 'Location', 'Status', 'Reviewed By',
                'Date Reviewed', 'Fee', 'Filed On',
            ]);

            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->application_number,
                    $row->applicant_name,
                    $row->applicant_contact,
                    $row->project_type,
                    $row->project_nature,
                    $row->location,
                    $row->status,
                    $row->reviewed_by,
                    $row->date_reported ? Carbon::parse($row->date_reported)->format('Y-m-d') : '',
                    $row->payment_amount,
                    $row->filed_on ? Carbon::parse($row->filed_on)->format('Y-m-d') : '',
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    /**
     * The wording the office uses for a status, matching the applications list
     * and the status filter (resources/js/lib/applicationStatus.js).
     */
    private function statusLabel(?string $status): string
    {
        return match ($status) {
            'pending', 'for_verification' => 'For Verification',
            'reviewed', 'pending_superadmin_approval' => 'For Approval',
            'returned', 'in_applicant' => 'Returned to Applicant',
            'approved' => 'Approved - For Payment',
            'for_payment', 'pending_payment' => 'For Payment',
            'payment_confirmed', 'approved_with_payment', 'certificate_preparing',
            'certificate_ready', 'released', 'collected', 'completed' => 'Application Approved (paid)',
            'rejected' => 'Application Denied',
            default => $status ? ucfirst(str_replace('_', ' ', $status)) : 'Unknown',
        };
    }

    private function slug(string $value): string
    {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $value), '-'));

        return $slug !== '' ? $slug : 'report';
    }
}
