<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }
        .status-badge {
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
        }
        .info-box {
            background: white;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
        }
        .highlight {
            color: #667eea;
            font-weight: bold;
        }
        .status-change {
            background: #eff6ff;
            border: 2px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📋 Status Update</h1>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $userName }}</strong>,</p>
        
        <div class="status-badge">
            🔔 STATUS CHANGED
        </div>
        
        <p>We're writing to inform you about a status change for your application.</p>
        
        <div class="info-box">
            <p><strong>Application Details:</strong></p>
            <p>Applicant Name: <span class="highlight">{{ $applicantName }}</span></p>
            <p>Request ID: <span class="highlight">#{{ $requestId }}</span></p>
            <p>Status Type: <span class="highlight">{{ $statusType }}</span></p>
        </div>
        
        <div class="status-change">
            <h3 style="margin-top: 0;">Status Change Details</h3>
            @if($oldStatus !== 'N/A')
            <p><strong>Previous Status:</strong> {{ $oldStatus }}</p>
            @endif
            <p><strong>New Status:</strong> <span style="color: #3b82f6; font-weight: bold;">{{ $newStatus }}</span></p>
            <p><strong>Updated On:</strong> {{ $changedAt }}</p>
        </div>
        
        @if($notes)
        <div class="info-box">
            <p><strong>Additional Information:</strong></p>
            <p>{{ $notes }}</p>
        </div>
        @endif
        
        <center>
            <a href="{{ $dashboardUrl }}" class="button">View Your Dashboard</a>
        </center>
        
        <p>If you have any questions about this status change, please don't hesitate to contact us.</p>
        
        <p>Thank you for your patience.</p>
        
        <p>Best regards,<br>
        <strong>City Planning and Development Office</strong><br>
        Land Certification Department</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} CPDO City of Ilagan. All rights reserved.</p>
    </div>
</body>
</html>
