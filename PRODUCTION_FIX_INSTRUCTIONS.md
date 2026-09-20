# Production Dropdown Fix Instructions

## Problem
The 3-dot dropdown menu works in testing/dev mode but not in production (built version).

## Root Cause
Browser is caching the old JavaScript files. The new build with the fix exists but isn't being loaded.

## ✅ Build Status
- **Build completed:** 34.95 seconds
- **Fix verified in:** `ApplicationsBoard-BdP-ILf5.js`
- **Z-index fix:** ✓ Present (z-[9999])
- **Status:** Ready to deploy

---

## Solution Steps

### Step 1: Clear Browser Cache (IMPORTANT!)

#### Chrome/Edge:
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"
5. **OR** Hard refresh: `Ctrl + Shift + R` or `Ctrl + F5`

#### Firefox:
1. Press `Ctrl + Shift + Delete`
2. Check "Cache"
3. Click "Clear Now"
4. **OR** Hard refresh: `Ctrl + Shift + R`

### Step 2: Verify Cache Headers (Optional)

Open browser DevTools (F12) → Network tab → Reload page
Check if JS files show:
- Status: `200` (not `304 Not Modified`)
- Size: actual size (not "from cache")

### Step 3: Force New Assets Load

Add this to your `.htaccess` file to prevent caching during development:

```apache
# Prevent caching of built assets during development
<IfModule mod_headers.c>
    <FilesMatch "\.(js|css)$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires 0
    </FilesMatch>
</IfModule>
```

**Note:** Remove this in production to allow proper caching!

---

## Alternative: Update Asset Hash

Laravel/Vite automatically generates new filenames with hashes on each build:
- Old: `ApplicationsBoard-BmVKwwIW.js`
- New: `ApplicationsBoard-BdP-ILf5.js`

This means browsers **should** load the new file automatically. If not:

### Check Laravel Mix/Vite Configuration

Verify `vite.config.js` has version hashing enabled (it does by default):

```js
export default defineConfig({
    build: {
        manifest: true,
        rollupOptions: {
            // Hash is automatic
        }
    }
});
```

---

## Verification Steps

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Hard refresh** (`Ctrl + Shift + R`)
4. **Find:** `ApplicationsBoard-BdP-ILf5.js` (new hash)
5. **Check:** File size should be ~19.45 kB
6. **Verify:** Status should be `200` (not cached)

### Test the Dropdown

1. Navigate to **"All Applications"**
2. Find any application row
3. Click the **3-dot button** in the "Actions" column
4. **Expected:** Dropdown menu appears with:
   - "View Application"
   - "Document Verification"

---

## Still Not Working?

### Check 1: Verify Build Files Deployed

```bash
# Check if new files exist
ls -la public/build/assets/ApplicationsBoard-*.js

# Should show: ApplicationsBoard-BdP-ILf5.js
```

### Check 2: Server Cache

If using a server-side cache (Redis, Memcached), clear it:

```bash
php artisan cache:clear
php artisan view:clear
php artisan config:clear
```

### Check 3: CDN/Proxy Cache

If using Cloudflare or similar CDN:
1. Log in to CDN dashboard
2. Purge all caches
3. Wait 2-3 minutes
4. Hard refresh browser

### Check 4: Verify Manifest

```bash
cat public/build/manifest.json | grep ApplicationsBoard
```

Should show the new hash: `BdP-ILf5`

---

## Production Deployment Checklist

When deploying to production server:

1. ✅ Upload all files from `public/build/` directory
2. ✅ Upload new `manifest.json`
3. ✅ Clear server-side caches
4. ✅ Purge CDN cache (if applicable)
5. ✅ Hard refresh browser
6. ✅ Test in incognito/private window

---

## Technical Details

### What Changed

**File:** `resources/js/Components/Applications/ApplicationsTable.jsx`  
**Line:** ~147-154

**Before:**
```jsx
className="z-[100] min-w-[200px]"
```

**After:**
```jsx
className="z-[9999] min-w-[200px] bg-white shadow-lg border border-gray-200"
avoidCollisions={true}
collisionPadding={10}
```

### Build Output
- **Time:** 34.95 seconds
- **Chunks:** 176
- **New hash:** `BdP-ILf5`
- **File size:** 19.45 kB (gzipped: 6.28 kB)

---

## Quick Fix Summary

```bash
# 1. Already built (done)
npm run build

# 2. Clear Laravel caches
php artisan optimize:clear

# 3. Hard refresh browser
# Ctrl + Shift + R (Windows/Linux)
# Cmd + Shift + R (Mac)
```

---

## Contact Support

If dropdown still doesn't work after:
- Hard refresh (Ctrl + Shift + R)
- Testing in incognito mode
- Clearing all caches

Check browser console (F12) for JavaScript errors and report them.

---

**Build Date:** September 15, 2026  
**Build Time:** 34.95s  
**Status:** ✅ Fix deployed in build  
**Action Required:** Clear browser cache + hard refresh
