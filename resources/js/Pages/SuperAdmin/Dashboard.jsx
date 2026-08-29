import { Head } from "@inertiajs/react";
import { SuperAdminDashboard } from "@/Components/SuperAdmin/Dashboard";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";

export default function Page({ applications = [], stats = {}, analytics = null, evaluationDistribution = [], systemStats = {} }) {
    return (
        <>
            <Head title="Zoning Administrator Dashboard — CPDO"/>
            <SuperAdminLayout title="Dashboard">
                <SuperAdminDashboard applications={applications} stats={stats} analytics={analytics} systemStats={systemStats}/>
            </SuperAdminLayout>
        </>
    );
}
