<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Requests Export</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 7px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 2px solid #3b82f6;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 16px;
        }
        .header p {
            color: #6b7280;
            margin: 2px 0;
            font-size: 8px;
        }
        .summary {
            background-color: #f3f4f6;
            padding: 6px;
            margin-bottom: 8px;
            border-radius: 3px;
            text-align: center;
        }
        .summary-item {
            display: inline-block;
            margin: 0 15px;
        }
        .summary-label {
            font-weight: bold;
            color: #4b5563;
            font-size: 8px;
        }
        .summary-value {
            color: #1e40af;
            font-weight: bold;
            font-size: 9px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 6px;
        }
        th {
            background-color: #3b82f6;
            color: white;
            padding: 4px 2px;
            text-align: left;
            font-weight: bold;
            font-size: 6px;
            border: 1px solid #2563eb;
            vertical-align: top;
        }
        td {
            padding: 3px 2px;
            border: 1px solid #d1d5db;
            font-size: 6px;
            vertical-align: top;
            word-wrap: break-word;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .status-badge {
            padding: 1px 4px;
            border-radius: 2px;
            font-size: 6px;
            font-weight: bold;
            display: inline-block;
            white-space: nowrap;
        }
        .status-approved {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-pending {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .status-rejected {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .footer {
            margin-top: 10px;
            text-align: center;
            color: #6b7280;
            font-size: 7px;
            padding-top: 8px;
            border-top: 1px solid #e5e7eb;
        }
        .small-text {
            font-size: 5px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Request Records Export</h1>
        <p>Generated on {{ $exportDate }}</p>
        @if($status !== 'all')
            <p>Filter: <strong>{{ ucfirst($status) }}</strong> Requests</p>
        @endif
    </div>

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Requests:</span>
            <span class="summary-value">{{ $totalRequests }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 2%;">ID</th>
                <th style="width: 6%;">Applicant Name</th>
                <th style="width: 5%;">Applicant Address</th>
                <th style="width: 5%;">Corporation</th>
                <th style="width: 5%;">Corp. Address</th>
                <th style="width: 5%;">Auth. Rep.</th>
                <th style="width: 4%;">Locational Clearance</th>
                <th style="width: 4%;">Project Nature</th>
                <th style="width: 6%;">Location</th>
                <th style="width: 3%;">Area (sqm)</th>
                <th style="width: 3%;">Lot (sqm)</th>
                <th style="width: 3%;">Bldg (sqm)</th>
                <th style="width: 4%;">Right Over Land</th>
                <th style="width: 4%;">Duration</th>
                <th style="width: 6%;">Cost</th>
                <th style="width: 5%;">Land Use</th>
                <th style="width: 4%;">Written Notice</th>
                <th style="width: 4%;">Similar App</th>
                <th style="width: 5%;">Release Mode</th>
                <th style="width: 3%;">Status</th>
                <th style="width: 4%;">Submitted</th>
            </tr>
        </thead>
        <tbody>
            @foreach($requests as $req)
            <tr>
                <td>#{{ $req->id }}</td>
                <td>{{ $req->applicant_name ?? 'N/A' }}</td>
                <td>{{ $req->applicant_address ?? 'N/A' }}</td>
                <td>{{ $req->corporation_name ?? '-' }}</td>
                <td>{{ $req->corporation_address ?? '-' }}</td>
                <td>
                    @if(isset($req->authorized_representative_name) && $req->authorized_representative_name)
                        {{ $req->authorized_representative_name }}
                    @else
                        -
                    @endif
                </td>
                <td>{{ $req->project_type ?? 'N/A' }}</td>
                <td>{{ $req->project_nature ?? 'N/A' }}</td>
                <td>
                    {{ $req->project_location_number ?? '' }}
                    {{ $req->project_location_street ?? '' }},
                    {{ $req->project_location_barangay ?? '' }},
                    {{ $req->project_location_municipality ?? '' }},
                    {{ $req->project_location_province ?? '' }}
                </td>
                <td>{{ isset($req->project_area_sqm) && $req->project_area_sqm ? number_format($req->project_area_sqm, 2) : '-' }}</td>
                <td>{{ isset($req->lot_area_sqm) && $req->lot_area_sqm ? number_format($req->lot_area_sqm, 2) : '-' }}</td>
                <td>{{ isset($req->bldg_improvement_sqm) && $req->bldg_improvement_sqm ? number_format($req->bldg_improvement_sqm, 2) : '-' }}</td>
                <td>{{ $req->right_over_land ?? '-' }}</td>
                <td>
                    {{ $req->project_nature_duration ?? '-' }}
                    @if(isset($req->project_nature_duration) && $req->project_nature_duration === 'Temporary' && isset($req->project_nature_years) && $req->project_nature_years)
                        <br><span class="small-text">({{ $req->project_nature_years }} yrs)</span>
                    @endif
                </td>
                <td>{{ isset($req->project_cost) && $req->project_cost ? 'PHP  ' . number_format($req->project_cost, 2) : '-' }}</td>
                <td>{{ $req->existing_land_use ?? '-' }}</td>
                <td>
                    {{ isset($req->has_written_notice) && $req->has_written_notice ? strtoupper($req->has_written_notice) : '-' }}
                    @if(isset($req->has_written_notice) && $req->has_written_notice === 'yes')
                        <br><span class="small-text">{{ $req->notice_officer_name ?? '' }}</span>
                        <br><span class="small-text">{{ $req->notice_dates ?? '' }}</span>
                    @endif
                </td>
                <td>
                    {{ isset($req->has_similar_application) && $req->has_similar_application ? strtoupper($req->has_similar_application) : '-' }}
                    @if(isset($req->has_similar_application) && $req->has_similar_application === 'yes')
                        <br><span class="small-text">{{ $req->similar_application_offices ?? '' }}</span>
                        <br><span class="small-text">{{ $req->similar_application_dates ?? '' }}</span>
                    @endif
                </td>
                <td>
                    {{ isset($req->preferred_release_mode) && $req->preferred_release_mode ? ucwords(str_replace('_', ' ', $req->preferred_release_mode)) : '-' }}
                    @if(isset($req->release_address) && $req->release_address)
                        <br><span class="small-text">{{ $req->release_address }}</span>
                    @endif
                </td>
                <td>
                    <span class="status-badge status-{{ strtolower($req->status ?? 'pending') }}">
                        {{ ucfirst($req->status ?? 'pending') }}
                    </span>
                </td>
                <td>{{ $req->created_at ? \Carbon\Carbon::parse($req->created_at)->format('M j, Y') : 'N/A' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This is a computer-generated document. No signature is required.</p>
        <p>© {{ date('Y') }} - City Planning and Development Office. All rights reserved.</p>
    </div>
</body>
</html>
