import React from "react";
import { formatDate, formatCurrency } from "./utils";
import {
    FileText,
    User,
    Calendar,
    CreditCard,
    Receipt,
    CheckCircle,
    AlertCircle,
    Clock,
} from "lucide-react";

export function PaymentDetailsCard({ payment }) {
    if (!payment) {
        return (
            <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">No payment data available</p>
            </div>
        );
    }

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
                        value={payment.applicant_name || payment.request?.applicant?.applicant_name || payment.request?.applicant?.name || "N/A"}
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
                        icon={<Calendar className="w-4 h-4 text-gray-500" />}
                        label="Submitted On"
                        value={formatDate(payment.created_at)}
                    />
                </div>
            </div>

            {/* Request Details Card */}
            {(payment.request || payment.project_type || payment.applicant_name || payment.user_email) && (
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        Request Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Applicant name — from relationship or flat column */}
                        {(payment.applicant_name || payment.request?.applicant?.applicant_name) && (
                            <InfoField
                                icon={<User className="w-4 h-4 text-gray-500" />}
                                label="Applicant Name"
                                value={payment.applicant_name || payment.request?.applicant?.applicant_name}
                            />
                        )}
                        {/* Project type — from flat column or relationship */}
                        {(payment.project_type || payment.request?.project_type) && (
                            <InfoField
                                label="Project Type"
                                value={payment.project_type || payment.request?.project_type}
                            />
                        )}
                        {/* Submitted by user */}
                        {(payment.user_name || payment.request?.user?.name) && (
                            <InfoField
                                icon={<User className="w-4 h-4 text-gray-500" />}
                                label="Submitted By"
                                value={payment.user_name || payment.request?.user?.name}
                            />
                        )}
                        {(payment.user_email || payment.request?.user?.email) && (
                            <InfoField
                                label="User Email"
                                value={payment.user_email || payment.request?.user?.email}
                            />
                        )}
                        {/* Request status */}
                        {(payment.request?.status) && (
                            <InfoField
                                label="Request Status"
                                value={
                                    <span className="capitalize">
                                        {payment.request.status.replace(/_/g, " ")}
                                    </span>
                                }
                            />
                        )}
                        {/* Payment order number */}
                        {payment.request?.payment_order_number && (
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
