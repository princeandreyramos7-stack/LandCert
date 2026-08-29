import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { Head } from '@inertiajs/react';
import { CertificatesTable } from '@/Components/Admin/Certificates/CertificatesTable';

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
                <div className="bg-white rounded-2xl p-6 shadow-2xl border-2 border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
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
