import { Head } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { SuperAdminRequestList } from "@/Components/SuperAdmin/Request";

export default function SuperAdminRequests({ requests, archived = false, archivedCount = 0, sla }) {
    return (
        <>
            <Head title="Reviewed Applications — Zoning Administrator"/>
            <SuperAdminLayout title="Reviewed Applications" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}>
                <SuperAdminRequestList requests={requests} archived={archived} archivedCount={archivedCount} sla={sla} />
            </SuperAdminLayout>
        </>
    );
}
