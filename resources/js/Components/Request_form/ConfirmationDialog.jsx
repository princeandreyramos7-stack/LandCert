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
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";

export function ConfirmationDialog({ isOpen, onClose, onConfirm, processing }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <CheckCircle2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <DialogTitle>Confirm Submission</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to submit this application? Please review
                        all information before proceeding.
                    </DialogDescription>
                </DialogHeader>
                
                {/* Content moved outside DialogDescription to avoid HTML nesting issues */}
                <div className="space-y-3">
                    {/* Next Step Reminder */}
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 flex gap-3">
                        <Upload className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                            <div className="font-bold mb-2 text-base">📋 Next Step After Submission:</div>
                            <div className="mb-2">
                                You will be automatically redirected to upload the required 
                                <strong> softcopy documents</strong> (scanned copies or photos of your requirements).
                            </div>
                            <div className="text-xs text-blue-700">
                                ⏱️ This is an important step to complete your application process.
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <div className="font-medium mb-1">Important:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    Once submitted, you cannot edit the application
                                </li>
                                <li>
                                    You will receive a confirmation email with your
                                    application details
                                </li>
                                <li>
                                    The admin will review your application and notify you
                                    of the decision
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {processing ? "Submitting..." : "Confirm & Submit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
