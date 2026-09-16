import React from "react";
import { Button } from "@/Components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * What the two decision cards on View Application share.
 *
 * The Zoning Officer's card (OfficerDecision) and the Zoning Administrator's
 * card (AdministratorDecision) are the review workflow that used to live on
 * the separate Document Verification pages; the rules below are the ones both
 * of those pages agreed on, kept in one place so they cannot drift apart again.
 */

/**
 * Once the Administrator has approved — or the certificate is already being
 * prepared, ready, or released — neither role can change the decision. Mirrors
 * the $lockedStatuses check on the server (AdminController::reviewApplication,
 * SuperAdminController::rejectRequest).
 */
export const DECISION_LOCKED_STATUSES = [
    "approved",
    "certificate_preparing",
    "certificate_ready",
    "released",
];

export function isDecisionLocked(status) {
    return DECISION_LOCKED_STATUSES.includes(String(status || "").toLowerCase());
}

/** The standing instruction the office gives every reviewed application. */
export const REVIEWED_NOTE = "Submit the application form, and the requirements in the CPDO.";

/** The quick picks offered beside the free-text reason. */
export const QUICK_REASONS = [
    "Incomplete Documents",
    "Verify Location",
    "Zoning Violation",
    "Missing Information",
];

/**
 * A ready-made denial reason listing every required document that is either
 * not uploaded or not marked verified on the checklist.
 *
 * @param {Array} reference        request.requirements_reference
 * @param {Array} uploaded         uploadedRequirements ({id, name, files: []})
 * @param {Object} verified        {[requirementId]: boolean}
 * @returns {string} "" when nothing is missing
 */
export function missingRequirementsText(reference = [], uploaded = [], verified = {}) {
    const uploadedIds = new Set(
        uploaded.filter((group) => (group.files || []).length > 0).map((group) => group.id),
    );

    const missing = reference
        // Headings only group the documents beneath them; an optional document
        // that was not filed is not a reason to deny.
        .filter((req) => !req.is_group && req.required !== false)
        .filter((req) => !uploadedIds.has(req.id) || !verified[req.id]);

    if (missing.length === 0) return "";

    return "Missing or Incomplete Requirements:\n" + missing.map((req) => `- ${req.name}`).join("\n");
}

/** "Sep 16, 2026" for a timestamp, "" for nothing. */
export function formatDecisionDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** The amber "you cannot do this yet / any more" notice both cards use. */
export function DecisionNotice({ tone = "amber", title, children }) {
    const tones = {
        amber: "bg-amber-50 border-amber-200 text-amber-900",
        blue: "bg-blue-50 border-blue-200 text-blue-900",
        red: "bg-red-50 border-red-200 text-red-900",
    };

    return (
        <div className={`flex items-start gap-3 rounded-lg border-2 p-4 ${tones[tone] || tones.amber}`}>
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div className="min-w-0 text-sm">
                {title && <h4 className="font-semibold">{title}</h4>}
                <div className={title ? "mt-1" : ""}>{children}</div>
            </div>
        </div>
    );
}

/**
 * The "are you sure?" step before a decision is sent. A plain overlay rather
 * than the Radix dialog so it behaves the same as the other confirmations on
 * View Application.
 */
export function ConfirmDecisionDialog({
    open,
    title,
    tone = "green",
    confirmLabel,
    loading = false,
    onCancel,
    onConfirm,
    children,
}) {
    if (!open) return null;

    const isRed = tone === "red";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div
                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                                isRed ? "bg-red-100" : "bg-green-100"
                            }`}
                        >
                            {isRed ? (
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            ) : (
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                            <div className="text-sm text-gray-600">{children}</div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 rounded-b-lg bg-gray-50 px-6 py-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={isRed ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
