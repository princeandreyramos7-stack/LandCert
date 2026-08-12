import { AdminSidebar } from "@/Components/admin-sidebar";
import { SuperAdminSidebar } from "@/Components/super-admin-sidebar";
import { Head, router } from "@inertiajs/react";
import { PaymentHistoryTable } from "@/Components/Admin/Payments/PaymentHistoryTable";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { useState } from "react";
import { FileDown, History, ArrowLeft } from "lucide-react";

export default function PaymentHistory({ auth, payments = [], filters = {}, userType = 'admin' }) {
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const isSuperAdmin = userType === 'super_admin';
    const Sidebar = isSuperAdmin ? SuperAdminSidebar : AdminSidebar;
    const dashboardRoute = isSuperAdmin ? 'super-admin.dashboard' : 'admin.dashboard';
    const pendingRoute   = isSuperAdmin ? 'super-admin.payments.pending' : 'admin.payments.pending';

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    const handleExport = (format) => {
        alert(`Export to ${format.toUpperCase()} functionality will be implemented in the next phase`);
    };

    const handleBackToPayments = () => {
        router.visit(route(pendingRoute));
    };

    return (
        <SidebarProvider>
            <Head title="Payment History" />
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
                                    <BreadcrumbLink
                                        href={route(pendingRoute)}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        Payments
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-slate-900 font-semibold">
                                        Payment History
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
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <History className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        Payment History
                                    </h1>
                                    <p className="text-sm text-slate-600 mt-1">
                                        View and manage all payment records
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Back to Payments Button */}
                                <Button
                                    variant="outline"
                                    onClick={handleBackToPayments}
                                    className="border-slate-200 hover:bg-slate-50"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Pending
                                </Button>

                                {/* Export Buttons (Optional for MVP) */}
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport("excel")}
                                    className="border-slate-200 hover:bg-slate-50"
                                >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Export Excel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleExport("pdf")}
                                    className="border-slate-200 hover:bg-slate-50"
                                >
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Payment History Table Component */}
                    <PaymentHistoryTable
                        payments={payments}
                        onViewDetails={handleViewDetails}
                    />
                </div>
            </SidebarInset>

            {/* Payment Details Modal */}
            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Payment Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <PaymentDetailsCard
                            payment={selectedPayment}
                            onClose={() => setShowDetailsModal(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
