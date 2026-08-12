import React, { useState, useEffect } from "react";
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
import { XCircle, AlertTriangle } from "lucide-react";

export function RejectDialog({
    isOpen,
    onClose,
    request,
    onConfirm,
}) {
    const [feedback, setFeedback] = useState("");
    
    // Reset feedback when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFeedback("");
        }
    }, [isOpen]);
    
    if (!request) return null;

    // Common rejection reasons
    const commonReasons = [
        "Incomplete documentation",
        "Does not meet zoning requirements",
        "Missing required permits",
        "Incorrect land classification",
        "Insufficient project details",
        "Non-compliance with building codes",
    ];

    const handleReasonClick = (reason) => {
        setFeedback(reason);
    };
    
    const handleConfirm = () => {
        onConfirm(feedback);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                            <XCircle className="h-7 w-7 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl text-red-900">Reject Request</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4 text-base">
                        Please provide a detailed reason for rejecting this request. The applicant will receive this feedback.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 my-4">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">
                                Request ID:
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                #{request.id}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">
                                Applicant:
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {request.applicant_name}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">
                                Project Type:
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {request.project_type}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">
                                User Email:
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {request.user_email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Selection - Common Reasons */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Quick Select (Common Reasons):</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {commonReasons.map((reason, index) => (
                            <Button
                                key={index}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleReasonClick(reason)}
                                className="justify-start text-left h-auto py-2 px-3 hover:bg-red-50 hover:border-red-300 transition-colors"
                            >
                                <span className="text-xs">{reason}</span>
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Rejection Reason Text Area */}
                <div className="space-y-3">
                    <Label htmlFor="rejection-reason" className="text-sm font-semibold text-gray-700">
                        Rejection Reason <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="rejection-reason"
                        placeholder="Enter detailed rejection reason here... (Required)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[120px] resize-none border-2 focus:border-red-500"
                    />
                    <p className="text-xs text-gray-500">
                        {feedback.length} / 500 characters
                    </p>
                </div>

                {/* Warning Notice */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-yellow-900 mb-1">Important Notice</p>
                            <p className="text-sm text-yellow-800">
                                This rejection will be permanent. The applicant will be notified via email with the reason you provide. Please ensure your feedback is clear and constructive.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleConfirm}
                        disabled={!feedback.trim()}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirm Rejection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
