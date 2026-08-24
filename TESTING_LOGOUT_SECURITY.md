# Logout Security Testing Checklist

## Required Behavior After Implementation

After logout, the authentication flow must be:

```
LOGIN 
  ↓
AUTHENTICATED ACCOUNT/DASHBOARD
  ↓
LOGOUT
  ↓
SESSION INVALIDATED
  ↓
LANDING PAGE
  ↓
User clicks browser BACK button
  ↓
LOGIN PAGE ✓
```

**NEVER:**
```
LOGIN 
  ↓
DASHBOARD
  ↓
LOGOUT
  ↓
LANDING PAGE
  ↓
Browser BACK
  ↓
DASHBOARD ❌
```

---

## Test Cases

### ✅ Test 1: Normal Logout
**Steps:**
1. Login with valid credentials
2. Navigate to dashboard
3. Click logout button
4. Verify redirect to landing page (/)

**Expected Result:**
- User is logged out successfully
- Session is invalidated
- User is redirected to landing page

---

### ✅ Test 2: Browser Back Button After Logout
**Steps:**
1. Login → Dashboard
2. Click Logout → Landing Page
3. Click browser Back button (←)

**Expected Result:**
- Browser attempts to show previous page
- Server detects invalid session
- User is redirected to `/login`
- User **CANNOT** see dashboard or any authenticated content

---

### ✅ Test 3: Direct URL Access After Logout
**Steps:**
1. Login successfully
2. Note the dashboard URL (e.g., `/admin/dashboard` or `/dashboard`)
3. Logout
4. Manually type the dashboard URL in browser address bar
5. Press Enter

**Expected Result:**
- Server checks authentication
- Session is invalid
- User is redirected to `/login`

---

### ✅ Test 4: Browser Refresh After Back Button
**Steps:**
1. Login → Dashboard
2. Logout → Landing Page
3. Click browser Back button
4. Press F5 or Ctrl+R to refresh

**Expected Result:**
- Even if browser briefly shows cached page
- Refresh triggers server request
- Server detects invalid session
- User is redirected to `/login`

---

### ✅ Test 5: Protected Application Pages
**Steps:**
1. Login
2. Navigate to various protected pages:
   - `/dashboard`
   - `/applications`
   - `/admin/dashboard`
   - `/super-admin/dashboard`
   - `/profile`
   - `/my-applications`
3. Logout
4. Try to access each URL directly or via browser Back

**Expected Result:**
- All protected routes require authentication
- Accessing any protected route redirects to `/login`

---

### ✅ Test 6: Browser Forward Button
**Steps:**
1. Login → Dashboard
2. Navigate to another protected page (e.g., `/applications`)
3. Logout → Landing Page
4. Click browser Back button (should redirect to login)
5. Click browser Forward button (→)

**Expected Result:**
- Forward button does not restore authenticated session
- Server checks authentication
- User is redirected to `/login`

---

### ✅ Test 7: Multiple Browser Tabs
**Steps:**
1. Open browser Tab 1 → Login → Dashboard
2. Open browser Tab 2 → Same account shows dashboard
3. In Tab 1: Logout
4. In Tab 2: Try to navigate or refresh

**Expected Result:**
- Tab 2 session is also invalidated (shared session)
- Any action in Tab 2 redirects to `/login`

---

### ✅ Test 8: Login Again After Logout
**Steps:**
1. Login → Dashboard → Logout
2. Click browser Back (redirects to login)
3. Login again with valid credentials

**Expected Result:**
- New session is created
- User is redirected to dashboard
- New session works normally
- Previous session remains invalidated

---

### ✅ Test 9: Different User Types
**Test for each role:**
- **Applicant** → `/dashboard`
- **Admin** → `/admin/dashboard`
- **Super Admin** → `/super-admin/dashboard`

**Steps (for each role):**
1. Login as role
2. Access role's dashboard
3. Logout
4. Browser Back button

**Expected Result:**
- All roles properly log out
- Browser Back redirects to `/login` for all roles
- No role can access protected pages after logout

---

### ✅ Test 10: Browser Cache Headers
**Steps:**
1. Login → Dashboard
2. Open browser DevTools → Network tab
3. Check response headers for dashboard page

**Expected Headers:**
```
Cache-Control: no-store, no-cache, must-revalidate, max-age=0
Pragma: no-cache
Expires: Sat, 01 Jan 2000 00:00:00 GMT
```

**Expected Result:**
- Response headers prevent browser caching
- No authenticated page is stored in browser cache

---

### ✅ Test 11: Session Cookies After Logout
**Steps:**
1. Login
2. Open browser DevTools → Application tab → Cookies
3. Note the cookies (laravel_session, XSRF-TOKEN, etc.)
4. Logout
5. Check cookies again

**Expected Result:**
- Session cookies are cleared or invalidated
- New session ID generated for guest user

---

### ✅ Test 12: Logout Request Validation
**Steps:**
1. Login
2. Open browser DevTools → Network tab
3. Click logout
4. Examine the `/logout` POST request

**Expected Result:**
- POST request to `/logout`
- Response: 302 redirect to `/`
- Session invalidated server-side
- Response headers include no-cache directives

---

## Security Requirements Checklist

- [x] **Session Invalidation**: `$request->session()->invalidate()`
- [x] **Token Regeneration**: `$request->session()->regenerateToken()`
- [x] **Session Flush**: `$request->session()->flush()`
- [x] **Auth Logout**: `Auth::guard('web')->logout()`
- [x] **Cache-Control Headers**: Prevent browser caching
- [x] **Authentication Middleware**: Protect all authenticated routes
- [x] **PreventBackHistory Middleware**: Enforce auth on every request
- [x] **Client-Side State Clearing**: Logout handlers clear state
- [x] **Full Page Reload After Logout**: Force clean state
- [x] **Inertia Compatibility**: Works with Inertia.js navigation

---

## Browser Testing

Test on multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

---

## Known Good Behavior

✅ **User can refresh authenticated pages while logged in**
✅ **Session persists across page reloads (while authenticated)**
✅ **Normal browser navigation works (while authenticated)**
✅ **After logout, no authenticated page is accessible**
✅ **Browser Back after logout redirects to login**
✅ **New login creates new session properly**

---

## Testing Commands

```bash
# Clear all caches before testing
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Restart the development server
# (Ctrl+C to stop, then restart)
php artisan serve
```

---

## Debugging

If tests fail, check:

1. **Session Configuration** (`config/session.php`):
   - Driver (file, database, redis)
   - Lifetime
   - Secure cookies (for HTTPS)

2. **Middleware Order** (`bootstrap/app.php`):
   - HandleInertiaRequests
   - NoCacheHeaders
   - PreventBackHistory

3. **Routes** (`routes/web.php`):
   - All authenticated routes use `auth` middleware
   - All authenticated routes use `prevent.back` middleware

4. **Browser Cache**:
   - Clear browser cache completely
   - Test in Incognito/Private mode

5. **Server Logs**:
   - Check `storage/logs/laravel.log` for errors
   - Check session files in `storage/framework/sessions`

---

## Success Criteria

The implementation is successful when:

✅ All 12 test cases pass
✅ Browser Back button after logout redirects to login
✅ No authenticated page is accessible after logout
✅ Direct URL access to protected routes redirects to login
✅ Session is properly invalidated server-side
✅ Cache headers prevent browser caching
✅ Works across all major browsers
✅ Works for all user roles (applicant, admin, super_admin)
