import { Head } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { SuperAdminUserManagement } from "@/Components/SuperAdmin/Users";
import { LiveRefresh } from "@/Components/LiveRefresh";

export default function SuperAdminUsers({ users }) {
    return (
        <>
            <Head title="User Management — Zoning Administrator"/>
            <SuperAdminLayout title="User Management" breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}>
                <LiveRefresh only={["users"]} items={users} label="users" className="justify-end mb-4" />
                <SuperAdminUserManagement users={users}/>
            </SuperAdminLayout>
        </>
    );
}
