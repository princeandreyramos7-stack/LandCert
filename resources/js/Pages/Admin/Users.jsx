import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { AdminUserManagement } from "@/Components/Admin/Users";
import { Toaster } from "@/Components/ui/toaster";
import { Users } from "lucide-react";
import { LiveRefresh } from "@/Components/LiveRefresh";

export default function AdminUsers({ users }) {
    return (
        <>
            <Head title="Users — CPDO Admin"/>
            <AdminLayout title="User Management" breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}>
                <LiveRefresh only={["users"]} items={users} label="users" className="justify-end mb-4" />
                {/* Page header card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl" style={{background:"rgba(13,31,92,0.06)"}}>
                            <Users className="h-6 w-6 text-[#0d1f5c]"/>
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-[#0d1f5c]">User Management</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Manage all applicant accounts</p>
                        </div>
                    </div>
                </div>
                <AdminUserManagement users={users}/>
            </AdminLayout>
            <Toaster/>
        </>
    );
}
