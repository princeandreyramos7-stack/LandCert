import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head } from "@inertiajs/react";
import { AdminDashboard } from "@/Components/Admin/Dashboard";
import AdminLayout from "@/Layouts/AdminLayout";
import { LiveRefresh } from "@/Components/LiveRefresh";

export default function Page({
    applications = [],
    stats = {},
    analytics = null,
    pendingPaymentsCount = 0,
    recentPayments = [],
    online = null,
}) {
    return (
        <>
            <Head title="Dashboard — CPDO Admin" />
            <AdminLayout title="Dashboard">
                <LiveRefresh
                    only={[
                        "applications",
                        "stats",
                        "analytics",
                        "pendingPaymentsCount",
                        "recentPayments",
                        "online",
                    ]}
                    items={applications}
                    label="applications"
                    className="justify-end mb-4"
                />
                <AdminDashboard
                    online={online}
                    applications={applications}
                    stats={stats}
                    analytics={analytics}
                    pendingPaymentsCount={pendingPaymentsCount}
                    recentPayments={recentPayments}
                />
            </AdminLayout>
        </>
    );
}
