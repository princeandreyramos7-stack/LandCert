import { Head } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { SuperAdminUserManagement } from "@/Components/SuperAdmin/Users";

export default function SuperAdminUsers({ users }) {
    return (
        <>
            <Head title="User Management — Zoning Administrator"/>
            <SuperAdminLayout title="User Management" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}>
                <SuperAdminUserManagement users={users}/>
            </SuperAdminLayout>
        </>
    );
}
