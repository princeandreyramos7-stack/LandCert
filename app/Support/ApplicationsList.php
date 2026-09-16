<?php

namespace App\Support;

use App\Models\Request as RequestModel;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * The rows the All Applications page shows, for the officer and the
 * administrator alike.
 *
 * One query with joins, selecting only the columns the list reads. It used
 * to load every request with five relations and send each whole row - the
 * verified-requirements JSON, the release notes, the lot - to the browser,
 * for a table that shows a number, a name, a type, a barangay, a date and a
 * status.
 */
class ApplicationsList
{
    /**
     * Get the applications list rows, optionally filtered by user role.
     * 
     * @param string|null $role The user role ('admin' or 'super_admin')
     * @return Collection
     */
    public static function rows(?string $role = null): Collection
    {
        $query = RequestModel::query()
            ->leftJoin('reports', 'requests.id', '=', 'reports.request_id')
            ->leftJoin('applicants', 'requests.applicant_id', '=', 'applicants.id')
            ->leftJoin('normalized_corporations', 'applicants.id', '=', 'normalized_corporations.applicant_id')
            ->leftJoin('normalized_projects', 'requests.id', '=', 'normalized_projects.request_id')
            ->leftJoin('locations', 'requests.id', '=', 'locations.request_id')
            ->leftJoin('users', 'requests.user_id', '=', 'users.id')
            ->whereNull('requests.deleted_at');

        // The status every screen shows: the officer's evaluation while the
        // application is being decided, the request's own status once it is in
        // the payment/certificate lifecycle (Request::deriveStatus, in SQL).
        $derivedStatus = "CASE WHEN requests.status IN ('payment_confirmed','certificate_preparing','certificate_ready','released') THEN requests.status ELSE COALESCE(reports.evaluation, requests.status) END";

        // The Zoning Administrator only sees what the Zoning Officer has
        // already dealt with. Judged on the derived status, not the raw one:
        // an application the applicant resubmits after a denial is stored as
        // in_applicant with its evaluation back to pending, and on the raw
        // status it slipped into the administrator's list as "Pending Review".
        if ($role === 'super_admin') {
            $query->whereRaw("$derivedStatus NOT IN ('pending', 'for_verification')");
        }

        return $query->select([
                'requests.id',
                'requests.id as application_id',
                'requests.user_id',
                'requests.application_number',
                'requests.decision_number',
                'requests.status as request_status',
                'requests.created_at',
                'requests.updated_at',
                'reports.report_id',
                'reports.evaluation',
                'applicants.applicant_name',
                'normalized_corporations.corporation_name',
                'normalized_projects.project_type',
                'normalized_projects.project_nature',
                'locations.street_address as project_location_street',
                'locations.barangay as project_location_barangay',
                'locations.city_municipality as project_location_city',
                'locations.province as project_location_province',
                'users.name as user_name',
                'users.email as user_email',
                DB::raw("$derivedStatus as status"),
            ])
            ->orderByDesc('requests.created_at')
            ->get();
    }
}
