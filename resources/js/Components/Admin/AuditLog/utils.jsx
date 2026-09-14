// Utility functions for the audit log screens.

/**
 * The tone an action is shown in. Actions are grouped by what they did rather
 * than listed one by one, so an action the log has not seen before still lands
 * in the right colour.
 */
export const actionTone = (action = "") => {
    const a = String(action).toLowerCase();
    if (/fail|denied|reject|delete|revoke|withdraw/.test(a)) return "danger";
    if (/approve|verified|release|create|register|issued|ready/.test(a)) return "success";
    if (/payment|receipt|order/.test(a)) return "gold";
    if (/login|logout/.test(a)) return "slate";
    if (/sms|export|broadcast|print|download/.test(a)) return "violet";
    if (/update|edit|review|status|upload|record/.test(a)) return "info";
    return "neutral";
};

export const toneClasses = {
    danger:  "bg-rose-50 text-rose-700 border-rose-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gold:    "bg-amber-50 text-amber-800 border-amber-200",
    slate:   "bg-slate-100 text-slate-700 border-slate-200",
    violet:  "bg-violet-50 text-violet-700 border-violet-200",
    info:    "bg-blue-50 text-blue-700 border-blue-200",
    neutral: "bg-gray-50 text-gray-700 border-gray-200",
};

// Kept for callers that still ask for a Badge variant.
export const getActionBadge = (action) => {
    const tone = actionTone(action);
    return tone === "danger" ? "destructive" : tone === "neutral" ? "outline" : "default";
};

export const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Manila",
    });
};

/** "just now", "5 min ago", "3 hours ago", "2 days ago", then the date. */
export const timeAgo = (date) => {
    const then = new Date(date).getTime();
    if (Number.isNaN(then)) return "";
    const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
    if (seconds < 45) return "just now";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.round(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });
};

export const roleLabel = (userType) => ({
    super_admin: "Zoning Administrator",
    admin: "Zoning Officer",
    applicant: "Applicant",
}[userType] || (userType ? String(userType).replace(/_/g, " ") : "System"));

export const initialsOf = (name = "") =>
    String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

export const formatActionLabel = (action) => {
    const labels = {
        created:       "Created",
        updated:       "Updated",
        deleted:       "Deleted",
        viewed:        "Viewed",
        exported:      "Exported",
        login:         "Login",
        logout:        "Logout",
        failed_login:  "Failed Login",
        bulk_created:  "Bulk Create",
        bulk_updated:  "Bulk Update",
        bulk_deleted:  "Bulk Delete",
        sms_broadcast: "SMS Broadcast",
        approved:      "Approved",
        rejected:      "Denied",
    };
    return labels[action] || String(action || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};
