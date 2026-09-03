# Hostinger Deployment - Troubleshooting Guide

## 🔍 Common Issues & Solutions

---

## 1. ❌ 500 Internal Server Error

### Symptoms:
- White page with "500 Internal Server Error"
- Or "Whoops, something went wrong"

### Causes & Solutions:

#### A. Check Error Logs
```bash
# View Laravel log
cat storage/logs/laravel.log

# Or via File Manager:
# Navigate to storage/logs/laravel.log and download
```

#### B. Permissions Issue
```bash
# Set correct permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .env
```

#### C. Missing .env File
```bash
# Verify .env exists in project root
ls -la | grep .env

# If missing, copy from .env.example
cp .env.example .env
```

#### D. Cache Issues
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### E. APP_KEY Not Set
```bash
# Generate application key
php artisan key:generate

# Or manually add to .env:
APP_KEY=base64:generated_key_here
```

---

## 2. 🗄️ Database Connection Errors

### Symptoms:
- "SQLSTATE[HY000] [1045] Access denied"
- "SQLSTATE[HY000] [2002] Connection refused"
- "Database connection failed"

### Solutions:

#### A. Verify Database Credentials
**Check .env file:**
```env
DB_CONNECTION=mysql
DB_HOST=localhost          # Should be localhost
DB_PORT=3306              # Default MySQL port
DB_DATABASE=u123456789_cpdo    # Your actual database name
DB_USERNAME=u123456789_user    # Your actual username
DB_PASSWORD=your_password      # Your actual password
```

#### B. Test Database Connection
**Via SSH:**
```bash
php artisan tinker
>>> DB::connection()->getPdo();
>>> exit
```

**Via phpMyAdmin:**
1. Login to Hostinger → Databases → phpMyAdmin
2. Check if database exists
3. Check if user has privileges

#### C. Create Database If Missing
1. Hostinger hPanel → Databases → MySQL Databases
2. Create new database
3. Create user with all privileges
4. Update .env with credentials

#### D. Clear Config Cache
```bash
php artisan config:clear
php artisan config:cache
```

---

## 3. 🎨 Assets Not Loading (CSS/JS/Images)

### Symptoms:
- Page loads but no styling
- JavaScript not working
- Images show as broken

### Solutions:

#### A. Check APP_URL
**In .env:**
```env
APP_URL=https://yourdomain.com
# NOT http://localhost or 127.0.0.1
```

#### B. Rebuild Assets
**Locally:**
```bash
npm run build
```
Then upload `public/build` folder to server

#### C. Clear Cache
```bash
php artisan config:clear
php artisan cache:clear
```

#### D. Check File Paths
Verify files exist:
```
public/build/manifest.json
public/build/assets/*.js
public/build/assets/*.css
```

#### E. Force HTTPS
**In public/.htaccess:**
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 4. 📁 "Mix Manifest Not Found" or "Vite Manifest Not Found"

### Symptoms:
- Error: "The Mix manifest does not exist"
- Error: "Vite manifest not found"

### Solutions:

#### A. Build Assets
```bash
# On local machine
npm run build

# Upload public/build folder to server
```

#### B. Verify manifest.json Exists
```
public/build/manifest.json    # Should exist
public/build/.vite/manifest.json  # Alternative location
```

#### C. Check vite.config.js
Ensure build is configured correctly:
```javascript
export default defineConfig({
    build: {
        manifest: true,
        outDir: 'public/build',
    },
});
```

#### D. Clear Cache
```bash
php artisan view:clear
php artisan config:clear
```

---

## 5. 🔗 Storage Link Not Working

### Symptoms:
- Uploaded files show 404
- `/storage/` URL not accessible
- Images/PDFs not displaying

### Solutions:

#### A. Create Storage Link
**Via SSH:**
```bash
php artisan storage:link
```

**Verify:**
```bash
ls -la public/storage
# Should show: storage -> ../storage/app/public
```

#### B. Manual Creation (if SSH unavailable)
**Via File Manager:**
1. Navigate to `public` folder
2. Create folder named `storage`
3. This is a workaround, not ideal but works

#### C. Check Permissions
```bash
chmod -R 755 storage/app/public
```

#### D. Verify Files Are in Correct Location
Files should be in:
```
storage/app/public/uploads/
storage/app/public/documents/
storage/app/public/signatures/
```

Not in:
```
public/uploads/  ❌
```

---

## 6. 📧 Email Not Sending

### Symptoms:
- No emails received
- Error: "Connection refused"
- Error: "Authentication failed"

### Solutions:

#### A. Verify Email Settings
**In .env:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="CPDO LC"
```

#### B. Create Email Account in Hostinger
1. Hostinger → Emails → Email Accounts
2. Create: noreply@yourdomain.com
3. Use this email in MAIL_USERNAME
4. Use its password in MAIL_PASSWORD

#### C. Test Email
```bash
php artisan test:email
```

#### D. Check Logs
```
storage/logs/laravel.log
```

#### E. Alternative: Use Gmail SMTP
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
```

---

## 7. 📱 SMS Not Sending

### Symptoms:
- No SMS received
- Error: "Invalid API key"
- SMS fails silently

### Solutions:

#### A. Verify SMS Settings
**In .env:**
```env
SMS_ENABLED=true
SMS_PROVIDER=semaphore
SEMAPHORE_API_KEY=your_actual_api_key
SEMAPHORE_SENDER_NAME=CPDOLC
```

#### B. Test Semaphore API Key
Visit: https://semaphore.co/
Login and verify API key is correct

#### C. Check Semaphore Balance
Ensure you have SMS credits

#### D. Test SMS
```bash
php artisan test:sms
```

#### E. Check Logs
```
storage/logs/laravel.log
```
Look for "[SMS]" entries

---

## 8. 🔐 CSRF Token Mismatch

### Symptoms:
- "CSRF token mismatch" error
- "419 | Page Expired"
- Forms won't submit

### Solutions:

#### A. Check APP_URL
Must match your domain exactly:
```env
APP_URL=https://yourdomain.com
```

#### B. Clear Browser Cache
- Clear cookies for your domain
- Try incognito/private mode

#### C. Check Session Configuration
**In .env:**
```env
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
```

#### D. Clear Session Files
```bash
rm -rf storage/framework/sessions/*
```

#### E. Clear Config Cache
```bash
php artisan config:clear
php artisan cache:clear
```

---

## 9. 🚫 Permission Denied Errors

### Symptoms:
- "Permission denied" when uploading files
- Cannot write to storage
- Logs not being created

### Solutions:

#### A. Set Correct Permissions
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

#### B. Set Correct Ownership (if you have sudo)
```bash
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

#### C. Via File Manager
1. Right-click on `storage` folder
2. Permissions → 755
3. Check "Apply to subdirectories"

---

## 10. 🔄 Changes Not Reflecting

### Symptoms:
- Code changes not showing
- Old content still displaying
- Config changes not taking effect

### Solutions:

#### A. Clear All Caches
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### B. Rebuild Cache
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### C. Clear Browser Cache
- Hard refresh: Ctrl + Shift + R (Chrome)
- Clear browser cache
- Try incognito mode

#### D. Check .env Changes
```bash
# After editing .env, always clear config
php artisan config:clear
php artisan config:cache
```

---

## 11. 📦 Composer/NPM Errors

### Symptoms:
- "Class not found"
- "Module not found"
- Missing dependencies

### Solutions:

#### A. Reinstall Composer Dependencies
```bash
composer install --optimize-autoloader --no-dev
composer dump-autoload
```

#### B. Reinstall NPM Dependencies
```bash
npm install
npm run build
```

#### C. Check PHP Version
```bash
php -v
# Should be PHP 8.1 or higher
```

#### D. Upload vendor/ Folder
If Composer not available on server, upload `vendor/` folder from local

---

## 12. 🌐 Domain/SSL Issues

### Symptoms:
- "Not Secure" warning
- SSL certificate errors
- Domain not resolving

### Solutions:

#### A. Install SSL Certificate
1. Hostinger → SSL → Manage SSL
2. Select domain
3. Install Free SSL (Let's Encrypt)
4. Wait 5-15 minutes

#### B. Force HTTPS
**In .htaccess:**
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

#### C. Update .env
```env
APP_URL=https://yourdomain.com  # HTTPS not HTTP
```

#### D. Check DNS Settings
1. Hostinger → Domains → DNS Zone
2. Verify A record points to correct IP

---

## 13. ⏰ Scheduled Tasks Not Running

### Symptoms:
- Payment reminders not sent
- SMS reminders not working
- No scheduled emails

### Solutions:

#### A. Set Up Cron Job
1. Hostinger → Advanced → Cron Jobs
2. Add:
```bash
* * * * * cd /home/username/public_html/cpdo_project && php artisan schedule:run >> /dev/null 2>&1
```

#### B. Verify Cron Is Active
Check cron logs in Hostinger

#### C. Test Schedule Manually
```bash
php artisan schedule:run
```

#### D. Check Scheduled Commands
```bash
php artisan schedule:list
```

---

## 14. 🗃️ Migration Errors

### Symptoms:
- "Table already exists"
- "Column not found"
- "Syntax error in migration"

### Solutions:

#### A. Check Migration Status
```bash
php artisan migrate:status
```

#### B. Fresh Migration (CAUTION: Deletes data!)
```bash
php artisan migrate:fresh --seed
```

#### C. Run Specific Migration
```bash
php artisan migrate --path=/database/migrations/2026_09_02_130000_specific_migration.php
```

#### D. Rollback and Re-run
```bash
php artisan migrate:rollback
php artisan migrate
```

---

## 🛠️ Diagnostic Commands

### Check System Status
```bash
# Check PHP version
php -v

# Check Laravel version
php artisan --version

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();

# List all routes
php artisan route:list

# Check config values
php artisan tinker
>>> config('app.url');
>>> config('database.default');

# View logs
tail -100 storage/logs/laravel.log

# Check disk space
df -h

# Check file permissions
ls -la storage
ls -la bootstrap/cache
```

---

## 📞 Getting Help

### 1. Check Logs First
```
storage/logs/laravel.log
```

### 2. Enable Debug Mode (Temporarily!)
```env
APP_DEBUG=true
```
**Don't forget to disable after troubleshooting!**

### 3. Hostinger Support
- **Live Chat:** 24/7 available
- **Email:** support@hostinger.com
- **Knowledge Base:** https://support.hostinger.com

### 4. Laravel Community
- **Documentation:** https://laravel.com/docs
- **Forum:** https://laracasts.com/discuss
- **Discord:** Laravel Discord Server

---

## 🔍 Quick Diagnostics Checklist

When something doesn't work:

- [ ] Check `storage/logs/laravel.log`
- [ ] Verify `.env` file exists and has correct values
- [ ] Confirm database credentials are correct
- [ ] Ensure `APP_URL` matches your domain
- [ ] Check file permissions (755 for storage, bootstrap/cache)
- [ ] Clear all caches: `php artisan cache:clear`
- [ ] Rebuild caches: `php artisan config:cache`
- [ ] Verify SSL certificate is active
- [ ] Check if `public/build` folder exists
- [ ] Test database connection via phpMyAdmin
- [ ] Clear browser cache and try incognito mode

---

**Remember:** 90% of deployment issues are:
1. Incorrect `.env` configuration
2. File permission problems
3. Cache not cleared after changes

Always start with these three!

---

**Last Updated:** September 2, 2026  
**For:** CPDO LC System v1.0
