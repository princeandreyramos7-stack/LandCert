import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { AuditLogComponent } from "@/Components/Admin/AuditLog";
import { LiveRefresh } from "@/Components/LiveRefresh";

export default function AuditLogs({ logs, users, actions, modelTypes, filters, stats }) {
    return (
        <>
            <Head title="Audit Logs — CPDO Admin"/>
            <AdminLayout title="Audit Logs" breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}>
                {/* New entries and the tiles arrive on their own, keeping filters and page. */}
                <LiveRefresh only={["logs", "stats"]} items={logs} label="log entries" interval={10000} className="justify-end mb-4" />
                <AuditLogComponent logs={logs} users={users} actions={actions} modelTypes={modelTypes} filters={filters} stats={stats}/>
            </AdminLayout>
        </>
    );
}
