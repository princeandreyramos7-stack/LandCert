import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { CertificatesTable } from "@/Components/Admin/Certificates/CertificatesTable";
import { MarkReadyDialog } from "@/Components/Admin/Certificates/MarkReadyDialog";
import { RecordReleaseDialog } from "@/Components/Admin/Certificates/RecordReleaseDialog";
import { Button } from "@/Components/ui/button";
import { useState } from "react";
import { Award, RefreshCw, FileDown } from "lucide-react";

export default function CertificatesIndex({ auth, certificates = {}, filters = {}, userType = 'admin' }) {
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showMarkReadyDialog, setShowMarkReadyDialog] = useState(false);
    const [showRecordReleaseDialog, setShowRecordReleaseDialog] = useState(false);

    const isSuperAdmin = userType === 'super_admin';
    const routePrefix = isSuperAdmin ? 'super-admin' : 'admin';
    const Layout = isSuperAdmin ? SuperAdminLayout : AdminLayout;
    const breadcrumbs = [{ label: "Dashboard", href: `/${routePrefix}/dashboard` }];

    const handleMarkReady = (certificate) => { setSelectedCertificate(certificate); setShowMarkReadyDialog(true); };
    const handleRecordRelease = (certificate) => { setSelectedCertificate(certificate); setShowRecordReleaseDialog(true); };
    const handleDownload = (certificate) => { window.open(route(`${routePrefix}.certificates.download`, certificate.id), '_blank'); };
    const handlePreview = (certificate) => { window.open(route(`${routePrefix}.certificates.preview`, certificate.id), '_blank'); };
    const handleRefresh = () => { router.reload({ only: ['certificates'] }); };
    const handleExport = () => {
        window.open(route(`${routePrefix}.export.payments`) + '?format=pdf', '_blank');
    };

    return (
        <>
            <Head title="Certificates"/>
            <Layout title="Certificates" breadcrumbs={breadcrumbs}>
                {/* Page header card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#d4a017]/10 border border-[#d4a017]/20">
                                <Award className="h-6 w-6 text-[#d4a017]"/>
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#0d1f5c]">Certificate Management</h1>
                                <p className="text-xs text-gray-400 mt-0.5">View, download, and manage issued certificates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleRefresh}
                                className="border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] gap-2 text-sm">
                                <RefreshCw className="h-4 w-4"/> Refresh
                            </Button>
                            <Button variant="outline" onClick={handleExport}
                                className="border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] gap-2 text-sm">
                                <FileDown className="h-4 w-4"/> Export
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Certificates Table */}
                <CertificatesTable
                    certificates={certificates}
                    filters={filters}
                    routePrefix={routePrefix}
                    onMarkReady={handleMarkReady}
                    onRecordRelease={handleRecordRelease}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                />
            </Layout>

            <MarkReadyDialog
                certificate={selectedCertificate}
                open={showMarkReadyDialog}
                onOpenChange={setShowMarkReadyDialog}
                routePrefix={routePrefix}
            />
            <RecordReleaseDialog
                certificate={selectedCertificate}
                open={showRecordReleaseDialog}
                onOpenChange={setShowRecordReleaseDialog}
                routePrefix={routePrefix}
            />
        </>
    );
}
