import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { Dashboard } from "@/Components/Dashboard";
import { Head } from "@inertiajs/react";
import { LiveRefresh } from "@/Components/LiveRefresh";

/**
 * The applicant's home. The chrome - sidebar, top bar with the bell, seal -
 * is ApplicantLayout's, the same on every applicant page; this page only
 * owns its content.
 */
export default function Page({ requests = [] }) {
    return (
        <ApplicantLayout title="Dashboard">
            <Head title="Dashboard — CPDO" />
            <div className="mx-auto w-full max-w-7xl">
                <LiveRefresh only={["requests"]} items={requests} label="applications" className="justify-end mb-4" />
                <Dashboard requests={requests} />
            </div>
        </ApplicantLayout>
    );
}
