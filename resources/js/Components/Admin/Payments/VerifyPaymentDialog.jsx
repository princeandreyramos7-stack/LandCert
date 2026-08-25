import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { useToast } from "@/Components/ui/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

/**
 * VerifyPaymentDialog
 *
 * Lets an admin/super admin confirm the amount, OR number, and payment date
 * before marking a pending payment as verified - or reject it with a reason.
 * Both actions POST to the existing admin/super-admin payments.verify and
 * payments.reject routes (routePrefix picks the correct one per panel).
 */
export function VerifyPaymentDialog({ isOpen, onClose, payment, routePrefix = "admin" }) {
    const { toast } = useToast();
    const [mode, setMode] = useState("verify"); // "verify" | "reject"
    const [processing, setProcessing] = useState(false);
    const [verifyForm, setVerifyForm] = useState({
        amount: "",
        receipt_number: "",
        payment_date: "",
        notes: "",
    });
    const [rejectionReason, setRejectionReason] = useState("");

    // Pre-fill the verify form whenever a new payment is selected / dialog reopens
    useEffect(() => {
        if (payment && isOpen) {
            setMode("verify");
            setVerifyForm({
                amount: payment.amount || "",
                receipt_number: payment.receipt_number || "",
                payment_date: payment.payment_date
                    ? new Date(payment.payment_date).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                notes: "",
            });
            setRejectionReason("");
        }
    }, [payment, isOpen]);

    if (!payment) return null;

    const handleVerify = () => {
        setProcessing(true);
        router.post(route(`${routePrefix}.payments.verify`, payment.id), verifyForm, {
            onSuccess: () => {
                toast({
                    title: "Payment Verified",
                    description: `Payment for Request #${payment.request_id} has been verified.`,
                });
                onClose();
            },
            onError: (errors) => {
                toast({
                    variant: "destructive",
                    title: "Verification Failed",
                    description: Object.values(errors)[0] || "Please check the form and try again.",
                });
            },
            onFinish: () => setProcessing(false),
        });
    };

    const handleReject = () => {
        setProcessing(true);
        router.post(
            route(`${routePrefix}.payments.reject`, payment.id),
            { rejection_reason: rejectionReason },
            {
                onSuccess: () => {
                    toast({
                        title: "Payment Rejected",
                        description: `Payment for Request #${payment.request_id} has been rejected.`,
                    });
                    onClose();
                },
                onError: (errors) => {
                    toast({
                        variant: "destructive",
                        title: "Rejection Failed",
                        description: Object.values(errors)[0] || "Please provide a reason and try again.",
                    });
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                {mode === "verify" ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-5 w-5" />
                                Verify Payment
                            </DialogTitle>
                            <DialogDescription>
                                Confirm payment details before marking as verified.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-200 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Applicant</span>
                                <span className="font-medium">{payment.applicant_name || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Request</span>
                                <span className="font-medium">#{payment.request_id}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="verify-amount">
                                        Amount (₱) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="verify-amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={verifyForm.amount}
                                        onChange={(e) =>
                                            setVerifyForm({ ...verifyForm, amount: e.target.value })
                                        }
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="verify-date">
                                        Payment Date <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="verify-date"
                                        type="date"
                                        value={verifyForm.payment_date}
                                        max={new Date().toISOString().split("T")[0]}
                                        onChange={(e) =>
                                            setVerifyForm({ ...verifyForm, payment_date: e.target.value })
                                        }
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="verify-or">
                                    OR Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="verify-or"
                                    value={verifyForm.receipt_number}
                                    onChange={(e) =>
                                        setVerifyForm({ ...verifyForm, receipt_number: e.target.value })
                                    }
                                    placeholder="Official Receipt number"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="verify-notes">Notes (optional)</Label>
                                <Textarea
                                    id="verify-notes"
                                    value={verifyForm.notes}
                                    onChange={(e) =>
                                        setVerifyForm({ ...verifyForm, notes: e.target.value })
                                    }
                                    rows={2}
                                    className="mt-1 resize-none"
                                />
                            </div>
                        </div>

                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setMode("reject")}
                                disabled={processing}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 sm:mr-auto"
                            >
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Reject instead
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleVerify}
                                disabled={
                                    processing ||
                                    !verifyForm.amount ||
                                    !verifyForm.receipt_number ||
                                    !verifyForm.payment_date
                                }
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {processing ? "Verifying..." : "Verify Payment"}
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-700">
                                <XCircle className="h-5 w-5" />
                                Reject Payment
                            </DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting this payment. This will be sent to
                                the applicant.
                            </DialogDescription>
                        </DialogHeader>

                        <div>
                            <Label htmlFor="reject-reason">
                                Rejection Reason <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="reject-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why this payment is being rejected..."
                                rows={4}
                                className="mt-1 resize-none"
                            />
                        </div>

                        <DialogFooter className="mt-4 gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setMode("verify")}
                                disabled={processing}
                                className="sm:mr-auto"
                            >
                                Back to verify
                            </Button>
                            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleReject}
                                disabled={processing || !rejectionReason.trim()}
                            >
                                {processing ? "Rejecting..." : "Reject Payment"}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
