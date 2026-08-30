<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Status Update</title>
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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
            background: #f59e0b;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
        }
        .info-box {
            background: white;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .warning-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            background: #f59e0b;
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
            color: #f59e0b;
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
        <div class="denial-icon">⚠️</div>
        <h1>Application Status Update</h1>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $applicantName }}</strong>,</p>
        
        <div class="status-badge">
            ⚠️ ACTION REQUIRED
        </div>
        
        <p>We have reviewed your land certification application and need to inform you about the current status.</p>
        
        <div class="info-box">
            <p><strong>Application Details:</strong></p>
            <p>Request ID: <span class="highlight">#{{ $requestId }}</span></p>
            <p>Applicant: <span class="highlight">{{ $applicantName }}</span></p>
            <p>Status: <span class="highlight">Requires Revision</span></p>
            <p>Date: <span class="highlight">{{ now()->format('F d, Y') }}</span></p>
        </div>
        
        @if($rejectionReason)
        <div class="warning-box">
            <p><strong>📋 Reason for Revision Request:</strong></p>
            <p>{{ $rejectionReason }}</p>
        </div>
        @endif
        
        <h3>📝 Next Steps</h3>
        <p>Your application requires some adjustments before we can proceed with the approval process.</p>
        
        <div class="info-box">
            <p><strong>What you need to do:</strong></p>
            <ol>
                <li>Review the feedback provided above</li>
                <li>Make the necessary corrections to your application</li>
                <li>Submit a new application with the updated information</li>
                <li>Contact our office if you need clarification</li>
            </ol>
        </div>
        
        <center>
            <a href="{{ url('/request') }}" class="button">Submit New Application</a>
        </center>
        
        <div class="info-box">
            <p><strong>📞 Need Help?</strong></p>
            <ul>
                <li>Visit our office during business hours</li>
                <li>Call us for assistance with your application</li>
                <li>Review the application guidelines</li>
                <li>Ensure all required documents are complete</li>
            </ul>
        </div>
        
        <p>We appreciate your understanding and look forward to processing your revised application.</p>
        
        <p>Best regards,<br>
        <strong>City Planning and Development Office</strong><br>
        Land Certification Department</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} LandCert. All rights reserved.</p>
    </div>
</body>
</html>