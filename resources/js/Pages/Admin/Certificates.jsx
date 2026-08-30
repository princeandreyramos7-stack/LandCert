import AdminLayout from "@/Layouts/AdminLayout";
import { Head } from '@inertiajs/react';
import { Award } from 'lucide-react';
import { CertificatesTable } from '@/Components/Admin/Certificates/CertificatesTable';

export default function Certificates({ auth, certificates, filters }) {
    return (
        <AdminLayout
            title="Certificate Management"
            breadcrumbs={[
                { label: "Dashboard", href: "/admin/dashboard" },
                { label: "Certificates" }
            ]}
        >
            <Head title="Certificate Management - Admin" />

            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Award className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage and generate certificates for approved applications
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <CertificatesTable 
                    certificates={certificates}
                    filters={filters}
                    routePrefix="admin"
                />
            </div>
        </AdminLayout>
    );
}
