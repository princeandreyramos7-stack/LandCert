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

export function ApproveConfirmDialog({ isOpen, onClose, request, onConfirm }) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <DialogTitle>Approve Request</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">
                        Are you sure you want to approve Request #{request.id} from{" "}
                        <strong>{request.applicant_name}</strong>?
                        <br />
                        <br />
                        The applicant will be notified via email and can proceed to the
                        payment stage.
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
                        Approve Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
