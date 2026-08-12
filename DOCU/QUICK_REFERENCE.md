# Database Quick Reference Card

**Version**: 3.0 (Normalized)  
**Last Updated**: August 3, 2026

---

## 📊 Database Overview

- **Total Tables**: 26 (13 business + 13 system)
- **Structure**: 3NF Normalized
- **Status**: Production Ready ✅

---

## 🗂️ Core Business Tables (13)

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `users` | Authentication | → applicants, requests |
| `applicants` | Applicant info | → corporations, reps, requests |
| `normalized_corporations` | Corporate entities | ← applicants |
| `representatives` | Authorized reps | ← applicants |
| `requests` | Applications | ← applicants, → project, property, location |
| `normalized_projects` | Project details | ← requests |
| `properties` | Property info | ← requests |
| `locations` | Address data | ← requests |
| `reports` | Evaluations | ← requests |
| `payments` | Payment tracking | ← requests |
| `certificates` | Cert management | ← requests |
| `notifications` | User alerts | ← users |
| `audit_logs` | Activity log | ← users |

---

## 🔗 Key Relationships

```
users (1:1) → applicants
applicants (1:*) → requests
applicants (1:1) → normalized_corporations
applicants (1:*) → representatives
requests (1:1) → normalized_projects
requests (1:1) → properties
requests (1:1) → locations
requests (1:*) → reports
requests (1:*) → payments
requests (1:1) → certificates
```

---

## 💻 Common Queries

### Get Request with All Relations
```php
$request = Request::with([
    'applicant',
    'applicant.corporation',
    'applicant.representatives',
    'project',
    'property',
    'location',
    'payments',
    'certificates'
])->find($id);
```

### Create New Request
```php
$applicant = Applicant::create([...]);
$request = Request::create(['applicant_id' => $applicant->id]);
NormalizedProject::create(['request_id' => $request->id]);
Property::create(['request_id' => $request->id]);
Location::create(['request_id' => $request->id]);
```

### Get Applicant Requests
```php
$applicant = Applicant::with('requests')->find($id);
$requests = $applicant->requests;
```

---

## 📝 Model Files

- `app/Models/Applicant.php`
- `app/Models/NormalizedCorporation.php`
- `app/Models/Representative.php`
- `app/Models/NormalizedProject.php`
- `app/Models/Property.php`
- `app/Models/Location.php`

---

## 🚀 Quick Commands

### Migrations
```bash
php artisan migrate:status        # Check migration status
php artisan migrate               # Run pending migrations
php artisan migrate:rollback      # Rollback last batch
```

### Cache
```bash
php artisan optimize:clear        # Clear all caches
php artisan cache:clear          # Clear application cache
php artisan config:clear         # Clear config cache
```

### Database
```bash
php artisan db:show              # Show database info
php artisan tinker               # Database REPL
```

---

## 📚 Documentation Files

1. **ERD_NORMALIZED_NO_DSS_GIS.md** - Complete ERD
2. **RUN_DATABASE_NORMALIZATION.md** - Implementation guide
3. **DATABASE_NORMALIZATION_COMPLETE.md** - Completion report
4. **DATABASE_NORMALIZATION_SUMMARY.md** - Quick summary
5. **UNUSED_TABLES_DROPPED.md** - Cleanup report
6. **FINAL_DATABASE_STATUS.md** - Final status
7. **QUICK_REFERENCE.md** - This file

---

## ⚠️ Removed Features

- ❌ DSS (Decision Support System)
- ❌ GIS (Geographic Information System)
- ❌ Online Payment Gateway
- ❌ Digital Certificate Download

---

## ✅ Current Features

- ✅ Manual application review
- ✅ Physical payment receipt upload
- ✅ Physical certificate tracking
- ✅ Text-based location data
- ✅ Normalized database structure
- ✅ Role-based access control
- ✅ Audit logging
- ✅ Email notifications

---

## 🎯 Status

**Production Ready**: YES ✅  
**Tested**: YES ✅  
**Documented**: YES ✅  
**Backward Compatible**: YES ✅

---

*For detailed information, see the full documentation files.*
