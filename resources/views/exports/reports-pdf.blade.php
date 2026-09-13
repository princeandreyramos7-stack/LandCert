<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }} — {{ $subtitle }}</title>
    <style>
        @page { size: A4 landscape; margin: 12mm; }
        body { font-family: Arial, sans-serif; font-size: 8px; color: #333; }

        /* City seal behind the report. position:fixed is what makes DomPDF
           repeat it on every page; the image is pre-faded by the controller,
           so this does not lean on DomPDF's patchy opacity support. */
        .watermark { position: fixed; top: 0; left: 0; width: 100%; height: 100%; text-align: center; }
        .watermark img { width: 60%; margin-top: 18%; }


        .report-title { text-align: center; margin-bottom: 10px; }
        .report-title h1 { font-size: 14px; color: #0d1f5c; margin: 0; }
        .report-title .subtitle { font-size: 10px; color: #d4a017; font-weight: bold; margin-top: 2px; }
        .report-title .meta { font-size: 7px; color: #6b7280; margin-top: 3px; }

        .summary { background: #f3f4f6; padding: 6px 8px; margin-bottom: 8px; border-radius: 3px; }
        .summary .count { display: inline-block; margin-right: 14px; font-size: 8px; }
        .summary .count b { color: #0d1f5c; }

        table { width: 100%; border-collapse: collapse; }
        th { background: #0d1f5c; color: #fff; padding: 5px 4px; text-align: left; font-size: 7px; text-transform: uppercase; letter-spacing: .3px; }
        td { padding: 4px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
        tr:nth-child(even) td { background: #fafbff; }
        .num { text-align: right; white-space: nowrap; }
        .nowrap { white-space: nowrap; }

        .empty { text-align: center; padding: 24px; color: #6b7280; font-style: italic; }
        .footer { margin-top: 12px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-size: 7px; color: #6b7280; }
        .footer .sign { margin-top: 22px; }
        .footer .line { border-top: 1px solid #333; width: 200px; padding-top: 2px; }
    </style>
</head>
<body>
    @if (!empty($watermark))
        <div class="watermark"><img src="{{ $watermark }}" alt=""></div>
    @endif

    @include('exports.partials.letterhead')

    <div class="report-title">
        <h1>{{ $title }}</h1>
        <div class="subtitle">{{ $subtitle }}</div>
        <div class="meta">Generated {{ $generatedOn }} by {{ $generatedBy }}</div>
    </div>

    <div class="summary">
        <span class="count"><b>{{ $rows->count() }}</b> application{{ $rows->count() === 1 ? '' : 's' }}</span>
        @foreach ($statusCounts as $label => $count)
            <span class="count">{{ $label }}: <b>{{ $count }}</b></span>
        @endforeach
    </div>

    @if ($rows->isEmpty())
        <div class="empty">No applications match this report.</div>
    @else
        <table>
            <thead>
                <tr>
                    <th style="width:9%">Application No.</th>
                    <th style="width:14%">Applicant</th>
                    <th style="width:11%">Locational Clearance</th>
                    <th style="width:21%">Location</th>
                    <th style="width:12%">Status</th>
                    <th style="width:12%">Reviewed By</th>
                    <th style="width:8%">Date Reviewed</th>
                    <th style="width:7%">Fee</th>
                    <th style="width:6%">Filed</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($rows as $row)
                    <tr>
                        <td class="nowrap">{{ $row->application_number }}</td>
                        <td>{{ $row->applicant_name }}</td>
                        <td>
                            {{ $row->project_type }}
                            @if ($row->project_nature)
                                <br><span style="color:#6b7280">{{ $row->project_nature }}</span>
                            @endif
                        </td>
                        <td>{{ $row->location }}</td>
                        <td>{{ $row->status }}</td>
                        <td>{{ $row->reviewed_by ?: '—' }}</td>
                        <td class="nowrap">
                            {{ $row->date_reported ? \Illuminate\Support\Carbon::parse($row->date_reported)->format('M j, Y') : '—' }}
                        </td>
                        <td class="num">
                            {{-- "PHP" rather than the peso sign: DomPDF's core fonts have no glyph for it. --}}
                            {{ $row->payment_amount ? 'PHP ' . number_format((float) $row->payment_amount, 2) : '—' }}
                        </td>
                        <td class="nowrap">
                            {{ $row->filed_on ? \Illuminate\Support\Carbon::parse($row->filed_on)->format('M j, Y') : '—' }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        This report was generated from the CPDO Land Use Certification System records as of {{ $generatedOn }}.
        <div class="sign">
            <div class="line">{{ $generatedBy }}</div>
            <div>Zoning Administrator</div>
        </div>
    </div>
</body>
</html>
