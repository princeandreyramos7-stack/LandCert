import { useState } from "react";
import { SuperAdminSidebar } from "@/Components/super-admin-sidebar";
import { Head } from "@inertiajs/react";
import { PaymentsPendingTable } from "@/Components/Admin/Payments/PaymentsPendingTable";
import { RecordPaymentModal } from "@/Components/Admin/Payments/RecordPaymentModal";
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink,
    BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/Components/ui/sidebar";
import { Card, CardContent } from "@/Components/ui/card";
import { DollarSign, Clock, AlertCircle, TrendingUp } from "lucide-react";

export default function PaymentsPending({ pendingPayments = [] }) {
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const stats = {
        total: pendingPayments.length,
        overdue: pendingPayments.filter(p => {
            if (!p.approved_at) return false;
            return Math.ceil((new Date() - new Date(p.approved_at)) / 86400000) >= 7;
        }).length,
        recent: pendingPayments.filter(p => {
            if (!p.approved_at) return false;
            return Math.ceil((new Date() - new Date(p.approved_at)) / 86400000) < 3;
        }).length,
    };

    const totalExpected = pendingPayments.reduce(
        (sum, p) => sum + (parseFloat(p.expected_amount) || 0), 0
    );

    return (
        <SidebarProvider>
            <Head title="Payments Pending — Super Admin" />
            <SuperAdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route("super-admin.dashboard")} className="text-slate-500 hover:text-slate-800">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route("super-admin.payments")} className="text-slate-500 hover:text-slate-800">
                                        Payments
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-semibold text-slate-900">Pending</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-6 pt-0 bg-white min-h-screen">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Payments Pending</h1>
                        <p className="text-sm text-slate-500 mt-1">Approved applications awaiting payment collection</p>
                    </div>

                    {/* Stats */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                        <Card className="border border-slate-200 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Total Pending</p>
                                        <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Awaiting payment</p>
                                    </div>
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <DollarSign className="h-5 w-5 text-slate-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Expected Amount</p>
                                        <p className="text-xl font-bold text-slate-900">
                                            ₱{totalExpected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">Total to collect</p>
                                    </div>
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <TrendingUp className="h-5 w-5 text-slate-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Recent</p>
                                        <p className="text-2xl font-bold text-slate-900">{stats.recent}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Last 3 days</p>
                                    </div>
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <Clock className="h-5 w-5 text-slate-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-slate-200 shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Overdue</p>
                                        <p className="text-2xl font-bold text-slate-900">{stats.overdue}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">7+ days waiting</p>
                                    </div>
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-slate-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <PaymentsPendingTable
                        pendingPayments={pendingPayments}
                        onRecordPayment={(p) => { setSelectedPayment(p); setIsRecordModalOpen(true); }}
                    />
                </div>
            </SidebarInset>

            {selectedPayment && (
                <RecordPaymentModal
                    isOpen={isRecordModalOpen}
                    onClose={() => { setIsRecordModalOpen(false); setSelectedPayment(null); }}
                    requestData={selectedPayment}
                />
            )}
        </SidebarProvider>
    );
}
