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

export function ApproveDialog({ isOpen, onClose, request, onConfirm }) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle2 className="h-7 w-7 text-green-600" />
                        </div>
                        <DialogTitle className="text-xl">Approve Request</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4 text-base">
                        Are you sure you want to approve this request?
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 my-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Request ID:</span>
                            <span className="text-sm font-bold text-gray-900">#{request.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Applicant:</span>
                            <span className="text-sm font-bold text-gray-900">{request.applicant_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Project Type:</span>
                            <span className="text-sm font-bold text-gray-900">{request.project_type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">User Email:</span>
                            <span className="text-sm font-bold text-gray-900">{request.user_email}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                        <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span>
                            <strong>Notice:</strong> The applicant will be notified via email and can proceed to the payment stage.
                        </span>
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={onConfirm}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirm Approval
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
