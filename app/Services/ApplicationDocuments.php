<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Request as RequestModel;
use App\Models\User;

/**
 * What the printed documents are drawn from.
 *
 * The Zoning Certification, the Zoning Clearance and the Order of Payment all
 * read the same picture of an application, and the Application Form its own
 * wider one. Both used to be assembled inline by every page that needed them -
 * the same array in three controllers - and the applicant report now draws the
 * documents as well, so the arrays live here, once, and every page and report
 * shows the same document because it is built from the same data.
 */
class ApplicationDocuments
{
    /** Relations the issuance documents read. */
    public const ISSUANCE_RELATIONS = ['applicant.corporation', 'project', 'location', 'property'];

    /** Relations the application form reads. */
    public const FORM_RELATIONS = ['reports', 'applicant.corporation', 'applicant.primaryRepresentative', 'project', 'location', 'property'];

    /**
     * The application as the certificate, clearance and order of payment see it.
     */
    public static function issuance(RequestModel $request): array
    {
        // A Zoning Certification has no project step: it certifies the
        // applicant's own parcel, so when nothing was written to the
        // locations table (applications filed before it was) the address on
        // the application stands in.
        $fallback = ['street' => null, 'barangay' => null, 'city' => null];
        if (strtoupper((string) $request->project?->project_type) === 'ZC' && $request->applicant) {
            $applicant = $request->applicant;
            $barangay = $applicant->address_barangay_code
                ? \App\Models\Psgc\Barangay::find($applicant->address_barangay_code)?->name
                : null;
            $city = $applicant->address_city_code
                ? \App\Models\Psgc\CityMunicipality::find($applicant->address_city_code)?->name
                : null;
            // Before the address picker the line was typed; its first part is
            // the closest thing to a barangay on file.
            if (!$barangay && $applicant->applicant_address) {
                $barangay = trim(explode(',', $applicant->applicant_address)[0]);
            }
            $fallback = [
                'street' => $applicant->address_street,
                'barangay' => $barangay,
                'city' => $city ?: 'City of Ilagan',
            ];
        }

        return [
            'id' => $request->id,
            'application_number' => $request->application_number,
            'decision_number' => $request->decision_number,
            'status' => $request->status,
            'created_at' => $request->created_at,
            'updated_at' => $request->updated_at,
            'applicant_name' => $request->applicant?->applicant_name,
            'applicant_address' => $request->applicant?->applicant_address,
            'corporation_name' => $request->applicant?->corporation?->corporation_name,
            'corporation_address' => $request->applicant?->corporation?->corporation_address,
            'project_type' => $request->project?->project_type,
            'project_nature' => $request->project?->project_nature,
            'project_cost' => $request->project?->project_cost,
            'project_location_street' => $request->location?->street_address ?: $fallback['street'],
            'project_location_barangay' => $request->location?->barangay ?: $fallback['barangay'],
            'project_location_municipality' => $request->location?->city_municipality ?: $fallback['city'],
            'right_over_land' => $request->property?->right_over_land,
            'lot_area_sqm' => $request->property?->lot_area_sqm,
            // Filled in by the Zoning Officer at issuance time.
            'lot_number' => $request->property?->lot_number,
            'tax_declaration_no' => $request->property?->tax_declaration_no,
            'zone_classification' => $request->property?->zone_classification ?: $request->property?->existing_land_use,
            // The QR on the sheet. Nothing until the certificate record exists,
            // which is when the payment is recorded - the same point at which
            // the office actually prints and releases the document.
            'verification' => self::verification($request),
        ];
    }

    /**
     * What the printed sheet needs to carry its verification QR: the code, the
     * public address it opens, and the dates the page will report - so the
     * reader can compare the paper with the screen.
     */
    public static function verification(RequestModel $request): ?array
    {
        $certificate = $request->relationLoaded('certificates')
            ? $request->certificates->sortByDesc('id')->first()
            : $request->certificates()->latest('id')->first();

        if (!$certificate || !$certificate->verification_code) {
            return null;
        }

        return [
            'code' => $certificate->verification_code,
            'url' => $certificate->verificationUrl(),
            'certificate_number' => $certificate->certificate_number,
            'issued_at' => $certificate->issued_at?->toDateString(),
            'valid_until' => $certificate->valid_until?->toDateString(),
        ];
    }

    /**
     * The application as the printed Application Form sees it.
     */
    public static function form(RequestModel $request): array
    {
        $report = $request->reports->first();

        return [
            'id'             => $request->id,
            'application_number' => $request->application_number ?? sprintf('TPZ-%s-%04d', date('m-y'), $request->id),
            'created_at'     => $request->created_at?->format('F j, Y'),

            // Applicant
            'applicant_name'    => $request->applicant?->applicant_name ?? '',
            'applicant_address' => $request->applicant?->applicant_address ?? '',

            // Corporation
            'corporation_name'    => $request->applicant?->corporation?->corporation_name ?? '',
            'corporation_address' => $request->applicant?->corporation?->corporation_address ?? '',

            // Representative
            'representative_name'    => $request->applicant?->primaryRepresentative?->representative_name ?? '',
            'representative_address' => $request->applicant?->primaryRepresentative?->representative_address ?? '',

            // Project
            'project_type'             => $request->project?->project_type ?? '',
            'project_nature'           => $request->project?->project_nature ?? '',
            'project_nature_duration'  => $request->project?->project_nature_duration ?? '',
            'project_nature_years'     => $request->project?->project_nature_years ?? '',
            'project_cost'             => $request->project?->project_cost ?? null,

            // Location
            'location_number'       => $request->location?->house_number ?? '',
            'location_street'       => $request->location?->street_address ?? '',
            'location_barangay'     => $request->location?->barangay ?? '',
            'location_city'         => $request->location?->city_municipality ?? 'City of Ilagan',
            'location_province'     => $request->location?->province ?? 'Isabela',

            // Property
            'lot_area_sqm'            => $request->property?->lot_area_sqm ?? '',
            'bldg_improvement_sqm'    => $request->property?->bldg_improvement_sqm ?? '',
            'right_over_land'         => $request->property?->right_over_land ?? '',
            'existing_land_use'       => $request->property?->existing_land_use ?? '',

            // Land use / notices
            'has_written_notice'          => $request->has_written_notice ?? '',
            'notice_officer_name'         => $request->notice_officer_name ?? '',
            'notice_dates'                => $request->notice_dates?->format('F j, Y') ?? '',
            'has_similar_application'     => $request->has_similar_application ?? '',
            'similar_application_offices' => $request->similar_application_offices ?? '',
            'similar_application_dates'   => $request->similar_application_dates?->format('F j, Y') ?? '',

            // Release
            'preferred_release_mode' => $request->preferred_release_mode ?? '',
            'release_address'        => $request->release_address ?? '',

            // Report info (for receipt fields — may be empty for unprocessed requests)
            'or_number'  => $report?->or_number ?? '',
            'amount_paid' => $report?->amount ?? '',
            'evaluation' => $report?->evaluation ?? $request->status ?? 'pending',
        ];
    }

    /**
     * The Zoning Officer who reviewed the application - the "Prepared &
     * Evaluated by" signer - with their e-signature if on file.
     */
    public static function reviewer(int $requestId): ?object
    {
        $report = Report::where('request_id', $requestId)
            ->whereIn('evaluation', ['approved', 'reviewed'])
            ->latest()
            ->first();

        return $report?->resolveReviewer();
    }

    /**
     * The date a document is signed as of: when its certificate was issued,
     * else when it was released to the applicant, else now (still being
     * prepared - signed by whoever holds the post today).
     */
    public static function issuedAt(RequestModel $request): ?\Carbon\CarbonInterface
    {
        $issued = $request->relationLoaded('certificates')
            ? $request->certificates->sortByDesc('id')->first()?->issued_at
            : $request->certificates()->latest('id')->value('issued_at');

        return $issued ? \Carbon\Carbon::parse($issued) : $request->released_to_applicant_at;
    }

    /**
     * The Zoning Administrator - the "Approved by" signer - as of a date
     * (see Signatories::zoningAdministrator).
     */
    public static function zoningAdministrator(?\Carbon\CarbonInterface $at = null): ?User
    {
        return \App\Support\Signatories::zoningAdministrator($at);
    }

    /**
     * A signer as the documents print them: name, signature and position as
     * of the document's date, or nothing.
     */
    public static function signer(?object $user, ?\Carbon\CarbonInterface $at = null): ?array
    {
        return \App\Support\Signatories::signer($user, $at);
    }

    /**
     * Both signers of an application's documents, as of its issue date.
     *
     * @return array{reviewer: ?array, zoningAdministrator: ?array}
     */
    public static function signers(RequestModel $request): array
    {
        $at = self::issuedAt($request);

        return [
            'reviewer' => self::signer(self::reviewer($request->id), $at),
            'zoningAdministrator' => self::signer(self::zoningAdministrator($at), $at),
        ];
    }
}
