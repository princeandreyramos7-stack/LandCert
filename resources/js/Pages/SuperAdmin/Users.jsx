import { Head } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { SuperAdminUserManagement } from "@/Components/SuperAdmin/Users";

export default function SuperAdminUsers({ users }) {
    return (
        <>
            <Head title="User Management — Super Admin"/>
            <SuperAdminLayout title="User Management" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}>
                <SuperAdminUserManagement users={users}/>
            </SuperAdminLayout>
        </>
    );
}
