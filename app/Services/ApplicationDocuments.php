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
            'project_location_street' => $request->location?->street_address,
            'project_location_barangay' => $request->location?->barangay,
            'project_location_municipality' => $request->location?->city_municipality,
            'right_over_land' => $request->property?->right_over_land,
            'lot_area_sqm' => $request->property?->lot_area_sqm,
            // Filled in by the Zoning Officer at issuance time.
            'lot_number' => $request->property?->lot_number,
            'tax_declaration_no' => $request->property?->tax_declaration_no,
            'zone_classification' => $request->property?->zone_classification ?: $request->property?->existing_land_use,
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
            'location_number'       => $request->property?->lot_number ?? '',
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
    public static function reviewer(int $requestId): ?User
    {
        $report = Report::where('request_id', $requestId)
            ->whereIn('evaluation', ['approved', 'reviewed'])
            ->latest()
            ->first();

        return $report?->resolveReviewer();
    }

    /** The Zoning Administrator - the "Approved by" signer. */
    public static function zoningAdministrator(): ?User
    {
        return User::where('user_type', 'super_admin')
            ->whereNotNull('signature_path')
            ->first();
    }

    /** A signer as the documents print them: name and signature, or nothing. */
    public static function signer(?User $user): ?array
    {
        return $user ? [
            'name' => $user->name,
            'signature_url' => $user->signature_url,
        ] : null;
    }
}
