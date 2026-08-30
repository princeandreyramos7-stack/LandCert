import { CheckCircle2, XCircle, Clock } from "lucide-react";

// Everything after the payment is verified reads simply as "Application Approved".
const PAID_STATUSES = ["payment_confirmed", "certificate_preparing", "certificate_ready", "released", "approved_with_payment"];

/**
 * Get status badge color classes
 */
export const getStatusColor = (status) => {
    if (PAID_STATUSES.includes(status)) {
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300";
    }
    switch (status) {
        case "approved":
            return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300";
        case "rejected":
            return "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300";
        default:
            return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300";
    }
};

/**
 * Get status icon component
 */
export const getStatusIcon = (status) => {
    if (PAID_STATUSES.includes(status)) return <CheckCircle2 className="h-4 w-4" />;
    switch (status) {
        case "approved":
            return <CheckCircle2 className="h-4 w-4" />;
        case "rejected":
            return <XCircle className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
    }
};

/**
 * Human-readable status label for the applicant dashboard.
 */
export const getStatusLabel = (status) => {
    if (PAID_STATUSES.includes(status)) return "Application Approved";
    switch (status) {
        case "pending":
            return "Pending Review";
        case "reviewed":
            return "Waiting for Approval";
        case "approved":
            return "Approved — For Payment";
        case "rejected":
            return "Denied";
        default:
            return status
                ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
                : "Pending";
    }
};

/**
 * Format location from request object
 */
export const formatLocation = (request) => {
    const parts = [
        request?.project_location_street,
        request?.project_location_barangay,
        request?.project_location_city || request?.project_location_municipality,
        request?.project_location_province,
    ].filter(Boolean);
    return parts.join(", ") || "Location not specified";
};

/**
 * Format date string
 */
export const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

/**
 * Calculate statistics from requests array
 */
export const calculateStats = (requests) => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const denied = requests.filter((r) => r.status === "rejected").length;
    const withCertificates = requests.filter(
        (r) => r.payment_verified && r.certificate_number
    ).length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRequests = requests.filter((r) => {
        const requestDate = new Date(r.created_at);
        return requestDate >= thirtyDaysAgo;
    }).length;

    return {
        total,
        pending,
        approved,
        denied,
        withCertificates,
        recentRequests,
    };
};
