<?php

namespace App\Http\Controllers;

use App\Models\DssEvaluation;
use App\Models\PropertyLocation;
use App\Models\Request;
use App\Models\ZoningRule;
use App\Services\DecisionSupportService;
use Illuminate\Http\Request as HttpRequest;
use Inertia\Inertia;

class DssController extends Controller
{
    protected DecisionSupportService $dssService;

    public function __construct(DecisionSupportService $dssService)
    {
        $this->dssService = $dssService;
    }

    public function evaluate(HttpRequest $httpRequest, Request $request)
    {
        $propertyLocation = $request->propertyLocation;

        if (!$propertyLocation) {
            return back()->with('error', 'Property location not found');
        }

        try {
            $evaluation = $this->dssService->evaluateRequest($request, $propertyLocation);

            return back()->with('success', 'DSS evaluation completed')
                ->with('evaluation', $evaluation);
        } catch (\Exception $e) {
            return back()->with('error', 'Evaluation failed: ' . $e->getMessage());
        }
    }

    public function show(DssEvaluation $evaluation)
    {
        $evaluation->load(['request', 'propertyLocation.zoningRule', 'riskFactors', 'evaluatedBy']);

        return Inertia::render('Admin/DssEvaluation', [
            'evaluation' => $evaluation,
        ]);
    }

    public function zoningMap()
    {
        $zoningRules = ZoningRule::where('is_active', true)->get();
        $properties = PropertyLocation::with(['request', 'zoningRule'])->get();

        return Inertia::render('Admin/ZoningMap', [
            'zoningRules' => $zoningRules,
            'properties' => $properties,
        ]);
    }

    public function addProperty()
    {
        $zoningRules = ZoningRule::where('is_active', true)->get();
        
        // Get requests that don't have property locations yet
        $requests = Request::whereDoesntHave('propertyLocation')
            ->select('id', 'applicant_name', 'project_location_barangay', 'project_location_number', 
                     'project_location_street', 'project_location_municipality', 'project_location_province', 
                     'lot_area_sqm', 'existing_land_use')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/AddProperty', [
            'zoningRules' => $zoningRules,
            'requests' => $requests,
        ]);
    }

    public function storeProperty(HttpRequest $httpRequest)
    {
        $validated = $httpRequest->validate([
            'request_id' => 'nullable|exists:requests,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'required|string|max:500',
            'barangay' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'zoning_rule_id' => 'nullable|exists:zoning_rules,id',
            'lot_area' => 'required|numeric|min:0',
            'lot_number' => 'nullable|string|max:255',
            'title_number' => 'nullable|string|max:255',
        ]);

        PropertyLocation::create($validated);

        return redirect()->route('admin.zoning-map')->with('success', 'Property added successfully!');
    }
}
