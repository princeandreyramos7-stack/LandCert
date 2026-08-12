import React, { useState } from "react";
import { formatDate, formatCurrency } from "./utils";
import {
    FileText,
    User,
    Calendar,
    CreditCard,
    Receipt,
    Download,
    ZoomIn,
    X,
    CheckCircle,
    AlertCircle,
    Clock,
    Eye,
} from "lucide-react";

export function PaymentDetailsCard({ payment }) {
    const [showImagePreview, setShowImagePreview] = useState(false);

    if (!payment) {
        return (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">No payment data available</p>
            </div>
        );
    }

    const receiptUrl = payment.receipt_file_path
        ? `/storage/${payment.receipt_file_path}`
        : payment.receipt_path
        ? `/storage/${payment.receipt_path}`
        : null;

    const handleDownloadReceipt = () => {
        if (receiptUrl) {
            const link = document.createElement("a");
            link.href = receiptUrl;
            link.download = `receipt_${payment.id}.${receiptUrl.split(".").pop()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isPDF = receiptUrl?.toLowerCase().endsWith(".pdf");

    return (
        <div className="space-y-6">
            {/* Main Payment Information Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg border border-blue-100 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Payment Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoField
                        icon={<Receipt className="w-4 h-4 text-gray-500" />}
                        label="Payment ID"
                        value={`#${payment.id}`}
                    />
                    <InfoField
                        icon={<FileText className="w-4 h-4 text-gray-500" />}
                        label="Request ID"
                        value={`#${payment.request_id}`}
                    />
                    <InfoField
                        icon={<User className="w-4 h-4 text-gray-500" />}
                        label="Applicant Name"
                        value={payment.applicant_name || payment.request?.applicant?.name || "N/A"}
                    />
                    <InfoField
                        icon={<CreditCard className="w-4 h-4 text-gray-500" />}
                        label="Amount"
                        value={formatCurrency(payment.amount)}
                        highlight
                    />
                    <InfoField
                        icon={<CreditCard className="w-4 h-4 text-gray-500" />}
                        label="Payment Method"
                        value={formatPaymentMethod(payment.payment_method)}
                    />
                    <InfoField
                        icon={<Calendar className="w-4 h-4 text-gray-500" />}
                        label="Payment Date"
                        value={formatDate(payment.payment_date)}
                    />
                    {payment.receipt_number && (
                        <InfoField
                            icon={<Receipt className="w-4 h-4 text-gray-500" />}
                            label="Official Receipt Number"
                            value={payment.receipt_number}
                        />
                    )}
                    {payment.check_number && (
                        <InfoField
                            icon={<FileText className="w-4 h-4 text-gray-500" />}
                            label="Check Number"
                            value={payment.check_number}
                        />
                    )}
                    {payment.reference_number && (
                        <InfoField
                            icon={<FileText className="w-4 h-4 text-gray-500" />}
                            label="Reference Number"
                            value={payment.reference_number}
                        />
                    )}
                    <InfoField
                        icon={getStatusIcon(payment.payment_status)}
                        label="Status"
                        value={
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                                    payment.payment_status
                                )}`}
                            >
                                {formatStatus(payment.payment_status)}
                            </span>
                        }
                    />
                    <InfoField
                        icon={<Calendar className="w-4 h-4 text-gray-500" />}
                        label="Submitted On"
                        value={formatDate(payment.created_at)}
                    />
                </div>
            </div>

            {/* Request Details Card */}
            {payment.request && (
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        Request Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {payment.request.project_type && (
                            <InfoField
                                label="Project Type"
                                value={payment.request.project_type}
                            />
                        )}
                        {payment.request.status && (
                            <InfoField
                                label="Request Status"
                                value={
                                    <span className="capitalize">
                                        {payment.request.status.replace(/_/g, " ")}
                                    </span>
                                }
                            />
                        )}
                        {payment.request.payment_order_number && (
                            <InfoField
                                label="Payment Order Number"
                                value={payment.request.payment_order_number}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Verification Details Card */}
            {(payment.verified_by || payment.verified_at) && (
                <div className="bg-green-50 p-4 sm:p-6 rounded-lg border border-green-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Verification Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {payment.verified_by_user && (
                            <>
                                <InfoField
                                    icon={<User className="w-4 h-4 text-green-600" />}
                                    label="Verified By"
                                    value={payment.verified_by_user.name}
                                />
                                {payment.verified_by_user.email && (
                                    <InfoField
                                        label="Verifier Email"
                                        value={payment.verified_by_user.email}
                                    />
                                )}
                            </>
                        )}
                        {!payment.verified_by_user && payment.verified_by && (
                            <InfoField
                                icon={<User className="w-4 h-4 text-green-600" />}
                                label="Verified By (User ID)"
                                value={`#${payment.verified_by}`}
                            />
                        )}
                        {payment.verified_at && (
                            <InfoField
                                icon={<Calendar className="w-4 h-4 text-green-600" />}
                                label="Verified At"
                                value={formatDateTime(payment.verified_at)}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Receipt Image/PDF Section */}
            {receiptUrl && (
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-gray-600" />
                            Payment Receipt
                        </h3>
                        <div className="flex gap-2">
                            {!isPDF && (
                                <button
                                    onClick={() => setShowImagePreview(true)}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                    <span className="hidden sm:inline">View Full Size</span>
                                </button>
                            )}
                            {isPDF && (
                                <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="hidden sm:inline">View PDF</span>
                                </a>
                            )}
                            <button
                                onClick={handleDownloadReceipt}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                            </button>
                        </div>
                    </div>
                    <div className="relative group">
                        {isPDF ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <FileText className="w-16 h-16 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 mb-2">PDF Receipt Available</p>
                                <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Click to view in new tab
                                </a>
                            </div>
                        ) : (
                            <>
                                <img
                                    src={receiptUrl}
                                    alt="Payment Receipt"
                                    className="w-full h-auto rounded-lg border-2 border-gray-200 shadow-md cursor-pointer hover:border-blue-400 transition-all"
                                    onClick={() => setShowImagePreview(true)}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                    <ZoomIn className="w-12 h-12 text-white drop-shadow-lg" />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Notes Section */}
            {payment.notes && (
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Notes
                    </h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{payment.notes}</p>
                </div>
            )}

            {/* Rejection Reason Section */}
            {payment.rejection_reason && (
                <div className="bg-red-50 p-4 sm:p-6 rounded-lg border border-red-200 shadow-sm">
                    <h3 className="text-sm font-medium text-red-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        Rejection Reason
                    </h3>
                    <p className="text-sm text-red-700 whitespace-pre-wrap">
                        {payment.rejection_reason}
                    </p>
                </div>
            )}

            {/* Audit Trail Section */}
            {payment.audit_trail && payment.audit_trail.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-600" />
                        Audit Trail
                    </h3>
                    <div className="space-y-3">
                        {payment.audit_trail.map((entry, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                        {entry.action}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        by {entry.user} on {formatDateTime(entry.timestamp)}
                                    </p>
                                    {entry.details && (
                                        <p className="text-xs text-gray-500 mt-1">{entry.details}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Activity Log / Timestamps Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    Activity Timestamps
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoField
                        icon={<Calendar className="w-4 h-4 text-gray-500" />}
                        label="Created At"
                        value={formatDateTime(payment.created_at)}
                    />
                    <InfoField
                        icon={<Calendar className="w-4 h-4 text-gray-500" />}
                        label="Last Updated"
                        value={formatDateTime(payment.updated_at)}
                    />
                </div>
            </div>

            {/* Full Screen Image Preview */}
            {showImagePreview && receiptUrl && !isPDF && (
                <div
                    className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-4"
                    onClick={() => setShowImagePreview(false)}
                >
                    <button
                        onClick={() => setShowImagePreview(false)}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
                        aria-label="Close preview"
                    >
                        <X className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReceipt();
                        }}
                        className="absolute top-4 right-20 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors z-10"
                        aria-label="Download receipt"
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
        </div>
    );
}

// Helper Components
function InfoField({ icon, label, value, highlight = false }) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1 mb-1">
                {icon}
                <p className="text-xs text-gray-500">{label}</p>
            </div>
            <div
                className={`text-sm font-semibold break-words ${
                    highlight ? "text-blue-600 text-base sm:text-lg" : "text-gray-900"
                }`}
            >
                {value || "N/A"}
            </div>
        </div>
    );
}

// Helper Functions
function formatPaymentMethod(method) {
    if (!method) return "N/A";
    return method
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatStatus(status) {
    if (!status) return "N/A";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusClass(status) {
    switch (status) {
        case "verified":
            return "bg-green-100 text-green-800 border border-green-300";
        case "rejected":
            return "bg-red-100 text-red-800 border border-red-300";
        case "pending":
            return "bg-yellow-100 text-yellow-800 border border-yellow-300";
        default:
            return "bg-blue-100 text-blue-800 border border-blue-300";
    }
}

function getStatusIcon(status) {
    switch (status) {
        case "verified":
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        case "rejected":
            return <AlertCircle className="w-4 h-4 text-red-600" />;
        case "pending":
            return <Clock className="w-4 h-4 text-yellow-600" />;
        default:
            return <Clock className="w-4 h-4 text-blue-600" />;
    }
}

function formatDateTime(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
