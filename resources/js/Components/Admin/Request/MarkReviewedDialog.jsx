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
import { CheckCircle } from "lucide-react";

export function MarkReviewedDialog({ isOpen, onClose, request, onConfirm }) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle>Mark Request as Reviewed</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">
                        Are you sure you want to mark this request as reviewed?
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                                Request ID:
                            </span>
                            <span className="text-sm font-semibold">
                                #{request.id}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                                Applicant:
                            </span>
                            <span className="text-sm font-semibold">
                                {request.applicant_name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                                Project Type:
                            </span>
                            <span className="text-sm font-semibold">
                                {request.project_type}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                                Current Status:
                            </span>
                            <span className="text-sm font-semibold capitalize">
                                {request.status || "pending"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                        <svg
                            className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <span>
                            This action will mark the request as reviewed. The applicant will be notified of this status change.
                        </span>
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm & Mark as Reviewed
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
