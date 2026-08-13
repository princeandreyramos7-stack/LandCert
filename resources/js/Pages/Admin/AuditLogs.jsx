import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { AuditLogComponent } from "@/Components/Admin/AuditLog";

export default function AuditLogs({ logs, users, actions, modelTypes, filters }) {
    return (
        <>
            <Head title="Audit Logs — CPDO Admin"/>
            <AdminLayout title="Audit Logs" breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}>
                <AuditLogComponent logs={logs} users={users} actions={actions} modelTypes={modelTypes} filters={filters}/>
            </AdminLayout>
        </>
    );
}
