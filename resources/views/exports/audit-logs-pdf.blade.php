<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Audit Logs Export</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #f3f4f6;
            color: #374151;
            font-weight: bold;
            padding: 8px;
            text-align: left;
            border: 1px solid #d1d5db;
            font-size: 9px;
        }
        td {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            font-size: 9px;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
        }
        .badge-created { background-color: #dbeafe; color: #1e40af; }
        .badge-updated { background-color: #fef3c7; color: #92400e; }
        .badge-deleted { background-color: #fee2e2; color: #991b1b; }
        .badge-viewed { background-color: #f3f4f6; color: #374151; }
        .badge-exported { background-color: #e0e7ff; color: #3730a3; }
        .badge-login { background-color: #d1fae5; color: #065f46; }
        .badge-logout { background-color: #fef3c7; color: #92400e; }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .summary {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f9fafb;
            border-radius: 5px;
        }
        .summary-item {
            display: inline-block;
            margin-right: 20px;
        }
    </style>
</head>
<body>
    @include('exports.partials.letterhead')

    <div class="header">
        <h1>Audit Logs Report</h1>
        <p>City Planning and Development Office</p>
        <p>Generated on: {{ now()->format('F d, Y h:i A') }}</p>
    </div>

    <div class="summary">
        <strong>Summary:</strong>
        <div class="summary-item">Total Records: <strong>{{ $logs->count() }}</strong></div>
        <div class="summary-item">Date Range: <strong>{{ $logs->min('created_at')?->format('M d, Y') ?? 'N/A' }} - {{ $logs->max('created_at')?->format('M d, Y') ?? 'N/A' }}</strong></div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 12%;">Date & Time</th>
                <th style="width: 15%;">User</th>
                <th style="width: 10%;">Action</th>
                <th style="width: 30%;">Description</th>
                <th style="width: 13%;">Model</th>
                <th style="width: 10%;">IP Address</th>
                <th style="width: 10%;">Method</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logs as $log)
                <tr>
                    <td>{{ $log->created_at->format('M d, Y h:i A') }}</td>
                    <td>
                        <strong>{{ $log->user_name ?? 'System' }}</strong><br>
                        <span style="color: #666; font-size: 8px;">{{ $log->user_email }}</span>
                    </td>
                    <td>
                        @php
                            $badgeClass = match($log->action) {
                                'created', 'bulk_created' => 'badge-created',
                                'updated', 'bulk_updated' => 'badge-updated',
                                'deleted', 'bulk_deleted' => 'badge-deleted',
                                'viewed' => 'badge-viewed',
                                'exported' => 'badge-exported',
                                'login' => 'badge-login',
                                'logout' => 'badge-logout',
                                default => 'badge-viewed',
                            };
                        @endphp
                        <span class="badge {{ $badgeClass }}">
                            {{ strtoupper(str_replace('_', ' ', $log->action)) }}
                        </span>
                    </td>
                    <td>{{ $log->description }}</td>
                    <td>
                        @if($log->model_type)
                            {{ $log->model_type }}
                            @if($log->model_id)
                                #{{ $log->model_id }}
                            @endif
                        @else
                            -
                        @endif
                    </td>
                    <td style="font-family: monospace;">{{ $log->ip_address }}</td>
                    <td>{{ $log->method }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px;">No audit logs found</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>This is a system-generated report. All activities are logged for accountability and compliance purposes.</p>
        <p>© {{ date('Y') }} - City Planning and Development Office. All rights reserved.</p>
    </div>
</body>
</html>
