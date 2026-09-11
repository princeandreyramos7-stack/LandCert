<?php

namespace App\Http\Controllers;

/**
 * Reports for the Zoning Officer.
 *
 * The same machinery as the Administrator's screen, narrowed to the two reports
 * that describe the office's own casework: what an applicant has filed, and
 * what came through in a given period.
 *
 * The "by Zoning Officer" report is deliberately absent. It answers "who
 * reviewed what", which is the Administrator's oversight view of the officers -
 * not something an officer runs on themselves or on a colleague.
 *
 * Only the hooks below differ; everything else - the queries, the transaction
 * builder, the PDF and CSV - is inherited, so a fix to either screen is a fix
 * to both.
 */
class AdminReportsController extends SuperAdminReportsController
{
    protected function allowedTypes(): array
    {
        return ['applicant', 'period'];
    }

    protected function routePrefix(): string
    {
        return 'admin';
    }

    protected function pageComponent(): string
    {
        return 'Admin/Reports';
    }
}
