<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Users Export</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 10mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            color: #6b7280;
            margin: 5px 0;
        }
        .summary {
            background-color: #f3f4f6;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .summary-item {
            display: inline-block;
            margin-right: 30px;
        }
        .summary-label {
            font-weight: bold;
            color: #4b5563;
        }
        .summary-value {
            color: #1e40af;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #3b82f6;
            color: white;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }
        td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 10px;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .badge {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            display: inline-block;
        }
        .badge-verified {
            background-color: #d1fae5;
            color: #065f46;
        }
        .badge-unverified {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .badge-admin {
            background-color: #ddd6fe;
            color: #5b21b6;
        }
        .badge-applicant {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    @include('exports.partials.letterhead')

    <div class="header">
        <h1>User Records Export</h1>
        <p>Generated on {{ $exportDate }}</p>
        @if($userType !== 'all')
            <p>Filter: <strong>{{ ucfirst($userType) }}</strong> Users</p>
        @endif
    </div>

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Users:</span>
            <span class="summary-value">{{ $totalUsers }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Type</th>
                <th>Verified</th>
                <th>Registered</th>
            </tr>
        </thead>
        <tbody>
            @foreach($users as $user)
            <tr>
                <td>#{{ $user->id }}</td>
                <td><strong>{{ $user->name ?? 'N/A' }}</strong></td>
                <td>{{ $user->email ?? 'N/A' }}</td>
                <td>{{ $user->contact_number ?? 'N/A' }}</td>
                <td>{{ $user->address ?? 'N/A' }}</td>
                <td>
                    <span class="badge badge-{{ strtolower($user->user_type ?? 'applicant') }}">
                        {{ ucfirst($user->user_type ?? 'applicant') }}
                    </span>
                </td>
                <td>
                    <span class="badge badge-{{ $user->email_verified_at ? 'verified' : 'unverified' }}">
                        {{ $user->email_verified_at ? 'Yes' : 'No' }}
                    </span>
                </td>
                <td>{{ $user->created_at ? $user->created_at->format('M j, Y') : 'N/A' }}</td>
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
