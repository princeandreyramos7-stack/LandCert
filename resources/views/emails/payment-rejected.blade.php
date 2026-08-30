<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Verification Update</title>
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
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
        .button {
            display: inline-block;
            background: #dc2626;
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
        <div class="denial-icon">❌</div>
        <h1>Payment Verification Update</h1>
    </div>
    
    <div class="content">
        <p>Dear <strong>{{ $applicantName }}</strong>,</p>
        
        <div class="status-badge">
            ❌ PAYMENT ISSUE
        </div>
        
        <p>We have reviewed your payment submission and unfortunately cannot verify it at this time.</p>
        
        <div class="info-box">
            <p><strong>Payment Details:</strong></p>
            <p>Request ID: <span class="highlight">#{{ $requestId }}</span></p>
            <p>Applicant: <span class="highlight">{{ $applicantName }}</span></p>
            <p>Amount: <span class="highlight">₱{{ number_format($payment->amount, 2) }}</span></p>
            <p>Payment Method: <span class="highlight">{{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</span></p>
            <p>Submitted: <span class="highlight">{{ $payment->created_at->format('F d, Y') }}</span></p>
            <p>Status: <span class="highlight">Denied</span></p>
        </div>
        
        <div class="warning-box">
            <p><strong>🚫 Reason for Denial:</strong></p>
            <p>{{ $rejectionReason }}</p>
        </div>
        
        <h3>💳 Next Steps</h3>
        <p>To proceed with your land certification, you'll need to resubmit your payment with the correct information.</p>
        
        <div class="info-box">
            <p><strong>What you need to do:</strong></p>
            <ol>
                <li>Review the denial reason above carefully</li>
                <li>Prepare a new payment receipt that addresses the issues</li>
                <li>Ensure all payment information is clear and accurate</li>
                <li>Resubmit your payment through the receipt page</li>
            </ol>
        </div>
        
        <center>
            <a href="{{ url('/receipt') }}" class="button">Resubmit Payment</a>
        </center>
        
        <div class="info-box">
            <p><strong>💡 Payment Tips:</strong></p>
            <ul>
                <li>Ensure receipt images are clear and readable</li>
                <li>Verify the payment amount matches the required fee</li>
                <li>Include all necessary payment reference numbers</li>
                <li>Use accepted payment methods only</li>
                <li>Contact us if you need clarification on payment requirements</li>
            </ul>
        </div>
        
        <div class="info-box">
            <p><strong>📞 Need Assistance?</strong></p>
            <p>If you have questions about the denial or need help with resubmitting your payment, please contact our office during business hours.</p>
        </div>
        
        <p>We appreciate your understanding and look forward to processing your corrected payment submission.</p>
        
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