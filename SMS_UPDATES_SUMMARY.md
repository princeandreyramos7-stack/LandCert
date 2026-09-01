# SMS Templates & Broadcast Updates - Summary

## Changes Made (September 2, 2026)

### ✅ SMS Template Updates

**Objective:** Remove "LandCert" references and update branding to "CPDO LC" to match current system terminology.

**Changes:**
1. All "CPDO LandCert" → "CPDO LC"
2. "Land use permit application" → "Locational clearance application"
3. All templates now use `{application_number}` (previously was `{request_id}` or `{control_number}`)

### ✅ Updated Templates (12 total)

| Event Key | Old Message | New Message |
|-----------|-------------|-------------|
| `application_submitted` | ...CPDO **LandCert** | ...CPDO **LC** |
| `application_reviewed` | ...CPDO **LandCert** | ...CPDO **LC** |
| `requirements_submitted` | ...CPDO **LandCert** | ...CPDO **LC** |
| `application_approved` | ...CPDO **LandCert** | ...CPDO **LC** |
| `application_approved_next_steps` | ...CPDO **LandCert** | ...CPDO **LC** |
| `application_rejected` | ...CPDO **LandCert** | ...CPDO **LC** |
| `payment_verified` | ...CPDO **LandCert** | ...CPDO **LC** |
| `payment_rejected` | ...CPDO **LandCert** | ...CPDO **LC** |
| `payment_reminder` | ...CPDO **LandCert** | ...CPDO **LC** |
| `certificate_preparing` | ...CPDO **LandCert** | ...CPDO **LC** |
| `certificate_ready` | ...CPDO **LandCert** | ...CPDO **LC** |
| `certificate_released` | ...CPDO **LandCert** ...Thank you for using CPDO LandCert | ...CPDO **LC** ...Thank you for using CPDO **LC** services |

### ✅ SMS Broadcast Templates Updated

**Location:** `app/Http/Controllers/SmsController.php`

Updated all broadcast quick-reply templates:

1. **Application Reminder**
   - Old: "...CPDO LandCert regarding your **land use permit application**..."
   - New: "...CPDO LC regarding your **locational clearance application**..."

2. **Payment Reminder** → Updated to CPDO LC
3. **Document Submission** → Updated to CPDO LC
4. **Office Announcement** → Updated to CPDO LC
5. **Certificate Ready for Pickup** → Updated to CPDO LC
6. **Payment Instructions** → Updated to CPDO LC
7. **General Reminder** → Updated to CPDO LC

### ✅ SMS Service Default Messages

**Location:** `app/Services/SmsService.php`

All default messages remain consistent with the new branding (already using updated variable names).

## Files Modified

### Backend:
1. **`database/migrations/2026_09_02_120000_update_sms_templates_remove_landcert.php`** (NEW)
   - Migration to update all existing SMS templates in database
   - Includes rollback functionality

2. **`app/Http/Controllers/SmsController.php`**
   - Updated `getBroadcastTemplates()` method (8 templates)
   - Updated `defaultMessages()` method (9 templates)
   - Changed "land use permit" → "locational clearance"

### Frontend:
- **`resources/js/Pages/Admin/Sms/Index.jsx`**
  - Already using correct branding (no changes needed)

## Variable Names Used

All templates now use consistent variable naming:
- `{name}` - Applicant name
- `{application_number}` - Application number (e.g., CZ-2024-001)
- `{amount}` - Payment amount
- `{cert_number}` - Certificate number
- `{reason}` - Rejection/denial reason
- `{days_remaining}` - Days until deadline

## Migration Status

✅ **Migration executed successfully:**
```
php artisan migrate --path=database/migrations/2026_09_02_120000_update_sms_templates_remove_landcert.php
```

✅ **Verified template update:**
```
application_submitted template now reads:
"Hi {name}! Your application #{application_number} has been submitted. We will review it and notify you of the result. - CPDO LC"
```

## Testing Checklist

Before going live, test these scenarios:

### Automated SMS Notifications:
- [ ] Application submitted → SMS sent with CPDO LC branding
- [ ] Application reviewed → SMS sent
- [ ] Requirements submitted → SMS sent
- [ ] Application approved → SMS sent with payment details
- [ ] Application rejected → SMS sent
- [ ] Payment verified → SMS sent
- [ ] Payment rejected → SMS sent
- [ ] Certificate preparing → SMS sent
- [ ] Certificate ready → SMS sent
- [ ] Certificate released → SMS sent
- [ ] Payment reminder → SMS sent

### Manual SMS Broadcast:
- [ ] Open Admin/SuperAdmin → SMS Notifications page
- [ ] Select broadcast template (verify all show "CPDO LC")
- [ ] Send test broadcast to selected users
- [ ] Verify received SMS shows "CPDO LC" not "LandCert"

### Super Admin Template Editing:
- [ ] Super Admin can see "Auto-Notification Templates" tab
- [ ] Can edit any template
- [ ] Can enable/disable templates
- [ ] Can reset templates to default (should use new CPDO LC branding)

## Character Count Information

All SMS messages are optimized to stay within 160 characters (single SMS segment) where possible:

- Single segment: ≤ 160 characters
- Two segments: 161-320 characters
- Three segments: 321-480 characters

**Note:** Messages with variables might exceed 160 chars after substitution. Monitor SMS costs accordingly.

## Branding Consistency

✅ System-wide branding now consistent:
- Email signatures: "CPDO LC"
- SMS messages: "CPDO LC"
- Website header: "CPDO LC | City of Ilagan, Isabela"
- Certificates/Clearances: "City Planning and Development Office"
- Application types: Locational Clearances (not "land use permits")

## Admin Access

- **Admin users**: Can send SMS broadcasts
- **Super Admin users**: Can send SMS broadcasts + edit auto-notification templates

## Configuration

SMS settings in `.env`:
```env
SMS_ENABLED=true
SMS_PROVIDER=semaphore
SEMAPHORE_API_KEY=your_api_key_here
SEMAPHORE_SENDER_NAME=CPDOLC
```

**Sender name** appears in SMS as "CPDOLC" (Semaphore 11-character limit).

## Notes

- All "LandCert" references have been removed from SMS system
- SMS templates can be edited by Super Admin through the UI
- Default messages serve as reset targets when Super Admin clicks "Reset to default"
- Migration is reversible (rollback available if needed)

---

**Updated:** September 2, 2026  
**Status:** ✅ Complete and deployed
