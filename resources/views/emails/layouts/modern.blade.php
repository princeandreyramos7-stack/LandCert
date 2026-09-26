<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'CPDO Notification' }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <div style="width: 80px; height: 80px; margin: 0 auto 20px; background-color: #ffffff; border-radius: 50%; display: inline-block; line-height: 80px; text-align: center;">
                                            <span style="font-size: 36px; font-weight: bold; color: #1e40af; vertical-align: middle;">C</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">City Planning and Development Office</h1>
                            <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">City of Ilagan, Isabela</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            @yield('content')
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; font-size: 14px; color: #374151; font-weight: 600;">City Planning and Development Office</p>
                            <p style="margin: 0 0 15px; font-size: 13px; color: #6b7280;">City Government of Ilagan, Isabela, Philippines</p>
                            <p style="margin: 0 0 5px; font-size: 12px; color: #9ca3af;">📧 cpdo@ilagan.gov.ph | 📞 (078) 123-4567</p>
                            <p style="margin: 0 0 20px; font-size: 12px; color: #9ca3af;">🌐 www.ilagan.gov.ph</p>
                            <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
                                <p style="margin: 0; font-size: 11px; color: #9ca3af;">This is an automated message. Please do not reply to this email.</p>
                                <p style="margin: 5px 0 0; font-size: 11px; color: #9ca3af;">© {{ date('Y') }} CPDO City of Ilagan. All rights reserved.</p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
