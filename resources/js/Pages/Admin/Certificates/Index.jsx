import { AdminSidebar } from "@/Components/admin-sidebar";
import { SuperAdminSidebar } from "@/Components/super-admin-sidebar";
import { Head, router } from "@inertiajs/react";
import { CertificatesTable } from "@/Components/Admin/Certificates/CertificatesTable";
import { MarkReadyDialog } from "@/Components/Admin/Certificates/MarkReadyDialog";
import { RecordReleaseDialog } from "@/Components/Admin/Certificates/RecordReleaseDialog";
import { Button } from "@/Components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import { useState } from "react";
import { Award, FileDown, RefreshCw } from "lucide-react";

export default function CertificatesIndex({ auth, certificates = {}, filters = {}, userType = 'admin' }) {
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [showMarkReadyDialog, setShowMarkReadyDialog] = useState(false);
    const [showRecordReleaseDialog, setShowRecordReleaseDialog] = useState(false);

    const isSuperAdmin = userType === 'super_admin';
    const routePrefix = isSuperAdmin ? 'super-admin' : 'admin';
    const dashboardRoute = isSuperAdmin ? 'super-admin.dashboard' : 'admin.dashboard';
    const Sidebar = isSuperAdmin ? SuperAdminSidebar : AdminSidebar;

    const handleMarkReady = (certificate) => {
        setSelectedCertificate(certificate);
        setShowMarkReadyDialog(true);
    };

    const handleRecordRelease = (certificate) => {
        setSelectedCertificate(certificate);
        setShowRecordReleaseDialog(true);
    };

    const handleDownload = (certificate) => {
        window.open(route(`${routePrefix}.certificates.download`, certificate.id), '_blank');
    };

    const handlePreview = (certificate) => {
        window.open(route(`${routePrefix}.certificates.preview`, certificate.id), '_blank');
    };

    const handleRefresh = () => {
        router.reload({ only: ['certificates'] });
    };

    const handleExport = () => {
        alert('Export functionality will be implemented in the next phase');
    };

    return (
        <SidebarProvider>
            <Head title="Certificates" />
            <Sidebar />
            <SidebarInset>
                {/* Header with Breadcrumbs */}
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        href={route(dashboardRoute)}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-slate-900 font-semibold">
                                        Certificates
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-br from-blue-50 to-slate-50">
                    {/* Page Header */}
                    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <Award className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        Certificate Management
                                    </h1>
                                    <p className="text-sm text-slate-600 mt-1">
                                        View, download, and manage issued certificates
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleRefresh}
                                    className="border-slate-200 hover:bg-slate-50"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleExport}
                                    className="border-slate-200 hover:bg-slate-50"
                                >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Export
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
                </div>
            </SidebarInset>

            {/* Mark Ready Dialog */}
            <MarkReadyDialog
                certificate={selectedCertificate}
                open={showMarkReadyDialog}
                onOpenChange={setShowMarkReadyDialog}
                routePrefix={routePrefix}
            />

            {/* Record Release Dialog */}
            <RecordReleaseDialog
                certificate={selectedCertificate}
                open={showRecordReleaseDialog}
                onOpenChange={setShowRecordReleaseDialog}
                routePrefix={routePrefix}
            />
        </SidebarProvider>
    );
}
