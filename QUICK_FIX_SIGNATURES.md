# Quick Fix: Signatures Not Showing

## Your Situation
- Your `.env` has **production** (Hostinger) database credentials
- You're trying to fix signatures locally
- Need to fix on BOTH local AND server

---

## 🚀 Option 1: Fix on Hostinger (Recommended)

Since your `.env` is already configured for production, you need to run the fix on the server.

### Step 1: Upload Files to Hostinger

**Upload signature images:**
1. Go to Hostinger File Manager
2. Navigate to: `/public_html/cpdo_project/public/images/`
3. Create folder: `E-signitures` (if doesn't exist)
4. Upload these files from local:
   ```
   C:\xampp\htdocs\cpdo_project\public\images\E-signitures\
   ├── ENGR. CRISANTA D. CONCEPCION, EnP.png
   ├── Jeffrey Paguig.png
   ├── Kay B. Aggarao.png
   ├── April U. Cuntapay.png
   └── Mary Jane P. Bulauan.png
   ```

### Step 2: Fix Database via phpMyAdmin

1. **Login to Hostinger → Databases → phpMyAdmin**
2. **Select database:** `u988863428_zone_clear`
3. **Click "SQL" tab**
4. **Copy and paste this SQL:**

```sql
UPDATE users 
SET signature_url = '/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png' 
WHERE email = 'crisanta@cpdo.com';

UPDATE users 
SET signature_url = '/images/E-signitures/Jeffrey Paguig.png' 
WHERE email = 'jeff@cpdo.com';

UPDATE users 
SET signature_url = '/images/E-signitures/Kay B. Aggarao.png' 
WHERE email = 'kay@cpdo.com';

UPDATE users 
SET signature_url = '/images/E-signitures/April U. Cuntapay.png' 
WHERE email = 'april@cpdo.com';

UPDATE users 
SET signature_url = '/images/E-signitures/Mary Jane P. Bulauan.png' 
WHERE email = 'admin@cpdo.com';
```

5. **Click "Go"**
6. **Verify:** Browse `users` table and check `signature_url` column

### Step 3: Rebuild and Upload Frontend

**On your local computer:**
```powershell
cd C:\xampp\htdocs\cpdo_project
npm run build
```

**Upload to Hostinger:**
- Upload entire `public/build/` folder
- Replace existing folder on server

### Step 4: Clear Cache on Server

**Via SSH (if available):**
```bash
cd /home/username/public_html/cpdo_project
php artisan cache:clear
php artisan config:clear
```

**Without SSH - Create temp file:**

Create: `public/clear-cache.php`
```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<h1>Clearing Cache</h1><pre>";
$kernel->call('cache:clear');
echo "✓ Cache cleared\n";
$kernel->call('config:clear');
echo "✓ Config cleared\n";
echo "</pre><p><strong>Done! Delete this file now.</strong></p>";
```

Upload to server, visit: `https://cityofilaganzoningadministration.online/clear-cache.php`  
**Delete after use!**

### Step 5: Test

1. Visit: `https://cityofilaganzoningadministration.online`
2. Login as admin
3. View an approved application
4. Generate certificate
5. Check if signature appears

---

## 🏠 Option 2: Fix Locally (For Testing)

If you want to test locally, you need local database credentials.

### Step 1: Start XAMPP MySQL

1. Open XAMPP Control Panel
2. Start **MySQL**
3. Wait until it shows "Running"

### Step 2: Create .env.local

Create new file: `.env.local` with local credentials:

```env
APP_NAME=CPDO
APP_ENV=local
APP_KEY=base64:joUfRqkAQhAVtAOu8+uYa9JReNxPFVAxfwOINTBJoPI=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_local_database_name
DB_USERNAME=root
DB_PASSWORD=

# Rest of settings...
```

### Step 3: Use Local Env

```powershell
# Copy local env
Copy-Item .env.local .env

# Run fix
php artisan signatures:fix

# Restore production env
Copy-Item .env.production .env
```

---

## ⚡ Fastest Fix (Recommended)

**Just run the SQL on Hostinger phpMyAdmin:**

1. Login to Hostinger
2. Go to phpMyAdmin
3. Select `u988863428_zone_clear` database
4. Run the SQL script from `fix-signatures-local.sql`
5. Upload signature images to server
6. Rebuild frontend: `npm run build`
7. Upload `public/build/` folder
8. Clear cache
9. Test!

---

## 📁 Files You Need

**Already Created:**
- ✅ `fix-signatures-local.sql` - SQL to run on database
- ✅ `app/Console/Commands/FixSignaturePaths.php` - Artisan command (for later)
- ✅ `resources/js/Components/ESignatureImage.jsx` - Updated component

**To Upload to Server:**
1. `public/images/E-signitures/` (all PNG files)
2. `public/build/` (after running `npm run build`)
3. `app/Console/Commands/FixSignaturePaths.php`

---

## ✅ Verification Checklist

After fixing, verify:

- [ ] Signature images exist in: `/public_html/cpdo_project/public/images/E-signitures/`
- [ ] Database `users` table has correct `signature_url` paths
- [ ] Frontend rebuilt: `npm run build` executed
- [ ] `public/build/` folder uploaded to server
- [ ] Cache cleared on server
- [ ] Test: Generate certificate and see signature

---

## 🔍 Quick Test

**Check if image is accessible:**
1. Visit: `https://cityofilaganzoningadministration.online/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png`
2. Should show the signature image
3. If 404 error → images not uploaded
4. If shows image → images OK, check database

---

## Need Help?

**If signatures still don't show:**

1. **Check browser console** (F12)
   - Look for 404 errors
   - Note the exact path being requested

2. **Verify database:**
   ```sql
   SELECT name, email, signature_url 
   FROM users 
   WHERE email = 'crisanta@cpdo.com';
   ```

3. **Check file exists on server:**
   - File Manager → `/public_html/cpdo_project/public/images/E-signitures/`
   - Verify all PNG files are there

4. **Clear browser cache:**
   - Ctrl + Shift + Delete
   - Or try Incognito mode

---

**Summary:** Your `.env` is configured for production, so the easiest fix is to run the SQL on Hostinger's phpMyAdmin, upload signature images, rebuild frontend, and upload the build folder. ✅
