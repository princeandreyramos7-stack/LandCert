<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmed</title>
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
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Payment Confirmed!</h1>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $request->applicant->applicant_name ?? 'Applicant' }}</strong>,</p>
        
        <div class="success-badge">
            ✓ PAYMENT VERIFIED
        </div>
        
        <p>Great news! Your payment for Request <span class="highlight">#{{ $request->id }}</span> has been successfully verified and confirmed.</p>
        
        <div class="info-box">
            <p><strong>Confirmed Payment Details:</strong></p>
            <p>Official Receipt Number: <span class="highlight">{{ $payment->receipt_number }}</span></p>
            <p>Amount Paid: <span class="highlight">₱{{ number_format($payment->amount, 2) }}</span></p>
            <p>Payment Method: <span class="highlight">{{ ucwords(str_replace('_', ' ', $payment->payment_method)) }}</span></p>
            <p>Payment Date: <span class="highlight">{{ \Carbon\Carbon::parse($payment->payment_date)->format('F d, Y') }}</span></p>
            <p>Verified: <span class="highlight">{{ \Carbon\Carbon::parse($payment->verified_at)->format('F d, Y h:i A') }}</span></p>
        </div>
        
        <h3>What Happens Next?</h3>
        <ol>
            <li><strong>Certificate Preparation</strong> - Our team will now prepare your land use certificate with official signatures and seals</li>
            <li><strong>Quality Review</strong> - The certificate will undergo final quality checks</li>
            <li><strong>Ready for Pickup</strong> - You'll receive a notification when your certificate is ready for collection at our office</li>
        </ol>
        
        <div class="info-box">
            <p><strong>⏱️ Processing Time:</strong></p>
            <p>Your certificate will be ready for pickup within 3-5 business days. We'll notify you via email and SMS once it's available.</p>
        </div>
        
        <center>
            <a href="{{ url('/my-applications') }}" class="button">View Application Status</a>
        </center>
        
        <div class="info-box">
            <p><strong>📋 Important Information:</strong></p>
            <ul>
                <li>Keep your Official Receipt (OR) for claiming your certificate</li>
                <li>Bring a valid ID when collecting your certificate</li>
                <li>Office hours: Monday-Friday, 8:00 AM - 5:00 PM</li>
                <li>You can track your certificate preparation in your dashboard</li>
            </ul>
        </div>
        
        <p>Thank you for using our services!</p>
        
        <p>Best regards,<br>
        <strong>City Planning and Development Office</strong><br>
        Land Certification Department</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
        <p>For inquiries, please visit our office or call us during office hours.</p>
        <p>&copy; {{ date('Y') }} LandCert. All rights reserved.</p>
    </div>
</body>
</html>
