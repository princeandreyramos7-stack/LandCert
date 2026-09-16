import { CheckCircle2, XCircle, Clock } from "lucide-react";

/**
 * Get status badge color classes based on payment status
 */
export const getStatusColor = (status) => {
    switch (status) {
        case "verified":
            return "bg-emerald-100 text-emerald-800 border-emerald-300";
        case "rejected":
            return "bg-rose-100 text-rose-800 border-rose-300";
        default:
            return "bg-blue-100 text-blue-800 border-blue-300";
    }
};

/**
 * Get status icon component based on payment status
 */
export const getStatusIcon = (status) => {
    switch (status) {
        case "verified":
            return <CheckCircle2 className="h-4 w-4" />;
        case "rejected":
            return <XCircle className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
    }
};

/**
 * Format date string to readable format
 */
export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount) => {
    if (!amount) return "₱0.00";
    return `₱${parseFloat(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * A payment's status as the office reads it. "pending" is a receipt the
 * applicant uploaded that nobody has checked yet - the Zoning Officer's next
 * job - so it is named for that rather than left as a bare word.
 */
export const PAYMENT_STATUS = {
    pending:  { label: "Needs verification", cls: "bg-amber-50 text-amber-800 border-amber-200",       dot: "bg-amber-500" },
    verified: { label: "Verified",           cls: "bg-emerald-50 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
    rejected: { label: "Denied",             cls: "bg-rose-50 text-rose-800 border-rose-200",          dot: "bg-rose-500" },
};

export function PaymentStatusBadge({ status, className = "" }) {
    const cfg = PAYMENT_STATUS[status] || PAYMENT_STATUS.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold ${cfg.cls} ${className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}
