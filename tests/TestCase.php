<?php

namespace Tests;

use App\Events\TwoFactorCodeIssued;
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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;

abstract class TestCase extends BaseTestCase
{
    /**
     * Signs a user in through the real routes - password, then the texted
     * code - the way a browser does. Event::fake() here only intercepts
     * TwoFactorCodeIssued (to read the code a phone would have shown);
     * every other event, including whatever the caller's own test listens
     * for, still fires normally. Returns the response to the code, i.e. the
     * one that actually finishes the sign-in.
     */
    protected function loginThroughTwoFactor(string $email, string $password): TestResponse
    {
        Event::fake([TwoFactorCodeIssued::class]);

        $this->post('/login', ['email' => $email, 'password' => $password]);

        $code = null;
        Event::assertDispatched(TwoFactorCodeIssued::class, function ($event) use (&$code) {
            $code = $event->code;
            return true;
        });

        return $this->post('/two-factor-challenge', ['code' => $code]);
    }

    /**
     * A small but structurally real PDF - not the empty stand-in
     * UploadedFile::fake()->create() produces when given an integer size (it
     * writes no bytes at all) - so it passes ReadableDocument's integrity
     * check the way a genuine upload would. Padded with trailing zeroes to
     * roughly the requested size; nothing in this suite checks the byte
     * count precisely.
     */
    protected function fakePdf(string $name = 'document.pdf', int $kilobytes = 40): UploadedFile
    {
        $pdf = "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
        $content = str_pad($pdf, max(strlen($pdf), $kilobytes * 1024), '0');

        return UploadedFile::fake()->createWithContent($name, $content);
    }

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

    /**
     * The five address fields a submission needs, pointing at Alibagu,
     * City of Ilagan.
     *
     * Only the three PSGC rows that address runs through are inserted, not the
     * country's 42,000 barangays: a test that merely has to file an
     * application should not pay for the whole reference list. Tests that are
     * *about* the address seed PsgcSeeder properly (PhilippineAddressTest).
     */
    protected function addressFields(string $prefix = 'applicant_address'): array
    {
        DB::table('psgc_provinces')->insertOrIgnore([
            'code' => '023100000', 'name' => 'Isabela', 'region_code' => '020000000',
            'region_name' => 'Cagayan Valley', 'kind' => 'province',
        ]);
        DB::table('psgc_cities_municipalities')->insertOrIgnore([
            'code' => '023114000', 'name' => 'City of Ilagan', 'province_code' => '023100000', 'is_city' => true,
        ]);
        DB::table('psgc_barangays')->insertOrIgnore([
            'code' => '023114006', 'name' => 'Alibagu', 'city_code' => '023114000',
        ]);

        return [
            "{$prefix}_region_code" => '020000000',
            "{$prefix}_province_code" => '023100000',
            "{$prefix}_city_code" => '023114000',
            "{$prefix}_barangay_code" => '023114006',
            "{$prefix}_street" => '1 Test Street',
        ];
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
