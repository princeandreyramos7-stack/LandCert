# SMS Implementation Guide

**Date:** June 27, 2026  
**System:** CPDO Land Certification System  
**SMS Provider:** Semaphore API

---

## ✅ Implementation Complete

SMS notifications have been fully integrated into the CPDO system using the Semaphore SMS API.

---

## 📋 SMS Service Features

### Core Functionality
- ✅ Semaphore API integration
- ✅ Philippine phone number formatting (automatic +63 prefix)
- ✅ SMS enabled/disabled configuration
- ✅ Error logging and handling
- ✅ Fallback to email if SMS fails

### SMS Notification Types

1. **Application Submitted**
   - Sent when user submits application
   - Confirms receipt with request ID

2. **Application Approved**
   - Sent when admin approves application
   - Instructs user to proceed to payment

3. **Application Rejected**
   - Sent when admin rejects application
   - Includes rejection reason
   - Advises to contact office

4. **Payment Reminder**
   - Scheduled automatically (3 days default)
   - Reminds about payment deadline
   - Includes days remaining

5. **Payment Verified**
   - Sent when admin verifies payment
   - Confirms payment amount
   - Instructs to collect certificate

6. **Payment Rejected**
   - Sent when payment receipt is rejected
   - Includes rejection reason
   - Advises to resubmit

7. **Document Reminder**
   - Scheduled for pending documents
   - Reminds to submit requirements

8. **Certificate Ready**
   - Sent when certificate is generated
   - Provides certificate number
   - Instructs to bring valid ID

9. **Status Update**
   - Generic status change notification
   - Shows old and new status

10. **Custom Message**
    - Admin can send custom SMS
    - Auto-prefixes with "CPDO:"

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# SMS Configuration
SMS_ENABLED=true
SMS_PROVIDER=semaphore
SEMAPHORE_API_KEY=9a617b8a8f98414747b077c6c8b19201
SEMAPHORE_SENDER_NAME=CPDO
```

### Service Configuration (config/services.php)

```php
'sms' => [
    'enabled' => env('SMS_ENABLED', false),
    'provider' => env('SMS_PROVIDER', 'semaphore'),
    'api_key' => env('SEMAPHORE_API_KEY'),
    'sender_name' => env('SEMAPHORE_SENDER_NAME', 'CPDO'),
],
```

---

## 📱 SMS Service Usage

### Basic Usage

```php
use App\Services\SmsService;

$smsService = app(SmsService::class);

// Send application submitted SMS
$smsService->sendApplicationSubmitted(
    '09171234567',
    'Juan Dela Cruz',
    123
);

// Send application approved SMS
$smsService->sendApplicationApproved(
    '09171234567',
    'Juan Dela Cruz',
    123
);

// Send payment reminder
$smsService->sendPaymentReminder(
    '09171234567',
    'Juan Dela Cruz',
    123,
    3 // days remaining
);

// Send custom message
$smsService->sendCustomMessage(
    '09171234567',
    'Your custom message here'
);
```

### Check if SMS is Enabled

```php
$smsService = app(SmsService::class);

if ($smsService->isEnabled()) {
    // SMS is enabled
    $smsService->send('09171234567', 'Message');
}
```

---

## 🔄 Integration Points

### 1. Application Submission (RequestController.php)
```php
// After application created
if (auth()->user()->contact_number) {
    app(\App\Services\SmsService::class)->sendApplicationSubmitted(
        auth()->user()->contact_number,
        auth()->user()->name,
        $result['request']->id
    );
}
```

### 2. Application Approved/Rejected (AdminController.php)
```php
// After approval
if ($user->contact_number) {
    app(\App\Services\SmsService::class)->sendApplicationApproved(
        $user->contact_number,
        $user->name,
        $requestModel->id
    );
}

// After rejection
if ($user->contact_number) {
    app(\App\Services\SmsService::class)->sendApplicationRejected(
        $user->contact_number,
        $user->name,
        $requestModel->id,
        $rejectionReason
    );
}
```

### 3. Payment Verification (AdminController.php)
```php
// After payment verified and certificate generated
if ($user->contact_number) {
    app(\App\Services\SmsService::class)->sendPaymentVerified(
        $user->contact_number,
        $user->name,
        $requestModel->id,
        $payment->amount
    );
}
```

### 4. Payment Rejection (AdminController.php)
```php
// After payment rejected
if ($user->contact_number) {
    app(\App\Services\SmsService::class)->sendPaymentRejected(
        $user->contact_number,
        $user->name,
        $requestModel->id,
        $validated['rejection_reason']
    );
}
```

### 5. Scheduled Reminders (ReminderService.php)
```php
// Automatically sends SMS with email reminders
private function sendSmsReminder(Reminder $reminder): void
{
    $smsService = app(SmsService::class);
    // Sends appropriate SMS based on reminder type
}
```

---

## 📞 Phone Number Format

The SMS service automatically formats Philippine phone numbers:

**Input Formats Accepted:**
- `09171234567` → Converted to `639171234567`
- `9171234567` → Converted to `639171234567`
- `639171234567` → Used as-is
- `+639171234567` → Cleaned to `639171234567`

**All numbers are converted to:** `639XXXXXXXXX` format for Semaphore API

---

## 🔐 Security & Privacy

1. **Phone Number Storage**
   - Stored in `users.contact_number` field
   - Optional field (nullable)
   - Only sent if number exists

2. **SMS Content**
   - Does not include sensitive information
   - Uses request ID for reference
   - Professional and brief messages

3. **API Security**
   - API key stored in .env (not in code)
   - HTTPS requests to Semaphore
   - Error logging without exposing API key

---

## 📊 SMS Logging

All SMS attempts are logged:

```php
// Success
Log::info('SMS sent successfully', [
    'phone' => $phoneNumber,
    'response' => $data
]);

// Failure
Log::error('SMS sending failed', [
    'phone' => $phoneNumber,
    'error' => $e->getMessage()
]);

// Disabled
Log::info('SMS sending is disabled', [
    'phone' => $phoneNumber,
    'message' => $message
]);
```

---

## 🧪 Testing SMS

### Enable/Disable for Testing

**To Test SMS:**
```env
SMS_ENABLED=true
```

**To Test Without SMS:**
```env
SMS_ENABLED=false
```

### Test Scenarios

1. **Submit Application**
   - User submits application
   - Should receive SMS with request ID

2. **Approve Application**
   - Admin approves application
   - User receives approval SMS

3. **Verify Payment**
   - Admin verifies payment
   - User receives payment verified SMS
   - Certificate ready notification

4. **Scheduled Reminders**
   - Run: `php artisan reminders:send`
   - Users with pending reminders get SMS

---

## ⚙️ Semaphore API Details

**API Endpoint:** `https://api.semaphore.co/api/v4/messages`

**Request Format:**
```
POST https://api.semaphore.co/api/v4/messages
Content-Type: application/x-www-form-urlencoded

apikey=YOUR_API_KEY
number=639171234567
message=Your message here
sendername=CPDO
```

**Response Format:**
```json
[
  {
    "message_id": 1234567,
    "user_id": 12345,
    "user": "user@example.com",
    "account_id": 12345,
    "account": "Account Name",
    "recipient": "639171234567",
    "message": "Your message",
    "sender_name": "CPDO",
    "network": "GLOBE",
    "status": "Pending",
    "type": "Single",
    "source": "Api",
    "created_at": "2026-06-27 12:00:00",
    "updated_at": "2026-06-27 12:00:00"
  }
]
```

---

## 🚨 Troubleshooting

### SMS Not Sending

1. **Check if SMS is enabled**
   ```php
   config('services.sms.enabled') // should be true
   ```

2. **Check API key**
   ```php
   config('services.sms.api_key') // should not be empty
   ```

3. **Check user phone number**
   ```php
   $user->contact_number // should not be null
   ```

4. **Check logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```

### Common Issues

**Issue:** SMS not sent but no error
- **Solution:** Check if `SMS_ENABLED=false` in .env

**Issue:** Invalid phone number
- **Solution:** Ensure phone number is Philippine format (09XX or 9XX)

**Issue:** Semaphore API error 401
- **Solution:** Check API key is correct

**Issue:** SMS delayed
- **Solution:** This is normal, Semaphore processes in queue

---

## 💰 SMS Credits

**Semaphore Pricing:**
- Monitor credit balance in Semaphore dashboard
- Top up when credits are low
- Set up low-balance alerts

**Credit Usage:**
- 1 credit = 1 SMS (160 characters)
- Messages over 160 chars use multiple credits
- Current messages are all under 160 chars

---

## 📈 Monitoring & Analytics

### SMS Activity Tracking

Monitor SMS activity through:
1. Laravel logs (`storage/logs/laravel.log`)
2. Semaphore dashboard (semaphore.co)
3. Database audit logs (optional implementation)

### Metrics to Monitor

- SMS sent per day
- SMS failure rate
- Credit consumption
- User response rate

---

## 🔜 Future Enhancements

### Potential Improvements

1. **Two-Way SMS**
   - Receive SMS responses
   - Process user replies

2. **SMS Templates**
   - Store templates in database
   - Admin can edit messages

3. **Bulk SMS**
   - Send to multiple users
   - Broadcast announcements

4. **SMS Queue**
   - Queue large SMS batches
   - Rate limiting

5. **SMS Dashboard**
   - Admin view of SMS history
   - Credit balance display
   - Success/failure stats

---

## ✅ Implementation Checklist

- [x] Create SmsService.php
- [x] Configure services.php
- [x] Update .env with SMS settings
- [x] Integrate with RequestController (application submission)
- [x] Integrate with AdminController (approval/rejection)
- [x] Integrate with payment verification
- [x] Integrate with ReminderService
- [x] Phone number formatting
- [x] Error logging
- [x] Enable/disable configuration
- [x] Documentation complete

---

## 📞 Support

**Semaphore Support:**
- Website: https://semaphore.co
- Email: support@semaphore.co
- Documentation: https://semaphore.co/docs

**System Administrator:**
- For SMS configuration issues, contact system admin
- Check logs at `storage/logs/laravel.log`

---

**Implementation Date:** June 27, 2026  
**Status:** ✅ COMPLETE & ACTIVE  
**Last Updated:** June 27, 2026
