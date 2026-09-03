# Deployment Fixes & Issues Resolution

## Issue 1: Database Connection Error ❌

### Error Message:
```
Illuminate\Database\QueryException
SQLSTATE[HY000] [2002] No connection could be made because the target machine actively refused it
(Connection: mysql, SQL: select * from `cache`...)
```

### Cause:
MySQL server is not running.

### Solution:

#### For Local Development (XAMPP):
1. **Open XAMPP Control Panel**
   - Location: `C:\xampp\xampp-control.exe`
   - Or search "XAMPP Control Panel" in Start Menu

2. **Start MySQL**
   - Click the "Start" button next to "MySQL"
   - Wait for it to turn green and show "Running"

3. **Start Apache (if needed)**
   - Click "Start" next to "Apache"
   - Both MySQL and Apache should be running

4. **Verify MySQL is Running**
   ```powershell
   # Check if MySQL is listening on port 3306
   netstat -ano | findstr "3306"
   ```

5. **Test Laravel Connection**
   ```bash
   cd C:\xampp\htdocs\cpdo_project
   php artisan tinker
   >>> DB::connection()->getPdo();
   # Should show PDO object if connected
   ```

#### For Production (Hostinger):
1. **Verify Database Credentials in `.env`**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=localhost  # Or your Hostinger DB host
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_database_user
   DB_PASSWORD=your_database_password
   ```

2. **Create Database in Hostinger Panel**
   - Log into Hostinger control panel
   - Go to "Databases" → "MySQL Databases"
   - Create new database
   - Create database user with all privileges

3. **Update `.env` with Hostinger Credentials**
   - Use the database name, username, and password from Hostinger

4. **Clear Laravel Cache**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan config:cache
   ```

5. **Test Connection**
   ```bash
   php artisan migrate:status
   ```

---

## Issue 2: Welcome Page Sign Up Button ✅ FIXED

### Change:
Removed "Sign Up" button from welcome page header. Now shows only "Login" button.

### Reason:
Registration should be controlled/restricted. Public visitors should contact admin to create accounts.

### Files Modified:
- `resources/js/Pages/Welcome.jsx`

### Result:
- **Desktop**: Shows only "Login" button in header
- **Mobile**: Shows only "Login" button
- Users cannot self-register from public landing page

---

## Pre-Deployment Checklist for Hostinger

### 1. Database Setup ✓
- [ ] Create MySQL database in Hostinger
- [ ] Create database user with privileges
- [ ] Note down: DB name, DB user, DB password, DB host

### 2. Environment Configuration ✓
- [ ] Upload all files EXCEPT: `node_modules/`, `vendor/`, `.git/`, `.env`
- [ ] Create new `.env` file on server (copy from `.env.example`)
- [ ] Update `.env` with production values:
  ```env
  APP_ENV=production
  APP_DEBUG=false
  APP_URL=https://yourdomain.com
  
  DB_CONNECTION=mysql
  DB_HOST=localhost
  DB_PORT=3306
  DB_DATABASE=u123456789_cpdo
  DB_USERNAME=u123456789_cpdo_user
  DB_PASSWORD=your_secure_password
  
  MAIL_MAILER=smtp
  MAIL_HOST=smtp.hostinger.com
  MAIL_PORT=587
  MAIL_USERNAME=noreply@yourdomain.com
  MAIL_PASSWORD=your_email_password
  MAIL_ENCRYPTION=tls
  MAIL_FROM_ADDRESS=noreply@yourdomain.com
  MAIL_FROM_NAME="CPDO LC"
  
  CACHE_DRIVER=file
  SESSION_DRIVER=file
  QUEUE_CONNECTION=sync
  
  SEMAPHORE_API_KEY=your_semaphore_api_key
  SEMAPHORE_SENDER_NAME=CPDOLC
  SMS_ENABLED=true
  SMS_PROVIDER=semaphore
  ```

### 3. Install Dependencies ✓
```bash
# Install Composer dependencies
composer install --optimize-autoloader --no-dev

# Install NPM dependencies
npm install

# Build frontend assets
npm run build
```

### 4. Set Permissions ✓
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

### 5. Generate Application Key ✓
```bash
php artisan key:generate
```

### 6. Run Migrations ✓
```bash
php artisan migrate --force
```

### 7. Seed Database ✓
```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=AdminUserSeeder
```

### 8. Create Storage Link ✓
```bash
php artisan storage:link
```

### 9. Cache Configuration ✓
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 10. Set Up Cron Job ✓
Add to crontab for scheduled tasks (reminders, etc.):
```
* * * * * cd /path/to/your/project && php artisan schedule:run >> /dev/null 2>&1
```

---

## Common Deployment Issues & Fixes

### Issue: "500 Server Error" after deployment
**Fix:**
```bash
php artisan config:clear
php artisan cache:clear
chmod -R 755 storage bootstrap/cache
```

### Issue: "Mix Manifest Not Found"
**Fix:**
```bash
npm run build
php artisan config:clear
```

### Issue: "Storage link not working"
**Fix:**
```bash
php artisan storage:link
# Verify: ls -la public/storage
```

### Issue: "Vite manifest not found"
**Fix:**
```bash
npm run build
# Make sure public/build folder exists
```

### Issue: "Class not found"
**Fix:**
```bash
composer dump-autoload
php artisan config:clear
php artisan cache:clear
```

### Issue: "CSRF token mismatch"
**Fix:**
- Check `APP_URL` in `.env` matches your domain
- Clear browser cookies
- Check session driver in `.env`
```bash
php artisan config:clear
php artisan cache:clear
```

---

## Security Checklist for Production

- [ ] `APP_DEBUG=false` in `.env`
- [ ] `APP_ENV=production` in `.env`
- [ ] Strong `APP_KEY` generated
- [ ] Strong database passwords
- [ ] HTTPS enabled (SSL certificate)
- [ ] `.env` file permissions: `chmod 600 .env`
- [ ] Remove `.git` folder (or restrict access)
- [ ] Disable directory listing in Apache/Nginx
- [ ] Set up regular backups (database + files)
- [ ] Configure fail2ban for brute force protection
- [ ] Monitor error logs regularly

---

## Post-Deployment Testing

### 1. Test Public Pages
- [ ] Visit homepage: `https://yourdomain.com`
- [ ] Verify "Login" button appears (NO "Sign Up" button)
- [ ] Click Login button → Should go to login page

### 2. Test Admin Login
- [ ] Login as super admin
- [ ] Check dashboard loads
- [ ] Verify all menu items work

### 3. Test Application Flow
- [ ] Admin can view applications
- [ ] Admin can approve/reject
- [ ] Notifications work
- [ ] Payment recording works
- [ ] Certificate generation works

### 4. Test Email
```bash
php artisan test:email
```

### 5. Test SMS
```bash
php artisan test:sms
```

### 6. Test File Uploads
- [ ] Upload requirement documents
- [ ] Upload payment receipts
- [ ] Upload signatures
- [ ] Verify files appear in storage

---

## Quick Start Guide (After MySQL is Running)

1. **Start XAMPP Services**
   - Open XAMPP Control Panel
   - Start MySQL
   - Start Apache

2. **Navigate to Project**
   ```bash
   cd C:\xampp\htdocs\cpdo_project
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Visit: `http://localhost:8000`
   - Or: `http://127.0.0.1:8000`

5. **Login**
   - Use super admin credentials
   - Or create new admin: `php artisan create:super-admin`

---

## Contact & Support

If you encounter issues:

1. **Check Laravel Logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Check Apache/MySQL Logs**
   - Apache: `C:\xampp\apache\logs\error.log`
   - MySQL: `C:\xampp\mysql\data\*.err`

3. **Clear All Caches**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   composer dump-autoload
   ```

---

**Last Updated:** September 2, 2026  
**Status:** Ready for deployment after MySQL is started
