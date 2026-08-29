import { Head } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { SuperAdminRequestList } from "@/Components/SuperAdmin/Request";

export default function SuperAdminRequests({ requests }) {
    return (
        <>
            <Head title="Applications — Zoning Administrator"/>
            <SuperAdminLayout title="All Applications" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}>
                <SuperAdminRequestList requests={requests}/>
            </SuperAdminLayout>
        </>
    );
}
