import {
    AlertCircle,
    CheckCircle2,
    Clock,
    DollarSign,
    Hourglass,
    XCircle,
} from "lucide-react";

/**
 * Badge configuration for an application status.
 *
 * The status a page receives is the derived one (see Request::deriveStatus on
 * the server): the report's evaluation while the application is being decided,
 * then the request status once it enters the payment/certificate lifecycle.
 * That lifecycle is why this map has to be complete — a page that only knows
 * pending/reviewed/approved/rejected falls back to "Pending Review" for an
 * application that is actually approved and already at the certificate stage.
 *
 * The lifecycle statuses all read "Application Approved", matching the wording
 * on the applications list (Components/Admin/Request/utils.jsx): the fine-
 * grained certificate steps are tracked on the Certificates page, not here.
 */
const STATUS_CONFIGS = {
    pending: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending Review",
    },
    for_verification: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Pending Review",
    },
    reviewed: {
        icon: AlertCircle,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Under Review",
    },
    pending_superadmin_approval: {
        icon: Hourglass,
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "For Approval",
    },
    approved: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Approved",
    },
    rejected: {
        icon: XCircle,
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Denied",
    },
    returned: {
        icon: AlertCircle,
        color: "bg-orange-100 text-orange-800 border-orange-200",
        label: "Returned to Applicant",
    },
    for_payment: {
        icon: DollarSign,
        color: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Approved — For Payment",
    },
    pending_payment: {
        icon: DollarSign,
        color: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Approved — For Payment",
    },
    approved_with_payment: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Application Approved",
    },
    payment_confirmed: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Application Approved",
    },
    certificate_preparing: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Application Approved",
    },
    certificate_ready: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Application Approved",
    },
    released: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Application Approved",
    },
    completed: {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Application Approved",
    },
};

/**
 * @param {string} status Derived application status.
 * @returns {{icon: Function, color: string, label: string}}
 */
export function getStatusConfig(status) {
    const key = String(status ?? "").toLowerCase();

    if (STATUS_CONFIGS[key]) return STATUS_CONFIGS[key];

    // An unmapped status is shown as itself rather than silently reported as
    // pending — a wrong status is worse than an unfamiliar one.
    return {
        icon: Clock,
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: key
            ? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : "Pending Review",
    };
}

/**
 * The options offered by the All Applications status filter.
 *
 * Several stages of the lifecycle share one meaning to an officer scanning the
 * list — "For Payment" is stored as either for_payment or pending_payment, and
 * everything after the payment clears reads as "Application Approved" — so each
 * option carries the set of stored statuses it covers rather than a single
 * value. Keeping the list and the matching in one place is what stops the
 * dropdown drifting from the statuses the application can actually be in, which
 * is how "For Payment" and "Returned to Applicant" came to be unfilterable.
 */
export const STATUS_FILTERS = [
    { value: "all", label: "All Status of Application", matches: [] },
    { value: "pending", label: "For Verification", matches: ["pending", "for_verification"] },
    { value: "reviewed", label: "For Approval", matches: ["reviewed", "pending_superadmin_approval"] },
    { value: "in_applicant", label: "Returned to Applicant", matches: ["in_applicant", "returned"] },
    { value: "approved", label: "Approved — For Payment", matches: ["approved"] },
    { value: "for_payment", label: "For Payment", matches: ["for_payment", "pending_payment"] },
    {
        value: "application_approved",
        label: "Application Approved (paid)",
        matches: [
            "payment_confirmed",
            "approved_with_payment",
            "certificate_preparing",
            "certificate_ready",
            "released",
            "collected",
            "completed",
        ],
    },
    { value: "rejected", label: "Application Denied", matches: ["rejected"] },
];

/**
 * One colour per status, so a chart of the distribution keeps the same colour
 * for "For Payment" no matter which slices happen to be present that day.
 * Keyed by STATUS_FILTERS value.
 */
export const STATUS_COLORS = {
    pending: "#f59e0b",
    reviewed: "#3b82f6",
    in_applicant: "#f97316",
    approved: "#8b5cf6",
    for_payment: "#eab308",
    application_approved: "#10b981",
    rejected: "#ef4444",
    other: "#94a3b8",
};

/**
 * Roll {status, count} rows up into the buckets the All Applications filter
 * offers, so a chart summarising the applications is labelled with the same
 * vocabulary as the list it summarises.
 *
 * A status matching no bucket is collected under "Other" rather than dropped:
 * a chart whose slices silently fail to add up to the total is worse than one
 * with an unfamiliar slice in it.
 *
 * @param {Array<{status: string, count: number}>} rows
 * @returns {Array<{key: string, name: string, value: number, color: string}>}
 */
export function groupStatusCounts(rows = []) {
    const buckets = STATUS_FILTERS.filter((entry) => entry.value !== "all").map((entry) => ({
        key: entry.value,
        name: entry.label,
        value: 0,
        color: STATUS_COLORS[entry.value] ?? STATUS_COLORS.other,
    }));

    let other = 0;

    for (const row of rows) {
        const status = String(row?.status ?? "").toLowerCase();
        const count = Number(row?.count) || 0;
        if (!count) continue;

        const bucket = buckets.find((entry) => {
            const option = STATUS_FILTERS.find((filter) => filter.value === entry.key);
            return option?.matches.includes(status);
        });

        if (bucket) bucket.value += count;
        else other += count;
    }

    if (other > 0) {
        buckets.push({ key: "other", name: "Other", value: other, color: STATUS_COLORS.other });
    }

    return buckets;
}

/**
 * Does an application's stored status belong under the chosen filter?
 */
export function matchesStatusFilter(status, filterValue) {
    if (!filterValue || filterValue === "all") return true;

    const option = STATUS_FILTERS.find((entry) => entry.value === filterValue);
    if (!option) return false;

    return option.matches.includes(String(status ?? "").toLowerCase());
}
