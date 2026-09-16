import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { PaymentHistoryTable } from "@/Components/Admin/Payments/PaymentHistoryTable";
import { PaymentStats } from "@/Components/Admin/Payments/PaymentStats";
import { RecordPaymentModal } from "@/Components/Admin/Payments/RecordPaymentModal";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";
import { AddReceiptModal } from "@/Components/Admin/Payments/AddReceiptModal";
import { AddPaymentPickerModal } from "@/Components/Admin/Payments/AddPaymentPickerModal";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import {
    DollarSign, Clock, AlertCircle, CreditCard,
    CheckCircle2, XCircle, Plus
} from "lucide-react";
import { LiveRefresh } from "@/Components/LiveRefresh";

export default function PaymentsUnified({ 
    pendingPayments = [], 
    verifiedPayments = [], 
    allPayments = [],
    stats = {} 
}) {
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [isAddReceiptModalOpen, setIsAddReceiptModalOpen] = useState(false);
    const [isAddPaymentPickerOpen, setIsAddPaymentPickerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    // Handle both array and paginated object formats
    const allPaymentsData = Array.isArray(allPayments) ? allPayments : (allPayments.data || []);
    const verifiedPaymentsData = Array.isArray(verifiedPayments) ? verifiedPayments : (verifiedPayments.data || []);
    const pendingPaymentsData = Array.isArray(pendingPayments) ? pendingPayments : [];

    // Calculate stats based on new data structure
    // pendingPayments now contains ALL approved requests (with or without payment)
    // Filter to get only those without verified payment
    const actualPendingPayments = pendingPaymentsData.filter(p => p.payment_status === 'pending' || !p.has_payment);
    const approvedWithPayment = pendingPaymentsData.filter(p => p.payment_status === 'verified' || p.has_payment);
    
    // Count from actual payment records
    const verifiedCount = allPaymentsData.filter(p => p.payment_status === 'verified').length;
    const rejectedCount = allPaymentsData.filter(p => p.payment_status === 'rejected').length;
    
    // Pending count = approved requests without verified payment
    const pendingCount = actualPendingPayments.length;

    const totalVerified = allPaymentsData
        .filter(p => p.payment_status === 'verified')
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

    const totalExpected = actualPendingPayments.reduce(
        (sum, payment) => sum + (parseFloat(payment.expected_amount) || 0), 0
    );

    const handleRecordPayment = (payment) => {
        setSelectedPayment(payment);
        setIsRecordModalOpen(true);
    };

    // "Add Payment" button - let admin pick which approved, unpaid
    // application to manually record a payment (with receipt image) for.
    const handleOpenAddPayment = () => {
        setIsAddPaymentPickerOpen(true);
    };

    const handlePickRequestForPayment = (request) => {
        setIsAddPaymentPickerOpen(false);
        handleRecordPayment(request);
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    const handleAddReceipt = (payment) => {
        setSelectedPayment(payment);
        setIsAddReceiptModalOpen(true);
    };

    const handleModalClose = () => {
        setIsRecordModalOpen(false);
        setSelectedPayment(null);
    };

    const handleAddReceiptClose = () => {
        setIsAddReceiptModalOpen(false);
        setSelectedPayment(null);
    };

    return (
        <>
            <Head title="Payments Management — CPDO Admin"/>
            <AdminLayout 
                title="Payments Management" 
                breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }]}
            >
                <LiveRefresh only={["pendingPayments", "verifiedPayments", "allPayments"]} items={allPayments} label="payments" className="justify-end mb-4" />

                {/* Page Header */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#d4a017]/10 border border-[#d4a017]/20">
                                <CreditCard className="h-6 w-6 text-[#d4a017]"/>
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-[#0d1f5c]">Payments Management</h1>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Receipts the applicants uploaded and payments recorded at the counter
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleOpenAddPayment}
                            className="bg-[#0d1f5c] hover:bg-[#0d1f5c]/90 text-white gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Payment
                        </Button>
                    </div>
                </div>

                {/* Counts, as filters: click one to see just those rows. */}
                <PaymentStats
                    payments={allPaymentsData}
                    awaiting={pendingCount}
                    active={statusFilter}
                    onSelect={setStatusFilter}
                    onRecordPayment={handleOpenAddPayment}
                />

                {/* Single Unified Payment Table */}
                <PaymentHistoryTable
                    payments={allPayments}
                    onViewDetails={handleViewDetails}
                    onAddReceipt={handleAddReceipt}
                    routePrefix="admin"
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />

                {/* Add Payment - pick which approved application to record a payment for */}
                <AddPaymentPickerModal
                    isOpen={isAddPaymentPickerOpen}
                    onClose={() => setIsAddPaymentPickerOpen(false)}
                    requests={pendingPaymentsData}
                    onSelect={handlePickRequestForPayment}
                />

                {/* Record Payment Modal */}
                <RecordPaymentModal
                    isOpen={isRecordModalOpen}
                    onClose={handleModalClose}
                    requestData={selectedPayment}
                />

                {/* Add Receipt Modal */}
                <AddReceiptModal
                    isOpen={isAddReceiptModalOpen}
                    onClose={handleAddReceiptClose}
                    payment={selectedPayment}
                />

                {/* Payment Details Modal */}
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
            </AdminLayout>
        </>
    );
}
