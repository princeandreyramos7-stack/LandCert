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

        /* Reproduced scans, one to a page. The strip above each one says which
           application and which requirement it is, so a page can be read on
           its own once the pack is out of the binder. */
        .scan-page { page-break-before: always; }
        .scan-page .strip { border-bottom: 2px solid #0d1f5c; padding-bottom: 3px; margin-bottom: 6px; }
        .scan-page .strip .what { font-size: 9px; font-weight: bold; color: #0d1f5c; text-transform: uppercase; letter-spacing: .5px; }
        .scan-page .strip .who { font-size: 7px; color: #6b7280; }
        .scan-page .shot { text-align: center; }
        .scan-page .shot img { max-width: 100%; max-height: 235mm; border: 1px solid #d1d5db; }
        .scan-page .cap { font-size: 7px; color: #6b7280; text-align: center; margin-top: 3px; }

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

    @include('exports.partials.letterhead')

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
                {{-- Only what the applicant handed in. The form, order of
                     payment, receipt and certificate are the office's own
                     records, reached from their own pages; this pack
                     reproduces the file as it was submitted. --}}
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
                    @else
                        <p class="none">No requirements submitted.</p>
                    @endif
                </div>
            </div>
        </div>

        {{-- The scans themselves, one to a page. Only images: a PDF requirement
             cannot be nested inside this PDF, so those stay listed in the table
             above. The notarized form comes first, as it does in the file. --}}
        @php
            $shots = collect($app['requirements'])
                ->filter(fn ($d) => $d['kind'] === 'image' && $d['path'])
                ->sortByDesc(fn ($d) => $d['is_application_form'] ?? false)
                ->values();
        @endphp
        @foreach ($shots as $n => $doc)
            <div class="scan-page">
                <div class="strip">
                    <div class="what">{{ $doc['name'] ?: 'Attachment' }} &nbsp;·&nbsp; {{ $n + 1 }} of {{ $shots->count() }}</div>
                    <div class="who">Application {{ $app['step'] }} of {{ $applications->count() }} &nbsp;·&nbsp; {{ $app['application_number'] }} &nbsp;·&nbsp; {{ $app['form']['applicant_name'] }}</div>
                </div>
                <div class="shot">
                    <img src="{{ $doc['path'] }}" alt="{{ $doc['name'] }}">
                </div>
                <div class="cap">{{ $doc['filename'] }}</div>
            </div>
        @endforeach
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
