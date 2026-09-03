# CPDO LC - Hostinger Deployment Guide

## 📋 Pre-Deployment Checklist

### Local Preparation
- [x] All features tested locally
- [x] Database cleaned and optimized
- [x] SMS templates updated (CPDO LC branding)
- [x] Welcome page updated (Login only, no Sign Up)
- [x] All migrations executed
- [x] Frontend assets built

### Hostinger Requirements
- [ ] Hostinger hosting account active
- [ ] Domain name configured
- [ ] SSL certificate available
- [ ] MySQL database access
- [ ] SSH access (if available)
- [ ] PHP 8.1+ supported

---

## 🗄️ STEP 1: Prepare Database on Hostinger

### 1.1 Create MySQL Database

1. **Login to Hostinger Control Panel (hPanel)**
2. **Navigate to:** Databases → MySQL Databases
3. **Create New Database:**
   - Database Name: `u123456789_cpdo` (Hostinger adds prefix)
   - Click "Create"
   - **Note down the database name!**

### 1.2 Create Database User

1. **In MySQL Databases page:**
   - Username: `u123456789_cpdo_user`
   - Password: Generate strong password (min 12 chars)
   - Click "Create User"
   - **Copy credentials to safe location!**

### 1.3 Assign User to Database

1. **Add User to Database:**
   - Select database: `u123456789_cpdo`
   - Select user: `u123456789_cpdo_user`
   - Grant: **ALL PRIVILEGES**
   - Click "Add"

### 1.4 Note Down Connection Details

```
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u123456789_cpdo
DB_USERNAME=u123456789_cpdo_user
DB_PASSWORD=your_generated_password
```

---

## 📦 STEP 2: Prepare Files for Upload

### 2.1 Build Production Assets

```bash
cd C:\xampp\htdocs\cpdo_project

# Install dependencies (if not done)
npm install

# Build for production
npm run build
```

**Verify:** Check that `public/build` folder exists with compiled assets.

### 2.2 Optimize Composer

```bash
# Install production dependencies only
composer install --optimize-autoloader --no-dev

# Or if already installed, optimize
composer dump-autoload --optimize
```

### 2.3 Create Deployment Package

**Files/Folders TO UPLOAD:**
```
✅ app/
✅ bootstrap/
✅ config/
✅ database/ (migrations, seeders)
✅ lang/
✅ public/ (including public/build)
✅ resources/
✅ routes/
✅ storage/ (structure only, clear contents)
✅ vendor/
✅ .htaccess
✅ artisan
✅ composer.json
✅ composer.lock
✅ package.json
✅ package-lock.json
✅ vite.config.js
✅ tailwind.config.js
✅ postcss.config.js
✅ .env.example (rename to .env on server)
```

**Files/Folders NOT to upload:**
```
❌ node_modules/ (227 MB - rebuild on server if needed)
❌ .git/ (version control - optional)
❌ .env (create new on server)
❌ .env.local
❌ tests/
❌ .kiro/
❌ .vscode/
❌ storage/logs/*.log (clear logs)
❌ storage/framework/cache/* (clear cache)
❌ storage/framework/sessions/* (clear sessions)
❌ storage/framework/views/* (clear compiled views)
```

### 2.4 Clean Storage Before Upload

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Or manually delete:
del /s /q storage\framework\cache\data\*
del /s /q storage\framework\sessions\*
del /s /q storage\framework\views\*
del /s /q storage\logs\*.log
```

### 2.5 Create ZIP Archive (Optional)

**Using File Explorer:**
1. Select all files/folders to upload
2. Right-click → Send to → Compressed (zipped) folder
3. Name it: `cpdo_project_production.zip`

**Using PowerShell:**
```powershell
# Compress (excluding unnecessary files)
Compress-Archive -Path "C:\xampp\htdocs\cpdo_project\*" `
  -DestinationPath "C:\xampp\htdocs\cpdo_deploy.zip" `
  -Force
```

---

## 🚀 STEP 3: Upload to Hostinger

### 3.1 Upload via File Manager (Recommended)

1. **Login to Hostinger hPanel**
2. **Navigate to:** Files → File Manager
3. **Go to public_html directory** (this is your web root)
4. **Upload your files:**
   - If ZIP: Upload `cpdo_deploy.zip` → Right-click → Extract
   - If individual files: Upload all folders/files

### 3.2 Set Correct Directory Structure

**Important:** Laravel's `public` folder should be your document root.

**Option A: If you have domain root access (Recommended)**
```
public_html/
  └── cpdo_project/
      ├── app/
      ├── bootstrap/
      ├── config/
      ├── database/
      ├── public/  ← This should be accessible via yourdomain.com
      ├── resources/
      ├── routes/
      ├── storage/
      ├── vendor/
      └── .env
```

**Configure document root to:** `/public_html/cpdo_project/public`

**Option B: If limited to public_html**
```
public_html/
  ├── app/
  ├── bootstrap/
  ├── config/
  ├── database/
  ├── resources/
  ├── routes/
  ├── storage/
  ├── vendor/
  ├── .env
  └── (public folder contents directly in public_html)
```

Move contents of `public/` folder to `public_html/` root.

### 3.3 Upload via FTP (Alternative)

**Using FileZilla or any FTP client:**
```
Host: ftp.yourdomain.com
Username: your_hostinger_username
Password: your_hostinger_password
Port: 21
```

1. Connect to FTP
2. Navigate to `public_html`
3. Upload all files (may take 10-30 minutes)

---

## ⚙️ STEP 4: Configure Environment

### 4.1 Create .env File

1. **In File Manager, go to project root**
2. **Copy `.env.example` → Rename to `.env`**
3. **Edit `.env` file:**

```env
# === APPLICATION SETTINGS ===
APP_NAME="CPDO LC"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# === DATABASE SETTINGS ===
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u123456789_cpdo
DB_USERNAME=u123456789_cpdo_user
DB_PASSWORD=your_strong_password_here

# === MAIL SETTINGS (Hostinger SMTP) ===
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="CPDO LC"

# === SMS SETTINGS (Semaphore) ===
SMS_ENABLED=true
SMS_PROVIDER=semaphore
SEMAPHORE_API_KEY=your_semaphore_api_key
SEMAPHORE_SENDER_NAME=CPDOLC

# === CACHE & SESSION ===
CACHE_DRIVER=file
SESSION_DRIVER=file
SESSION_LIFETIME=120
QUEUE_CONNECTION=sync

# === SECURITY ===
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=yourdomain.com

# === FILESYSTEM ===
FILESYSTEM_DISK=public

# === LOGGING ===
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### 4.2 Generate Application Key

**Via SSH (if available):**
```bash
cd /home/username/public_html/cpdo_project
php artisan key:generate
```

**Via Hostinger Terminal:**
1. Go to Advanced → Terminal (if available)
2. Navigate to project directory
3. Run: `php artisan key:generate`

**Manual Method (if no SSH):**
1. Visit: https://generate-random.org/laravel-key-generator
2. Generate a key
3. Add to `.env`: `APP_KEY=base64:your_generated_key_here`

---

## 🔐 STEP 5: Set File Permissions

### Via SSH or Terminal:
```bash
cd /home/username/public_html/cpdo_project

# Set correct permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .env

# If you have sudo access
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

### Via File Manager:
1. Right-click on `storage` folder → Permissions
2. Set: **755** (rwxr-xr-x)
3. Check "Apply to subdirectories"
4. Repeat for `bootstrap/cache`

**Required Permissions:**
```
storage/               → 755
storage/app/           → 755
storage/framework/     → 755
storage/logs/          → 755
bootstrap/cache/       → 755
.env                   → 644 (important for security!)
```

---

## 💾 STEP 6: Database Setup

### 6.1 Run Migrations (Via SSH/Terminal)

```bash
cd /home/username/public_html/cpdo_project

# Run migrations
php artisan migrate --force

# Seed roles
php artisan db:seed --class=RoleSeeder

# Create super admin
php artisan db:seed --class=AdminUserSeeder
```

### 6.2 Run Migrations (Without SSH)

**Option 1: Create migration script**

Create file: `public/migrate.php`
```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

// Run migrations
echo "Running migrations...\n";
$kernel->call('migrate', ['--force' => true]);
echo "Migrations complete!\n";

// Seed roles
echo "Seeding roles...\n";
$kernel->call('db:seed', ['--class' => 'RoleSeeder']);
echo "Roles seeded!\n";

// Seed admin
echo "Seeding admin...\n";
$kernel->call('db:seed', ['--class' => 'AdminUserSeeder']);
echo "Admin seeded!\n";

echo "\n✅ Setup complete!\n";
```

Visit: `https://yourdomain.com/migrate.php`  
**Delete this file after use!**

### 6.3 Verify Database

**Via phpMyAdmin:**
1. Go to Hostinger → Databases → phpMyAdmin
2. Select your database
3. Check that tables exist: `users`, `requests`, `payments`, `certificates`, etc.

---

## 🔗 STEP 7: Create Storage Link

### Via SSH:
```bash
php artisan storage:link
```

### Via File Manager:
1. Create folder: `public_html/cpdo_project/public/storage`
2. Or create symbolic link (if Hostinger allows)

### Verify:
Visit: `https://yourdomain.com/storage`  
Should show "Forbidden" (not 404)

---

## 🎨 STEP 8: Build Frontend Assets (if needed)

**If you uploaded without `public/build`:**

### Via SSH:
```bash
cd /home/username/public_html/cpdo_project

# Install Node modules
npm install

# Build assets
npm run build
```

**Note:** Some Hostinger plans don't support Node.js. In this case, build locally and upload the `public/build` folder.

---

## 🌐 STEP 9: Configure Domain & SSL

### 9.1 Point Domain to Hosting

1. **In Hostinger hPanel:** Domains → Manage
2. **Add/Select your domain**
3. **Point to:** Your hosting account

### 9.2 Enable SSL Certificate

1. **Navigate to:** SSL → Manage SSL
2. **Select your domain**
3. **Click:** "Install SSL" (Free Let's Encrypt)
4. **Wait:** 5-15 minutes for activation

### 9.3 Force HTTPS

**Edit `.htaccess` in public folder:**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Redirect to public folder (if needed)
    RewriteCond %{REQUEST_URI} !^/public/
    RewriteRule ^(.*)$ /public/$1 [L]
    
    # Laravel default rules
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

## 🧹 STEP 10: Clear & Cache Configuration

### Via SSH:
```bash
# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## ⏰ STEP 11: Set Up Cron Jobs

### 11.1 Configure Cron (for scheduled tasks)

1. **In Hostinger hPanel:** Advanced → Cron Jobs
2. **Add New Cron Job:**

```bash
# Run every minute
* * * * * cd /home/username/public_html/cpdo_project && php artisan schedule:run >> /dev/null 2>&1
```

**Or more specific:**
```bash
# Every minute
* * * * * /usr/bin/php /home/username/public_html/cpdo_project/artisan schedule:run >> /dev/null 2>&1
```

**This handles:**
- Payment reminders
- SMS reminders  
- Certificate expiry notifications
- Analytics refresh

---

## ✅ STEP 12: Post-Deployment Testing

### 12.1 Test Public Pages
- [ ] Visit: `https://yourdomain.com`
- [ ] Verify homepage loads
- [ ] Check "Login" button appears (no "Sign Up")
- [ ] Test navigation links

### 12.2 Test Login System
- [ ] Click "Login"
- [ ] Login as super admin
  - Email: `crisanta@cpdo.com`
  - Password: `password123` (change after first login!)
- [ ] Verify dashboard loads

### 12.3 Test Core Features
- [ ] View applications list
- [ ] Create test application (as applicant)
- [ ] Admin can review/approve
- [ ] Payment recording works
- [ ] Certificate generation works
- [ ] File uploads work
- [ ] Notifications display

### 12.4 Test Email
```bash
# Via SSH
php artisan test:email
```

Or test by triggering an action (application submission).

### 12.5 Test SMS
```bash
# Via SSH
php artisan test:sms
```

Or verify SMS sends when application status changes.

### 12.6 Check Logs
Visit: `storage/logs/laravel.log`  
Check for any errors.

---

## 🔒 STEP 13: Security Hardening

### 13.1 Secure .env File

**Add to `.htaccess` in project root:**
```apache
<Files .env>
    Order allow,deny
    Deny from all
</Files>
```

### 13.2 Disable Directory Listing

**In `public/.htaccess`:**
```apache
Options -Indexes
```

### 13.3 Change Default Admin Password

```bash
php artisan admin:reset-password
# Or login and change via UI
```

### 13.4 Remove Unnecessary Files

```bash
# Delete installation/test files
rm public/migrate.php
rm database_audit_script.php
```

### 13.5 Set Proper File Ownership

```bash
# Via SSH with sudo
chown -R www-data:www-data /path/to/project
```

---

## 🐛 Troubleshooting Common Issues

### Issue: 500 Internal Server Error

**Fix 1: Check logs**
```
storage/logs/laravel.log
```

**Fix 2: Clear cache**
```bash
php artisan cache:clear
php artisan config:clear
```

**Fix 3: Check permissions**
```bash
chmod -R 755 storage bootstrap/cache
```

### Issue: "Mix Manifest Not Found"

**Fix:**
```bash
npm run build
# Upload public/build folder
```

### Issue: "Vite Manifest Not Found"

**Fix:**
```bash
# Ensure public/build/manifest.json exists
# Rebuild: npm run build
```

### Issue: "Storage Link Not Working"

**Fix:**
```bash
php artisan storage:link

# Verify symbolic link exists:
ls -la public/storage
```

### Issue: "Class Not Found"

**Fix:**
```bash
composer dump-autoload --optimize
php artisan config:clear
```

### Issue: "CSRF Token Mismatch"

**Fix:**
1. Check `APP_URL` in `.env` matches domain
2. Clear browser cookies
3. Check `SESSION_DRIVER` is set to `file`

### Issue: Database Connection Failed

**Fix:**
1. Verify credentials in `.env`
2. Check database exists in phpMyAdmin
3. Test connection:
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo();
   ```

### Issue: Images/CSS Not Loading

**Fix:**
1. Check `APP_URL` in `.env`
2. Verify `public/build` folder exists
3. Check file permissions
4. Force HTTPS in `.htaccess`

---

## 📊 Monitoring & Maintenance

### Daily Tasks
- [ ] Check error logs: `storage/logs/laravel.log`
- [ ] Monitor disk space usage
- [ ] Verify cron jobs running

### Weekly Tasks
- [ ] Review application submissions
- [ ] Check payment records
- [ ] Monitor email/SMS delivery
- [ ] Backup database

### Monthly Tasks
- [ ] Update dependencies (if needed)
- [ ] Review user accounts
- [ ] Check analytics
- [ ] Performance optimization

### Backup Strategy

**Database Backup (via phpMyAdmin):**
1. Login to phpMyAdmin
2. Select database
3. Export → SQL format
4. Download and store securely

**File Backup (via File Manager):**
1. Compress entire project folder
2. Download ZIP
3. Store in secure location

**Automated Backups:**
- Enable Hostinger's automatic backups (if available)
- Or use: `php artisan backup:run` (requires spatie/laravel-backup package)

---

## 📞 Support Resources

### Hostinger Support
- **Live Chat:** 24/7
- **Email:** support@hostinger.com
- **Knowledge Base:** https://support.hostinger.com

### Laravel Documentation
- **Official Docs:** https://laravel.com/docs
- **Deployment:** https://laravel.com/docs/deployment

### CPDO LC System
- **Admin Email:** crisanta@cpdo.com
- **Log Files:** `storage/logs/laravel.log`
- **Debug Mode:** Set `APP_DEBUG=true` (temporarily)

---

## 🎉 Deployment Complete!

After following all steps, your CPDO LC system should be live at:
**https://yourdomain.com**

### Default Login Credentials
- **Email:** crisanta@cpdo.com
- **Password:** password123
- **⚠️ CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

---

## Quick Reference Commands

```bash
# Navigate to project
cd /home/username/public_html/cpdo_project

# Clear caches
php artisan cache:clear && php artisan config:clear && php artisan view:clear

# Cache config
php artisan config:cache && php artisan route:cache

# Run migrations
php artisan migrate --force

# Create admin
php artisan create:super-admin

# Reset admin password
php artisan admin:reset-password

# Test email
php artisan test:email

# View logs
tail -f storage/logs/laravel.log

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

---

**Last Updated:** September 2, 2026  
**Version:** 1.0 Production  
**Status:** ✅ Ready for Deployment
