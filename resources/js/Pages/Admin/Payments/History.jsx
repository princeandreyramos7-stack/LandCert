import { AdminSidebar } from "@/Components/admin-sidebar";
import { SuperAdminSidebar } from "@/Components/super-admin-sidebar";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { PaymentHistoryTable } from "@/Components/Admin/Payments/PaymentHistoryTable";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { useState } from "react";
import { History } from "lucide-react";

export default function PaymentHistory({ auth, payments = [], filters = {}, userType = 'admin' }) {
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const isSuperAdmin = userType === 'super_admin';
    const Layout = isSuperAdmin ? SuperAdminLayout : AdminLayout;
    const breadcrumbs = [
        { label: "Dashboard", href: isSuperAdmin ? "/super-admin/dashboard" : "/admin/dashboard" },
        { label: "Payments", href: isSuperAdmin ? "/super-admin/payments/pending" : "/admin/payments/pending" },
    ];

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    return (
        <>
            <Head title="Payment History"/>
            <Layout title="Payment History" breadcrumbs={breadcrumbs}>
                {/* Page header card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#0d1f5c]/8 border border-[#0d1f5c]/10" style={{background:"rgba(13,31,92,0.06)"}}>
                            <History className="h-6 w-6 text-[#0d1f5c]"/>
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-[#0d1f5c]">Payment History</h1>
                            <p className="text-xs text-gray-400 mt-0.5">View and manage all verified payment records</p>
                        </div>
                    </div>
                </div>

                <PaymentHistoryTable
                    payments={payments}
                    onViewDetails={handleViewDetails}
                />
            </Layout>

            <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#0d1f5c]">
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
        </>
    );
}
