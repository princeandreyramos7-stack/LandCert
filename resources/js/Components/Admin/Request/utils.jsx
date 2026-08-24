import { CheckCircle2, XCircle, Clock } from "lucide-react";

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
            return "bg-green-100 text-green-800 hover:bg-green-200 border-green-300";
        default:
            return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300";
    }
};

/**
 * Get status icon component based on status
 */
export const getStatusIcon = (status) => {
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
        "Project Type",
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
        "Zoning Clearance": "Locational Clearance",
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
