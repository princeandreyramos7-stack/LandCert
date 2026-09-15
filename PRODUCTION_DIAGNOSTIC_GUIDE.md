# Production Issues Diagnostic Guide

## Current Issues

1. **500 Errors** - Upload receipt endpoint returning HTML error pages
2. **422 Errors** - Record payment validation failures  
3. **Status Stuck** - Applications at "payment_confirmed" not progressing to certificates

---

## Issue 1: 500 Server Errors (Upload Receipt)

### Symptoms
```
Failed to load resource: the server responded with a status of 500
Upload failed: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### Root Cause
The server is returning an HTML error page instead of JSON. This typically means:
- PHP fatal error (uncaught exception)
- Missing APP_KEY
- Storage permission issues
- Missing dependencies

### Diagnostic Steps

#### Step 1: Check Laravel Logs
```bash
tail -50 storage/logs/laravel.log
```

Look for:
- "No application encryption key has been specified"
- File permission errors
- Database connection errors
- Missing class/namespace errors

#### Step 2: Check APP_KEY
```bash
php artisan config:show | grep APP_KEY
# or
grep APP_KEY .env
```

If empty or missing:
```bash
php artisan key:generate
php artisan config:cache
```

#### Step 3: Check Storage Permissions
```bash
ls -la storage/
ls -la storage/app/
ls -la storage/logs/
```

Should show `drwxrwxr-x` or similar. Fix with:
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
# or if using different user
chown -R apache:apache storage bootstrap/cache
```

#### Step 4: Check PHP Error Logs
```bash
# Location varies by server
tail -50 /var/log/apache2/error.log
# or
tail -50 /var/log/nginx/error.log
# or
tail -50 /var/log/httpd/error_log
```

#### Step 5: Test Upload Manually
Create test file: `test-upload.php` in public directory:
```php
<?php
echo "Max upload: " . ini_get('upload_max_filesize') . "\n";
echo "Max post: " . ini_get('post_max_size') . "\n";
echo "Storage writable: " . (is_writable(__DIR__ . '/../storage/app') ? 'Yes' : 'No') . "\n";
```

Visit: `https://your-domain.com/test-upload.php`

---

## Issue 2: 422 Validation Errors (Record Payment)

### Symptoms
```
Request failed with status code 422
Error recording payment
```

### Root Cause
Validation failing in `RecordPaymentRequest`. Most likely causes:

1. **Duplicate receipt_number** - OR number already exists
2. **File upload issues** - File not being sent or wrong format
3. **Date format** - Payment date in wrong format or in future
4. **Missing required fields**

### Diagnostic Steps

#### Step 1: Check Network Response
In browser DevTools:
1. Open Network tab
2. Trigger the error
3. Find the failed request
4. Click on it → Response tab
5. Look for JSON response with validation errors:
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "receipt_number": ["The receipt number has already been taken."],
    "payment_date": ["The payment date field is required."]
  }
}
```

#### Step 2: Check for Duplicate OR Numbers
```bash
php artisan tinker
```
```php
// Check if OR number exists
\App\Models\Payment::where('receipt_number', 'YOUR_OR_NUMBER')->first();

// List recent payments
\App\Models\Payment::orderByDesc('id')->limit(10)->get(['id', 'receipt_number', 'amount', 'payment_date']);
```

#### Step 3: Check Request Payload
In browser DevTools → Network → Failed request → Payload tab
Verify all required fields are present:
- request_id
- receipt_number
- amount
- payment_date (format: YYYY-MM-DD)
- payment_method (must be 'cash')
- receipt_file (optional but if sent must be jpg/jpeg/png/pdf, max 2MB)

#### Step 4: Test Validation Manually
```bash
php artisan tinker
```
```php
$request = new \App\Http\Requests\RecordPaymentRequest();
$request->replace([
    'request_id' => 1,
    'receipt_number' => 'OR-12345',
    'amount' => 1000,
    'payment_date' => '2026-09-15',
    'payment_method' => 'cash',
]);
$request->setUserResolver(function() {
    return \App\Models\User::where('user_type', 'admin')->first();
});
$validator = \Validator::make($request->all(), $request->rules());
if ($validator->fails()) {
    print_r($validator->errors()->toArray());
} else {
    echo "Validation passed\n";
}
```

---

## Issue 3: Status Stuck at "payment_confirmed"

### Symptoms
Applications remain at "payment_confirmed" status after admin verifies payment, instead of progressing to "certificate_preparing"

### Root Cause
Certificate auto-creation is failing silently in `PaymentService::verifyPayment()` method.

### Diagnostic Steps

#### Step 1: Check Laravel Logs
```bash
grep "Certificate auto-creation failed" storage/logs/laravel.log
```

#### Step 2: Check Database State
```bash
php artisan tinker
```
```php
// Find stuck applications
$stuck = \App\Models\Request::where('status', 'payment_confirmed')->get();
foreach ($stuck as $req) {
    echo "ID: {$req->id} | App#: {$req->application_number} | Payment: " . 
         ($req->payment ? "Yes (verified: {$req->payment->payment_status})" : "No") . 
         " | Certificate: " . ($req->certificate ? "Yes" : "No") . "\n";
}
```

#### Step 3: Run Fix Command
We created a command to fix stuck applications:
```bash
php artisan fix:stuck-certificates
```

This will:
1. Find all applications at "payment_confirmed" with verified payments but no certificate
2. Attempt to create certificates for them
3. Report successes and failures

#### Step 4: Manual Certificate Creation Test
```bash
php artisan tinker
```
```php
$payment = \App\Models\Payment::where('payment_status', 'verified')->whereHas('request', function($q) {
    $q->where('status', 'payment_confirmed');
})->first();

if ($payment) {
    echo "Testing certificate creation for payment ID: {$payment->id}\n";
    
    $service = app(\App\Services\CertificateService::class);
    try {
        $certificate = $service->autoCreateFromPayment($payment);
        echo "Success! Certificate ID: {$certificate->id}\n";
    } catch (\Exception $e) {
        echo "Failed: " . $e->getMessage() . "\n";
        echo $e->getTraceAsString() . "\n";
    }
}
```

---

## Quick Checklist for Production Deployment

### Before Deployment
- [ ] Run `npm run build` locally
- [ ] Commit all changes
- [ ] Push to repository

### On Production Server
```bash
# 1. Pull latest code
git pull origin main  # or your branch

# 2. Install/update dependencies
composer install --no-dev --optimize-autoloader
npm ci && npm run build

# 3. Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# 4. Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Run migrations (if any)
php artisan migrate --force

# 6. Fix storage permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# 7. Restart services
sudo systemctl restart apache2
# or
sudo systemctl restart php-fpm
sudo systemctl restart nginx

# 8. Fix stuck certificates
php artisan fix:stuck-certificates
```

### Verify Deployment
- [ ] Check logs: `tail -f storage/logs/laravel.log`
- [ ] Test upload receipt (applicant side)
- [ ] Test record payment (admin side)
- [ ] Check status progression after payment verification

---

## Common Production Environment Issues

### 1. File Upload Limits
Check `php.ini`:
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 60
```

Restart web server after changes.

### 2. Storage Symbolic Link
If public storage link is broken:
```bash
php artisan storage:link
```

### 3. Database Connection
Test connection:
```bash
php artisan tinker
\DB::connection()->getPdo();
```

### 4. Queue Workers (if used)
Restart queue workers after deployment:
```bash
php artisan queue:restart
```

### 5. Supervisor (if used)
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart all
```

---

## Getting Detailed Error Information

### Enable Debug Mode (TEMPORARILY)
In `.env`:
```
APP_DEBUG=true
LOG_LEVEL=debug
```

Reproduce the error, check logs, then IMMEDIATELY set back to:
```
APP_DEBUG=false
LOG_LEVEL=error
```

**NEVER leave debug mode on in production!**

### Add Logging to Code
If you need more details, temporarily add logging:

In `PaymentController::store()` (line ~315):
```php
\Log::info('Upload receipt attempt', [
    'user_id' => auth()->id(),
    'request_id' => $request->input('request_id'),
    'has_file' => $request->hasFile('receipt'),
]);
```

In `PaymentController::recordPayment()` (line ~52):
```php
\Log::info('Record payment attempt', [
    'user_id' => auth()->id(),
    'request_data' => $request->all(),
]);
```

---

## Contact Information for Support

If issues persist after following this guide:

1. **Collect this information:**
   - Last 50 lines of `storage/logs/laravel.log`
   - PHP version: `php -v`
   - Laravel version: `php artisan --version`
   - Server type: Apache/Nginx version
   - Browser console errors (full text)
   - Network tab response for failed requests

2. **Check these locations:**
   - `/var/log/apache2/error.log` or `/var/log/nginx/error.log`
   - PHP error log location (run `php -i | grep error_log`)

3. **Provide step-by-step reproduction:**
   - Exact steps to trigger the error
   - User role (applicant/admin)
   - Application status when error occurs
