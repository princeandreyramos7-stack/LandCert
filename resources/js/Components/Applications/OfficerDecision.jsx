import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import axios from "axios";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import { AlertCircle, Check, History, Loader2, Sparkles, Undo2, XCircle } from "lucide-react";
import { formatAmountForDisplay, parseAmountInput } from "@/lib/amount";
import {
    ConfirmDecisionDialog,
    DecisionNotice,
    QUICK_REASONS,
    REVIEWED_NOTE,
    formatDecisionDate,
    isDecisionLocked,
    missingRequirementsText,
} from "./reviewDecision";

/**
 * The Zoning Officer's Review & Decision card on View Application.
 *
 * Two outcomes, as on the Document Verification page this replaces:
 *
 *  - Mark as Reviewed: the officer sets the Treasury fee and a note for the
 *    applicant, and the application goes to the Zoning Administrator "For
 *    Approval". The applicant hears nothing until the Administrator approves.
 *  - Denied: the officer gives the reason; the applicant is told at once by
 *    e-mail, SMS and notification.
 *
 * The server (AdminController::reviewApplication) also insists the Application
 * Type, Lot Number and Tax Declaration No. are recorded before an application
 * can be marked reviewed — they end up on the clearance — so the card says so
 * up front rather than letting the officer find out from a rejected submit.
 * The decision is locked once the Administrator has approved.
 */
export default function OfficerDecision({
    request,
    projectType,
    lotNumber,
    taxDeclarationNo,
    verifiedRequirements = {},
    uploadedRequirements = [],
}) {
    const { toast } = useToast();

    const status = String(request.status || "").toLowerCase();
    const decisionLocked = isDecisionLocked(status);

    // What was decided last time, if anything: the form opens on it.
    const previousAction =
        status === "reviewed" || decisionLocked ? "reviewed" : status === "rejected" ? "rejected" : "";

    const [action, setAction] = useState(previousAction);
    const [formData, setFormData] = useState({
        rejection_reason: request.rejection_reason || "Lacking of Requirements",
        payment_amount:
            request.payment_amount === null || request.payment_amount === undefined
                ? ""
                : String(request.payment_amount),
        // A note the Administrator left when returning the application is for
        // the officer, not the applicant — it is shown in its own banner.
        admin_notes: request.returned_reason ? "" : request.admin_notes || "",
    });
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const missingRequirements = () =>
        missingRequirementsText(request.requirements_reference, uploadedRequirements, verifiedRequirements);

    // What the server will refuse "reviewed" without.
    const typeValue = String(projectType ?? request.project_type ?? "").trim().toUpperCase();
    const prerequisites = [
        { ok: typeValue !== "" && typeValue !== "N/A" && typeValue !== "NA", label: "Application Type" },
        { ok: String(lotNumber ?? request.lot_number ?? "").trim() !== "", label: "Lot Number / Title No." },
        { ok: String(taxDeclarationNo ?? request.tax_declaration_no ?? "").trim() !== "", label: "Tax Declaration No." },
    ].filter((item) => !item.ok);

    const handleActionChange = (next) => {
        setAction(next);

        if (next === "reviewed") {
            // Fill the standing note in unless the officer has written their own.
            setFormData((prev) => ({
                ...prev,
                admin_notes: prev.admin_notes?.trim() ? prev.admin_notes : REVIEWED_NOTE,
            }));
        }

        if (next === "rejected") {
            const missing = missingRequirements();
            if (missing) setFormData((prev) => ({ ...prev, rejection_reason: missing }));
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (decisionLocked) {
            toast({
                variant: "destructive",
                title: "Decision Locked",
                description: "This application has already been approved. The decision can no longer be changed.",
            });
            return;
        }

        if (action === "reviewed" && prerequisites.length > 0) {
            toast({
                variant: "destructive",
                title: "Not ready to mark as reviewed",
                description: `Set the ${prerequisites.map((item) => item.label).join(", ")} first (Step 2 → Project Details / Property Details).`,
            });
            return;
        }

        setShowConfirm(true);
    };

    const confirmSubmit = async () => {
        setShowConfirm(false);
        setLoading(true);

        try {
            await axios.post("/admin/review-application", {
                request_id: request.id,
                action,
                payment_amount: action === "reviewed" ? formData.payment_amount : null,
                admin_notes: action === "reviewed" ? formData.admin_notes : null,
                rejection_reason: action === "rejected" ? formData.rejection_reason : null,
            });

            toast({
                title: action === "reviewed" ? "Marked as Reviewed" : "Application Denied",
                description:
                    action === "reviewed"
                        ? "Sent to the Zoning Administrator for approval. The applicant is told once it is approved."
                        : "The applicant has been notified of the denial.",
            });

            setTimeout(() => router.visit("/applications"), 1200);
        } catch (error) {
            const errors = error.response?.data?.errors;
            toast({
                variant: "destructive",
                title: errors ? "Cannot submit yet" : "Error",
                description: errors
                    ? Object.values(errors).flat().join("\n")
                    : error.response?.data?.message || "Failed to submit the review. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const reviewedAmount = formData.payment_amount ? `₱${formatAmountForDisplay(formData.payment_amount)}` : "₱0.00";

    return (
        <Card className="mb-6">
            <CardHeader className="border-b bg-white">
                <div className="flex items-center gap-2">
                    <div className="rounded-full bg-purple-100 p-2">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900">Review & Decision</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Returned by the Administrator: the reason is the first thing to read. */}
                {request.returned_reason && !decisionLocked && (
                    <div className="flex items-start gap-3 rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                        <Undo2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                        <div className="text-sm">
                            <h4 className="font-semibold text-orange-900">Returned by the Zoning Administrator</h4>
                            <p className="mt-1 whitespace-pre-line text-orange-800">{request.returned_reason}</p>
                            <p className="mt-1 text-xs text-orange-700">
                                Address the reason above, then review the application again.
                            </p>
                        </div>
                    </div>
                )}

                {/* Previous decision */}
                {previousAction && (
                    <div className="flex items-start gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                        <History className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        <div className="text-sm text-blue-800">
                            <h4 className="font-semibold text-blue-900">Previous Decision</h4>
                            <p className="mt-1">
                                This application was{" "}
                                <span className="font-bold">
                                    {decisionLocked
                                        ? "APPROVED"
                                        : previousAction === "reviewed"
                                          ? "MARKED AS REVIEWED"
                                          : "DENIED"}
                                </span>
                                {request.reviewed_by_name && ` by ${request.reviewed_by_name}`}
                                {request.reviewed_at && ` on ${formatDecisionDate(request.reviewed_at)}`}.
                                {previousAction === "rejected" && request.rejection_reason && (
                                    <>
                                        {" "}
                                        Reason: <span className="italic">"{request.rejection_reason}"</span>
                                    </>
                                )}
                            </p>
                            <p className="mt-1 text-xs">
                                {decisionLocked
                                    ? "This decision is final and can no longer be changed."
                                    : "You can change the decision below. Changes are logged in the audit trail."}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Action */}
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Select Action <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`grid grid-cols-1 gap-3 md:grid-cols-2 ${
                                decisionLocked ? "pointer-events-none opacity-60" : ""
                            }`}
                        >
                            {[
                                { value: "reviewed", label: "MARK AS REVIEWED", active: "border-green-400 bg-green-50" },
                                { value: "rejected", label: "DENIED", active: "border-red-400 bg-red-50" },
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className={`relative flex items-center rounded-lg border p-3 transition-all ${
                                        decisionLocked ? "cursor-not-allowed" : "cursor-pointer"
                                    } ${
                                        action === option.value
                                            ? option.active
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="officer-action"
                                        value={option.value}
                                        checked={action === option.value}
                                        onChange={(e) => handleActionChange(e.target.value)}
                                        disabled={decisionLocked}
                                        className="h-4 w-4"
                                        required
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-900">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Mark as Reviewed */}
                    {action === "reviewed" && (
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Mark as Reviewed</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Forwarded to the Zoning Administrator for approval. The applicant can pay only
                                    after it is approved.
                                </p>
                            </div>

                            {prerequisites.length > 0 && !decisionLocked && (
                                <DecisionNotice title="Set these before marking as reviewed">
                                    <ul className="list-disc pl-5">
                                        {prerequisites.map((item) => (
                                            <li key={item.label}>{item.label}</li>
                                        ))}
                                    </ul>
                                    <p className="mt-1 text-xs">
                                        Step 2 → Project Details (type) and Property Details (lot and tax numbers).
                                        They are printed on the clearance or certificate.
                                    </p>
                                </DecisionNotice>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Amount to Pay at the Treasury <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={formatAmountForDisplay(formData.payment_amount)}
                                        onChange={(e) =>
                                            setFormData({ ...formData, payment_amount: parseAmountInput(e.target.value) })
                                        }
                                        required
                                        disabled={decisionLocked}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    The fee the applicant pays at the Treasury Office once the Administrator approves.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Notes for Applicant (Optional)
                                </label>
                                <textarea
                                    value={formData.admin_notes}
                                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                                    rows={3}
                                    maxLength={1000}
                                    disabled={decisionLocked}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                    placeholder="Additional instructions or information for the applicant"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Included in the approval notice the applicant receives.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Denied */}
                    {action === "rejected" && (
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Denial Reason</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    The applicant receives this reason by e-mail, SMS and notification.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Detailed Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.rejection_reason}
                                    onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                                    rows={4}
                                    required
                                    maxLength={1000}
                                    disabled={decisionLocked}
                                    placeholder="Give a clear, specific reason for the denial"
                                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                />
                                <p className="mt-1 text-xs text-gray-500">{formData.rejection_reason.length}/1000 characters</p>
                            </div>

                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-700">Quick Select:</p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                rejection_reason: missingRequirements() || "Lacking of Requirements",
                                            })
                                        }
                                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                                    >
                                        <XCircle className="h-3.5 w-3.5" />
                                        Missing Requirements
                                    </button>
                                    {QUICK_REASONS.map((reason) => (
                                        <button
                                            key={reason}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rejection_reason: reason })}
                                            className="rounded-lg border-2 border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:border-red-300 hover:bg-red-50"
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                                    <span>
                                        <span className="font-semibold">Missing Requirements</span> lists every required
                                        document that is not uploaded or not marked verified above.
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <Link href="/applications">
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={loading || !action || decisionLocked}
                            className="bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : decisionLocked ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Decision Final
                                </>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" />
                                    Submit Review
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>

            <ConfirmDecisionDialog
                open={showConfirm}
                title="Confirm Your Decision"
                tone={action === "rejected" ? "red" : "green"}
                confirmLabel={action === "rejected" ? "Confirm Denial" : "Confirm Review"}
                loading={loading}
                onCancel={() => setShowConfirm(false)}
                onConfirm={confirmSubmit}
            >
                {action === "reviewed" ? (
                    <>
                        <p>
                            Mark this application as <span className="font-semibold text-green-700">REVIEWED</span> and
                            send it to the Zoning Administrator for approval?
                        </p>
                        <div className="mt-3 rounded bg-blue-50 p-3">
                            <p className="text-sm font-medium text-gray-700">Amount to Pay at the Treasury</p>
                            <p className="text-xl font-bold text-blue-900">{reviewedAmount}</p>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            The applicant is notified only after the Administrator approves.
                        </p>
                    </>
                ) : (
                    <>
                        <p>
                            <span className="font-semibold text-red-700">DENY</span> this application? The applicant is
                            notified immediately with this reason:
                        </p>
                        <p className="mt-2 whitespace-pre-line rounded bg-red-50 p-3 text-sm text-red-900">
                            {formData.rejection_reason || "No reason provided"}
                        </p>
                    </>
                )}
            </ConfirmDecisionDialog>
        </Card>
    );
}
