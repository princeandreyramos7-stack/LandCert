import { Head } from "@inertiajs/react";
import { AdminRequestList } from "@/Components/Admin/Request";
import AdminLayout from "@/Layouts/AdminLayout";
import { Toaster } from "@/Components/ui/toaster";

export default function AdminRequestPage({ requests = [], flash = {} }) {
    return (
        <>
            <Head title="Applications — CPDO Zoning Officer"/>
            <AdminLayout title="All Applications" breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}>
                <AdminRequestList requests={requests} flash={flash}/>
            </AdminLayout>
        </>
    );
}
