import React from "react";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Loader2 } from "lucide-react";

export function ConfirmDialog({
    isOpen,
    onOpenChange,
    selectedRequest,
    formData,
    onConfirm,
    isSubmitting,
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Payment Submission</DialogTitle>
                    <DialogDescription>
                        Please review your payment details before submitting.
                    </DialogDescription>
                </DialogHeader>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm">
                        <strong>Request ID:</strong> #{selectedRequest?.id}
                    </p>
                    <p className="text-sm">
                        <strong>Applicant:</strong>{" "}
                        {selectedRequest?.applicant_name}
                    </p>
                    <p className="text-sm">
                        <strong>Amount:</strong> ₱
                        {parseFloat(formData.amount || 0).toLocaleString()}
                    </p>
                    <p className="text-sm">
                        <strong>Payment Method:</strong>{" "}
                        {formData.payment_method === "other"
                            ? formData.other_method
                            : formData.payment_method.replace("_", " ")}
                    </p>
                    <p className="text-sm">
                        <strong>Payment Date:</strong> {formData.payment_date}
                    </p>
                    {formData.receipt_number && (
                        <p className="text-sm">
                            <strong>Receipt Number:</strong>{" "}
                            {formData.receipt_number}
                        </p>
                    )}
                    {formData.receipt_file && (
                        <p className="text-sm">
                            <strong>File:</strong> {formData.receipt_file.name}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isSubmitting}>
                        {isSubmitting && (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
