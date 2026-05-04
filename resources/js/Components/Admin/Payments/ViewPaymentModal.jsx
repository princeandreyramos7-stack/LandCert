import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { formatDate, formatCurrency } from "./utils";
import { Download, ZoomIn, X, FileText } from "lucide-react";

export function ViewPaymentModal({ isOpen, onClose, payment }) {
    const [showImagePreview, setShowImagePreview] = useState(false);
    
    if (!payment) return null;

    const receiptUrl = payment.receipt_file_path 
        ? `/storage/${payment.receipt_file_path}` 
        : payment.receipt_path 
            ? `/storage/${payment.receipt_path}` 
            : null;

    const handleDownloadReceipt = () => {
        if (receiptUrl) {
            const link = document.createElement('a');
            link.href = receiptUrl;
            link.download = `receipt_${payment.id}.${receiptUrl.split('.').pop()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Payment Details #{payment.id}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Payment Information Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Payment Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField
                                    label="Payment ID"
                                    value={`#${payment.id}`}
                                />
                                <InfoField
                                    label="Request ID"
                                    value={`#${payment.request_id}`}
                                />
                                <InfoField
                                    label="Applicant Name"
                                    value={payment.applicant_name}
                                />
                                <InfoField
                                    label="Amount"
                                    value={formatCurrency(payment.amount)}
                                    highlight
                                />
                                <InfoField
                                    label="Payment Method"
                                    value={payment.payment_method?.replace("_", " ")}
                                />
                                <InfoField
                                    label="Payment Date"
                                    value={formatDate(payment.payment_date)}
                                />
                                {payment.receipt_number && (
                                    <InfoField
                                        label="Receipt Number"
                                        value={payment.receipt_number}
                                    />
                                )}
                                <InfoField
                                    label="Status"
                                    value={
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            payment.payment_status === 'verified' 
                                                ? 'bg-green-100 text-green-800'
                                                : payment.payment_status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {payment.payment_status?.charAt(0).toUpperCase() + payment.payment_status?.slice(1)}
                                        </span>
                                    }
                                />
                                <InfoField
                                    label="Submitted On"
                                    value={formatDate(payment.created_at)}
                                />
                            </div>
                        </div>

                        {/* Receipt Image Section */}
                        {receiptUrl && (
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Payment Receipt
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowImagePreview(true)}
                                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                            View Full Size
                                        </button>
                                        <button
                                            onClick={handleDownloadReceipt}
                                            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <img
                                        src={receiptUrl}
                                        alt="Payment Receipt"
                                        className="w-full h-auto rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:border-blue-400 transition-all"
                                        onClick={() => setShowImagePreview(true)}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notes Section */}
                        {payment.notes && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </p>
                                <p className="text-sm text-gray-600">
                                    {payment.notes}
                                </p>
                            </div>
                        )}

                        {/* Rejection Reason Section */}
                        {payment.rejection_reason && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <p className="text-sm font-medium text-red-900 mb-2">
                                    Rejection Reason
                                </p>
                                <p className="text-sm text-red-700">
                                    {payment.rejection_reason}
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Full Screen Image Preview */}
            {showImagePreview && receiptUrl && (
                <div 
                    className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-4"
                    onClick={() => setShowImagePreview(false)}
                >
                    <button
                        onClick={() => setShowImagePreview(false)}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReceipt();
                        }}
                        className="absolute top-4 right-20 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <Download className="w-6 h-6 text-gray-800" />
                    </button>
                    <img
                        src={receiptUrl}
                        alt="Payment Receipt - Full Size"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}

function InfoField({ label, value, highlight = false }) {
    return (
        <div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-sm font-semibold ${highlight ? 'text-blue-600 text-lg' : 'text-gray-900'}`}>
                {value || "N/A"}
            </p>
        </div>
    );
}
