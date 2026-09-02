import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Upload, FileText, Image, X, AlertCircle, CheckCircle2 } from "lucide-react";

export function AddReceiptModal({ isOpen, onClose, payment }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setError(null);

        if (selectedFile) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(selectedFile.type)) {
                setError('Please upload a valid image (JPG, PNG, GIF) or PDF file');
                setFile(null);
                setPreview(null);
                return;
            }

            // Validate file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                setFile(null);
                setPreview(null);
                return;
            }

            setFile(selectedFile);

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setPreview(null);
        setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('receipt_file', file);
        formData.append('payment_id', payment.id);

        router.post(route('admin.payments.upload-receipt'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                handleClose();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setError(errors.receipt_file || 'Failed to upload receipt. Please try again.');
            },
        });
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setIsSubmitting(false);
        onClose();
    };

    if (!payment) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#0d1f5c]">
                        Upload Payment Receipt
                    </DialogTitle>
                    <DialogDescription>
                        Upload the applicant's payment receipt (image or PDF)
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Payment Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500">Application Number:</span>
                                <span className="ml-2 font-semibold text-[#0d1f5c]">
                                    {payment.application_number || `TPZ-${String(payment.request_id).padStart(4, '0')}`}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Applicant:</span>
                                <span className="ml-2 font-semibold">
                                    {payment.applicant_name}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Amount:</span>
                                <span className="ml-2 font-semibold">
                                    ₱{parseFloat(payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Receipt #:</span>
                                <span className="ml-2 font-semibold">
                                    {payment.receipt_number || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <Label htmlFor="receipt_file" className="text-sm font-semibold text-slate-700">
                            Receipt File *
                        </Label>
                        
                        {!file ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#d4a017] transition-colors">
                                <input
                                    type="file"
                                    id="receipt_file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="receipt_file"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="p-4 bg-slate-100 rounded-full mb-3">
                                        <Upload className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        JPG, PNG, GIF or PDF (max 5MB)
                                    </p>
                                </label>
                            </div>
                        ) : (
                            <div className="border border-slate-300 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        {preview ? (
                                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                                                <img
                                                    src={preview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <FileText className="h-8 w-8 text-slate-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </p>
                                            <div className="flex items-center gap-1 mt-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                <span className="text-xs text-emerald-600 font-medium">
                                                    File ready to upload
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveFile}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-slate-500 mt-2">
                            * Upload a clear photo or PDF of the official payment receipt
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!file || isSubmitting}
                            className="bg-[#0d1f5c] hover:bg-[#0d1f5c]/90 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Receipt
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
