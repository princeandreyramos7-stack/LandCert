# EMERGENCY: Missing Files on Hostinger

## Error
```
Failed to open stream: No such file or directory
app/Providers/AppServiceProvider.php
```

## Cause
The `app/` folder (or parts of it) wasn't uploaded to Hostinger.

---

## 🚨 IMMEDIATE FIX

### Option 1: Re-upload Entire app/ Folder (Recommended)

**Via File Manager:**
1. Login to Hostinger File Manager
2. Navigate to: `/public_html/`
3. **Delete old:** `/public_html/app/` folder (if exists)
4. **Upload from local:** `C:\xampp\htdocs\cpdo_project\app\`
5. Upload entire folder with all subfolders

**Via FTP:**
1. Connect via FTP client (FileZilla)
2. Local: `C:\xampp\htdocs\cpdo_project\app\`
3. Remote: `/public_html/app/`
4. Upload entire folder (all files + subdirectories)

---

### Option 2: Upload Missing File Only (Quick Fix)

**Create temporary upload script:**

File: `public/upload-appserviceprovider.php`

```php
<?php
$targetDir = __DIR__ . '/../app/Providers/';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$content = <<<'PHP'
<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\Request as RequestModel;
use App\Models\Report;
use App\Observers\RequestObserver;
use App\Observers\ReportObserver;

class AppServiceProvider extends ServiceProvider
{
    private const MAX_SESSION_LIFETIME_MINUTES = 15;

    public function register(): void
    {
        $this->enforceSessionSecurity();
    }

    private function enforceSessionSecurity(): void
    {
        config([
            'session.expire_on_close' => filter_var(
                env('SESSION_EXPIRE_ON_CLOSE', true),
                FILTER_VALIDATE_BOOLEAN
            ),
            'session.lifetime' => min(
                (int) env('SESSION_LIFETIME', self::MAX_SESSION_LIFETIME_MINUTES),
                self::MAX_SESSION_LIFETIME_MINUTES
            ),
        ]);
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        \Carbon\Carbon::setLocale('en');
        date_default_timezone_set('Asia/Manila');
        RequestModel::observe(RequestObserver::class);
        Report::observe(ReportObserver::class);
    }
}
PHP;

file_put_contents($targetDir . 'AppServiceProvider.php', $content);
echo "<h1>✓ AppServiceProvider.php created!</h1>";
echo "<p>Location: app/Providers/AppServiceProvider.php</p>";
echo "<p><strong>Delete this file now: public/upload-appserviceprovider.php</strong></p>";
```

1. Upload this file to `public/` folder
2. Visit: `https://cityofilaganzoningadministration.online/upload-appserviceprovider.php`
3. **Delete after use!**

---

## 🔍 Check What's Missing

### Verify Folder Structure on Server

Required folders in `/public_html/`:
```
app/
  ├── Console/
  ├── Http/
  │   ├── Controllers/
  │   ├── Middleware/
  │   └── Requests/
  ├── Models/
  ├── Observers/
  ├── Providers/  ← AppServiceProvider.php is here
  ├── Services/
  └── Mail/
bootstrap/
config/
database/
public/
resources/
routes/
storage/
vendor/
```

### Files That MUST Exist

**Critical files:**
```
app/Providers/AppServiceProvider.php
app/Providers/RouteServiceProvider.php
bootstrap/app.php
bootstrap/cache/ (folder)
config/app.php
public/index.php
storage/framework/cache/
storage/framework/sessions/
storage/framework/views/
```

---

## 📦 Complete Re-deployment Steps

If many files are missing, you need to re-upload everything:

### Step 1: Prepare Locally

```powershell
cd C:\xampp\htdocs\cpdo_project

# Clean up
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Build assets
npm run build

# Optimize
composer dump-autoload --optimize
```

### Step 2: Create Deployment Package

**Folders to upload:**
```
✓ app/              (ALL files and subfolders)
✓ bootstrap/        (including bootstrap/app.php)
✓ config/           (all config files)
✓ database/         (migrations, seeders)
✓ lang/
✓ public/           (including public/build/)
✓ resources/        (views, js, css)
✓ routes/           (web.php, api.php, console.php)
✓ storage/          (structure only, clear contents)
✓ vendor/           (all dependencies)
✓ .htaccess
✓ artisan
✓ composer.json
✓ composer.lock
```

**Do NOT upload:**
```
✗ node_modules/
✗ .git/
✗ .env (create new on server)
✗ tests/
✗ storage/logs/*.log
```

### Step 3: Upload to Hostinger

**Via File Manager:**
1. Delete old folders on server (backup first!)
2. Upload new folders
3. Verify all files uploaded

**Via FTP (Faster for large uploads):**
```
Host: ftp.yourdomain.com
User: your_hostinger_ftp_user
Password: your_ftp_password
Port: 21
```

Upload entire project structure.

### Step 4: Set Permissions

**Via SSH:**
```bash
cd /home/u988863428/domains/cityofilaganzoningadministration.online/public_html
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chmod 644 .env
```

**Via File Manager:**
- Right-click folders → Permissions → 755
- Apply to subdirectories

### Step 5: Clear Cache on Server

**Create:** `public/clear-all-cache.php`
```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<h1>Clearing All Caches</h1><pre>";

try {
    $kernel->call('cache:clear');
    echo "✓ Cache cleared\n";
    
    $kernel->call('config:clear');
    echo "✓ Config cleared\n";
    
    $kernel->call('route:clear');
    echo "✓ Routes cleared\n";
    
    $kernel->call('view:clear');
    echo "✓ Views cleared\n";
    
    // Rebuild caches
    $kernel->call('config:cache');
    echo "✓ Config cached\n";
    
    $kernel->call('route:cache');
    echo "✓ Routes cached\n";
    
    echo "\n✅ All caches cleared and rebuilt!\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "</pre><p><strong>Delete this file now!</strong></p>";
```

Visit: `https://cityofilaganzoningadministration.online/clear-all-cache.php`  
**Delete after use!**

---

## 🔧 Composer Issues

If you see "Class not found" errors after upload:

**Via SSH:**
```bash
composer dump-autoload --optimize
```

**Without SSH:**

Create: `public/rebuild-autoload.php`
```php
<?php
echo "<h1>Rebuilding Autoloader</h1><pre>";
chdir(__DIR__ . '/..');
exec('composer dump-autoload --optimize 2>&1', $output, $return);
echo implode("\n", $output);
echo "\n\nReturn code: " . $return;
echo "</pre><p><strong>Delete this file now!</strong></p>";
```

---

## ✅ Verification Checklist

After re-uploading, verify:

- [ ] Homepage loads without errors
- [ ] Can login as admin/super admin
- [ ] Dashboard displays
- [ ] Can view applications
- [ ] No "Class not found" errors
- [ ] No "File not found" errors

---

## 🚨 If Still Having Issues

### Check Laravel Log

**View:** `/storage/logs/laravel.log` on server

**Via File Manager:**
1. Navigate to: `storage/logs/`
2. Download `laravel.log`
3. Check for errors

### Enable Debug Mode (Temporarily)

Edit `.env` on server:
```env
APP_DEBUG=true
APP_ENV=local
```

Visit site to see detailed error messages.

**⚠️ IMPORTANT: Disable debug after fixing!**
```env
APP_DEBUG=false
APP_ENV=production
```

---

## 📞 Getting Help

If errors persist:

1. **Check logs:** `storage/logs/laravel.log`
2. **Enable debug:** `APP_DEBUG=true`
3. **Check permissions:** `chmod 755 storage bootstrap/cache`
4. **Verify files exist:** All files from local should be on server
5. **Clear cache:** Run clear-all-cache.php script

---

## 🎯 Recommended: Start Fresh

The safest approach:

1. **Backup:** Download current database
2. **Clean:** Delete all files on server
3. **Re-upload:** Upload complete project from local
4. **Configure:** Update `.env` with production settings
5. **Run:** Migrations and seeders
6. **Test:** Verify everything works

---

**Most Likely Issue:** Incomplete upload. The entire `app/` folder needs to be on the server with all subdirectories intact. 🚀
