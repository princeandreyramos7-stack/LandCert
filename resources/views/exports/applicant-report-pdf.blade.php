<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Applicant Transaction Summary — {{ $applicant }}</title>
    <style>
        @page { size: A4 portrait; margin: 14mm; }
        body { font-family: Arial, sans-serif; font-size: 9px; color: #333; }

        /* City seal behind the report. position:fixed is what makes DomPDF
           repeat it on every page; the image is pre-faded by the controller,
           so this does not lean on DomPDF's patchy opacity support. */
        .watermark { position: fixed; top: 0; left: 0; width: 100%; height: 100%; text-align: center; }
        .watermark img { width: 60%; margin-top: 18%; }

        .letterhead { text-align: center; border-bottom: 2px solid #0d1f5c; padding-bottom: 8px; margin-bottom: 10px; }
        .letterhead .republic { font-size: 8px; letter-spacing: 1px; text-transform: uppercase; color: #555; }
        .letterhead .city { font-size: 13px; font-weight: bold; color: #0d1f5c; margin: 1px 0; }
        .letterhead .office { font-size: 9px; font-weight: bold; color: #d4a017; text-transform: uppercase; }

        .doc-title { text-align: center; margin-bottom: 10px; }
        .doc-title h1 { font-size: 14px; color: #0d1f5c; margin: 0; }
        .doc-title .who { font-size: 11px; color: #d4a017; font-weight: bold; margin-top: 2px; }
        .doc-title .meta { font-size: 7px; color: #6b7280; margin-top: 3px; }

        .overview { background: #f3f4f6; padding: 6px 8px; margin-bottom: 10px; border-radius: 3px; }
        .overview span { display: inline-block; margin-right: 14px; font-size: 8px; }
        .overview b { color: #0d1f5c; }

        /* Each application is one step of the applicant's history. Kept whole on
           a page where it fits, so a transaction is never split mid-record. */
        .application { border: 1px solid #d1d5db; border-radius: 4px; margin-bottom: 10px; page-break-inside: avoid; }
        .application > .head { background: #0d1f5c; color: #fff; padding: 5px 8px; }
        .application > .head .step { font-size: 8px; text-transform: uppercase; letter-spacing: .6px; color: #cbd5e1; }
        .application > .head .no { font-size: 11px; font-weight: bold; }
        .application > .head .status { float: right; font-size: 8px; background: #d4a017; padding: 2px 6px; border-radius: 8px; }
        .application > .body { padding: 7px 8px; }

        .section { margin-bottom: 7px; }
        .section:last-child { margin-bottom: 0; }
        .section h3 { font-size: 8px; text-transform: uppercase; letter-spacing: .5px; color: #0d1f5c;
                      border-bottom: 1px solid #e5e7eb; padding-bottom: 2px; margin: 0 0 4px; }

        table.kv { width: 100%; border-collapse: collapse; }
        table.kv td { padding: 1.5px 0; vertical-align: top; font-size: 8px; }
        table.kv td.k { width: 30%; color: #6b7280; }
        table.kv td.v { color: #111; }

        table.list { width: 100%; border-collapse: collapse; }
        table.list th { background: #eef2ff; color: #0d1f5c; text-align: left; padding: 3px 4px; font-size: 7px; text-transform: uppercase; }
        table.list td { padding: 3px 4px; border-bottom: 1px solid #eee; font-size: 8px; }

        /* Reproduced scans. DomPDF has no flexbox or grid, so the two-up layout
           is done with floats — the only reliable way to place these side by
           side in this renderer. */
        .shots { margin-top: 6px; }
        .shots:after { content: ""; display: block; clear: both; }
        .shot { float: left; width: 48%; margin: 0 1% 8px; page-break-inside: avoid; }
        .shot img { width: 100%; max-height: 220px; border: 1px solid #d1d5db; }
        .shot .cap { font-size: 7px; color: #6b7280; text-align: center; margin-top: 2px; }

        .none { color: #9ca3af; font-style: italic; font-size: 8px; }
        .footer { margin-top: 10px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-size: 7px; color: #6b7280; }
        .footer .sign { margin-top: 24px; }
        .footer .line { border-top: 1px solid #333; width: 200px; padding-top: 2px; }
    </style>
</head>
<body>
    @if (!empty($watermark))
        <div class="watermark"><img src="{{ $watermark }}" alt=""></div>
    @endif

    <div class="letterhead">
        <div class="republic">Republic of the Philippines</div>
        <div class="city">City of Ilagan, Isabela</div>
        <div class="office">City Planning &amp; Development Office</div>
    </div>

    <div class="doc-title">
        <h1>Applicant Transaction Summary</h1>
        <div class="who">{{ $applicant }}</div>
        <div class="meta">Generated {{ $generatedOn }} by {{ $generatedBy }}</div>
    </div>

    <div class="overview">
        <span><b>{{ $applications->count() }}</b> application{{ $applications->count() === 1 ? '' : 's' }} on record</span>
        @foreach ($statusCounts as $label => $count)
            <span>{{ $label }}: <b>{{ $count }}</b></span>
        @endforeach
    </div>

    @forelse ($applications as $app)
        <div class="application">
            <div class="head">
                <span class="status">{{ $app['status'] }}</span>
                <div class="step">
                    Application {{ $app['step'] }} of {{ $applications->count() }}
                    @if ($app['filed_on'])
                        &nbsp;·&nbsp; Filed {{ \Illuminate\Support\Carbon::parse($app['filed_on'])->format('F j, Y') }}
                    @endif
                </div>
                <div class="no">{{ $app['application_number'] }}</div>
            </div>

            <div class="body">
                <div class="section">
                    <h3>Application Form</h3>
                    <table class="kv">
                        <tr><td class="k">Applicant</td><td class="v">{{ $app['form']['applicant_name'] ?: '—' }}{{ $app['form']['applicant_type'] ? ' (' . $app['form']['applicant_type'] . ')' : '' }}</td></tr>
                        <tr><td class="k">Address</td><td class="v">{{ $app['form']['address'] ?: '—' }}</td></tr>
                        <tr><td class="k">Contact</td><td class="v">{{ $app['form']['contact'] ?: '—' }}</td></tr>
                        <tr><td class="k">Locational Clearance</td><td class="v">{{ $app['form']['project_type'] }}{{ $app['form']['project_nature'] ? ' — ' . $app['form']['project_nature'] : '' }}</td></tr>
                        <tr><td class="k">Project Location</td><td class="v">{{ $app['form']['location'] }}</td></tr>
                        @if ($app['form']['lot_area_sqm'])
                            <tr><td class="k">Lot Area</td><td class="v">{{ number_format((float) $app['form']['lot_area_sqm'], 2) }} sqm</td></tr>
                        @endif
                        @if ($app['form']['right_over_land'])
                            <tr><td class="k">Right Over Land</td><td class="v">{{ $app['form']['right_over_land'] }}</td></tr>
                        @endif
                        <tr><td class="k">Reviewed By</td><td class="v">
                            {{ $app['form']['reviewed_by'] ?: '—' }}
                            @if ($app['form']['date_reviewed'])
                                ({{ \Illuminate\Support\Carbon::parse($app['form']['date_reviewed'])->format('M j, Y') }})
                            @endif
                        </td></tr>
                        @if ($app['decision_number'])
                            <tr><td class="k">Decision No.</td><td class="v">{{ $app['decision_number'] }}</td></tr>
                        @endif
                    </table>
                </div>

                <div class="section">
                    <h3>Order of Payment</h3>
                    @if ($app['order_of_payment']['available'])
                        <table class="kv">
                            <tr><td class="k">Amount Due</td><td class="v">
                                {{-- "PHP" rather than the peso sign: DomPDF's core fonts have no glyph for it. --}}
                                {{ $app['order_of_payment']['amount'] ? 'PHP ' . number_format((float) $app['order_of_payment']['amount'], 2) : 'Not set' }}
                            </td></tr>
                        </table>
                    @else
                        <p class="none">{{ $app['order_of_payment']['note'] }}</p>
                    @endif
                </div>

                <div class="section">
                    <h3>Payment Receipt</h3>
                    @if ($app['payment'])
                        <table class="kv">
                            <tr><td class="k">O.R. Number</td><td class="v">{{ $app['payment']['receipt_number'] ?: '—' }}</td></tr>
                            <tr><td class="k">Amount Paid</td><td class="v">PHP {{ number_format((float) $app['payment']['amount'], 2) }}</td></tr>
                            <tr><td class="k">Method</td><td class="v">{{ $app['payment']['method'] ? ucwords(str_replace('_', ' ', $app['payment']['method'])) : '—' }}</td></tr>
                            <tr><td class="k">Date Paid</td><td class="v">{{ $app['payment']['date'] ? \Illuminate\Support\Carbon::parse($app['payment']['date'])->format('F j, Y') : '—' }}</td></tr>
                            <tr><td class="k">Status</td><td class="v">{{ ucfirst($app['payment']['status'] ?? '—') }}</td></tr>
                        </table>

                        {{-- The receipt itself, when it is an image DomPDF can read
                             off disk. A PDF receipt cannot be nested inside this
                             document, so it is named instead of shown. --}}
                        @if ($app['payment']['receipt_kind'] === 'image' && $app['payment']['receipt_path'])
                            <div class="shot">
                                <img src="{{ $app['payment']['receipt_path'] }}" alt="Official receipt">
                                <div class="cap">Official receipt</div>
                            </div>
                        @elseif ($app['payment']['receipt_kind'] === 'pdf')
                            <p class="none">Receipt is a PDF document — held on file, not reproduced here.</p>
                        @endif
                    @else
                        <p class="none">No payment recorded.</p>
                    @endif
                </div>

                <div class="section">
                    <h3>Submitted Requirements ({{ count($app['requirements']) }})</h3>
                    @if (count($app['requirements']))
                        <table class="list">
                            <thead>
                                <tr>
                                    <th style="width:5%">#</th>
                                    <th style="width:45%">Requirement</th>
                                    <th style="width:35%">File</th>
                                    <th style="width:15%">Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($app['requirements'] as $i => $doc)
                                    <tr>
                                        <td>{{ $i + 1 }}</td>
                                        <td>{{ $doc['name'] ?: '—' }}</td>
                                        <td>{{ $doc['filename'] ?: '—' }}</td>
                                        <td>{{ $doc['uploaded_at'] ? \Illuminate\Support\Carbon::parse($doc['uploaded_at'])->format('M j, Y') : '—' }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>

                        {{-- Scanned requirements reproduced in the document. Only
                             images: a PDF requirement cannot be nested inside this
                             PDF, so those stay listed in the table above. --}}
                        @php
                            $shots = collect($app['requirements'])
                                ->filter(fn ($d) => $d['kind'] === 'image' && $d['path']);
                        @endphp
                        @if ($shots->isNotEmpty())
                            <div class="shots">
                                @foreach ($shots as $doc)
                                    <div class="shot">
                                        <img src="{{ $doc['path'] }}" alt="{{ $doc['name'] }}">
                                        <div class="cap">{{ $doc['name'] ?: $doc['filename'] }}</div>
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    @else
                        <p class="none">No requirements submitted.</p>
                    @endif
                </div>

                @if ($app['certificate'])
                    <div class="section">
                        <h3>Certificate</h3>
                        <table class="kv">
                            <tr><td class="k">Certificate No.</td><td class="v">{{ $app['certificate']['number'] ?: '—' }}</td></tr>
                            <tr><td class="k">Status</td><td class="v">{{ ucwords(str_replace('_', ' ', $app['certificate']['status'] ?? '—')) }}</td></tr>
                            @if ($app['certificate']['released_at'])
                                <tr><td class="k">Released</td><td class="v">{{ \Illuminate\Support\Carbon::parse($app['certificate']['released_at'])->format('F j, Y') }}</td></tr>
                            @endif
                        </table>
                    </div>
                @endif
            </div>
        </div>
    @empty
        <p class="none">No applications on record for this applicant.</p>
    @endforelse

    <div class="footer">
        This summary was generated from the CPDO Land Use Certification System records as of {{ $generatedOn }}.
        <div class="sign">
            <div class="line">{{ $generatedBy }}</div>
            <div>Zoning Administrator</div>
        </div>
    </div>
</body>
</html>
