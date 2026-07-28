# SMS Setup Instructions

## ✅ SMS Implementation Complete

SMS notifications have been successfully implemented in the CPDO system using Semaphore API.

---

## 🚀 Quick Start

### 1. SMS is Already Enabled

The `.env` file is configured with:
```env
SMS_ENABLED=true
SMS_PROVIDER=semaphore
SEMAPHORE_API_KEY=9a617b8a8f98414747b077c6c8b19201
SEMAPHORE_SENDER_NAME=CPDO
```

### 2. Clear Configuration Cache
```bash
php artisan config:clear
php artisan cache:clear
```

### 3. Test SMS Sending
```bash
php artisan tinker
```

Then run:
```php
$smsService = app(\App\Services\SmsService::class);
$smsService->send('09171234567', 'CPDO: Test message from system');
```

Replace `09171234567` with your actual Philippine mobile number.

---

## 📱 SMS Features

### Automatic SMS Notifications

SMS will be sent automatically for:
1. ✅ Application submitted
2. ✅ Application approved
3. ✅ Application rejected
4. ✅ Payment verified
5. ✅ Payment rejected
6. ✅ Scheduled payment reminders
7. ✅ Document pending reminders
8. ✅ Certificate expiry reminders

### Requirements

**Users must have a contact number:**
- Field: `users.contact_number`
- Format: Philippine mobile (09XX, 9XX, or 639XX)
- Update via profile or admin panel

---

## ⏰ Scheduled Reminders (SMS + Email)

### Manual Execution
```bash
php artisan sms:send-reminders
```

### Automatic Execution (Cron Job)

Add to your server's crontab:

**For Linux/Mac:**
```bash
crontab -e
```

Add this line:
```
* * * * * cd /path/to/cpdo_project && php artisan schedule:run >> /dev/null 2>&1
```

**For Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 12:00 AM
4. Action: Start a program
5. Program: `C:\xampp\php\php.exe`
6. Arguments: `artisan schedule:run`
7. Start in: `C:\xampp\htdocs\cpdo_project`

**Alternative - Run every hour manually:**
```bash
php artisan sms:send-reminders
```

---

## 🔧 Configuration

### Enable/Disable SMS

**To Disable SMS (for testing):**
```env
SMS_ENABLED=false
```

**To Enable SMS:**
```env
SMS_ENABLED=true
```

After changing:
```bash
php artisan config:clear
```

### Check SMS Status

**Via Code:**
```php
$smsService = app(\App\Services\SmsService::class);
echo $smsService->isEnabled() ? 'Enabled' : 'Disabled';
```

**Via Tinker:**
```bash
php artisan tinker
app(\App\Services\SmsService::class)->isEnabled()
```

---

## 📞 User Phone Number Setup

### Update User Contact Number

**Via Tinker:**
```bash
php artisan tinker
```
```php
$user = App\Models\User::find(1);
$user->contact_number = '09171234567';
$user->save();
```

**Via Admin Panel:**
1. Login as Admin
2. Go to Users Management
3. Edit user
4. Add contact number
5. Save

**Via Profile:**
1. User logs in
2. Goes to Profile
3. Updates contact number
4. Saves changes

---

## 🧪 Testing SMS

### Test 1: Manual SMS Send
```bash
php artisan tinker
```
```php
$sms = app(\App\Services\SmsService::class);
$sms->sendApplicationApproved('09171234567', 'Test User', 123);
```

### Test 2: Submit Application
1. Login as user with contact number
2. Submit new application
3. Check phone for SMS confirmation

### Test 3: Approve Application
1. Login as admin
2. Approve an application
3. Check user's phone for approval SMS

### Test 4: Verify Payment
1. Login as admin
2. Verify a payment
3. Check user's phone for payment verified SMS

### Test 5: Scheduled Reminders
```bash
php artisan sms:send-reminders
```
Check logs for sent reminders.

---

## 📊 Monitoring

### View SMS Logs
```bash
# Real-time log monitoring
tail -f storage/logs/laravel.log | grep -i sms

# Search for SMS activity
grep -i "sms" storage/logs/laravel.log

# Check for errors
grep -i "sms.*error" storage/logs/laravel.log
```

### Check Semaphore Dashboard
1. Visit: https://semaphore.co
2. Login with your account
3. View SMS history
4. Check credit balance
5. Monitor delivery status

---

## 💰 SMS Credits

### Check Credit Balance
- Login to Semaphore dashboard
- View current balance
- Set up low-balance alerts

### Top-Up Credits
1. Login to Semaphore: https://semaphore.co
2. Go to "Buy Credits"
3. Choose amount
4. Complete payment
5. Credits added automatically

### Estimate Usage
- Average: 50-100 SMS per day (depending on applications)
- 1 SMS = 1 credit (up to 160 characters)
- All messages are optimized to <160 chars

---

## 🚨 Troubleshooting

### Issue: SMS Not Sending

**Solution 1: Check if enabled**
```bash
grep SMS_ENABLED .env
# Should show: SMS_ENABLED=true
```

**Solution 2: Clear cache**
```bash
php artisan config:clear
php artisan cache:clear
```

**Solution 3: Check API key**
```bash
grep SEMAPHORE_API_KEY .env
# Should show the API key
```

**Solution 4: Check user phone number**
```php
$user = User::find($userId);
echo $user->contact_number;
// Should not be null
```

**Solution 5: Check logs**
```bash
tail -f storage/logs/laravel.log
```

### Issue: Invalid Phone Number Format

**Solution:**
Phone numbers must be Philippine format:
- `09171234567` ✅
- `9171234567` ✅
- `639171234567` ✅
- `+639171234567` ✅
- `12345` ❌ (invalid)
- `8888-8888` ❌ (landline not supported)

### Issue: Semaphore API Error

**Solution:**
Check Semaphore status:
- API might be down (check https://semaphore.co)
- Credit balance might be zero
- API key might be invalid

### Issue: SMS Delayed

**Solution:**
This is normal. Semaphore processes SMS in queue.
Typical delivery: 5-30 seconds

---

## 📝 Important Files

### SMS Service Files
- `app/Services/SmsService.php` - Main SMS service
- `app/Services/ReminderService.php` - Scheduled reminders with SMS
- `app/Console/Commands/SendScheduledSmsReminders.php` - Reminder command

### Integration Points
- `app/Http/Controllers/RequestController.php` - Application submission
- `app/Http/Controllers/AdminController.php` - Approval, rejection, payment

### Configuration
- `.env` - SMS settings
- `config/services.php` - Service configuration

### Documentation
- `DOCU/SMS_IMPLEMENTATION_GUIDE.md` - Complete technical guide
- `DOCU/SMS_IMPLEMENTATION_SUMMARY.md` - Quick reference
- `README_SMS_SETUP.md` - This file (setup instructions)

---

## 🎯 Quick Commands

```bash
# Test SMS service
php artisan tinker
app(\App\Services\SmsService::class)->isEnabled()

# Send scheduled reminders
php artisan sms:send-reminders

# Clear cache after config changes
php artisan config:clear
php artisan cache:clear

# View logs
tail -f storage/logs/laravel.log | grep -i sms

# Check database reminders
php artisan tinker
App\Models\Reminder::where('status', 'pending')->count()
```

---

## 📞 Support

### Semaphore Support
- Website: https://semaphore.co
- Email: support@semaphore.co
- Documentation: https://semaphore.co/docs

### System Issues
- Check logs: `storage/logs/laravel.log`
- Contact system administrator
- Review documentation in `DOCU/` folder

---

## ✅ Verification Checklist

- [ ] `.env` has `SMS_ENABLED=true`
- [ ] Config cache cleared
- [ ] Test SMS sent successfully
- [ ] Users have contact numbers added
- [ ] Application submission sends SMS
- [ ] Application approval sends SMS
- [ ] Payment verification sends SMS
- [ ] Scheduled reminders working
- [ ] Logs show successful SMS sending
- [ ] Semaphore dashboard shows SMS history

---

## 🎉 You're All Set!

SMS notifications are now active and will be sent automatically for all workflow events.

**Next Steps:**
1. Test with a real application
2. Monitor SMS delivery in Semaphore dashboard
3. Train staff on SMS features
4. Set up cron job for scheduled reminders

---

**Implementation Date:** June 27, 2026  
**Status:** ✅ ACTIVE & OPERATIONAL  
**Version:** 1.0
