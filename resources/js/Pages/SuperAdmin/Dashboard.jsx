import { Head } from "@inertiajs/react";
import { SuperAdminDashboard } from "@/Components/SuperAdmin/Dashboard";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { LiveRefresh } from "@/Components/LiveRefresh";
import { OnlineNowPanel } from "@/Components/OnlineNowPanel";

export default function Page({ applications = [], stats = {}, analytics = null, evaluationDistribution = [], systemStats = {}, adminActivity = {}, online = null }) {
    return (
        <>
            <Head title="Zoning Administrator Dashboard — CPDO"/>
            <SuperAdminLayout title="Dashboard">
                <LiveRefresh only={["applications", "stats", "analytics", "evaluationDistribution", "systemStats", "adminActivity", "online"]} items={applications} label="applications" className="justify-end mb-4" />
                <OnlineNowPanel online={online} className="mb-4" />
                <SuperAdminDashboard applications={applications} stats={stats} analytics={analytics} systemStats={systemStats} adminActivity={adminActivity}/>
            </SuperAdminLayout>
        </>
    );
}
