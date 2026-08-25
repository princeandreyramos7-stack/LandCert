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
            background-color: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            background: white;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }
        .success-badge {
            background: #10b981;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            margin: 20px 0;
            font-size: 16px;
        }
        .info-box {
            background: #f0fdf4;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info-box h3 {
            margin-top: 0;
            color: #059669;
        }
        .info-row {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            color: #6b7280;
            font-size: 14px;
        }
        .info-value {
            color: #111827;
            font-weight: 600;
            font-size: 16px;
        }
        .requirements-list {
            list-style: none;
            padding: 0;
        }
        .requirements-list li {
            padding: 10px;
            background: white;
            margin: 8px 0;
            border-radius: 5px;
            border: 1px solid #d1d5db;
        }
        .requirements-list li:before {
            content: "✓ ";
            color: #10b981;
            font-weight: bold;
            margin-right: 8px;
        }
        .button {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
        }
        .button:hover {
            background: #059669;
        }
        .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
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
            color: #10b981;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-icon">🎉</div>
        <h1>Application Approved!</h1>
        <p>Your land certification application has been approved</p>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $applicantName }}</strong>,</p>
        
        <div class="success-badge">
            ✓ APPLICATION APPROVED
        </div>
        
        <p>Congratulations! Your land certification application <strong>#{{ $request->id }}</strong> has been <span class="highlight">APPROVED</span> by the City Planning and Development Office.</p>
        
        <div class="info-box">
            <h3>📅 Appointment Details</h3>
            <div class="info-row">
                <div class="info-label">Date:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($appointmentDate)->format('l, F j, Y') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Time:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Location:</div>
                <div class="info-value">City Planning and Development Office<br>Tacurong City Hall, Tacurong City</div>
            </div>
        </div>
        
        <div class="info-box">
            <h3>💰 Payment Information</h3>
            <div class="info-row">
                <div class="info-label">Amount to Pay:</div>
                <div class="info-value">₱{{ number_format($paymentAmount, 2) }}</div>
            </div>
            <p style="margin-top: 15px; font-size: 14px;">
                <strong>Next Step - Where to Pay:</strong><br>
                Please proceed to the <strong>Municipal/City Treasury Office</strong> to pay the amount above
                on or before your scheduled date. After payment, bring your <strong>Official Receipt (OR)</strong>
                together with your requirements to the CPDO office to continue processing your application.
            </p>
        </div>
        
        <div class="info-box">
            <h3>📋 Requirements to Bring</h3>
            <p>Please bring the following documents on your appointment date:</p>
            <ul class="requirements-list">
                @foreach($requirements as $req)
                    @if($req['checked'])
                        <li>{{ $req['name'] }}</li>
                    @endif
                @endforeach
            </ul>
        </div>
        
        @if($adminNotes)
        <div class="info-box" style="border-left-color: #f59e0b; background: #fffbeb;">
            <h3 style="color: #b45309;">📝 Note from CPDO</h3>
            <p>{{ $adminNotes }}</p>
        </div>
        @endif
        
        <div class="warning-box">
            <strong>⚠️ Important Reminders:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Pay at the <strong>Treasury Office</strong> on or before your scheduled date</li>
                <li>Bring your <strong>Official Receipt (OR)</strong> and all required documents (original and photocopy) to CPDO</li>
                <li>Please arrive <strong>15 minutes before</strong> your scheduled appointment</li>
                <li>Bring a <strong>valid government-issued ID</strong> for verification</li>
                <li>If you cannot attend, please inform us at least 24 hours in advance</li>
            </ul>
        </div>
        
        <center>
            <a href="{{ url('/my-applications') }}" class="button">View Application Details</a>
        </center>
        
        <p style="margin-top: 30px;">If you have any questions or need to reschedule, please contact us:</p>
        <p>
            📞 Phone: (064) 200-1234<br>
            📧 Email: cpdo@tacurongcity.gov.ph<br>
            🏢 Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
        </p>
        
        <p>Thank you for your patience throughout the application process!</p>
        
        <p>Best regards,<br>
        <strong>City Planning and Development Office</strong><br>
        Tacurong City Government</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} City Planning and Development Office, Tacurong City. All rights reserved.</p>
    </div>
</body>
</html>
