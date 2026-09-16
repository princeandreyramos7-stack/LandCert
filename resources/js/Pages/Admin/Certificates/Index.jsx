import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { CertificatesTable } from "@/Components/Admin/Certificates/CertificatesTable";
import { CertificateStats } from "@/Components/Admin/Certificates/CertificateStats";
import { MarkReadyDialog } from "@/Components/Admin/Certificates/MarkReadyDialog";
import { RecordReleaseDialog } from "@/Components/Admin/Certificates/RecordReleaseDialog";
import { UploadCertificateModal } from "@/Components/Admin/Certificates/UploadCertificateModal";
import { Button } from "@/Components/ui/button";
import { useState } from "react";
import { Award, RefreshCw, FileDown } from "lucide-react";
import { Toaster } from "@/Components/ui/toaster";
import { LiveRefresh } from "@/Components/LiveRefresh";

export default function CertificatesIndex({ auth, certificates = {}, filters = {}, userType = 'admin' }) {
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showMarkReadyDialog, setShowMarkReadyDialog] = useState(false);
    const [showRecordReleaseDialog, setShowRecordReleaseDialog] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const isSuperAdmin = userType === 'super_admin';
    const routePrefix = isSuperAdmin ? 'super-admin' : 'admin';
    const Layout = isSuperAdmin ? SuperAdminLayout : AdminLayout;
    const breadcrumbs = [{ label: "Dashboard", href: `/${routePrefix}/dashboard` }];

    const handleMarkReady = (certificate) => { setSelectedCertificate(certificate); setShowMarkReadyDialog(true); };
    const handleRecordRelease = (certificate) => { setSelectedCertificate(certificate); setShowRecordReleaseDialog(true); };
    const handleDownload = (certificate) => { window.open(route(`${routePrefix}.certificates.download`, certificate.id), '_blank'); };
    const handlePreview = (certificate) => { window.open(route(`${routePrefix}.certificates.preview`, certificate.id), '_blank'); };
    const handleUploadCertificate = (certificate) => { setSelectedCertificate(certificate); setShowUploadModal(true); };
    const handleRefresh = () => { router.reload({ only: ['certificates'] }); };
    // The rows on screen, as a spreadsheet. (This button used to open the
    // payments report - a different list altogether.)
    const handleExport = () => {
        const rows = certificates?.data || [];
        const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const lines = [
            ["Certificate No.", "Application No.", "Decision No.", "Applicant", "Type", "Issued", "Status", "Released to applicant"].map(cell).join(","),
            ...rows.map((c) => [
                c.certificate_number,
                c.request?.application_number || `#${c.request_id}`,
                c.request?.decision_number || "",
                c.request?.applicant?.applicant_name || "",
                c.request?.project?.project_type || c.request?.project_type || "",
                c.issued_at ? new Date(c.issued_at).toLocaleDateString("en-US") : "",
                c.request?.released_to_applicant_at ? "Released" : "Preparing",
                c.request?.released_to_applicant_at ? new Date(c.request.released_to_applicant_at).toLocaleDateString("en-US") : "",
            ].map(cell).join(",")),
        ];
        const blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificates-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Head title="Certificates"/>
            <Layout title="Certificates" breadcrumbs={breadcrumbs}>
                <LiveRefresh only={["certificates"]} items={certificates} label="certificates" className="justify-end mb-4" />

                {/* Page header card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#d4a017]/10 border border-[#d4a017]/20">
                                <Award className="h-6 w-6 text-[#d4a017]"/>
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#0d1f5c]">Certificate Management</h1>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {isSuperAdmin
                                        ? "Every certificate and clearance on file, and whether the applicant has it yet"
                                        : "Generate and print each document, then release it so the applicant can download it"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleRefresh}
                                className="border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] gap-2 text-sm">
                                <RefreshCw className="h-4 w-4"/> Refresh
                            </Button>
                            <Button variant="outline" onClick={handleExport}
                                className="border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] gap-2 text-sm">
                                <FileDown className="h-4 w-4"/> Export CSV
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary counts — clicking one filters the list below. */}
                <CertificateStats
                    certificates={certificates?.data || []}
                    onFilterChange={(status) =>
                        router.get(
                            route(`${routePrefix}.certificates.index`),
                            { ...filters, status },
                            { preserveState: true, replace: true }
                        )
                    }
                />

                {/* Certificates Table */}
                <CertificatesTable
                    certificates={certificates}
                    filters={filters}
                    routePrefix={routePrefix}
                    onMarkReady={handleMarkReady}
                    onRecordRelease={handleRecordRelease}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                    onUploadCertificate={handleUploadCertificate}
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
            <UploadCertificateModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                certificate={selectedCertificate}
                routePrefix={routePrefix}
            />
            <Toaster />
        </>
    );
}
