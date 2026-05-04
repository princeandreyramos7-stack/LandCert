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
import { AlertTriangle } from "lucide-react";

export function DeleteConfirmDialog({ isOpen, onClose, request, onConfirm }) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle>Delete Request</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">
                        Are you sure you want to delete Request #{request.id} from{" "}
                        <strong>{request.applicant_name}</strong>?
                        <br />
                        <br />
                        This action cannot be undone. All associated data will be
                        permanently removed from the system.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
