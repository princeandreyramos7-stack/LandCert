import { useState } from "react";
import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head } from "@inertiajs/react";
import { PaymentsPendingTable } from "@/Components/Admin/Payments/PaymentsPendingTable";
import { RecordPaymentModal } from "@/Components/Admin/Payments/RecordPaymentModal";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Card, CardContent } from "@/Components/ui/card";
import { DollarSign, Clock, AlertCircle } from "lucide-react";

/**
 * Admin Payments Pending Index Page
 * 
 * Displays all approved applications awaiting payment confirmation.
 * Allows admins to record payments made at the Treasury Office.
 * 
 * @param {Object} props
 * @param {Array} props.pendingPayments - Array of pending payment requests
 */
export default function Index({ pendingPayments = [] }) {
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    // Calculate statistics
    const stats = {
        total: pendingPayments.length,
        overdue: pendingPayments.filter(payment => {
            if (!payment.approved_at) return false;
            const approvedDate = new Date(payment.approved_at);
            const today = new Date();
            const diffDays = Math.ceil((today - approvedDate) / (1000 * 60 * 60 * 24));
            return diffDays >= 7;
        }).length,
        recent: pendingPayments.filter(payment => {
            if (!payment.approved_at) return false;
            const approvedDate = new Date(payment.approved_at);
            const today = new Date();
            const diffDays = Math.ceil((today - approvedDate) / (1000 * 60 * 60 * 24));
            return diffDays < 3;
        }).length,
    };

    // Calculate total expected amount
    const totalExpected = pendingPayments.reduce(
        (sum, payment) => sum + (parseFloat(payment.expected_amount) || 0),
        0
    );

    // Handle record payment button click
    const handleRecordPayment = (payment) => {
        setSelectedPayment(payment);
        setIsRecordModalOpen(true);
    };

    // Handle modal close
    const handleModalClose = () => {
        setIsRecordModalOpen(false);
        setSelectedPayment(null);
    };

    return (
        <SidebarProvider>
            <Head title="Payments Pending" />
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <a
                                        href={route("admin.dashboard")}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Admin Dashboard
                                    </a>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span className="mx-2 text-gray-400">›</span>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Payments</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span className="mx-2 text-gray-400">›</span>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Pending</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-6 pt-0 min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
                    {/* Page Header */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Payments Pending
                        </h1>
                        <p className="text-gray-600">
                            Manage and record payments for approved applications
                        </p>
                    </div>

                    {/* Statistics Cards - Responsive Grid */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
                        {/* Total Pending */}
                        <Card className="bg-blue-50 border-0 shadow-sm">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-blue-700 font-medium mb-1 truncate">
                                            Total Pending
                                        </p>
                                        <p className="text-xl sm:text-2xl font-bold text-blue-900">
                                            {stats.total}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-0.5 truncate">
                                            Awaiting payment
                                        </p>
                                    </div>
                                    <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg flex-shrink-0 ml-2">
                                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Expected Amount */}
                        <Card className="bg-emerald-50 border-0 shadow-sm">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-emerald-700 font-medium mb-1 truncate">
                                            Expected Amount
                                        </p>
                                        <p className="text-lg sm:text-2xl font-bold text-emerald-900 break-words">
                                            ₱{totalExpected.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                        <p className="text-xs text-emerald-600 mt-0.5 truncate">
                                            Total to collect
                                        </p>
                                    </div>
                                    <div className="p-1.5 sm:p-2 bg-emerald-500 rounded-lg flex-shrink-0 ml-2">
                                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent (< 3 days) */}
                        <Card className="bg-amber-50 border-0 shadow-sm">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-amber-700 font-medium mb-1 truncate">
                                            Recent
                                        </p>
                                        <p className="text-xl sm:text-2xl font-bold text-amber-900">
                                            {stats.recent}
                                        </p>
                                        <p className="text-xs text-amber-600 mt-0.5 truncate">
                                            Last 3 days
                                        </p>
                                    </div>
                                    <div className="p-1.5 sm:p-2 bg-amber-500 rounded-lg flex-shrink-0 ml-2">
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Overdue (>= 7 days) */}
                        <Card className="bg-rose-50 border-0 shadow-sm">
                            <CardContent className="p-3 sm:p-4">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-rose-700 font-medium mb-1 truncate">
                                            Overdue
                                        </p>
                                        <p className="text-xl sm:text-2xl font-bold text-rose-900">
                                            {stats.overdue}
                                        </p>
                                        <p className="text-xs text-rose-600 mt-0.5 truncate">
                                            7+ days waiting
                                        </p>
                                    </div>
                                    <div className="p-1.5 sm:p-2 bg-rose-500 rounded-lg flex-shrink-0 ml-2">
                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payments Pending Table */}
                    <PaymentsPendingTable
                        pendingPayments={pendingPayments}
                        onRecordPayment={handleRecordPayment}
                    />
                </div>
            </SidebarInset>

            {/* Record Payment Modal */}
            {selectedPayment && (
                <RecordPaymentModal
                    isOpen={isRecordModalOpen}
                    onClose={handleModalClose}
                    requestData={selectedPayment}
                />
            )}
        </SidebarProvider>
    );
}
