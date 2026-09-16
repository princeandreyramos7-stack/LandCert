import React, { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { useToast } from "@/Components/ui/use-toast";
import { AlertCircle, Check, CheckCircle2, History, Loader2, Sparkles, XCircle } from "lucide-react";
import { formatAmountForDisplay } from "@/lib/amount";
import {
    ConfirmDecisionDialog,
    DecisionNotice,
    QUICK_REASONS,
    formatDecisionDate,
    isDecisionLocked,
    missingRequirementsText,
} from "./reviewDecision";

/**
 * The Zoning Administrator's Review & Decision card on View Application.
 *
 * The Administrator acts on the Zoning Officer's review, never instead of it:
 * until the officer has marked the application reviewed there is no report,
 * no Treasury fee and nothing to approve, so the form stays closed. Once it
 * opens there are two outcomes, as on the Document Verification page this
 * replaces:
 *
 *  - Approve: a decision number is issued and the applicant is notified with
 *    the fee the officer set, so they can pay at the Treasury Office.
 *  - Deny: the application goes back to the officer's queue with the reason.
 *    The applicant is not told — nothing has been decided against them yet.
 *
 * Both post to the report, not the request (approve-request/{reportId}).
 */
export default function AdministratorDecision({ request, verifiedRequirements = {}, uploadedRequirements = [] }) {
    const { toast } = useToast();

    const status = String(request.status || "").toLowerCase();
    const decisionLocked = isDecisionLocked(status);
    const officerReviewed = status === "reviewed";
    const officerDenied = status === "rejected";

    const [action, setAction] = useState(decisionLocked ? "approved" : "");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const missingRequirements = () =>
        missingRequirementsText(request.requirements_reference, uploadedRequirements, verifiedRequirements);

    const fee = request.payment_amount ? `₱${formatAmountForDisplay(request.payment_amount)}` : null;

    const handleActionChange = (next) => {
        setAction(next);
        if (next === "rejected" && !reason.trim()) {
            setReason(missingRequirements());
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

        if (!officerReviewed || !request.report_id) {
            toast({
                variant: "destructive",
                title: "Waiting on the Zoning Officer",
                description:
                    "The Zoning Officer must mark this application reviewed and set the Treasury fee before it can be approved or denied here.",
            });
            return;
        }

        if (action === "rejected" && !reason.trim()) {
            toast({
                variant: "destructive",
                title: "Reason required",
                description: "Give the Zoning Officer a reason for returning the application.",
            });
            return;
        }

        setShowConfirm(true);
    };

    const confirmSubmit = () => {
        setShowConfirm(false);
        setLoading(true);

        const approving = action === "approved";
        const endpoint = approving
            ? route("super-admin.approve-request", request.report_id)
            : route("super-admin.reject-request", request.report_id);

        router.post(endpoint, approving ? {} : { description: reason.trim() }, {
            preserveScroll: true,
            onSuccess: (page) => {
                // The handlers answer back()->with('error', …) for a refused
                // decision, which Inertia still reports as a success.
                const refused = page?.props?.flash?.error;
                if (refused) {
                    toast({ variant: "destructive", title: "Decision not recorded", description: refused });
                    return;
                }

                toast({
                    title: approving ? "Application Approved" : "Returned to the Zoning Officer",
                    description: approving
                        ? "The applicant has been notified and can now pay at the Treasury Office."
                        : "The Zoning Officer has been notified and will review it again.",
                });
                setTimeout(() => router.visit("/applications"), 1200);
            },
            onError: (errors) => {
                toast({
                    variant: "destructive",
                    title: "Could not submit the decision",
                    description: Object.values(errors || {}).flat().join(" ") || "Please try again.",
                });
            },
            onFinish: () => setLoading(false),
        });
    };

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
                {/* Previous decision — only once one actually exists */}
                {(decisionLocked || officerDenied) && (
                    <div className="flex items-start gap-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                        <History className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        <div className="text-sm text-blue-800">
                            <h4 className="font-semibold text-blue-900">Previous Decision</h4>
                            <p className="mt-1">
                                This application was{" "}
                                <span className="font-bold">{decisionLocked ? "APPROVED" : "DENIED"}</span>
                                {decisionLocked && request.approved_by && ` by ${request.approved_by}`}
                                {decisionLocked && request.approved_at && ` on ${formatDecisionDate(request.approved_at)}`}
                                {officerDenied && " by the Zoning Officer"}.
                                {officerDenied && request.rejection_reason && (
                                    <>
                                        {" "}
                                        Reason: <span className="italic">"{request.rejection_reason}"</span>
                                    </>
                                )}
                            </p>
                            <p className="mt-1 text-xs">
                                {decisionLocked
                                    ? "This decision is final and can no longer be changed."
                                    : "The applicant has been notified. The Zoning Officer can review it again if the applicant resubmits."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Nothing to decide yet */}
                {!officerReviewed && !decisionLocked && !officerDenied && (
                    <DecisionNotice title="Waiting on the Zoning Officer">
                        This application has not been marked as reviewed yet. The Zoning Officer reviews it and
                        sets the Treasury fee — once they do, Approve and Deny appear here.
                    </DecisionNotice>
                )}

                {/* The officer's review, which is what is being approved */}
                {officerReviewed && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="text-sm font-semibold text-gray-900">Zoning Officer's Review</h4>
                        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-500">Reviewed by</dt>
                                <dd className="font-medium text-gray-900">
                                    {request.reviewed_by_name || "—"}
                                    {request.reviewed_at && (
                                        <span className="font-normal text-gray-500"> · {formatDecisionDate(request.reviewed_at)}</span>
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs uppercase tracking-wide text-gray-500">Amount to Pay at the Treasury</dt>
                                <dd className="text-lg font-semibold text-gray-900">
                                    {fee || <span className="text-sm font-normal italic text-gray-500">Not set by the officer</span>}
                                </dd>
                            </div>
                            {request.admin_notes && (
                                <div className="sm:col-span-2">
                                    <dt className="text-xs uppercase tracking-wide text-gray-500">Note for the applicant</dt>
                                    <dd className="whitespace-pre-line text-gray-800">{request.admin_notes}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                )}

                {(officerReviewed || decisionLocked) && (
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    { value: "approved", label: "APPROVE", active: "border-green-400 bg-green-50" },
                                    { value: "rejected", label: "DENY", active: "border-red-400 bg-red-50" },
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
                                            name="administrator-action"
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

                        {action === "approved" && !decisionLocked && (
                            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-5">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">Approve Application</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        A decision number is issued and the applicant is notified by e-mail, SMS and
                                        notification so they can pay {fee ? <strong>{fee}</strong> : "the fee"} at the
                                        Treasury Office.
                                    </p>
                                </div>
                            </div>
                        )}

                        {action === "rejected" && (
                            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">Reason for Return</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        The application goes back to the Zoning Officer to review again.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={4}
                                        required
                                        maxLength={1000}
                                        placeholder="What should the Zoning Officer look at again?"
                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">{reason.length}/1000 characters</p>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm font-medium text-gray-700">Quick Select:</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setReason(missingRequirements() || "Lacking of Requirements")}
                                            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                                        >
                                            <XCircle className="h-3.5 w-3.5" />
                                            Missing Requirements
                                        </button>
                                        {QUICK_REASONS.map((quick) => (
                                            <button
                                                key={quick}
                                                type="button"
                                                onClick={() => setReason(quick)}
                                                className="rounded-lg border-2 border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:border-red-300 hover:bg-red-50"
                                            >
                                                {quick}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <DecisionNotice>
                                    <span className="font-semibold">Note:</span> The applicant is not notified. The
                                    application returns to the Zoning Officer's queue with this reason attached.
                                </DecisionNotice>
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
                                        Submit Decision
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>

            <ConfirmDecisionDialog
                open={showConfirm}
                title="Confirm Your Decision"
                tone={action === "rejected" ? "red" : "green"}
                confirmLabel={action === "rejected" ? "Return to Officer" : "Confirm Approval"}
                loading={loading}
                onCancel={() => setShowConfirm(false)}
                onConfirm={confirmSubmit}
            >
                {action === "approved" ? (
                    <>
                        <p>
                            <span className="font-semibold text-green-700">APPROVE</span> this application? The
                            applicant is notified immediately and can pay at the Treasury Office.
                        </p>
                        <div className="mt-3 rounded bg-blue-50 p-3">
                            <p className="text-sm font-medium text-gray-700">Amount to Pay at the Treasury</p>
                            <p className="text-xl font-bold text-blue-900">{fee || "₱0.00"}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <p>
                            Return this application to the <span className="font-semibold">Zoning Officer</span> with
                            this reason? The applicant is not notified.
                        </p>
                        <p className="mt-2 whitespace-pre-line rounded bg-red-50 p-3 text-sm text-red-900">
                            {reason || "No reason provided"}
                        </p>
                    </>
                )}
            </ConfirmDecisionDialog>
        </Card>
    );
}
