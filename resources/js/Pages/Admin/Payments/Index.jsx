import { useState } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { PaymentsPendingTable } from "@/Components/Admin/Payments/PaymentsPendingTable";
import { RecordPaymentModal } from "@/Components/Admin/Payments/RecordPaymentModal";
import { Card, CardContent } from "@/Components/ui/card";
import { DollarSign, Clock, AlertCircle, CreditCard } from "lucide-react";

export default function Index({ pendingPayments = [] }) {
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const stats = {
        total: pendingPayments.length,
        overdue: pendingPayments.filter(payment => {
            if (!payment.approved_at) return false;
            const diffDays = Math.ceil((new Date() - new Date(payment.approved_at)) / (1000 * 60 * 60 * 24));
            return diffDays >= 7;
        }).length,
        recent: pendingPayments.filter(payment => {
            if (!payment.approved_at) return false;
            const diffDays = Math.ceil((new Date() - new Date(payment.approved_at)) / (1000 * 60 * 60 * 24));
            return diffDays < 3;
        }).length,
    };

    const totalExpected = pendingPayments.reduce(
        (sum, payment) => sum + (parseFloat(payment.expected_amount) || 0), 0
    );

    const handleRecordPayment = (payment) => { setSelectedPayment(payment); setIsRecordModalOpen(true); };
    const handleModalClose = () => { setIsRecordModalOpen(false); setSelectedPayment(null); };

    return (
        <>
            <Head title="Payments Pending — CPDO Admin"/>
            <AdminLayout title="Payments Pending" breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}>

                {/* Page header card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#d4a017]/10 border border-[#d4a017]/20">
                            <CreditCard className="h-6 w-6 text-[#d4a017]"/>
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-[#0d1f5c]">Payments Pending</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Manage and record payments for approved applications</p>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-5">
                    <Card className="bg-[#0d1f5c]/5 border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#0d1f5c] font-bold mb-1 uppercase tracking-wide">Total Pending</p>
                                    <p className="text-2xl font-black text-[#0d1f5c]">{stats.total}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Awaiting payment</p>
                                </div>
                                <div className="p-2 bg-[#0d1f5c] rounded-lg"><DollarSign className="h-5 w-5 text-white"/></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-50 border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-emerald-700 font-bold mb-1 uppercase tracking-wide">Expected Amount</p>
                                    <p className="text-lg font-black text-emerald-900 break-words">
                                        ₱{totalExpected.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-xs text-emerald-600 mt-0.5">Total to collect</p>
                                </div>
                                <div className="p-2 bg-emerald-500 rounded-lg"><DollarSign className="h-5 w-5 text-white"/></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-50 border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-amber-700 font-bold mb-1 uppercase tracking-wide">Recent</p>
                                    <p className="text-2xl font-black text-amber-900">{stats.recent}</p>
                                    <p className="text-xs text-amber-600 mt-0.5">Last 3 days</p>
                                </div>
                                <div className="p-2 bg-amber-500 rounded-lg"><Clock className="h-5 w-5 text-white"/></div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-rose-50 border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-rose-700 font-bold mb-1 uppercase tracking-wide">Overdue</p>
                                    <p className="text-2xl font-black text-rose-900">{stats.overdue}</p>
                                    <p className="text-xs text-rose-600 mt-0.5">7+ days waiting</p>
                                </div>
                                <div className="p-2 bg-rose-500 rounded-lg"><AlertCircle className="h-5 w-5 text-white"/></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <PaymentsPendingTable
                    pendingPayments={pendingPayments}
                    onRecordPayment={handleRecordPayment}
                />

                {selectedPayment && (
                    <RecordPaymentModal
                        isOpen={isRecordModalOpen}
                        onClose={handleModalClose}
                        requestData={selectedPayment}
                    />
                )}
            </AdminLayout>
        </>
    );
}
