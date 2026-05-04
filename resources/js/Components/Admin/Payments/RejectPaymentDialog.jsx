import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { XCircle } from "lucide-react";

export function RejectPaymentDialog({
    isOpen,
    onClose,
    payment,
    rejectionReason,
    onReasonChange,
    onConfirm,
}) {
    if (!payment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle>Reject Payment</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">
                        You are about to reject Payment #{payment.id} for Request #
                        {payment.request_id}.
                        <br />
                        <br />
                        Please provide a reason for rejection. This will be sent to
                        the applicant.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                    <Textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(e) => onReasonChange(e.target.value)}
                        placeholder="Explain why this payment is being rejected..."
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                        This reason will be sent to the applicant via email.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={!rejectionReason.trim()}
                    >
                        Reject Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
