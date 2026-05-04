import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/ui/card";
import { router } from "@inertiajs/react";
import { useToast } from "@/Components/ui/use-toast";
import { ReceiptCard } from "./ReceiptCard";
import { UploadDialog } from "./UploadDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import {
    validateReceiptForm,
    createFormData,
    getInitialFormData,
} from "./utils";

export function ReceiptList({ requests = [] }) {
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(getInitialFormData());
    const { toast } = useToast();

    const handleUploadClick = (request) => {
        setSelectedRequest(request);
        setIsUploadDialogOpen(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, receipt_file: file });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = validateReceiptForm(formData);
        if (errors.length > 0) {
            toast({
                variant: "destructive",
                title: errors[0].title,
                description: errors[0].description,
            });
            return;
        }

        setIsConfirmDialogOpen(true);
    };

    const confirmSubmit = () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        const data = createFormData(selectedRequest, formData);

        router.post(route("receipt.store"), data, {
            onSuccess: () => {
                setIsUploadDialogOpen(false);
                setIsConfirmDialogOpen(false);
                setIsSubmitting(false);
                setFormData(getInitialFormData());
                toast({
                    title: "Receipt Submitted!",
                    description: `Your payment receipt for Request #${selectedRequest.id} has been submitted successfully! Please wait for admin verification. You will receive an email notification once your payment is verified.`,
                });
            },
            onError: () => {
                setIsConfirmDialogOpen(false);
                setIsSubmitting(false);
                toast({
                    variant: "destructive",
                    title: "Submission Failed!",
                    description:
                        "Failed to submit your payment receipt. Please check your information and try again. If the problem persists, contact support.",
                });
            },
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Receipts</CardTitle>
                    <CardDescription>
                        Upload payment receipts for your approved applications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request, index) => (
                                <ReceiptCard
                                    key={`request-${request.id}-${
                                        request.payment_id || index
                                    }`}
                                    request={request}
                                    onUploadClick={handleUploadClick}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <UploadDialog
                isOpen={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
                selectedRequest={selectedRequest}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onFileChange={handleFileChange}
            />

            <ConfirmDialog
                isOpen={isConfirmDialogOpen}
                onOpenChange={setIsConfirmDialogOpen}
                selectedRequest={selectedRequest}
                formData={formData}
                onConfirm={confirmSubmit}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
