import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { Head } from '@inertiajs/react';
import { Award } from 'lucide-react';
import { CertificatesTable } from '@/Components/Admin/Certificates/CertificatesTable';
import { LiveRefresh } from '@/Components/LiveRefresh';

export default function Certificates({ auth, certificates, filters }) {
    return (
        <SuperAdminLayout
            title="Certificate Management"
            breadcrumbs={[
                { label: "Dashboard", href: "/super-admin/dashboard" },
                { label: "Certificates" }
            ]}
        >
            <Head title="Certificate Management - SuperAdmin" />

            <div className="max-w-7xl mx-auto space-y-6">
                <LiveRefresh only={["certificates"]} items={certificates} label="certificates" />
                <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Award className="h-8 w-8 text-purple-600" />
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
                    routePrefix="super-admin"
                />
            </div>
        </SuperAdminLayout>
    );
}
