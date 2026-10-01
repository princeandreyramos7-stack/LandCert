<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Denied - Online Resubmission Closed</title>
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
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
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
            background: #dc2626;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
        }
        .info-box {
            background: white;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .warning-box {
            background: #fee2e2;
            border: 1px solid #dc2626;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
        }
        .highlight {
            color: #dc2626;
            font-weight: bold;
        }
        .denial-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="denial-icon">🚫</div>
        <h1>Online Resubmission Closed</h1>
    </div>

    <div class="content">
        <p>Dear <strong>{{ $applicantName }}</strong>,</p>

        <div class="status-badge">
            🚫 DENIED - VISIT THE OFFICE IN PERSON
        </div>

        <p>Your application has now been denied {{ \App\Models\Request::MAX_DENIALS }} times. To keep the process fair and to make sure every denial gets the office's full attention, this application can <strong>no longer be resubmitted online</strong>.</p>

        <div class="info-box">
            <p><strong>Application Details:</strong></p>
            <p>Request ID: <span class="highlight">#{{ $requestId }}</span></p>
            <p>Applicant: <span class="highlight">{{ $applicantName }}</span></p>
            <p>Times Denied: <span class="highlight">{{ \App\Models\Request::MAX_DENIALS }}</span></p>
            <p>Date: <span class="highlight">{{ now()->format('F d, Y') }}</span></p>
        </div>

        @if($rejectionReason)
        <div class="warning-box">
            <p><strong>📋 Most Recent Reason for Denial:</strong></p>
            <p>{{ $rejectionReason }}</p>
        </div>
        @endif

        <h3>📍 What to do next</h3>
        <div class="info-box">
            <p>Please visit the City Planning and Development Office in person, bringing:</p>
            <ul>
                <li>A valid government-issued ID</li>
                <li>Copies of the documents you last submitted for this application</li>
                <li>Any corrections addressing the reasons given for each denial</li>
            </ul>
            <p>Office staff will review your case with you directly and advise on how to proceed.</p>
        </div>

        <p>We understand this is inconvenient, and appreciate your patience while the office ensures every application is evaluated fairly.</p>

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
