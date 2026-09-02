<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Submitted</title>
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
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
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
        .info-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        .info-row {
            margin: 10px 0;
        }
        .label {
            font-weight: bold;
            color: #2563eb;
        }
        .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            background: #fef3c7;
            color: #92400e;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">✓ Application Submitted Successfully</h1>
        <p style="margin: 10px 0 0 0;">Your land certification request is now being processed</p>
    </div>

    <div class="content">
        <p>Dear <strong><?php echo e($userName); ?></strong>,</p>

        <p>Thank you for submitting your land certification application. We have successfully received your request and it is now being processed by our team.</p>

        <div class="info-box">
            <h3 style="margin-top: 0; color: #2563eb;">Application Details</h3>
            <div class="info-row">
                <span class="label">Application ID:</span> #<?php echo e($application->id); ?>

            </div>
            <div class="info-row">
                <span class="label">Applicant Name:</span> <?php echo e($application->applicant_name); ?>

            </div>
            <div class="info-row">
                <span class="label">Submission Date:</span> <?php echo e($application->created_at->format('F d, Y h:i A')); ?>

            </div>
            <div class="info-row">
                <span class="label">Status:</span> <span class="status-badge">Pending Review</span>
            </div>
        </div>

        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1e40af;">📋 What happens next?</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Our team will review your application within 3-5 business days</li>
                <li>You will receive email updates on your application status</li>
                <li>You can track your application progress in your dashboard</li>
                <li>If additional information is needed, we will contact you</li>
            </ul>
        </div>

        <p><strong>Important:</strong> Please keep this email for your records. Your application ID is <strong>#<?php echo e($application->id); ?></strong></p>

        <p>If you have any questions or concerns, please don't hesitate to contact us.</p>

        <p>Best regards,<br>
        <strong>Land Certification Team</strong></p>
    </div>

    <div class="footer">
        <p style="margin: 5px 0;">This is an automated message. Please do not reply to this email.</p>
        <p style="margin: 5px 0;">© <?php echo e(date('Y')); ?> Land Certification System. All rights reserved.</p>
    </div>
</body>
</html>
<?php /**PATH C:\xampp\htdocs\cpdo_project\resources\views/emails/application-submitted.blade.php ENDPATH**/ ?>