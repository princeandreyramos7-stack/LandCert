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

export function RejectDialog({
    isOpen,
    onClose,
    request,
    feedback,
    onFeedbackChange,
    onConfirm,
}) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle>Reject Request</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">
                        You are about to reject Request #{request.id} from{" "}
                        <strong>{request.applicant_name}</strong>.
                        <br />
                        <br />
                        Please provide feedback explaining why this request is being
                        rejected. This will help the applicant understand what needs to
                        be corrected.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="feedback">Rejection Feedback *</Label>
                    <Textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => onFeedbackChange(e.target.value)}
                        placeholder="Explain why this request is being rejected..."
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-gray-500">
                        This feedback will be sent to the applicant via email.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={!feedback.trim()}
                    >
                        Reject Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
