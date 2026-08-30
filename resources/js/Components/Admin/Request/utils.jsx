import { CheckCircle2, XCircle, Clock, DollarSign, FileCheck, Hourglass } from "lucide-react";

/**
 * Get status badge color classes based on status
 */
export const getStatusColor = (status) => {
    switch (status) {
        case "approved":
            return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300";
        case "rejected":
            return "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300";
        case "reviewed":
        case "for_payment":
        case "pending_payment":
            return "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300";
        case "pending":
        case "for_verification":
            return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300";
        case "approved_with_payment":
        // Once payment is verified the application is simply "Application Approved" —
        // the certificate lifecycle is tracked on the Certificates page, not here.
        case "payment_confirmed":
        case "certificate_preparing":
        case "certificate_ready":
        case "released":
            return "bg-green-100 text-green-800 hover:bg-green-200 border-green-300";
        default:
            return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300";
    }
};

/**
 * Get status icon component based on status
 */
export const getStatusIcon = (status) => {
    switch (status) {
        case "approved":
        case "approved_with_payment":
        case "payment_confirmed":
        case "certificate_preparing":
        case "certificate_ready":
        case "released":
            return <CheckCircle2 className="h-4 w-4" />;
        case "rejected":
            return <XCircle className="h-4 w-4" />;
        case "reviewed":
            // "For Approval" — waiting on the Zoning Administrator, not a payment step.
            return <Hourglass className="h-4 w-4" />;
        case "for_payment":
        case "pending_payment":
            return <DollarSign className="h-4 w-4" />;
        case "for_verification":
            return <FileCheck className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
    }
};

/**
 * Get human-readable status label
 */
export const getStatusLabel = (status) => {
    switch (status) {
        case "pending":
        case "for_verification":
            return "For Verification";
        case "reviewed":
            // Officer has reviewed and set the fee; the Zoning Administrator must
            // approve before the applicant can pay.
            return "For Approval";
        case "for_payment":
        case "pending_payment":
            return "For Payment";
        case "approved":
            return "Approved — For Payment";
        case "approved_with_payment":
        case "payment_confirmed":
        case "certificate_preparing":
        case "certificate_ready":
        case "released":
            return "Application Approved";
        case "rejected":
            return "Application Denied";
        default:
            return status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ') : "Unknown";
    }
};

/**
 * Format date string to readable format
 */
export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

/**
 * Format request location from multiple fields
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
 * Generate CSV content from requests array
 */
export const generateCSV = (requests) => {
    const headers = [
        "ID",
        "Applicant Name",
        "User Email",
        "Locational Clearance",
        "Status",
        "Created Date",
    ];
    const rows = requests.map((req) => [
        req.id,
        req.applicant_name || "",
        req.user_email || "",
        req.project_type || "",
        req.status || "pending",
        formatDate(req.created_at),
    ]);

    return [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");
};

/**
 * Format project type to a human-readable label
 */
export const formatProjectType = (type) => {
    if (!type) return null;
    const labels = {
        "TUP": "TUP (Temporary Use Permit)",
        "Locational Clearance": "Locational Clearance",
        "CZC": "CZC (Certificate of Zoning Compliance)",
        "Zoning Clearance": "CZC (Certificate of Zoning Compliance)", // Legacy support
        "Zoning": "CZC (Certificate of Zoning Compliance)", // Legacy support
        "SUP": "SUP (Special Use Permit)",
    };
    return labels[type] || type;
};
export const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
