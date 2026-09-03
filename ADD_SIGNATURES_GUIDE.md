# Add Signatures to Database - Complete Guide

## Problem
The `signature_url` column doesn't exist in the `users` table yet.

## Solution: Run Migrations

We've created migrations to:
1. Add the `signature_url` column
2. Populate it with signature paths

---

## 🚀 For Hostinger (Production)

### Method 1: Via SSH (Recommended)

```bash
cd /home/username/public_html/cpdo_project

# Run migrations
php artisan migrate --force

# Verify
php artisan tinker
>>> \App\Models\User::where('email', 'crisanta@cpdo.com')->first()->signature_url;
```

### Method 2: Via phpMyAdmin

**Step 1: Add Column**
```sql
ALTER TABLE users 
ADD COLUMN signature_url VARCHAR(255) NULL 
AFTER avatar_path;
```

**Step 2: Populate Data**
```sql
UPDATE users SET signature_url = '/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png' WHERE email = 'crisanta@cpdo.com';
UPDATE users SET signature_url = '/images/E-signitures/Jeffrey Paguig.png' WHERE email = 'jeff@cpdo.com';
UPDATE users SET signature_url = '/images/E-signitures/Kay B. Aggarao.png' WHERE email = 'kay@cpdo.com';
UPDATE users SET signature_url = '/images/E-signitures/April U. Cuntapay.png' WHERE email = 'april@cpdo.com';
UPDATE users SET signature_url = '/images/E-signitures/Mary Jane P. Bulauan.png' WHERE email = 'admin@cpdo.com';
```

**Step 3: Verify**
```sql
SELECT name, email, signature_url 
FROM users 
WHERE email IN ('crisanta@cpdo.com', 'jeff@cpdo.com', 'kay@cpdo.com', 'april@cpdo.com', 'admin@cpdo.com');
```

### Method 3: Upload Migration Files

**Upload these files to server:**
```
database/migrations/
├── 2026_09_03_221032_add_signature_url_to_users_table.php
└── 2026_09_03_221100_populate_user_signatures.php
```

Then run via SSH:
```bash
php artisan migrate --force
```

Or create a web-based migrator (see below).

---

## 🏠 For Local (Testing)

If you want to test locally first:

### Step 1: Configure Local Database

**Option A: Change .env temporarily**

Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_local_db_name
DB_USERNAME=root
DB_PASSWORD=
```

**Option B: Create .env.local**

Keep production `.env`, create `.env.local` for testing:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cpdo_local
DB_USERNAME=root
DB_PASSWORD=
```

Use: `php artisan migrate --env=local`

### Step 2: Start MySQL

1. Open XAMPP Control Panel
2. Click "Start" for MySQL

### Step 3: Run Migrations

```powershell
cd C:\xampp\htdocs\cpdo_project
php artisan migrate
```

---

## 📋 Complete Deployment Steps

### For Hostinger Deployment:

**1. Upload Files**
```
Upload to server:
- database/migrations/2026_09_03_221032_add_signature_url_to_users_table.php
- database/migrations/2026_09_03_221100_populate_user_signatures.php
- public/images/E-signitures/*.png (all signature files)
- public/build/ (after npm run build)
```

**2. Run Migrations on Server**

**Via SSH:**
```bash
cd /path/to/cpdo_project
php artisan migrate --force
```

**Via phpMyAdmin:**
```sql
-- Run the SQL from fix-signatures-local.sql
-- (Updated version with ALTER TABLE included)
```

**Via Web Script:**

Create `public/run-migrations.php`:
```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<h1>Running Migrations</h1><pre>";
$kernel->call('migrate', ['--force' => true]);
echo "</pre><p><strong>✅ Done! Delete this file now.</strong></p>";
```

Upload and visit: `https://yourdomain.com/run-migrations.php`  
**Delete after use!**

**3. Verify**
```sql
SELECT name, email, signature_url FROM users WHERE email = 'crisanta@cpdo.com';
```

Should return:
```
name: Crisanta Concepcion
email: crisanta@cpdo.com
signature_url: /images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png
```

**4. Test**
- Login as admin
- Generate certificate
- Signature should appear!

---

## 🔍 Verification Commands

### Check if column exists:
```sql
SHOW COLUMNS FROM users LIKE 'signature_url';
```

### Check signature paths:
```sql
SELECT 
    id,
    name,
    email,
    signature_url,
    CASE 
        WHEN signature_url IS NULL THEN '❌ Missing'
        WHEN signature_url = '' THEN '❌ Empty'
        ELSE '✓ Set'
    END as status
FROM users 
WHERE email IN (
    'crisanta@cpdo.com',
    'jeff@cpdo.com',
    'kay@cpdo.com',
    'april@cpdo.com',
    'admin@cpdo.com'
)
ORDER BY email;
```

### Test signature file accessibility:

Visit in browser:
```
https://yourdomain.com/images/E-signitures/ENGR. CRISANTA D. CONCEPCION, EnP.png
```

Should display the signature image.

---

## 📁 Files Overview

### Migration Files (Already Created)
1. **`2026_09_03_221032_add_signature_url_to_users_table.php`**
   - Adds `signature_url` column to users table

2. **`2026_09_03_221100_populate_user_signatures.php`**
   - Populates signature URLs for all users

### SQL File (Updated)
3. **`fix-signatures-local.sql`**
   - Now includes `ALTER TABLE` to add column
   - Can be run directly in phpMyAdmin

### Commands
4. **`app/Console/Commands/FixSignaturePaths.php`**
   - Artisan command: `php artisan signatures:fix`
   - Use after column exists

---

## ⚠️ Important Notes

1. **Column must exist first** before updating values
2. **Run migrations in order** (they're numbered correctly)
3. **Upload signature images** to server
4. **Clear cache** after changes
5. **Test** before going live

---

## 🎯 Recommended Order

1. ✅ Add `signature_url` column (migration or SQL)
2. ✅ Populate signature paths (migration or SQL)
3. ✅ Upload signature image files
4. ✅ Rebuild frontend: `npm run build`
5. ✅ Upload `public/build/` folder
6. ✅ Clear cache
7. ✅ Test certificate generation

---

## 🆘 Troubleshooting

### "Unknown column 'signature_url'"
→ Column doesn't exist yet. Run migration first.

### "Column 'signature_url' already exists"
→ Column exists. Skip ALTER TABLE, just UPDATE values.

### "Signature still not showing"
→ Check:
- Image files uploaded?
- Database has correct paths?
- Cache cleared?
- Frontend rebuilt?

### "404 on signature image"
→ Upload signature files to `/public/images/E-signitures/`

---

## ✅ Success Criteria

When everything works:

- ✅ `users` table has `signature_url` column
- ✅ All users have signature paths set
- ✅ Image files exist on server
- ✅ Signatures appear in generated certificates
- ✅ PDF downloads include signatures
- ✅ Printed certificates show signatures

---

**Ready to add signatures!** Follow the steps above for your environment (Hostinger or Local). 🚀
