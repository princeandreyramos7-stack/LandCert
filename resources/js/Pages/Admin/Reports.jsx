import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ReportsWorkspace from "@/Components/Reports/ReportsWorkspace";

/**
 * The Zoning Officer's report screen.
 *
 * Two reports only — by applicant and by month or year. The "by Zoning Officer"
 * report answers who reviewed what, which is the Administrator's oversight view
 * of the officers rather than something an officer runs. AdminReportsController
 * withholds it server-side too, so it is not merely hidden here.
 */
export default function Reports(props) {
    return (
        <>
            <Head title="Reports — Zoning Officer" />
            <AdminLayout
                title="Reports"
                breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}
            >
                <ReportsWorkspace {...props} routePrefix="admin" />
            </AdminLayout>
        </>
    );
}
