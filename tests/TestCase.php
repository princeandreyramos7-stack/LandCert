<?php

namespace Tests;

use App\Models\Applicant;
use App\Models\Location;
use App\Models\NormalizedProject;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\RequirementDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Storage;

abstract class TestCase extends BaseTestCase
{
    /** A signed-in account of the given kind. */
    protected function userOf(string $type, array $attributes = []): User
    {
        return User::factory()->create(['user_type' => $type] + $attributes);
    }

    /**
     * One complete application on file: applicant, project, location,
     * property, the officer's report, and (from approval on) a verified
     * payment - everything the pages and reports read.
     *
     * $status is the request status; the report's evaluation follows it so
     * the derived status the office sees agrees with it.
     */
    protected function application(User $owner, string $type = 'CZC', string $status = 'approved', ?User $reviewer = null, array $overrides = []): RequestModel
    {
        // One applicant row per account (the column is unique), so a second
        // application for the same owner files under the same applicant.
        $applicant = Applicant::where('user_id', $owner->id)->first()
            ?? Applicant::factory()->create([
                'user_id' => $owner->id,
                'applicant_name' => $overrides['applicant_name'] ?? 'Juan Dela Cruz',
            ]);

        $request = RequestModel::factory()->numbered()->create([
            'user_id' => $owner->id,
            'applicant_id' => $applicant->id,
            'status' => $status,
        ]);

        NormalizedProject::factory()->create([
            'request_id' => $request->id,
            'project_type' => $type,
            'project_nature' => $overrides['project_nature'] ?? 'Sari-sari Store',
            'project_nature_duration' => $overrides['project_nature_duration'] ?? 'Permanent',
            'project_nature_years' => $overrides['project_nature_years'] ?? null,
            'project_cost' => 250000,
        ]);

        Location::factory()->create(['request_id' => $request->id, 'barangay' => 'Alibagu']);

        Property::create([
            'request_id' => $request->id,
            'lot_area_sqm' => 120,
            'lot_number' => 'LOT-1',
            'tax_declaration_no' => 'TD-2026-001',
            'zone_classification' => 'Residential',
            'right_over_land' => 'Owner',
            'existing_land_use' => 'Residential',
        ]);

        $evaluation = match ($status) {
            'pending', 'in_applicant' => 'pending',
            'rejected' => 'rejected',
            'reviewed' => 'reviewed',
            default => 'approved',
        };

        Report::create([
            'request_id' => $request->id,
            'evaluation' => $evaluation,
            'date_reported' => now(),
            'issued_by' => $reviewer?->name,
            'reviewed_by' => $reviewer?->id,
            'payment_amount' => 3289,
        ]);

        if (($overrides['paid'] ?? true) && ($status === 'approved' || in_array($status, RequestModel::CERT_LIFECYCLE_STATUSES, true))) {
            Payment::factory()->verified()->create([
                'request_id' => $request->id,
                'user_id' => $owner->id,
                'amount' => 3289,
                'verified_by' => $reviewer?->id ?? $owner->id,
            ]);
        }

        return $request->fresh(['applicant', 'project', 'location', 'property', 'report', 'payments']);
    }

    /** A requirement scan on file for the application, as an image. */
    protected function requirementScan(RequestModel $request, int $requirementId, string $name): RequirementDocument
    {
        Storage::disk('local')->put(
            $path = "requirement_documents/test_{$request->id}_{$requirementId}.png",
            // A 1x1 PNG.
            base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
        );

        return RequirementDocument::create([
            'request_id' => $request->id,
            'requirement_id' => $requirementId,
            'requirement_name' => $name,
            'file_path' => $path,
            'original_filename' => "{$name}.png",
            'mime_type' => 'image/png',
            'file_size' => 68,
        ]);
    }
}
