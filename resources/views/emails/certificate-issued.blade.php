<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Issued</title>
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
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            background: #10b981;
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
            color: #10b981;
            font-weight: bold;
        }
        .certificate-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="certificate-icon">✅</div>
        <h1>Payment Successfully Verified!</h1>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $request->applicant->applicant_name ?? 'Applicant' }}</strong>,</p>
        
        <div class="success-badge">
            ✓ CERTIFICATE BEING PREPARED
        </div>
        
        <p>Excellent news! Your payment has been successfully verified and your land certification application has been <strong>approved</strong>. Your official certificate is now being prepared for physical collection.</p>
        
        <div class="info-box">
            <p><strong>Certificate Details:</strong></p>
            <p>Certificate Number: <span class="highlight">{{ $certificate->certificate_number }}</span></p>
            <p>Issued Date: <span class="highlight">{{ $certificate->issued_at->format('F d, Y') }}</span></p>
            @if($certificate->valid_until)
            <p>Valid Until: <span class="highlight">{{ \Carbon\Carbon::parse($certificate->valid_until)->format('F d, Y') }}</span></p>
            @endif
            <p>Status: <span class="highlight">{{ ucwords(str_replace('_', ' ', $certificate->status)) }}</span></p>
        </div>
        
        <h3>📋 Next Steps</h3>
        <p>Your certificate is currently being prepared for physical collection. Staff will obtain the necessary official signatures before it's ready for pickup.</p>
        
        <div class="info-box">
            <p><strong>How to Collect Your Certificate:</strong></p>
            <ol>
                <li><strong>Wait for Notification:</strong> You'll receive an email/SMS when your certificate is ready for pickup</li>
                <li><strong>Visit the Office:</strong> Come to the City Planning and Development Office during business hours</li>
                <li><strong>Bring Valid ID:</strong> Present a valid government-issued ID for verification</li>
                <li><strong>Sign for Release:</strong> Staff will record the release and have you sign for the certificate</li>
            </ol>
        </div>
        
        <center>
            <a href="{{ url('/dashboard') }}" class="button">View Dashboard</a>
        </center>
        
        <div class="info-box">
            <p><strong>🎉 Application Process Status:</strong></p>
            <ul>
                <li>✅ Application submitted and reviewed</li>
                <li>✅ Payment received and verified</li>
                <li>🔄 Certificate being prepared (pending signatures)</li>
                <li>⏳ Ready for physical collection (will be notified)</li>
            </ul>
        </div>
        
        <div class="info-box">
            <p><strong>⚠️ Important Notes:</strong></p>
            <ul>
                <li>This is a PHYSICAL certificate that requires official signatures</li>
                <li>You'll receive notification when it's ready for pickup</li>
                <li>Bring a valid ID when collecting your certificate</li>
                <li>Contact us if you have any questions</li>
            </ul>
        </div>
        
        <p>Thank you for using our services!</p>
        
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
