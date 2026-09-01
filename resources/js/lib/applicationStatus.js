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
