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
import { CheckCircle2 } from "lucide-react";

export function VerifyPaymentDialog({ isOpen, onClose, payment, onConfirm }) {
    if (!payment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle>Verify Payment</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">
                        Are you sure you want to verify Payment #{payment.id} for
                        Request #{payment.request_id}?
                        <br />
                        <br />
                        This will generate a certificate and notify the applicant via
                        email.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={onConfirm}
                    >
                        Verify Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
