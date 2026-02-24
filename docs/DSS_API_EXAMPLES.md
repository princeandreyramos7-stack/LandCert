# LandCert DSS - API Examples & Code Snippets

This document provides practical examples for using the LandCert Decision Support System.

## Table of Contents
1. [Property Location Management](#property-location-management)
2. [DSS Evaluation](#dss-evaluation)
3. [Zoning Rules](#zoning-rules)
4. [Risk Factors](#risk-factors)
5. [Frontend Integration](#frontend-integration)

---

## Property Location Management

### Create Property Location

```php
use App\Models\PropertyLocation;
use App\Models\Request;

// Basic property location
$propertyLocation = PropertyLocation::create([
    'request_id' => 1,
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'address' => '123 Main Street, Barangay Centro',
    'barangay' => 'Centro',
    'district' => 'District 1',
    'zoning_rule_id' => 1, // R1 - Low Density Residential
    'lot_area' => 250.00,
    'lot_number' => 'LOT-2024-001',
    'title_number' => 'TCT-12345',
]);

// With boundaries (polygon coordinates)
$propertyLocation = PropertyLocation::create([
    'request_id' => 1,
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'address' => '456 Commercial Ave',
    'lot_area' => 500.00,
    'zoning_rule_id' => 3, // C1 - Neighborhood Commercial
    'boundaries' => [
        ['lat' => 14.5995, 'lng' => 120.9842],
        ['lat' => 14.5996, 'lng' => 120.9842],
        ['lat' => 14.5996, 'lng' => 120.9843],
        ['lat' => 14.5995, 'lng' => 120.9843],
    ],
]);
```

### Query Property Locations

```php
// Get all properties with zoning rules
$properties = PropertyLocation::with('zoningRule')->get();

// Get properties in specific zone
$residentialProperties = PropertyLocation::whereHas('zoningRule', function($query) {
    $query->where('zone_type', 'residential');
})->get();

// Get properties by barangay
$barangayProperties = PropertyLocation::where('barangay', 'Centro')->get();

// Get property with full relationships
$property = PropertyLocation::with([
    'request',
    'zoningRule',
    'dssEvaluations.riskFactors'
])->find(1);
```

### Update Property Location

```php
$propertyLocation = PropertyLocation::find(1);
$propertyLocation->update([
    'zoning_rule_id' => 2, // Change to R2
    'lot_area' => 300.00,
]);
```

---

## DSS Evaluation

### Run Evaluation

```php
use App\Services\DecisionSupportService;
use App\Models\Request;
use App\Models\PropertyLocation;

// Get the service
$dssService = app(DecisionSupportService::class);

// Get request and property
$request = Request::find(1);
$propertyLocation = $request->propertyLocation;

// Run evaluation
try {
    $evaluation = $dssService->evaluateRequest($request, $propertyLocation);
    
    echo "Recommendation: " . $evaluation->recommendation;
    echo "Compliance Score: " . $evaluation->compliance_score;
    echo "Risk Score: " . $evaluation->risk_score;
    
} catch (\Exception $e) {
    echo "Evaluation failed: " . $e->getMessage();
}
```

### Access Evaluation Results

```php
use App\Models\DssEvaluation;

// Get evaluation with relationships
$evaluation = DssEvaluation::with([
    'request',
    'propertyLocation.zoningRule',
    'riskFactors',
    'evaluatedBy'
])->find(1);

// Check recommendation
if ($evaluation->isApprovalRecommended()) {
    echo "DSS recommends approval";
}

// Get violations
if ($evaluation->hasViolations()) {
    foreach ($evaluation->violations as $violation) {
        echo "Violation: " . $violation['message'];
        echo "Severity: " . $violation['severity'];
    }
}

// Get validation results
$validationResults = $evaluation->validation_results;
foreach ($validationResults as $check => $result) {
    echo "$check: " . ($result['passed'] ? 'PASS' : 'FAIL');
    echo " - " . $result['message'];
}

// Get risk factors
foreach ($evaluation->riskFactors as $risk) {
    if ($risk->pivot->is_present) {
        echo "Risk: " . $risk->factor_name;
        echo "Severity: " . $risk->pivot->severity . "/10";
        echo "Category: " . $risk->category;
    }
}
```

### Query Evaluations

```php
// Get all evaluations for a request
$evaluations = DssEvaluation::where('request_id', 1)
    ->orderBy('created_at', 'desc')
    ->get();

// Get latest evaluation
$latestEvaluation = DssEvaluation::where('request_id', 1)
    ->latest()
    ->first();

// Get evaluations by recommendation
$approvedEvaluations = DssEvaluation::where('recommendation', 'approve')->get();
$deniedEvaluations = DssEvaluation::where('recommendation', 'deny')->get();

// Get evaluations with high compliance
$highCompliance = DssEvaluation::where('compliance_score', '>=', 80)->get();

// Get evaluations with high risk
$highRisk = DssEvaluation::where('risk_score', '>=', 70)->get();

// Statistics
$avgCompliance = DssEvaluation::avg('compliance_score');
$avgRisk = DssEvaluation::avg('risk_score');
$approvalRate = DssEvaluation::where('recommendation', 'approve')->count() / 
                DssEvaluation::count() * 100;
```

---

## Zoning Rules

### Create Zoning Rule

```php
use App\Models\ZoningRule;

$zoningRule = ZoningRule::create([
    'zone_code' => 'R3',
    'zone_name' => 'High Density Residential',
    'zone_type' => 'residential',
    'description' => 'High-rise residential buildings and condominiums',
    'allowed_uses' => [
        'apartment',
        'condominium',
        'townhouse',
        'mixed_use',
        'retail',
        'office'
    ],
    'min_lot_area' => 500.00,
    'max_lot_area' => null,
    'max_building_height' => 50.00,
    'max_floor_area_ratio' => 5.00,
    'min_setback_front' => 6.00,
    'min_setback_rear' => 4.00,
    'min_setback_side' => 3.00,
    'distance_restrictions' => [
        'school' => 100,
        'hospital' => 50,
        'fire_station' => 200,
    ],
    'environmental_restrictions' => [
        'flood_prone' => false,
        'fault_line' => false,
        'requires_ecc' => true, // Environmental Compliance Certificate
    ],
    'is_active' => true,
]);
```

### Query Zoning Rules

```php
// Get all active zones
$activeZones = ZoningRule::where('is_active', true)->get();

// Get by zone type
$residentialZones = ZoningRule::where('zone_type', 'residential')->get();
$commercialZones = ZoningRule::where('zone_type', 'commercial')->get();

// Get by zone code
$zone = ZoningRule::where('zone_code', 'R1')->first();

// Check if use is allowed
$zone = ZoningRule::find(1);
if ($zone->isAllowedUse('single_family')) {
    echo "Single family homes are allowed";
}

// Validate lot area
if ($zone->validateLotArea(250.00)) {
    echo "Lot area is compliant";
}
```

### Update Zoning Rule

```php
$zone = ZoningRule::where('zone_code', 'R1')->first();
$zone->update([
    'max_building_height' => 12.00, // Increase height limit
    'allowed_uses' => array_merge($zone->allowed_uses, ['home_office']),
]);
```

---

## Risk Factors

### Create Risk Factor

```php
use App\Models\RiskFactor;

$riskFactor = RiskFactor::create([
    'factor_name' => 'Coastal Erosion Risk',
    'category' => 'environmental',
    'description' => 'Property located in coastal erosion zone',
    'weight' => 8,
    'criteria' => [
        'distance_to_coast' => '<100m',
        'elevation' => '<5m',
        'erosion_rate' => '>1m/year',
    ],
    'is_active' => true,
]);
```

### Query Risk Factors

```php
// Get all active risk factors
$activeRisks = RiskFactor::where('is_active', true)->get();

// Get by category
$environmentalRisks = RiskFactor::where('category', 'environmental')->get();
$safetyRisks = RiskFactor::where('category', 'safety')->get();

// Get high-weight risks
$criticalRisks = RiskFactor::where('weight', '>=', 8)->get();

// Get risks for an evaluation
$evaluation = DssEvaluation::find(1);
$detectedRisks = $evaluation->riskFactors()
    ->wherePivot('is_present', true)
    ->get();
```

---

## Frontend Integration

### React Component - Property Location Form

```jsx
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PropertyLocationForm({ request, zoningRules }) {
    const { data, setData, post, processing, errors } = useForm({
        request_id: request.id,
        latitude: '',
        longitude: '',
        address: '',
        lot_area: '',
        zoning_rule_id: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.property-locations.store'));
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input
                type="number"
                step="0.00000001"
                value={data.latitude}
                onChange={(e) => setData('latitude', e.target.value)}
                placeholder="Latitude"
            />
            <Input
                type="number"
                step="0.00000001"
                value={data.longitude}
                onChange={(e) => setData('longitude', e.target.value)}
                placeholder="Longitude"
            />
            <Button type="submit" disabled={processing}>
                Save Location
            </Button>
        </form>
    );
}
```

### React Component - Run Evaluation

```jsx
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';

export default function EvaluateButton({ request }) {
    const handleEvaluate = () => {
        router.post(route('admin.requests.evaluate', request.id), {}, {
            onSuccess: (page) => {
                // Redirect to evaluation page
                if (page.props.evaluation) {
                    router.visit(route('admin.dss-evaluation.show', page.props.evaluation.id));
                }
            },
        });
    };

    return (
        <Button onClick={handleEvaluate}>
            <Brain className="w-4 h-4 mr-2" />
            Run DSS Evaluation
        </Button>
    );
}
```

### React Component - Display Evaluation

```jsx
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export default function EvaluationDisplay({ evaluation }) {
    const getRecommendationColor = (recommendation) => {
        const colors = {
            approve: 'bg-green-500',
            deny: 'bg-red-500',
            review_required: 'bg-yellow-500',
        };
        return colors[recommendation] || 'bg-gray-500';
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Evaluation Results</h3>
                <Badge className={getRecommendationColor(evaluation.recommendation)}>
                    {evaluation.recommendation.toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">Compliance Score</p>
                    <p className="text-3xl font-bold">{evaluation.compliance_score}</p>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <p className="text-3xl font-bold">{evaluation.risk_score}</p>
                </div>
            </div>

            {evaluation.violations && evaluation.violations.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-red-600 mb-2">Violations</h4>
                    <ul className="space-y-1">
                        {evaluation.violations.map((violation, index) => (
                            <li key={index} className="text-sm text-red-600">
                                • {violation.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Card>
    );
}
```

---

## Controller Examples

### Property Location Controller

```php
namespace App\Http\Controllers;

use App\Models\PropertyLocation;
use App\Models\ZoningRule;
use Illuminate\Http\Request;

class PropertyLocationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'request_id' => 'required|exists:requests,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'required|string|max:255',
            'barangay' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'zoning_rule_id' => 'required|exists:zoning_rules,id',
            'lot_area' => 'required|numeric|min:0',
            'lot_number' => 'nullable|string|max:50',
            'title_number' => 'nullable|string|max:50',
        ]);

        $propertyLocation = PropertyLocation::create($validated);

        return back()->with('success', 'Property location added successfully');
    }
}
```

### DSS Controller

```php
namespace App\Http\Controllers;

use App\Models\Request;
use App\Services\DecisionSupportService;
use Inertia\Inertia;

class DssController extends Controller
{
    public function evaluate(Request $httpRequest, \App\Models\Request $request)
    {
        $propertyLocation = $request->propertyLocation;

        if (!$propertyLocation) {
            return back()->with('error', 'Property location required');
        }

        $dssService = app(DecisionSupportService::class);
        
        try {
            $evaluation = $dssService->evaluateRequest($request, $propertyLocation);
            
            return redirect()
                ->route('admin.dss-evaluation.show', $evaluation)
                ->with('success', 'Evaluation completed');
                
        } catch (\Exception $e) {
            return back()->with('error', 'Evaluation failed: ' . $e->getMessage());
        }
    }

    public function show(\App\Models\DssEvaluation $evaluation)
    {
        $evaluation->load([
            'request',
            'propertyLocation.zoningRule',
            'riskFactors',
            'evaluatedBy'
        ]);

        return Inertia::render('Admin/DssEvaluation', [
            'evaluation' => $evaluation,
        ]);
    }
}
```

---

## Testing Examples

### Feature Test

```php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Request;
use App\Models\PropertyLocation;
use App\Models\ZoningRule;
use App\Services\DecisionSupportService;

class DssEvaluationTest extends TestCase
{
    public function test_can_create_property_location()
    {
        $user = User::factory()->create();
        $request = Request::factory()->create(['user_id' => $user->id]);
        $zone = ZoningRule::factory()->create();

        $response = $this->actingAs($user)->post(route('admin.property-locations.store'), [
            'request_id' => $request->id,
            'latitude' => 14.5995,
            'longitude' => 120.9842,
            'address' => 'Test Address',
            'lot_area' => 250,
            'zoning_rule_id' => $zone->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('property_locations', [
            'request_id' => $request->id,
            'latitude' => 14.5995,
        ]);
    }

    public function test_dss_evaluation_runs_successfully()
    {
        $request = Request::factory()->create();
        $zone = ZoningRule::factory()->create();
        $propertyLocation = PropertyLocation::factory()->create([
            'request_id' => $request->id,
            'zoning_rule_id' => $zone->id,
        ]);

        $dssService = app(DecisionSupportService::class);
        $evaluation = $dssService->evaluateRequest($request, $propertyLocation);

        $this->assertNotNull($evaluation);
        $this->assertContains($evaluation->recommendation, ['approve', 'deny', 'review_required']);
        $this->assertGreaterThanOrEqual(0, $evaluation->compliance_score);
        $this->assertLessThanOrEqual(100, $evaluation->compliance_score);
    }
}
```

---

## Artisan Commands

### Custom Command Example

```php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Request;
use App\Services\DecisionSupportService;

class EvaluateAllPendingRequests extends Command
{
    protected $signature = 'dss:evaluate-pending';
    protected $description = 'Run DSS evaluation on all pending requests';

    public function handle()
    {
        $requests = Request::where('status', 'pending')
            ->whereHas('propertyLocation')
            ->get();

        $this->info("Found {$requests->count()} pending requests");

        $dssService = app(DecisionSupportService::class);

        foreach ($requests as $request) {
            try {
                $evaluation = $dssService->evaluateRequest($request, $request->propertyLocation);
                $this->info("Evaluated request #{$request->id}: {$evaluation->recommendation}");
            } catch (\Exception $e) {
                $this->error("Failed to evaluate request #{$request->id}: {$e->getMessage()}");
            }
        }

        $this->info('Evaluation complete!');
    }
}
```

---

## Useful Queries

### Analytics Queries

```php
// Approval rate by zone type
$approvalRates = DB::table('dss_evaluations')
    ->join('property_locations', 'dss_evaluations.property_location_id', '=', 'property_locations.id')
    ->join('zoning_rules', 'property_locations.zoning_rule_id', '=', 'zoning_rules.id')
    ->select('zoning_rules.zone_type', 
        DB::raw('COUNT(*) as total'),
        DB::raw('SUM(CASE WHEN recommendation = "approve" THEN 1 ELSE 0 END) as approved'))
    ->groupBy('zoning_rules.zone_type')
    ->get();

// Most common violations
$commonViolations = DssEvaluation::whereNotNull('violations')
    ->get()
    ->flatMap(function($eval) {
        return collect($eval->violations)->pluck('type');
    })
    ->countBy()
    ->sortDesc();

// Average scores by month
$monthlyScores = DssEvaluation::selectRaw('
        YEAR(created_at) as year,
        MONTH(created_at) as month,
        AVG(compliance_score) as avg_compliance,
        AVG(risk_score) as avg_risk
    ')
    ->groupBy('year', 'month')
    ->orderBy('year', 'desc')
    ->orderBy('month', 'desc')
    ->get();
```

---

This document provides comprehensive examples for working with the LandCert DSS. For more information, see the full documentation files.
