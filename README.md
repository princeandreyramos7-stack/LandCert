# 🏛️ LandCert: Smart Decision Support System

A comprehensive City Planning and Development Office management system with intelligent Decision Support System (DSS) for land certification requests, zoning compliance, payment processing, and administrative workflows.

## 🎯 What's New - DSS Features

### Decision Support System (DSS)
- 🧠 **Automated Zoning Compliance** - Validates requests against zoning laws
- 📊 **Risk Assessment Engine** - Evaluates environmental, safety, infrastructure, and land-use risks
- 🎯 **Smart Recommendations** - AI-powered approve/deny/review suggestions
- 📈 **Scoring System** - Compliance (0-100) and Risk (0-100) scores
- 📋 **Detailed Reports** - Comprehensive evaluation with violations and warnings

### GIS Map Integration
- 🗺️ **Interactive Google Maps** - Full map integration with property plotting
- 🎨 **Zoning Visualization** - Color-coded zones (Residential, Commercial, Industrial, etc.)
- 📍 **Property Markers** - Clickable markers with detailed information
- 🏷️ **Zone Legend** - Visual legend showing all zoning classifications

### Automated Validation
- ✅ Lot area compliance checks
- ✅ Land use verification
- ✅ Building height validation
- ✅ Distance restrictions (schools, hospitals, etc.)
- ✅ Environmental compliance
- ✅ Setback requirements

## 🚀 Quick Start

### Standard Installation
```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
```

### 🆕 DSS Setup (One Command)
```bash
php artisan landcert:setup-dss
npm run build
```

Or use setup scripts:
```bash
# Linux/Mac
./setup-landcert-dss.sh

# Windows PowerShell
.\setup-landcert-dss.ps1
```

### Configure Google Maps
Add to `.env`:
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

Add to `resources/views/app.blade.php` in `<head>`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key={{ env('GOOGLE_MAPS_API_KEY') }}&libraries=places"></script>
```

### Development
```bash
# Start Laravel server
php artisan serve

# Start Vite dev server (in another terminal)
npm run dev
```

### Access
- **URL**: http://localhost:8000
- **Admin Panel**: /admin/dashboard
- **GIS Map**: /admin/zoning-map
- **Payments**: /admin/payments

### Test Accounts
- **Admin**: admin@cpdo.com / password
- **Regular User**: user@cpdo.com / password

## ✨ Features

### Core Features
- 📋 Request Management
- 💰 Payment Processing
- 👥 User Management
- 📜 Certificate Generation
- 📧 Email Notifications
- 📊 Audit Logs
- 🚀 Performance Optimized

### 🆕 DSS Features (February 2025)
- 🧠 **Decision Support System**
  - Automated zoning compliance checks
  - Risk assessment (8 risk factors)
  - Compliance scoring (0-100)
  - Risk scoring (0-100)
  - AI-powered recommendations

- 🗺️ **GIS Integration**
  - Interactive Google Maps
  - Property location plotting
  - Zoning area visualization
  - 7 pre-configured zones

- ⚡ **Automated Validation**
  - Lot area checks
  - Land use verification
  - Building height validation
  - Distance restrictions
  - Environmental compliance

### Previous Updates (November 2025)
- 🔔 **Real-time Notifications System**
  - Database-backed persistent notifications
  - Unread count tracking
  - Automatic notifications for all events
  
- ✅ **Payment Verification with Bulk Actions**
  - Single-click payment approval
  - Bulk verify multiple payments
  - Integrated into payments page
  - Automatic certificate generation

## 📚 Documentation

### Main Documentation
- **SYSTEM_DOCUMENTATION.md** - Complete system documentation
- **SYSTEM_ANALYSIS_REPORT.md** - System analysis and performance

## 🛠️ Tech Stack

- Laravel 12
- React 18 + Inertia.js
- Tailwind CSS + shadcn/ui
- MySQL

## 📝 Useful Commands

```bash
# Performance test
php artisan performance:test

# Test audit logs
php artisan test:audit-log

# Clear caches
php artisan cache:clear

# Run queue worker
php artisan queue:work
```

## 📞 Support

For detailed documentation, troubleshooting, and configuration, see **SYSTEM_DOCUMENTATION.md**.

---

**Status**: Production Ready ✅


## 📚 DSS Documentation

Comprehensive documentation for the Decision Support System:

- **[Quick Start Guide](LANDCERT_QUICK_START.md)** - Get up and running in 5 minutes
- **[Implementation Guide](LANDCERT_DSS_IMPLEMENTATION.md)** - Detailed technical documentation
- **[System Architecture](LANDCERT_ARCHITECTURE.md)** - Architecture and design patterns
- **[System Flow Diagrams](SYSTEM_FLOW_DIAGRAM.md)** - Visual flow diagrams
- **[Summary](LANDCERT_SUMMARY.md)** - Complete feature overview

## 🗺️ Pre-configured Zoning Rules

| Code | Name | Type | Min Lot | Max Height |
|------|------|------|---------|------------|
| R1 | Low Density Residential | residential | 200 sqm | 10m |
| R2 | Medium Density Residential | residential | 100 sqm | 15m |
| C1 | Neighborhood Commercial | commercial | 50 sqm | 20m |
| C2 | General Commercial | commercial | 100 sqm | 40m |
| I1 | Light Industrial | industrial | 500 sqm | 15m |
| A1 | Agricultural Zone | agricultural | 1000 sqm | 8m |
| MX1 | Mixed Use Zone | mixed | 150 sqm | 25m |

## 🎯 Risk Factors

8 pre-configured risk factors across 4 categories:
- **Environmental**: Flood prone, fault line, steep slope
- **Safety**: Near industrial zone
- **Infrastructure**: Traffic, water supply, road access
- **Land Use**: Land use conflicts

## 🔧 DSS Usage

### Create Property Location
```php
use App\Models\PropertyLocation;

PropertyLocation::create([
    'request_id' => $request->id,
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'address' => '123 Main St, Manila',
    'lot_area' => 250.00,
    'zoning_rule_id' => 1,
]);
```

### Run DSS Evaluation
```php
use App\Services\DecisionSupportService;

$dssService = app(DecisionSupportService::class);
$evaluation = $dssService->evaluateRequest($request, $propertyLocation);

// Results
echo $evaluation->recommendation;    // approve, deny, review_required
echo $evaluation->compliance_score;  // 0-100
echo $evaluation->risk_score;        // 0-100
```

### View Results
Navigate to: `/admin/dss-evaluation/{evaluationId}`

## 🛠️ Technology Stack

- **Backend**: Laravel 11, PHP 8.2+
- **Frontend**: React 18, Inertia.js, Tailwind CSS
- **Database**: MySQL 8.0+ / PostgreSQL 14+
- **Maps**: Google Maps JavaScript API
- **UI**: shadcn/ui components
- **Build**: Vite

## 📊 System Architecture

```
Frontend (React + Inertia)
    ↓
Backend (Laravel)
    ↓
Database (MySQL/PostgreSQL)
    ↓
External Services (Google Maps, Email, SMS)
```

## 🚀 What's Next?

Future enhancements (Phase 2):
- SMS notifications (Twilio)
- Advanced GIS (polygon drawing)
- Document OCR
- Mobile application
- Machine learning predictions
- Real-time collaboration
- Public application portal

## 🤝 Contributing

This is a city planning office management system. For contributions or customizations, please follow Laravel and React best practices.

## 📝 License

Proprietary - City Planning and Development Office

---

**LandCert** - Intelligent Decision Support for City Planning 🏛️
