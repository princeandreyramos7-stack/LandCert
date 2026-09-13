<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payments Export</title>
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
        .status-badge {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            display: inline-block;
        }
        .status-verified {
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
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        .amount {
            font-weight: bold;
            color: #059669;
        }
    </style>
</head>
<body>
    @include('exports.partials.letterhead')

    <div class="header">
        <h1>Payment Records Export</h1>
        <p>Generated on {{ $exportDate }}</p>
        @if($status !== 'all')
            <p>Filter: <strong>{{ ucfirst($status) }}</strong> Payments</p>
        @endif
    </div>

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Payments:</span>
            <span class="summary-value">{{ $totalPayments }}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Amount:</span>
            <span class="summary-value">PHP {{ number_format($totalAmount, 2) }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Applicant</th>
                <th>Request</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payments as $payment)
            <tr>
                <td>#{{ $payment->id }}</td>
                <td>
                    <strong>{{ $payment->request?->applicant_name ?? 'N/A' }}</strong><br>
                    <small style="color: #6b7280;">{{ $payment->request?->user?->email ?? '' }}</small>
                </td>
                <td>#{{ $payment->request_id }}</td>
                <td class="amount">PHP {{ number_format($payment->amount ?? 0, 2) }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $payment->payment_method ?? 'cash')) }}</td>
                <td>{{ $payment->receipt_number ?? 'N/A' }}</td>
                <td>{{ $payment->payment_date ? \Carbon\Carbon::parse($payment->payment_date)->format('M j, Y') : 'N/A' }}</td>
                <td>
                    <span class="status-badge status-{{ $payment->payment_status }}">
                        {{ ucfirst($payment->payment_status ?? 'pending') }}
                    </span>
                </td>
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
