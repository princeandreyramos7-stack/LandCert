import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { AuditLogComponent } from "@/Components/Admin/AuditLog";
import { Activity } from "lucide-react";
import { LiveRefresh } from "@/Components/LiveRefresh";

export default function AuditLogs({ logs, users, actions, modelTypes, filters, stats }) {
    return (
        <>
            <Head title="Audit Logs — CPDO Admin"/>
            <AdminLayout title="Audit Logs" breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}>
                {/* New entries and the tiles arrive on their own, keeping filters and page. */}
                <LiveRefresh only={["logs", "stats"]} items={logs} label="log entries" interval={10000} className="justify-end mb-4" />
                {/* Page header card, as on the officer's other pages and the
                    Administrator's Audit Logs. */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{background:"rgba(13,31,92,0.06)"}}>
                            <Activity className="h-6 w-6 text-[#0d1f5c]"/>
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-[#0d1f5c]">Audit Logs</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Track all system activity and user actions</p>
                        </div>
                    </div>
                </div>
                <AuditLogComponent logs={logs} users={users} actions={actions} modelTypes={modelTypes} filters={filters} stats={stats}/>
            </AdminLayout>
        </>
    );
}
