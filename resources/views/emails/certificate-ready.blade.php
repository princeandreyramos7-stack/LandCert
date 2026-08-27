<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Ready for Pickup</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #2c5282 0%, #2b6cb0 100%);
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .email-header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .email-body {
            padding: 30px 25px;
        }
        .greeting {
            font-size: 18px;
            color: #2c5282;
            margin-bottom: 20px;
        }
        .message {
            font-size: 15px;
            line-height: 1.8;
            margin-bottom: 25px;
        }
        .info-box {
            background-color: #f7fafc;
            border-left: 4px solid #2c5282;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .info-row {
            display: flex;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .info-label {
            font-weight: 600;
            color: #2d3748;
            width: 180px;
            flex-shrink: 0;
        }
        .info-value {
            color: #4a5568;
            flex-grow: 1;
        }
        .requirements-box {
            background-color: #fffaf0;
            border: 1px solid #fbd38d;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        .requirements-box h3 {
            color: #c05621;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
            display: flex;
            align-items: center;
        }
        .requirements-box ul {
            margin: 10px 0;
            padding-left: 25px;
            color: #744210;
        }
        .requirements-box li {
            margin-bottom: 8px;
        }
        .pickup-details {
            background-color: #e6fffa;
            border: 1px solid #81e6d9;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        .pickup-details h3 {
            color: #234e52;
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .pickup-details p {
            margin: 8px 0;
            color: #2c7a7b;
        }
        .cta-button {
            display: inline-block;
            background-color: #2c5282;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            transition: background-color 0.3s;
        }
        .cta-button:hover {
            background-color: #2b6cb0;
        }
        .footer {
            background-color: #f7fafc;
            padding: 25px;
            text-align: center;
            font-size: 13px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #2c5282;
            text-decoration: none;
        }
        .icon {
            display: inline-block;
            margin-right: 8px;
        }
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
            }
            .email-body {
                padding: 20px 15px;
            }
            .info-row {
                flex-direction: column;
            }
            .info-label {
                width: 100%;
                margin-bottom: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <h1>🎉 Certificate Ready for Pickup</h1>
            <p>City Planning and Development Office - Ilagan City</p>
        </div>

        <!-- Body -->
        <div class="email-body">
            <div class="greeting">
                Dear {{ $applicantName }},
            </div>

            <div class="message">
                <p>Great news! Your <strong>{{ $projectType }}</strong> certificate has been processed, signed by authorized officials, and is now <strong>ready for pickup</strong> at our office.</p>
                <p>Please visit the CPDO office during business hours to collect your certificate.</p>
            </div>

            <!-- Certificate Details -->
            <div class="info-box">
                <div class="info-row">
                    <div class="info-label">Certificate Number:</div>
                    <div class="info-value"><strong>{{ $certificateNumber }}</strong></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Application ID:</div>
                    <div class="info-value">#{{ $request->id }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Project Type:</div>
                    <div class="info-value">{{ $projectType }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Application Number:</div>
                    <div class="info-value">{{ $request->application_number ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Ready Since:</div>
                    <div class="info-value">{{ $certificate->ready_at ? $certificate->ready_at->format('F d, Y h:i A') : now()->format('F d, Y h:i A') }}</div>
                </div>
            </div>

            <!-- Requirements for Pickup -->
            <div class="requirements-box">
                <h3><span class="icon">⚠️</span> Requirements for Pickup</h3>
                <p>Please bring the following when claiming your certificate:</p>
                <ul>
                    <li><strong>Valid Government-Issued ID</strong> (Original and Photocopy)</li>
                    <li><strong>Official Receipt (OR)</strong> of payment</li>
                    <li><strong>Authorization Letter</strong> (if claiming on behalf of someone else)</li>
                    <li><strong>Valid ID of the Authorized Representative</strong> (if applicable)</li>
                </ul>
            </div>

            <!-- Pickup Details -->
            <div class="pickup-details">
                <h3><span class="icon">📍</span> Pickup Location & Office Hours</h3>
                <p><strong>Office:</strong> City Planning and Development Office (CPDO)</p>
                <p><strong>Address:</strong> City Hall, Ilagan City, Isabela</p>
                <p><strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM</p>
                <p><strong>Contact:</strong> (078) 123-4567</p>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ config('app.url') }}/my-applications" class="cta-button">
                    View Application Details
                </a>
            </div>

            <div class="message">
                <p><strong>Important Notes:</strong></p>
                <ul style="color: #4a5568; line-height: 1.8;">
                    <li>Please claim your certificate within 30 days from this notice.</li>
                    <li>Unclaimed certificates will be returned to file after the claiming period.</li>
                    <li>For inquiries, please contact our office during business hours.</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>City Planning and Development Office</strong></p>
            <p>City Hall, Ilagan City, Isabela, Philippines</p>
            <p>Email: <a href="mailto:cpdo@ilagancity.gov.ph">cpdo@ilagancity.gov.ph</a> | Phone: (078) 123-4567</p>
            <p style="margin-top: 15px; font-size: 12px; color: #a0aec0;">
                This is an automated notification. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
