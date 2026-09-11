import { Head } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import ReportsWorkspace from "@/Components/Reports/ReportsWorkspace";

/**
 * The Zoning Administrator's report screen. All three reports, including the
 * one on what each Zoning Officer has reviewed.
 *
 * The screen itself is shared with the officer's page; only the layout, the
 * route prefix and the set of reports differ, and the server decides the last
 * two (see SuperAdminReportsController).
 */
export default function Reports(props) {
    return (
        <>
            <Head title="Reports — Zoning Administrator" />
            <SuperAdminLayout
                title="Reports"
                breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}
            >
                <ReportsWorkspace {...props} routePrefix="super-admin" />
            </SuperAdminLayout>
        </>
    );
}
