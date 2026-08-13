import { Head } from "@inertiajs/react";
import { AdminRequestList } from "@/Components/Admin/Request";
import AdminLayout from "@/Layouts/AdminLayout";
import { Toaster } from "@/Components/ui/toaster";
import { FileText } from "lucide-react";

export default function AdminRequestPage({ requests = [], flash = {} }) {
    return (
        <>
            <Head title="Requests — CPDO Admin"/>
            <AdminLayout title="All Requests" breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}>
                {/* Page header card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{background:"rgba(13,31,92,0.06)"}}>
                            <FileText className="h-6 w-6 text-[#0d1f5c]"/>
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-[#0d1f5c]">All Requests</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Review, approve, and manage land use permit applications</p>
                        </div>
                    </div>
                </div>

                <AdminRequestList requests={requests} flash={flash}/>
            </AdminLayout>
        </>
    );
}
