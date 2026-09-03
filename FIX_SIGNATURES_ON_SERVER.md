# Fix Missing Signatures on Hostinger

## Problem
Zoning officer signatures not showing when generating certificates on the server.

## Causes
1. Signature image files not uploaded to server
2. Database has incorrect signature paths
3. Storage link not configured

---

## Solution Steps

### Step 1: Verify Signature Files Exist on Server

**Via File Manager:**
1. Login to Hostinger File Manager
2. Navigate to: `public_html/cpdo_project/public/images/E-signitures/`
3. Verify these files exist:
   - `ENGR. CRISANTA D. CONCEPCION, EnP.png`
   - `Jeffrey Paguig.png`
   - `Kay B. Aggarao.png`
   - `April U. Cuntapay.png`
   - `Mary Jane P. Bulauan.png`

**If files are missing:**
- Upload the entire `public/images/E-signitures/` folder from local to server
- **Local path:** `C:\xampp\htdocs\cpdo_project\public\images\E-signitures\`
- **Server path:** `/public_html/cpdo_project/public/images/E-signitures/`

---

### Step 2: Fix Database Signature Paths

**Via SSH (Recommended):**
```bash
cd /home/username/public_html/cpdo_project
php artisan signatures:fix
```

**Without SSH - Create Fix Script:**

Create file: `public/fix-signatures.php`

```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

use Illuminate\Support\Facades\DB;

echo "<h1>Fixing Signature Paths</h1><pre>";

// Define correct signature mappings
$signatureMappings = [
    'crisanta@cpdo.com' => '/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png',
    'jeff@cpdo.com' => '/images/E-signitures/Jeffrey Paguig.png',
    'kay@cpdo.com' => '/images/E-signitures/Kay B. Aggarao.png',
    'april@cpdo.com' => '/images/E-signitures/April U. Cuntapay.png',
    'admin@cpdo.com' => '/images/E-signitures/Mary Jane P. Bulauan.png',
];

$updated = 0;

foreach ($signatureMappings as $email => $signaturePath) {
    $result = DB::table('users')
        ->where('email', $email)
        ->update(['signature_url' => $signaturePath]);
    
    if ($result) {
        echo "✓ Updated signature for: {$email}\n";
        echo "  Path: {$signaturePath}\n\n";
        $updated++;
    } else {
        echo "⚠ User not found: {$email}\n\n";
    }
}

echo "\n==============================================\n";
echo "Total updated: {$updated} users\n";
echo "==============================================\n\n";

// Show current signatures
echo "Current signature URLs:\n\n";
$users = DB::table('users')
    ->whereIn('email', array_keys($signatureMappings))
    ->select('name', 'email', 'signature_url')
    ->get();

foreach ($users as $user) {
    echo "{$user->name} ({$user->email}):\n";
    echo "  → " . ($user->signature_url ?: '(no signature)') . "\n\n";
}

echo "</pre><p><strong>✅ Done! Delete this file now.</strong></p>";
```

1. Upload `fix-signatures.php` to `public/` folder
2. Visit: `https://yourdomain.com/fix-signatures.php`
3. **Delete the file after use!**

---

### Step 3: Verify Database Paths

**Via phpMyAdmin:**
1. Login to Hostinger → Databases → phpMyAdmin
2. Select your database
3. Open `users` table
4. Browse records
5. Check `signature_url` column for these users:
   - `crisanta@cpdo.com` → should be `/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png`
   - `jeff@cpdo.com` → should be `/images/E-signitures/Jeffrey Paguig.png`
   - `kay@cpdo.com` → should be `/images/E-signitures/Kay B. Aggarao.png`
   - `april@cpdo.com` → should be `/images/E-signitures/April U. Cuntapay.png`
   - `admin@cpdo.com` → should be `/images/E-signitures/Mary Jane P. Bulauan.png`

**If paths are wrong, update manually:**
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

---

### Step 4: Clear Cache

**Via SSH:**
```bash
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

**Without SSH:**
Create `public/clear-cache.php`:
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
$kernel->call('view:clear');
echo "✓ View cache cleared\n";
echo "</pre><p><strong>✅ Done! Delete this file now.</strong></p>";
```

Visit: `https://yourdomain.com/clear-cache.php`  
**Delete after use!**

---

### Step 5: Rebuild Frontend Assets

The ESignatureImage component was updated to handle paths better.

**On local machine:**
```bash
cd C:\xampp\htdocs\cpdo_project
npm run build
```

**Upload to server:**
- Upload the entire `public/build/` folder to replace the old one
- Or re-deploy entire project

---

### Step 6: Test Signature Display

1. Login as admin/super admin
2. Go to an approved application
3. Click "Generate Certificate"
4. Check if Crisanta Concepcion's signature appears
5. Try generating different certificate types (CZ, CZC, TUP, SUP)

**Expected Result:**
- Zoning officer signature should appear
- "ELECTRONIC SIGNATURE · VERIFIED" watermark should show
- Crisanta Concepcion's name should appear below signature

---

## Troubleshooting

### Issue 1: Signature Still Not Showing

**Check browser console (F12):**
- Look for 404 errors on image paths
- Note the exact path being requested

**Verify image URL manually:**
1. Copy the signature path from database
2. Try accessing directly: `https://yourdomain.com/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png`
3. Should show the signature image

### Issue 2: 404 Error on Signature Image

**Possible causes:**
1. File not uploaded → Upload from local
2. Wrong path in database → Fix with Step 3
3. File permissions → Set 644 on image files

**Fix permissions (via SSH):**
```bash
chmod 644 public/images/E-signitures/*.png
```

### Issue 3: Image Broken After Upload

**Check file integrity:**
1. Download signature from server
2. Open in image viewer
3. If corrupted, re-upload

**Re-upload via FTP:**
- Use binary mode, not ASCII mode
- Verify file size matches local file

### Issue 4: Signature Shows But Looks Wrong

**Check image quality:**
- Original file should be PNG with transparent background
- Size: Recommended 300-500px width
- Resolution: 72-150 DPI

---

## Quick Diagnostic Checklist

When signatures don't show:

- [ ] Signature files exist in `public/images/E-signitures/`
- [ ] Database has correct paths (starts with `/images/E-signitures/`)
- [ ] Cache cleared
- [ ] Frontend assets rebuilt (`npm run build`)
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Can access image directly via URL
- [ ] File permissions are 644
- [ ] Image is valid PNG file

---

## Expected Signature Paths in Database

| User Email | Signature Path |
|------------|----------------|
| crisanta@cpdo.com | `/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png` |
| jeff@cpdo.com | `/images/E-signitures/Jeffrey Paguig.png` |
| kay@cpdo.com | `/images/E-signitures/Kay B. Aggarao.png` |
| april@cpdo.com | `/images/E-signitures/April U. Cuntapay.png` |
| admin@cpdo.com | `/images/E-signitures/Mary Jane P. Bulauan.png` |

---

## Files to Upload to Server

From local: `C:\xampp\htdocs\cpdo_project\`

**Required:**
```
public/images/E-signitures/
  ├── ENGR. CRISANTA D. CONCEPCION, EnP.png
  ├── Jeffrey Paguig.png
  ├── Kay B. Aggarao.png
  ├── April U. Cuntapay.png
  └── Mary Jane P. Bulauan.png

public/build/
  └── (entire folder - after running npm run build)

app/Console/Commands/
  └── FixSignaturePaths.php
```

---

## After Fixing

Once signatures are working:

1. **Test all certificate types:**
   - Zoning Certification (CZ)
   - Zoning Clearance (CZC)
   - Temporary Use Permit (TUP)
   - Special Use Permit (SUP)

2. **Test PDF download:**
   - Generate certificate
   - Download PDF
   - Open PDF and verify signature appears

3. **Test printing:**
   - Generate certificate
   - Print preview
   - Verify signature is visible in print

4. **Delete temporary files:**
   - `public/fix-signatures.php`
   - `public/clear-cache.php`

---

## Prevention for Future Deployments

**Always upload these folders:**
1. `public/images/` (all images including signatures)
2. `public/build/` (compiled frontend assets)
3. `storage/app/public/` (user uploads)

**After deployment, always:**
1. Run: `php artisan storage:link`
2. Run: `php artisan cache:clear`
3. Verify signatures work

---

**Last Updated:** September 2, 2026  
**Status:** Solution provided - ready to implement on server
