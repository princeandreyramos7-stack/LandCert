import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { FileText, Search, Download } from "lucide-react";
import { router } from "@inertiajs/react";
import { useToast } from "@/Components/ui/use-toast";

// Local Components
import { PaymentStats } from "./PaymentStats";
import { PaymentTable } from "./PaymentTable";
import { ViewPaymentModal } from "./ViewPaymentModal";
import { VerifyPaymentDialog } from "./VerifyPaymentDialog";
import { RejectPaymentDialog } from "./RejectPaymentDialog";

export function AdminPaymentList({ payments }) {
    const paymentsData = payments?.data || [];
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedPayments, setSelectedPayments] = useState([]);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const [isBulkVerifyDialogOpen, setIsBulkVerifyDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const { toast } = useToast();

    // Filtered and computed data
    const filteredPayments = useMemo(() => {
        let filtered = paymentsData;

        if (filterStatus !== "all") {
            filtered = filtered.filter(
                (p) => p.payment_status === filterStatus
            );
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (p) =>
                    p.applicant_name
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    p.receipt_number
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    p.id?.toString().includes(searchTerm)
            );
        }

        return filtered;
    }, [paymentsData, filterStatus, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: paymentsData.length,
            pending: paymentsData.filter((p) => p.payment_status === "pending")
                .length,
            verified: paymentsData.filter(
                (p) => p.payment_status === "verified"
            ).length,
            rejected: paymentsData.filter(
                (p) => p.payment_status === "rejected"
            ).length,
        };
    }, [paymentsData]);

    // Event Handlers
    const handleView = (payment) => {
        setSelectedPayment(payment);
        setIsViewDialogOpen(true);
    };

    const handleVerifyClick = (payment) => {
        setSelectedPayment(payment);
        setIsVerifyDialogOpen(true);
    };

    const confirmVerify = () => {
        if (!selectedPayment) return;

        router.post(
            route("admin.payments.verify", selectedPayment.id),
            {},
            {
                onSuccess: () => {
                    setIsVerifyDialogOpen(false);
                    setSelectedPayment(null);
                    toast({
                        title: "Payment Verified!",
                        description: `Payment for Request #${selectedPayment.request_id} has been verified successfully.`,
                    });
                },
                onError: () => {
                    setIsVerifyDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Verification Failed!",
                        description: "Failed to verify the payment.",
                    });
                },
            }
        );
    };

    const handleRejectClick = (payment) => {
        setSelectedPayment(payment);
        setRejectionReason("");
        setIsRejectDialogOpen(true);
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            toast({
                variant: "destructive",
                title: "Rejection Reason Required",
                description: "Please provide a reason for rejecting this payment.",
            });
            return;
        }

        router.post(
            route("admin.payments.reject", selectedPayment.id),
            {
                rejection_reason: rejectionReason,
            },
            {
                onSuccess: () => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason("");
                    toast({
                        title: "Payment Rejected!",
                        description: `Payment for Request #${selectedPayment.request_id} has been rejected.`,
                    });
                },
                onError: () => {
                    setIsRejectDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Rejection Failed!",
                        description: "Failed to reject the payment.",
                    });
                },
            }
        );
    };

    const handleExport = () => {
        const url = route("admin.export.payments", {
            status: filterStatus,
            format: "pdf",
        });
        window.location.href = url;
        toast({
            title: "Export Started",
            description: "Your PDF file will download shortly.",
        });
    };

    const handleSelectPayment = (paymentId) => {
        setSelectedPayments((prev) =>
            prev.includes(paymentId)
                ? prev.filter((id) => id !== paymentId)
                : [...prev, paymentId]
        );
    };

    const handleSelectAll = () => {
        const pendingPayments = filteredPayments
            .filter((p) => p.payment_status === "pending")
            .map((p) => p.id);

        if (selectedPayments.length === pendingPayments.length) {
            setSelectedPayments([]);
        } else {
            setSelectedPayments(pendingPayments);
        }
    };

    const handleBulkVerify = () => {
        setIsBulkVerifyDialogOpen(true);
    };

    const confirmBulkVerify = () => {
        router.post(
            route("admin.bulk.approve"),
            { payment_ids: selectedPayments },
            {
                onSuccess: () => {
                    setIsBulkVerifyDialogOpen(false);
                    setSelectedPayments([]);
                    toast({
                        title: "Bulk Verification Complete!",
                        description: `Successfully verified ${selectedPayments.length} payment(s).`,
                    });
                },
                onError: () => {
                    setIsBulkVerifyDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Bulk Verification Failed!",
                        description: "Failed to verify some payments.",
                    });
                },
            }
        );
    };

    const handlePageChange = (url) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <div className="space-y-6 min-h-screen bg-gray-50 p-6">
            {/* Statistics Cards */}
            <PaymentStats stats={stats} onFilterChange={setFilterStatus} />

            {/* Payments Table */}
            <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CardHeader className="bg-blue-600 border-b border-blue-700 p-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            Payment Submissions ({filteredPayments.length})
                        </CardTitle>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                className="gap-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                            >
                                <Download className="h-4 w-4" />
                                Export PDF
                            </Button>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                                <Input
                                    placeholder="Search payments..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                                />
                            </div>
                            {filterStatus !== "all" && (
                                <Button
                                    variant="outline"
                                    onClick={() => setFilterStatus("all")}
                                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                                >
                                    Clear Filter
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Bulk Actions Bar */}
                    {selectedPayments.length > 0 && (
                        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 -mx-6 -mt-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold">
                                        {selectedPayments.length}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {selectedPayments.length} item
                                        {selectedPayments.length > 1 ? "s" : ""} selected
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedPayments([])}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 text-sm"
                                    >
                                        Clear selection
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleBulkVerify}
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        Verify Selected
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payment Table */}
                    <PaymentTable
                        payments={filteredPayments}
                        selectedPayments={selectedPayments}
                        onSelectAll={handleSelectAll}
                        onSelectPayment={handleSelectPayment}
                        onView={handleView}
                        onVerify={handleVerifyClick}
                        onReject={handleRejectClick}
                    />
                </CardContent>
            </Card>

            {/* Modals and Dialogs */}
            <ViewPaymentModal
                isOpen={isViewDialogOpen}
                onClose={() => setIsViewDialogOpen(false)}
                payment={selectedPayment}
            />

            <VerifyPaymentDialog
                isOpen={isVerifyDialogOpen}
                onClose={() => setIsVerifyDialogOpen(false)}
                payment={selectedPayment}
                onConfirm={confirmVerify}
            />

            <RejectPaymentDialog
                isOpen={isRejectDialogOpen}
                onClose={() => setIsRejectDialogOpen(false)}
                payment={selectedPayment}
                rejectionReason={rejectionReason}
                onReasonChange={setRejectionReason}
                onConfirm={handleRejectSubmit}
            />

            {/* Bulk Verify Dialog */}
            <VerifyPaymentDialog
                isOpen={isBulkVerifyDialogOpen}
                onClose={() => setIsBulkVerifyDialogOpen(false)}
                payment={{
                    id: "multiple",
                    request_id: `${selectedPayments.length} payments`,
                }}
                onConfirm={confirmBulkVerify}
            />
        </div>
    );
}