import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head } from "@inertiajs/react";
import { AdminDashboard } from "@/Components/Admin/Dashboard";
import AdminLayout from "@/Layouts/AdminLayout";

export default function Page({
    applications = [],
    stats = {},
    analytics = null,
    pendingPaymentsCount = 0,
    recentPayments = [],
}) {
    return (
        <>
            <Head title="Dashboard — CPDO Admin"/>
            <AdminLayout title="Dashboard">
                <AdminDashboard
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
