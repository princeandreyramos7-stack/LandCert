# CPDO LC System - Hostinger Deployment Checklist

## Pre-Deployment Cleanup (✓ COMPLETED)
- [x] Deleted DOCU folder
- [x] Deleted .kiro folder
- [x] Deleted .claude folder
- [x] Deleted .vscode folder
- [x] Deleted docs folder
- [x] Deleted tests folder
- [x] Deleted test_notification.php
- [x] Deleted phpunit.xml
- [x] Deleted vercel.json and .vercelignore
- [x] Cleaned storage/framework/views (compiled views cache)
- [x] Cleaned storage/framework/cache/data
- [x] Cleaned storage/logs/*.log files
- [x] Verified .env.example exists

## Files/Folders to EXCLUDE When Uploading
**DO NOT upload these to Hostinger:**
- `node_modules/` (227 MB - rebuild on server)
- `vendor/` (rebuild on server with composer)
- `.git/` (optional - include only if you want version control on server)
- `.env` (create new on server with production settings)
- `storage/framework/cache/`
- `storage/framework/sessions/`
- `storage/framework/views/`
- `storage/logs/`

## What TO UPLOAD
- All PHP files (app/, bootstrap/, config/, database/, lang/, routes/, public/, api/)
- Frontend assets (resources/)
- Package files (composer.json, composer.lock, package.json, package-lock.json)
- Configuration files (.env.example, artisan, vite.config.js, tailwind.config.js, etc.)
- Storage directory structure (but not cache/sessions/views content)

## After Upload - Server Setup Steps

### 1. Create .env file on server
```bash
cp .env.example .env
nano .env  # or use Hostinger file manager editor
```

Update these values:
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=your-email@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@yourdomain.com
MAIL_FROM_NAME="CPDO LC"

SEMAPHORE_API_KEY=your_semaphore_key
SEMAPHORE_SENDER_NAME=CPDOLC
```

### 2. Install Dependencies
```bash
# Install Composer dependencies
composer install --optimize-autoloader --no-dev

# Install NPM dependencies and build assets
npm install
npm run build
```

### 3. Set Permissions
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Run Migrations
```bash
php artisan migrate --force
```

### 6. Seed Database (if needed)
```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=AdminUserSeeder
```

### 7. Clear and Cache Config
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 8. Create Storage Symlink
```bash
php artisan storage:link
```

### 9. Set Up Scheduled Tasks (Cron)
Add to crontab:
```
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### 10. Verify File Structure
Ensure these directories exist with proper permissions:
- storage/app/public/
- storage/logs/
- storage/framework/cache/
- storage/framework/sessions/
- storage/framework/views/
- public/storage/ (symlink)

## Post-Deployment Testing
- [ ] Test login (applicant, admin, super_admin)
- [ ] Test application submission
- [ ] Test file uploads
- [ ] Test email notifications
- [ ] Test SMS notifications
- [ ] Test payment recording
- [ ] Test certificate generation
- [ ] Test PDF downloads
- [ ] Test notification bell routing (admin/super_admin should stay in dashboard)

## Important Notes
1. **Keep .git folder?** - If you want version control on server, keep it. Otherwise delete before upload.
2. **Node modules** - Must be rebuilt on server (don't upload the 227MB folder)
3. **Public folder** - This should be your web root in Hostinger
4. **SSL Certificate** - Enable HTTPS in Hostinger panel
5. **Database** - Create database and user in Hostinger panel first
6. **Backups** - Set up automatic backups in Hostinger

## Compression for Upload
To reduce upload size, you can create a zip excluding heavy folders:
```bash
# From parent directory
tar -czf cpdo_project_deploy.tar.gz cpdo_project \
  --exclude='cpdo_project/node_modules' \
  --exclude='cpdo_project/vendor' \
  --exclude='cpdo_project/.git' \
  --exclude='cpdo_project/storage/framework/cache' \
  --exclude='cpdo_project/storage/framework/sessions' \
  --exclude='cpdo_project/storage/framework/views' \
  --exclude='cpdo_project/storage/logs'
```

## Test Commands (artisan commands you might need)
```bash
# Create super admin
php artisan create:super-admin

# Reset admin password
php artisan admin:reset-password

# Show admin info
php artisan admin:show-info

# Send test email
php artisan test:email

# Verify database
php artisan verify:database
```

## Project Size Info
- With node_modules: ~227 MB
- With vendor: varies
- Without both: much smaller (faster upload)
- Rebuild both on server after upload

Good luck with deployment! 🚀
