<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to LandCert</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-message {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .info-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-box h3 {
            color: #1e40af;
            margin-top: 0;
            font-size: 18px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        .button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
        }
        .steps {
            background-color: #f0f9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin: 15px 0;
        }
        .step-number {
            background-color: #3b82f6;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .footer {
            background-color: #1f2937;
            color: #d1d5db;
            padding: 30px 20px;
            text-align: center;
        }
        .footer h4 {
            color: #ffffff;
            margin-top: 0;
        }
        .contact-info {
            margin: 15px 0;
        }
        .contact-info a {
            color: #60a5fa;
            text-decoration: none;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🏛️ LandCert</h1>
            <p>City Disaster Risk Reduction and Management Office</p>
            <p>City of Ilagan, Isabela</p>
        </div>

        <!-- Content -->
        <div class="content">
            <h2 style="color: #1e40af; margin-top: 0;">Welcome to LandCert, <?php echo e($userName); ?>!</h2>
            
            <p>Thank you for registering with the LandCert system. We're excited to help you with your land certification needs.</p>

            <div class="welcome-message">
                <h3 style="margin-top: 0; color: #1e40af;">✅ Registration Successful</h3>
                <p><strong>Your email address:</strong> <?php echo e($userEmail); ?></p>
                <p><strong>Registration date:</strong> <?php echo e($registrationDate); ?></p>
                <p>Your account has been successfully created and is now active in our system.</p>
            </div>

            <div class="info-box">
                <h3>🚀 What's Next?</h3>
                <p>You can now access your dashboard to submit land certification requests and track their progress.</p>
                
                <a href="<?php echo e($dashboardUrl); ?>" class="button">Access Your Dashboard</a>
            </div>

            <div class="steps">
                <h3 style="color: #1e40af; margin-top: 0;">📋 How to Use LandCert</h3>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Submit Your Application</strong><br>
                        Complete the land certification request form with your project details.
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Application Review</strong><br>
                        Our team will review your application (typically 5-10 business days).
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">3</div>
                    <div>
                        <strong>Payment Processing</strong><br>
                        Once approved, you'll receive payment instructions via email.
                    </div>
                </div>
                
                <div class="step">
                    <div class="step-number">4</div>
                    <div>
                        <strong>Certificate Issuance</strong><br>
                        After payment verification, your certificate will be generated and available for download.
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <div class="info-box">
                <h3>📞 Need Help?</h3>
                <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li><strong>Email:</strong> <a href="mailto:<?php echo e($supportEmail); ?>"><?php echo e($supportEmail); ?></a></li>
                    <li><strong>Office:</strong> CDRRMO Building, City of Ilagan, Isabela</li>
                    <li><strong>Phone:</strong> (078) 624-xxxx</li>
                </ul>
            </div>

            <p style="margin-top: 30px;">
                <strong>Important:</strong> Please keep this email for your records. You can always access your dashboard using the link above or by visiting our website.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <h4>City Disaster Risk Reduction and Management Office</h4>
            <div class="contact-info">
                <p>CDRRMO Building, City of Ilagan, Isabela</p>
                <p>Email: <a href="mailto:<?php echo e($supportEmail); ?>"><?php echo e($supportEmail); ?></a></p>
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.8;">
                © <?php echo e(date('Y')); ?> City of Ilagan CDRRMO. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html><?php /**PATH C:\xampp\htdocs\cpdo_project\resources\views/emails/user-registration-welcome.blade.php ENDPATH**/ ?>