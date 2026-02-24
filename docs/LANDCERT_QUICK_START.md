# LandCert DSS - Quick Start Guide

## What's New?

Your existing Laravel application has been upgraded with a complete Decision Support System (DSS) for zoning compliance and locational clearance processing.

## New Features Added

### 1. **Decision Support System (DSS)**
- Automated zoning compliance checks
- Risk assessment scoring
- AI-powered recommendations
- Compliance scoring (0-100)

### 2. **GIS Map Integration**
- Interactive Google Maps
- Property location plotting
- Zoning area visualization
- Color-coded zone markers

### 3. **Automated Validation**
- Lot area compliance
- Land use verification
- Distance restrictions
- Environmental checks

### 4. **Risk Assessment**
- 8 pre-configured risk factors
- Environmental, safety, infrastructure, and land-use categories
- Weighted severity scoring
- Detailed risk reports

## Quick Setup (5 Minutes)

### Option 1: Using Artisan Command (Recommended)
```bash
php artisan landcert:setup-dss
npm run build
```

### Option 2: Using Setup Script

**Linux/Mac:**
```bash
chmod +x setup-landcert-dss.sh
./setup-landcert-dss.sh
```

**Windows PowerShell:**
```powershell
.\setup-landcert-dss.ps1
```

### Option 3: Manual Setup
```bash
# 1. Run migrations
php artisan migrate

# 2. Seed data
php artisan db:seed --class=ZoningRuleSeeder
php artisan db:seed --class=RiskFactorSeeder

# 3. Build frontend
npm run build
```

## Configure Google Maps

### 1. Get API Key
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Enable "Maps JavaScript API"
- Create API key

### 2. Add to .env
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Add Script to Layout
Edit `resources/views/app.blade.php`, add in `<head>`:
```html
<script src="https://maps.googleapis.com/maps/api/js?key={{ env('GOOGLE_MAPS_API_KEY') }}&libraries=places"></script>
```

## Using the System

### View Zoning Map
1. Login as admin
2. Navigate to `/admin/zoning-map`
3. View properties and zoning areas

### Create Property Location
```php
use App\Models\PropertyLocation;

PropertyLocation::create([
    'request_id' => 1,
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'address' => '123 Main St, Manila',
    'barangay' => 'Barangay 1',
    'lot_area' => 250.00,
    'zoning_rule_id' => 1, // R1 zone
]);
```

### Run DSS Evaluation
```php
use App\Services\DecisionSupportService;

$dssService = app(DecisionSupportService::class);
$evaluation = $dssService->evaluateRequest($request, $propertyLocation);

// Results
echo $evaluation->recommendation; // approve, deny, review_required
echo $evaluation->compliance_score; // 0-100
echo $evaluation->risk_score; // 0-100
```

### View Evaluation Results
Navigate to: `/admin/dss-evaluation/{evaluationId}`

## Pre-configured Zoning Rules

| Code | Name | Type | Min Lot Area | Max Height |
|------|------|------|--------------|------------|
| R1 | Low Density Residential | residential | 200 sqm | 10m |
| R2 | Medium Density Residential | residential | 100 sqm | 15m |
| C1 | Neighborhood Commercial | commercial | 50 sqm | 20m |
| C2 | General Commercial | commercial | 100 sqm | 40m |
| I1 | Light Industrial | industrial | 500 sqm | 15m |
| A1 | Agricultural Zone | agricultural | 1000 sqm | 8m |
| MX1 | Mixed Use Zone | mixed | 150 sqm | 25m |

## Pre-configured Risk Factors

1. **Flood Prone Area** (Environmental, Weight: 9)
2. **Near Fault Line** (Environmental, Weight: 10)
3. **Traffic Congestion** (Infrastructure, Weight: 5)
4. **Inadequate Water Supply** (Infrastructure, Weight: 7)
5. **Near Industrial Zone** (Safety, Weight: 6)
6. **Land Use Conflict** (Land Use, Weight: 8)
7. **Steep Slope** (Environmental, Weight: 7)
8. **Limited Road Access** (Infrastructure, Weight: 6)

## Testing the System

### Test in Tinker
```bash
php artisan tinker
```

```php
// Create test property
$request = App\Models\Request::first();
$location = App\Models\PropertyLocation::create([
    'request_id' => $request->id,
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'address' => 'Test Property',
    'lot_area' => 250,
    'zoning_rule_id' => 1,
]);

// Run evaluation
$service = new App\Services\DecisionSupportService();
$evaluation = $service->evaluateRequest($request, $location);

// View results
$evaluation->recommendation;
$evaluation->compliance_score;
$evaluation->risk_score;
$evaluation->violations;
```

## New Routes

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/admin/zoning-map` | Interactive GIS map |
| POST | `/admin/requests/{id}/evaluate` | Run DSS evaluation |
| GET | `/admin/dss-evaluation/{id}` | View evaluation details |

## File Structure

```
New Files Created:
├── app/
│   ├── Models/
│   │   ├── PropertyLocation.php
│   │   ├── ZoningRule.php
│   │   ├── DssEvaluation.php
│   │   └── RiskFactor.php
│   ├── Services/
│   │   └── DecisionSupportService.php
│   ├── Http/Controllers/
│   │   └── DssController.php
│   └── Console/Commands/
│       └── SetupLandCertDss.php
├── database/
│   ├── migrations/
│   │   └── 2025_02_24_000001_create_zoning_tables.php
│   └── seeders/
│       ├── ZoningRuleSeeder.php
│       └── RiskFactorSeeder.php
├── resources/js/
│   ├── Components/
│   │   ├── GIS/
│   │   │   └── MapView.jsx
│   │   └── DSS/
│   │       ├── EvaluationCard.jsx
│   │       ├── ValidationResults.jsx
│   │       └── RiskAssessment.jsx
│   └── Pages/Admin/
│       ├── ZoningMap.jsx
│       └── DssEvaluation.jsx
└── Documentation/
    ├── LANDCERT_DSS_IMPLEMENTATION.md
    └── LANDCERT_QUICK_START.md (this file)
```

## Common Issues

### Google Maps Not Loading
- Check API key in `.env`
- Verify Maps JavaScript API is enabled
- Check browser console for errors

### Evaluation Fails
- Ensure property has `zoning_rule_id`
- Check zoning rule exists and `is_active = true`
- Verify request has required fields

### No Risk Factors Showing
- Run: `php artisan db:seed --class=RiskFactorSeeder`
- Check `is_active = true` in database

## Next Steps

1. ✅ Setup complete
2. ✅ Configure Google Maps
3. ✅ Test with sample data
4. 📝 Customize zoning rules for your city
5. 📝 Add more risk factors
6. 📝 Integrate with existing request workflow
7. 📝 Train staff on new features

## Need Help?

- Read: `LANDCERT_DSS_IMPLEMENTATION.md` for detailed docs
- Check: `storage/logs/laravel.log` for errors
- Review: Code comments in `DecisionSupportService.php`

## What's NOT Included (Future Phases)

- SMS notifications (Twilio integration needed)
- Polygon drawing for boundaries
- Document OCR
- Mobile app
- Real-time collaboration
- Advanced ML predictions
- Public application portal

These can be added in future development phases.

---

**Congratulations!** Your LandCert system now has intelligent decision support capabilities. 🎉
