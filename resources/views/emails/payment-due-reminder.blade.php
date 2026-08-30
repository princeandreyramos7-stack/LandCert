@extends('emails.layouts.modern')

@section('content')
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">⏰ Payment Reminder</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your payment is due soon</p>
</div>

<div style="padding: 40px 30px;">
    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Dear <strong>{{ $applicantName }}</strong>,
    </p>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: #856404; font-size: 15px;">
            <strong>⚠️ Important Notice:</strong> Your application has been approved, and payment is now required to proceed with your request.
        </p>
    </div>

    <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 20px;">
        This is a friendly reminder that your payment for <strong>Request #{{ $request->id }}</strong> is due. 
        Please submit your payment receipt within <strong>{{ $daysRemaining }} days</strong> to avoid any delays in processing.
    </p>

    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0;">
        <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📋 Request Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">Request ID:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; font-size: 14px;">#{{ $request->id }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Locational Clearance:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; font-size: 14px;">{{ $request->project->project_type ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Project Location:</td>
                <td style="padding: 8px 0; color: #333; font-weight: 600; font-size: 14px;">{{ $request->location->city_municipality ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">Payment Due Date:</td>
                <td style="padding: 8px 0; color: #dc3545; font-weight: 600; font-size: 14px;">{{ $dueDate }}</td>
            </tr>
        </table>
    </div>

    <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; color: #1976D2; font-size: 16px;">💡 How to Submit Payment</h4>
        <ol style="margin: 10px 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
            <li>Log in to your account</li>
            <li>Navigate to the Payments section</li>
            <li>Upload your payment receipt</li>
            <li>Wait for admin verification</li>
        </ol>
    </div>

    <div style="text-align: center; margin: 35px 0;">
        <a href="{{ url('/receipt') }}" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            Submit Payment Now
        </a>
    </div>

    <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 25px 0;">
        <p style="margin: 0; color: #856404; font-size: 13px; text-align: center;">
            ⏱️ <strong>Time Sensitive:</strong> Please submit your payment within {{ $daysRemaining }} days to avoid processing delays.
        </p>
    </div>

    <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 30px;">
        If you have already submitted your payment, please disregard this reminder. Your payment is currently being processed.
    </p>

    <p style="font-size: 14px; color: #666; line-height: 1.6;">
        If you have any questions or need assistance, please don't hesitate to contact our support team.
    </p>

    <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e9ecef;">
        <p style="font-size: 14px; color: #333; margin-bottom: 5px;">Best regards,</p>
        <p style="font-size: 15px; color: #667eea; font-weight: 600; margin: 0;">CPDO Admin Team</p>
    </div>
</div>

<div style="background: #f8f9fa; padding: 25px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
    <p style="font-size: 12px; color: #999; margin: 0; text-align: center; line-height: 1.6;">
        This is an automated reminder. Please do not reply to this email.<br>
        For support, please contact us through the system or visit our office.
    </p>
</div>
@endsection
