<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt Submitted</title>
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
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
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
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            background: #3b82f6;
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
            color: #3b82f6;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 Payment Receipt Submitted!</h1>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $request->applicant->applicant_name ?? 'Applicant' }}</strong>,</p>
        
        <div class="success-badge">
            ✓ RECEIPT SUBMITTED
        </div>
        
        <p>We have successfully received your payment receipt for Request <span class="highlight">#{{ $request->id }}</span>.</p>
        
        <div class="info-box">
            <p><strong>Payment Details:</strong></p>
            <p>Amount: <span class="highlight">₱{{ number_format($payment->amount, 2) }}</span></p>
            <p>Payment Method: <span class="highlight">{{ ucwords(str_replace('_', ' ', $payment->payment_method)) }}</span></p>
            <p>Payment Date: <span class="highlight">{{ \Carbon\Carbon::parse($payment->payment_date)->format('F d, Y') }}</span></p>
            @if($payment->receipt_number)
            <p>Receipt Number: <span class="highlight">{{ $payment->receipt_number }}</span></p>
            @endif
        </div>
        
        <h3>What Happens Next?</h3>
        <ol>
            <li><strong>Verification Process</strong> - Our admin team will review your payment receipt</li>
            <li><strong>Payment Confirmation</strong> - We'll verify the payment details</li>
            <li><strong>Certificate Preparation</strong> - Once verified, your certificate will be prepared with official signatures</li>
            <li><strong>Collection Notification</strong> - You'll be notified when your certificate is ready for pickup at our office</li>
        </ol>
        
        <div class="info-box">
            <p><strong>⏱️ Processing Time:</strong></p>
            <p>Payment verification typically takes 1-3 business days. You'll receive an email notification once your payment is verified.</p>
        </div>
        
        <center>
            <a href="{{ url('/receipt') }}" class="button">Check Status</a>
        </center>
        
        <div class="info-box">
            <p><strong>⚠️ Important Notes:</strong></p>
            <ul>
                <li>Keep this email for your records</li>
                <li>You can check your payment status anytime in your dashboard</li>
                <li>If there are any issues with your payment, we'll contact you</li>
                <li>Contact us if you have any questions</li>
            </ul>
        </div>
        
        <p>Thank you for your patience!</p>
        
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
