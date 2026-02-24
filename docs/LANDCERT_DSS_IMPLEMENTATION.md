# LandCert: Smart Decision Support System Implementation Guide

## Overview
This document outlines the implementation of the LandCert Decision Support System (DSS) for Locational Clearance and Zoning Compliance in City Planning Offices.

## System Architecture

### Backend (Laravel)
```
app/
├── Models/
│   ├── PropertyLocation.php      # Property geographic data
│   ├── ZoningRule.php            # Zoning regulations
│   ├── DssEvaluation.php         # DSS evaluation results
│   └── RiskFactor.php            # Risk assessment factors
├── Services/
│   └── DecisionSupportService.php # Core DSS logic
└── Http/Controllers/
    └── DssController.php          # DSS endpoints
```

### Frontend (React + Inertia.js)
```
resources/js/
├── Components/
│   ├── GIS/
│   │   └── MapView.jsx           # Google Maps integration
│   └── DSS/
│       ├── EvaluationCard.jsx    # Evaluation summary
│       ├── ValidationResults.jsx # Validation checks display
│       └── RiskAssessment.jsx    # Risk factors display
└── Pages/Admin/
    ├── ZoningMap.jsx             # Interactive GIS map
    └── DssEvaluation.jsx         # Evaluation details page
```

### Database Schema
```
zoning_rules              # Zoning regulations
property_locations        # Property geographic data
dss_evaluations          # Evaluation results
risk_factors             # Risk assessment criteria
evaluation_risk_assessments # Junction table
```

## Features Implemented

### 1. Decision Support System (DSS)
- ✅ Auto-check property compliance with zoning laws
- ✅ Suggest approval/denial based on rules
- ✅ Risk scoring (environmental, safety, land-use, infrastructure)
- ✅ AI-generated suggestions for planners

### 2. GIS / Map Integration
- ✅ Interactive map using Google Maps API
- ✅ Plot lot locations using coordinates
- ✅ Highlight zoning areas with color coding
- ✅ Property markers with info windows

### 3. Automated Validation Engine
- ✅ Check land area vs allowed usage
- ✅ Verify building type vs zoning rules
- ✅ Check distance restrictions
- ✅ Environmental compliance checks

### 4. Risk Assessment
- ✅ Multiple risk categories (environmental, safety, infrastructure, land-use)
- ✅ Weighted risk scoring
- ✅ Severity levels (0-10 scale)
- ✅ Risk factor tracking per evaluation

### 5. Analytics & Reporting
- ✅ Compliance score (0-100)
- ✅ Risk score (0-100)
- ✅ Violation tracking
- ✅ Warning system

## Installation Steps

### 1. Run Migrations
```bash
php artisan migrate
```

### 2. Seed Data
```bash
php artisan db:seed --class=ZoningRuleSeeder
php artisan db:seed --class=RiskFactorSeeder
```

### 3. Configure Google Maps API
Add to `.env`:
```env
GOOGLE_MAPS_API_KEY=your_api_key_here
```

Add to `resources/views/app.blade.php` (in `<head>` section):
```html
<script src="https://maps.googleapis.com/maps/api/js?key={{ env('GOOGLE_MAPS_API_KEY') }}&libraries=places"></script>
```

### 4. Install Frontend Dependencies
```bash
npm install
npm run build
```

## Usage Guide

### For Administrators

#### 1. View Zoning Map
Navigate to: `/admin/zoning-map`
- View all properties on interactive map
- Click markers to see property details
- View zoning classifications

#### 2. Evaluate a Request
```php
// In your admin request view, add evaluate button
<form method="POST" action="{{ route('admin.requests.evaluate', $request) }}">
    @csrf
    <button type="submit">Run DSS Evaluation</button>
</form>
```

#### 3. View Evaluation Results
Navigate to: `/admin/dss-evaluation/{evaluationId}`
- See compliance and risk scores
- Review validation checks
- View risk factors
- Read AI suggestions

### For Developers

#### Creating Property Location
```php
use App\Models\PropertyLocation;
use App\Models\Request;

$propertyLocation = PropertyLocation::create([
    'request_id' => $request->id,
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'address' => '123 Main St, Manila',
    'barangay' => 'Barangay 1',
    'district' => 'District 1',
    'zoning_rule_id' => 1, // R1 - Low Density Residential
    'lot_area' => 250.00,
    'lot_number' => 'LOT-001',
    'title_number' => 'TCT-12345',
]);
```

#### Running DSS Evaluation
```php
use App\Services\DecisionSupportService;

$dssService = new DecisionSupportService();
$evaluation = $dssService->evaluateRequest($request, $propertyLocation);

// Access results
echo $evaluation->recommendation; // 'approve', 'deny', or 'review_required'
echo $evaluation->compliance_score; // 0-100
echo $evaluation->risk_score; // 0-100
```

#### Adding Custom Zoning Rules
```php
use App\Models\ZoningRule;

ZoningRule::create([
    'zone_code' => 'R3',
    'zone_name' => 'High Density Residential',
    'zone_type' => 'residential',
    'description' => 'High-rise residential buildings',
    'allowed_uses' => ['apartment', 'condo', 'mixed_use'],
    'min_lot_area' => 500.00,
    'max_building_height' => 50.00,
    'max_floor_area_ratio' => 5.00,
    'min_setback_front' => 6.00,
    'min_setback_rear' => 4.00,
    'min_setback_side' => 3.00,
    'distance_restrictions' => [
        'school' => 100,
        'hospital' => 50,
    ],
    'is_active' => true,
]);
```

#### Adding Risk Factors
```php
use App\Models\RiskFactor;

RiskFactor::create([
    'factor_name' => 'Landslide Prone Area',
    'category' => 'environmental',
    'description' => 'Property in landslide-prone zone',
    'weight' => 9,
    'criteria' => ['slope' => '>45%', 'soil_type' => 'unstable'],
    'is_active' => true,
]);
```

## Validation Rules

### Lot Area Validation
```php
// Checks if lot area is within zoning rule limits
if ($lotArea < $zoningRule->min_lot_area) {
    // VIOLATION: Lot too small
}
if ($lotArea > $zoningRule->max_lot_area) {
    // VIOLATION: Lot too large
}
```

### Land Use Validation
```php
// Checks if proposed use is allowed in zone
if (!in_array($proposedUse, $zoningRule->allowed_uses)) {
    // VIOLATION: Use not allowed
}
```

### Distance Restrictions
```php
// Checks minimum distance to POIs
foreach ($zoningRule->distance_restrictions as $poi => $minDistance) {
    $actualDistance = calculateDistance($property, $poi);
    if ($actualDistance < $minDistance) {
        // VIOLATION: Too close to {$poi}
    }
}
```

## Scoring Algorithm

### Compliance Score
```
Compliance Score = (Passed Checks / Total Checks) × 100
```

### Risk Score
```
Risk Score = (Total Risk Severity / Max Possible Risk) × 100
```

### Recommendation Logic
```
if (hasCriticalViolations) {
    return 'deny';
}
if (complianceScore >= 80 && riskScore <= 30) {
    return 'approve';
}
if (complianceScore >= 60 && riskScore <= 50) {
    return 'review_required';
}
return 'deny';
```

## API Endpoints

### Evaluate Request
```
POST /admin/requests/{request}/evaluate
Response: Redirects with evaluation data
```

### View Evaluation
```
GET /admin/dss-evaluation/{evaluation}
Response: Inertia page with evaluation details
```

### Zoning Map
```
GET /admin/zoning-map
Response: Inertia page with map and properties
```

## Customization

### Modify Validation Logic
Edit `app/Services/DecisionSupportService.php`:
```php
protected function runValidationChecks(...) {
    // Add your custom checks here
    $checks['custom_check'] = [
        'passed' => $yourCondition,
        'message' => 'Your message',
        'severity' => 'critical|high|medium|low',
    ];
    return $checks;
}
```

### Add New Risk Categories
```php
// In migration or seeder
'category' => 'your_category', // environmental, safety, land_use, infrastructure
```

### Customize Map Markers
Edit `resources/js/Components/GIS/MapView.jsx`:
```javascript
const getMarkerIcon = (zoneType) => {
    return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: yourColor,
        scale: yourSize,
    };
};
```

## Next Steps

### Phase 2 Features (Not Yet Implemented)
1. **SMS Notifications** - Integrate Twilio for SMS alerts
2. **Advanced GIS** - Polygon drawing for property boundaries
3. **Document OCR** - Auto-extract data from uploaded documents
4. **Workflow Automation** - Multi-step approval process
5. **Mobile App** - React Native mobile application
6. **Real-time Collaboration** - WebSocket for live updates
7. **Advanced Analytics** - Predictive analytics dashboard
8. **Integration APIs** - Connect with external government systems

### Recommended Enhancements
1. Add actual POI database for distance calculations
2. Integrate with environmental database for real checks
3. Implement machine learning for better recommendations
4. Add historical data analysis
5. Create public-facing application portal
6. Implement digital signature for certificates
7. Add multi-language support
8. Create mobile-responsive design improvements

## Testing

### Test DSS Evaluation
```bash
php artisan tinker

$request = App\Models\Request::first();
$location = App\Models\PropertyLocation::create([
    'request_id' => $request->id,
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'address' => 'Test Address',
    'lot_area' => 250,
    'zoning_rule_id' => 1,
]);

$service = new App\Services\DecisionSupportService();
$evaluation = $service->evaluateRequest($request, $location);

echo "Recommendation: " . $evaluation->recommendation;
echo "Compliance: " . $evaluation->compliance_score;
echo "Risk: " . $evaluation->risk_score;
```

## Troubleshooting

### Google Maps Not Loading
- Check API key in `.env`
- Verify API key has Maps JavaScript API enabled
- Check browser console for errors

### Evaluation Fails
- Ensure property has zoning_rule_id assigned
- Check that zoning rule exists and is active
- Verify all required fields are present

### Risk Factors Not Showing
- Run RiskFactorSeeder
- Check is_active = true
- Verify risk factors are being attached in evaluation

## Support & Documentation

For questions or issues:
1. Check this documentation
2. Review code comments in DecisionSupportService.php
3. Check Laravel logs: `storage/logs/laravel.log`
4. Review browser console for frontend errors

## License
This implementation is part of the LandCert system.
