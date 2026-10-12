<?php

namespace App\Support;

use App\Models\RequirementDocument;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * What the application wizard (resources/js/Components/Request_form) makes
 * the applicant fill in before it lets them file, held to on the server as
 * well - RequestController::store() and ::update().
 *
 * Until this existed the server took the wizard's word for it: every field
 * past the applicant's name and address was nullable, so a request made by
 * hand, an old cached page or a script error could file an application with
 * no project, no location and no documents - one the office could never
 * process. Nothing here is stricter than the wizard: these are exactly its
 * required fields (utils.jsx validateStep2/3) and required documents (the
 * `requirements` list in index.jsx, where the notarized application form is
 * deliberately left for later), per application type.
 */
class ApplicationSubmission
{
    /**
     * Documents the wizard requires before filing, by requirement id.
     * A Zoning Certification has its own short set; every other type -
     * including "I'm not sure", which files with no type - uses the main one.
     */
    public const REQUIRED_DOCUMENTS = [
        'ZC' => [
            1 => '1. Title',
            2 => '2. Tax Declaration',
            3 => '3. VICINITY MAP',
            4 => '4. Latest Tax Receipt',
            5 => '5. Sketch Plan with signature of Geodetic Engr.',
        ],
        'default' => [
            13 => 'Title (Right Over Land Documentation)',
            14 => 'Tax Declaration (Right Over Land Documentation)',
            15 => 'Tax Receipt (Right Over Land Documentation)',
            3 => '3. VICINITY MAP',
            4 => '4. SITE DEVELOPMENT PLAN',
            5 => '5. ESTIMATED PROJECT COST / BILL OF MATERIALS',
            12 => '6. Barangay Clearance',
        ],
    ];

    public static function isZoningCertification(?string $type): bool
    {
        return strtoupper(trim((string) $type)) === 'ZC';
    }

    /**
     * The wizard's required project and land-use fields (steps 2 and 3),
     * which a Zoning Certification skips. Municipality and province are not
     * here: the form sends them fixed (City of Ilagan, Isabela).
     */
    public static function requiredFieldRules(Request $request): array
    {
        if (self::isZoningCertification($request->input('project_type'))) {
            return [];
        }

        return [
            'project_nature' => 'required',
            'project_location_street' => 'required',
            'project_location_barangay' => 'required',
            'lot_area_sqm' => 'required|min:1',
            'right_over_land' => 'required',
            'project_nature_duration' => 'required',
            'project_cost' => 'required|min:1',
            'existing_land_use' => 'required',
            'has_written_notice' => 'required',
            'has_similar_application' => 'required',
            'preferred_release_mode' => 'required',
            'notice_officer_name' => 'required_if:has_written_notice,yes',
            'notice_dates' => 'required_if:has_written_notice,yes',
            'similar_application_offices' => 'required_if:has_similar_application,yes',
            'similar_application_dates' => 'required_if:has_similar_application,yes',
        ];
    }

    /**
     * $rules with the wizard's required fields made required. Each field's
     * own checks (type, length, allowed values) are kept; only "nullable"
     * gives way.
     */
    public static function strengthen(array $rules, Request $request): array
    {
        foreach (self::requiredFieldRules($request) as $field => $required) {
            $existing = $rules[$field] ?? [];
            $existing = is_string($existing) ? explode('|', $existing) : (array) $existing;
            $existing = array_values(array_filter($existing, fn ($rule) => $rule !== 'nullable'));

            // A numeric field's "min:1" only means a number once "numeric" is there.
            $parts = explode('|', $required);
            if (in_array('min:1', $parts, true)) {
                $existing = array_values(array_filter($existing, fn ($rule) => !is_string($rule) || !str_starts_with($rule, 'min:')));
                if (!in_array('numeric', $existing, true)) {
                    $existing[] = 'numeric';
                }
            }

            $rules[$field] = array_merge($parts, $existing);
        }

        return $rules;
    }

    public static function messages(): array
    {
        return [
            'lot_area_sqm.min' => 'The project area (sqm) must be at least 1.',
            'project_cost.min' => 'The project cost must be at least 1.',
            'notice_officer_name.required_if' => 'The notice officer name is required when a written notice was given.',
            'notice_dates.required_if' => 'The notice dates are required when a written notice was given.',
            'similar_application_offices.required_if' => 'The offices are required when a similar application was filed.',
            'similar_application_dates.required_if' => 'The dates are required when a similar application was filed.',
        ];
    }

    /**
     * Every required document has at least one file: uploaded with this
     * submission, or already on file for the application being resubmitted.
     */
    public static function assertRequiredDocuments(Request $request, ?int $existingRequestId = null): void
    {
        $required = self::isZoningCertification($request->input('project_type'))
            ? self::REQUIRED_DOCUMENTS['ZC']
            : self::REQUIRED_DOCUMENTS['default'];

        $uploads = $request->file('requirement_uploads') ?? [];
        $onFile = $existingRequestId
            ? RequirementDocument::where('request_id', $existingRequestId)->pluck('requirement_id')->map(fn ($id) => (int) $id)->all()
            : [];

        $missing = [];
        foreach ($required as $id => $name) {
            $files = array_filter((array) ($uploads[$id] ?? $uploads[(string) $id] ?? []));
            if (count($files) === 0 && !in_array($id, $onFile, true)) {
                $missing["requirement_uploads.{$id}"] = "{$name} is required - please upload at least one file.";
            }
        }

        if ($missing) {
            throw ValidationException::withMessages($missing);
        }
    }
}
