<?php

namespace App\Services;

use App\Models\DssEvaluation;
use App\Models\PropertyLocation;
use App\Models\Request;
use App\Models\RiskFactor;
use App\Models\ZoningRule;
use Illuminate\Support\Facades\DB;

class DecisionSupportService
{
    public function evaluateRequest(Request $request, PropertyLocation $propertyLocation): DssEvaluation
    {
        $zoningRule = $propertyLocation->zoningRule;
        
        if (!$zoningRule) {
            throw new \Exception('No zoning rule assigned to property location');
        }

        $validationResults = $this->runValidationChecks($request, $propertyLocation, $zoningRule);
        $riskAssessment = $this->assessRisks($propertyLocation, $validationResults);
        
        $complianceScore = $this->calculateComplianceScore($validationResults);
        $riskScore = $this->calculateRiskScore($riskAssessment);
        
        $recommendation = $this->generateRecommendation($complianceScore, $riskScore, $validationResults);
        
        $evaluation = DssEvaluation::create([
            'request_id' => $request->id,
            'property_location_id' => $propertyLocation->id,
            'recommendation' => $recommendation,
            'compliance_score' => $complianceScore,
            'risk_score' => $riskScore,
            'validation_results' => $validationResults,
            'violations' => $this->extractViolations($validationResults),
            'warnings' => $this->extractWarnings($validationResults),
            'ai_suggestion' => $this->generateAISuggestion($validationResults, $riskAssessment),
            'evaluated_at' => now(),
        ]);

        // Attach risk factors
        foreach ($riskAssessment as $riskId => $assessment) {
            $evaluation->riskFactors()->attach($riskId, [
                'is_present' => $assessment['is_present'],
                'severity' => $assessment['severity'],
                'notes' => $assessment['notes'] ?? null,
            ]);
        }

        return $evaluation;
    }

    protected function runValidationChecks(Request $request, PropertyLocation $propertyLocation, ZoningRule $zoningRule): array
    {
        $checks = [];

        // Check 1: Lot Area Compliance
        $checks['lot_area'] = [
            'passed' => $zoningRule->validateLotArea($propertyLocation->lot_area),
            'message' => $this->getLotAreaMessage($propertyLocation->lot_area, $zoningRule),
            'severity' => 'critical',
        ];

        // Check 2: Land Use Compliance
        $proposedUse = $request->land_use ?? 'unknown';
        $checks['land_use'] = [
            'passed' => $zoningRule->isAllowedUse($proposedUse),
            'message' => $zoningRule->isAllowedUse($proposedUse) 
                ? "Land use '{$proposedUse}' is allowed in {$zoningRule->zone_name}"
                : "Land use '{$proposedUse}' is NOT allowed in {$zoningRule->zone_name}",
            'severity' => 'critical',
        ];

        // Check 3: Building Height (if applicable)
        if ($request->building_height && $zoningRule->max_building_height) {
            $checks['building_height'] = [
                'passed' => $request->building_height <= $zoningRule->max_building_height,
                'message' => $request->building_height <= $zoningRule->max_building_height
                    ? "Building height complies with maximum {$zoningRule->max_building_height}m"
                    : "Building height {$request->building_height}m exceeds maximum {$zoningRule->max_building_height}m",
                'severity' => 'high',
            ];
        }

        // Check 4: Distance Restrictions
        $distanceChecks = $this->checkDistanceRestrictions($propertyLocation, $zoningRule);
        $checks['distance_restrictions'] = $distanceChecks;

        // Check 5: Environmental Restrictions
        $envChecks = $this->checkEnvironmentalRestrictions($propertyLocation, $zoningRule);
        $checks['environmental'] = $envChecks;

        return $checks;
    }

    protected function checkDistanceRestrictions(PropertyLocation $propertyLocation, ZoningRule $zoningRule): array
    {
        $restrictions = $zoningRule->distance_restrictions ?? [];
        $results = ['passed' => true, 'checks' => []];

        foreach ($restrictions as $type => $minDistance) {
            // In production, you'd query actual POI database
            // For now, we'll simulate the check
            $actualDistance = $this->calculateDistanceToNearestPOI($propertyLocation, $type);
            
            $passed = $actualDistance >= $minDistance;
            $results['checks'][$type] = [
                'passed' => $passed,
                'required_distance' => $minDistance,
                'actual_distance' => $actualDistance,
                'message' => $passed 
                    ? "Property is {$actualDistance}m from nearest {$type} (required: {$minDistance}m)"
                    : "Property is only {$actualDistance}m from nearest {$type} (required: {$minDistance}m)",
            ];

            if (!$passed) {
                $results['passed'] = false;
            }
        }

        $results['severity'] = $results['passed'] ? 'low' : 'high';
        return $results;
    }

    protected function checkEnvironmentalRestrictions(PropertyLocation $propertyLocation, ZoningRule $zoningRule): array
    {
        $restrictions = $zoningRule->environmental_restrictions ?? [];
        $results = ['passed' => true, 'checks' => []];

        foreach ($restrictions as $restriction => $value) {
            // Simulate environmental checks
            $passed = $this->checkEnvironmentalFactor($propertyLocation, $restriction, $value);
            
            $results['checks'][$restriction] = [
                'passed' => $passed,
                'message' => $passed 
                    ? "Environmental check '{$restriction}' passed"
                    : "Environmental concern: {$restriction}",
            ];

            if (!$passed) {
                $results['passed'] = false;
            }
        }

        $results['severity'] = $results['passed'] ? 'low' : 'medium';
        return $results;
    }

    protected function assessRisks(PropertyLocation $propertyLocation, array $validationResults): array
    {
        $riskFactors = RiskFactor::where('is_active', true)->get();
        $assessment = [];

        foreach ($riskFactors as $factor) {
            $isPresent = $this->evaluateRiskFactor($factor, $propertyLocation, $validationResults);
            $severity = $isPresent ? $this->calculateRiskSeverity($factor, $validationResults) : 0;

            $assessment[$factor->id] = [
                'is_present' => $isPresent,
                'severity' => $severity,
                'notes' => $isPresent ? "Risk factor '{$factor->factor_name}' detected" : null,
            ];
        }

        return $assessment;
    }

    protected function calculateComplianceScore(array $validationResults): int
    {
        $totalChecks = 0;
        $passedChecks = 0;

        foreach ($validationResults as $check) {
            if (isset($check['passed'])) {
                $totalChecks++;
                if ($check['passed']) {
                    $passedChecks++;
                }
            } elseif (isset($check['checks'])) {
                foreach ($check['checks'] as $subCheck) {
                    $totalChecks++;
                    if ($subCheck['passed']) {
                        $passedChecks++;
                    }
                }
            }
        }

        return $totalChecks > 0 ? (int) (($passedChecks / $totalChecks) * 100) : 0;
    }

    protected function calculateRiskScore(array $riskAssessment): int
    {
        $totalRisk = 0;
        $maxPossibleRisk = 0;

        foreach ($riskAssessment as $assessment) {
            $maxPossibleRisk += 10;
            if ($assessment['is_present']) {
                $totalRisk += $assessment['severity'];
            }
        }

        return $maxPossibleRisk > 0 ? (int) (($totalRisk / $maxPossibleRisk) * 100) : 0;
    }

    protected function generateRecommendation(int $complianceScore, int $riskScore, array $validationResults): string
    {
        $hasCriticalViolations = $this->hasCriticalViolations($validationResults);

        if ($hasCriticalViolations) {
            return 'deny';
        }

        if ($complianceScore >= 80 && $riskScore <= 30) {
            return 'approve';
        }

        if ($complianceScore >= 60 && $riskScore <= 50) {
            return 'review_required';
        }

        return 'deny';
    }

    protected function extractViolations(array $validationResults): array
    {
        $violations = [];

        foreach ($validationResults as $key => $check) {
            if (isset($check['passed']) && !$check['passed'] && in_array($check['severity'] ?? '', ['critical', 'high'])) {
                $violations[] = [
                    'type' => $key,
                    'message' => $check['message'],
                    'severity' => $check['severity'],
                ];
            } elseif (isset($check['checks'])) {
                foreach ($check['checks'] as $subKey => $subCheck) {
                    if (!$subCheck['passed']) {
                        $violations[] = [
                            'type' => "{$key}.{$subKey}",
                            'message' => $subCheck['message'],
                            'severity' => $check['severity'] ?? 'medium',
                        ];
                    }
                }
            }
        }

        return $violations;
    }

    protected function extractWarnings(array $validationResults): array
    {
        $warnings = [];

        foreach ($validationResults as $key => $check) {
            if (isset($check['passed']) && !$check['passed'] && $check['severity'] === 'medium') {
                $warnings[] = [
                    'type' => $key,
                    'message' => $check['message'],
                ];
            }
        }

        return $warnings;
    }

    protected function generateAISuggestion(array $validationResults, array $riskAssessment): string
    {
        $violations = $this->extractViolations($validationResults);
        $warnings = $this->extractWarnings($validationResults);

        if (empty($violations) && empty($warnings)) {
            return "Application meets all zoning requirements. Recommend approval.";
        }

        $suggestion = "Based on automated analysis:\n\n";

        if (!empty($violations)) {
            $suggestion .= "Critical Issues:\n";
            foreach ($violations as $violation) {
                $suggestion .= "- {$violation['message']}\n";
            }
        }

        if (!empty($warnings)) {
            $suggestion .= "\nWarnings:\n";
            foreach ($warnings as $warning) {
                $suggestion .= "- {$warning['message']}\n";
            }
        }

        $suggestion .= "\nRecommendation: Manual review required by planning officer.";

        return $suggestion;
    }

    // Helper methods (simplified for demo)
    protected function getLotAreaMessage(float $lotArea, ZoningRule $zoningRule): string
    {
        if ($zoningRule->min_lot_area && $lotArea < $zoningRule->min_lot_area) {
            return "Lot area {$lotArea}sqm is below minimum {$zoningRule->min_lot_area}sqm";
        }
        if ($zoningRule->max_lot_area && $lotArea > $zoningRule->max_lot_area) {
            return "Lot area {$lotArea}sqm exceeds maximum {$zoningRule->max_lot_area}sqm";
        }
        return "Lot area {$lotArea}sqm complies with zoning requirements";
    }

    protected function calculateDistanceToNearestPOI(PropertyLocation $location, string $type): float
    {
        // Simulate distance calculation - in production, query actual POI database
        return rand(50, 500);
    }

    protected function checkEnvironmentalFactor(PropertyLocation $location, string $factor, $value): bool
    {
        // Simulate environmental check - in production, integrate with environmental database
        return rand(0, 1) === 1;
    }

    protected function evaluateRiskFactor(RiskFactor $factor, PropertyLocation $location, array $validationResults): bool
    {
        // Simplified risk evaluation - in production, implement complex criteria matching
        return rand(0, 3) === 0; // 25% chance of risk
    }

    protected function calculateRiskSeverity(RiskFactor $factor, array $validationResults): int
    {
        return min(10, $factor->weight * rand(1, 3));
    }

    protected function hasCriticalViolations(array $validationResults): bool
    {
        foreach ($validationResults as $check) {
            if (isset($check['passed']) && !$check['passed'] && $check['severity'] === 'critical') {
                return true;
            }
        }
        return false;
    }
}
