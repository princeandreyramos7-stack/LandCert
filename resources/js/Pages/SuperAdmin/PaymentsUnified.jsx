import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { PaymentHistoryTable } from "@/Components/Admin/Payments/PaymentHistoryTable";
import { RecordPaymentModal } from "@/Components/Admin/Payments/RecordPaymentModal";
import { PaymentDetailsCard } from "@/Components/Admin/Payments/PaymentDetailsCard";
import { AddReceiptModal } from "@/Components/Admin/Payments/AddReceiptModal";
import { AddPaymentPickerModal } from "@/Components/Admin/Payments/AddPaymentPickerModal";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { 
    DollarSign, Clock, AlertCircle, CreditCard, 
    CheckCircle2, XCircle, Plus 
} from "lucide-react";

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
            <Head title="Payments Management — Zoning Administrator"/>
            <SuperAdminLayout 
                title="Payments Management" 
                breadcrumbs={[{ label: "Dashboard", href: "/super-admin/dashboard" }]}
            >
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
                                    View and manage all payment records
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

                {/* Statistics Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-5">
                    <Card className="bg-[#0d1f5c]/5 border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#0d1f5c] font-bold mb-1 uppercase tracking-wide">
                                        Total Payments
                                    </p>
                                    <p className="text-2xl font-black text-[#0d1f5c]">
                                        {allPayments.length}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">All records</p>
                                </div>
                                <div className="p-2 bg-[#0d1f5c] rounded-lg">
                                    <DollarSign className="h-5 w-5 text-white"/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-amber-50 border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-amber-700 font-bold mb-1 uppercase tracking-wide">
                                        Pending
                                    </p>
                                    <p className="text-2xl font-black text-amber-900">
                                        {pendingCount}
                                    </p>
                                    <p className="text-xs text-amber-600 mt-0.5">Awaiting payment</p>
                                </div>
                                <div className="p-2 bg-amber-500 rounded-lg">
                                    <Clock className="h-5 w-5 text-white"/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-emerald-50 border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-emerald-700 font-bold mb-1 uppercase tracking-wide">
                                        Verified
                                    </p>
                                    <p className="text-2xl font-black text-emerald-900">
                                        {verifiedCount}
                                    </p>
                                    <p className="text-xs text-emerald-600 mt-0.5">Confirmed</p>
                                </div>
                                <div className="p-2 bg-emerald-500 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-white"/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-rose-50 border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-rose-700 font-bold mb-1 uppercase tracking-wide">
                                        Rejected
                                    </p>
                                    <p className="text-2xl font-black text-rose-900">
                                        {rejectedCount}
                                    </p>
                                    <p className="text-xs text-rose-600 mt-0.5">Declined</p>
                                </div>
                                <div className="p-2 bg-rose-500 rounded-lg">
                                    <XCircle className="h-5 w-5 text-white"/>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Single Unified Payment Table */}
                <PaymentHistoryTable
                    payments={allPayments}
                    onViewDetails={handleViewDetails}
                    onAddReceipt={handleAddReceipt}
                    routePrefix="super-admin"
                    showStatusFilter={true}
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
            </SuperAdminLayout>
        </>
    );
}
