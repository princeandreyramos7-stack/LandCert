<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Approved</title>
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
        .success-badge {
            background: #10b981;
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
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Application Approved!</h1>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $applicantName }}</strong>,</p>
        
        <div class="success-badge">
            ✓ APPROVED
        </div>
        
        <p>We are pleased to inform you that your land certification application has been <strong>approved</strong>!</p>
        
        <div class="info-box">
            <p><strong>Application Details:</strong></p>
            <p>Request ID: <span class="highlight">#{{ $requestId }}</span></p>
            <p>Status: <span style="color: #10b981;">Approved</span></p>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
            <li><strong>Proceed to Payment</strong> - Visit our office or use our online payment system</li>
            <li><strong>Submit Required Documents</strong> - Bring all necessary documents for verification</li>
            <li><strong>Collect Your Certificate</strong> - Once payment is confirmed, you can collect your land certification</li>
        </ol>
        
        <div class="info-box">
            <p><strong>⚠️ Important Reminders:</strong></p>
            <ul>
                <li>Please complete the payment within 30 days</li>
                <li>Bring a valid ID when collecting your certificate</li>
                <li>Keep this email for your records</li>
            </ul>
        </div>
        
        <center>
            <a href="{{ url('/dashboard') }}" class="button">View Application Status</a>
        </center>
        
        <p>If you have any questions or concerns, please don't hesitate to contact our office.</p>
        
        <p>Thank you for choosing our services!</p>
        
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
