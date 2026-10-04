import React, { useEffect, useState } from "react";
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

const peso = (value) =>
    Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

    // Keep in sync with App\Models\Request::MAX_DENIALS (PHP). Denying again
    // at this count locks the applicant out of resubmitting online - see
    // RequestController::update().
    const MAX_DENIALS = 3;
    const denialCount = Number(request.denial_count ?? 0);
    const willLockOnDenial = denialCount + 1 >= MAX_DENIALS;
    const isLocked = denialCount >= MAX_DENIALS;
    const [showAllowConfirm, setShowAllowConfirm] = useState(false);
    const [allowing, setAllowing] = useState(false);

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

    // The 2013 Schedule of Fees (App\Support\ZoningFeeSchedule). The server
    // prices this application's project cost under every category; picking
    // one here only chooses which of those figures to use.
    const feeQuotes = request.fee_quotes || [];
    const [feeCategory, setFeeCategory] = useState(
        request.fee_category || request.suggested_fee_category || "",
    );
    const selectedQuote = feeQuotes.find((quote) => quote.category === feeCategory) || null;

    const chooseFeeCategory = (category) => {
        setFeeCategory(category);
        const quote = feeQuotes.find((item) => item.category === category);
        if (quote) setFormData((prev) => ({ ...prev, payment_amount: String(quote.amount) }));
    };

    const missingRequirements = () =>
        missingRequirementsText(request.requirements_reference, uploadedRequirements, verifiedRequirements);

    // What the server will refuse "reviewed" without.
    const typeValue = String(projectType ?? request.project_type ?? "").trim().toUpperCase();
    // Every type is priced by the Schedule of Fees (ZoningFeeSchedule): a
    // Zoning Certification at a fixed P720, the others by category A-F and
    // the project cost.
    const feeScheduleApplies = ["CZC", "ZONING", "TUP", "SUP", "ZC"].includes(typeValue);
    const isZcFee = typeValue === "ZC";

    // Fill the amount from the schedule whenever a figure becomes available
    // - on choosing Mark as Reviewed, or once a project cost is entered
    // below - unless an amount is already set. A new application's report
    // is created with 0.00, so zero counts as not set.
    useEffect(() => {
        if (action !== "reviewed" || !feeScheduleApplies || !selectedQuote) return;
        setFormData((prev) =>
            Number(prev.payment_amount) > 0 ? prev : { ...prev, payment_amount: String(selectedQuote.amount) },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action, feeScheduleApplies, selectedQuote?.category, selectedQuote?.amount, request.project_cost]);

    // No project cost on file: the officer enters it here. It is saved
    // through the same endpoint as Step 2's project cost, and the server
    // prices it on the reload.
    const [costEntry, setCostEntry] = useState("");
    const [editingCost, setEditingCost] = useState(false);
    const [savingCost, setSavingCost] = useState(false);
    const saveCostForFee = async () => {
        if (!(Number(costEntry) > 0)) return;
        setSavingCost(true);
        try {
            await axios.post(`/admin/requests/${request.id}/application-details`, { project_cost: costEntry });
            // A new cost means a new fee: clear the amount so the schedule's
            // figure for the new cost fills it once the reload arrives.
            setFormData((prev) => ({ ...prev, payment_amount: "" }));
            setEditingCost(false);
            router.reload({ only: ["request"], preserveScroll: true });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.errors?.project_cost?.[0] || "Failed to save the project cost.",
            });
        } finally {
            setSavingCost(false);
        }
    };
    const amountDiffersFromSchedule =
        feeScheduleApplies &&
        selectedQuote &&
        formData.payment_amount !== "" &&
        Math.abs(Number(formData.payment_amount) - selectedQuote.amount) >= 0.005;
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
                fee_category: action === "reviewed" && feeScheduleApplies && feeCategory ? feeCategory : null,
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

    const confirmAllowResubmission = async () => {
        setShowAllowConfirm(false);
        setAllowing(true);
        try {
            await axios.post(`/admin/requests/${request.id}/allow-resubmission`);
            toast({
                title: "Resubmission Allowed",
                description: "The applicant can now resubmit this application online again.",
            });
            router.reload({ only: ["request"] });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Could not allow resubmission. Please try again.",
            });
        } finally {
            setAllowing(false);
        }
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

                {/* Locked after 3 denials (Request::MAX_DENIALS): the applicant
                    cannot resubmit online any more (RequestController::update()),
                    but the office can still lift that if it has spoken to them
                    in person and decided the case should go on. */}
                {isLocked && (
                    <div className="flex items-start gap-3 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                        <div className="flex-1 text-sm text-red-900">
                            <h4 className="font-semibold">Locked from online resubmission</h4>
                            <p className="mt-1">
                                This application has been denied {denialCount} time(s) and the applicant can no
                                longer resubmit it online — they were told to visit the office in person.
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => setShowAllowConfirm(true)}
                                disabled={allowing}
                                className="mt-3 bg-red-700 text-white hover:bg-red-800"
                            >
                                {allowing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Allowing…
                                    </>
                                ) : (
                                    "Allow Resubmission"
                                )}
                            </Button>
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
                                    {option.value === "rejected" && denialCount > 0 && (
                                        <span
                                            className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                                                willLockOnDenial ? "bg-red-600 text-white" : "bg-amber-100 text-amber-800"
                                            }`}
                                        >
                                            Denied {denialCount}x already
                                        </span>
                                    )}
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

                            {feeScheduleApplies && (
                                <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900">
                                            Fee Computation — 2013 Schedule of Fees
                                        </h4>
                                        <p className="mt-0.5 text-xs text-blue-800">
                                            {isZcFee
                                                ? "Other Certifications — Zoning Certification: fixed fee."
                                                : "Zoning / Locational Clearance. Choose the category of the project; the fee follows from the project cost."}
                                        </p>
                                    </div>

                                    {feeQuotes.length === 0 || editingCost ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-amber-800">
                                                {editingCost
                                                    ? "Enter the corrected project cost."
                                                    : "No project cost is recorded. Enter it here to compute the fee."}
                                            </p>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        aria-label="Project cost"
                                                        value={formatAmountForDisplay(costEntry)}
                                                        onChange={(e) => setCostEntry(parseAmountInput(e.target.value))}
                                                        disabled={decisionLocked || savingCost}
                                                        placeholder="Project cost"
                                                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-8 pr-4 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={saveCostForFee}
                                                    disabled={decisionLocked || savingCost || !(Number(costEntry) > 0)}
                                                    className="bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90"
                                                >
                                                    {savingCost ? <Loader2 className="h-4 w-4 animate-spin" /> : "Compute Fee"}
                                                </Button>
                                                {editingCost && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setEditingCost(false)}
                                                        disabled={savingCost}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                Saved as the application's project cost.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {!isZcFee && (
                                            <div>
                                                <label htmlFor="fee-category" className="mb-1 block text-xs font-medium text-gray-700">
                                                    Category
                                                </label>
                                                <select
                                                    id="fee-category"
                                                    value={feeCategory}
                                                    onChange={(e) => chooseFeeCategory(e.target.value)}
                                                    disabled={decisionLocked}
                                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                                                >
                                                    <option value="">Select a category…</option>
                                                    {feeQuotes.map((quote) => (
                                                        <option key={quote.category} value={quote.category}>
                                                            {quote.category}. {quote.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {request.existing_land_use && (
                                                    <p className="mt-1 text-xs text-gray-600">
                                                        Applicant's stated land use:{" "}
                                                        <span className="font-medium">{request.existing_land_use}</span>
                                                        {request.suggested_fee_category
                                                            ? ` — suggests category ${request.suggested_fee_category}; confirm it fits the actual project.`
                                                            : " — does not point to a category; choose one."}
                                                    </p>
                                                )}
                                            </div>
                                            )}

                                            {selectedQuote && (
                                                <div className="rounded-md bg-white p-3 text-sm">
                                                    {!isZcFee && (
                                                    <p className="mb-1 text-xs text-gray-500">
                                                        Project cost: ₱{peso(request.project_cost)}
                                                        {!decisionLocked && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCostEntry(String(Number(request.project_cost)));
                                                                    setEditingCost(true);
                                                                }}
                                                                className="ml-2 font-medium text-blue-600 hover:text-blue-700"
                                                            >
                                                                Change
                                                            </button>
                                                        )}
                                                    </p>
                                                    )}
                                                    <p className="text-gray-800">{selectedQuote.formula}</p>
                                                    <p className="mt-1 font-semibold text-blue-900">
                                                        Schedule fee: ₱{peso(selectedQuote.amount)}
                                                    </p>
                                                </div>
                                            )}

                                            {!isZcFee && String(request.project_nature || "").toLowerCase() === "improvement" && (
                                                <p className="text-xs text-amber-800">
                                                    This is an Improvement: the schedule charges alterations/expansions on
                                                    the cost of the affected work only. Check that the project cost above
                                                    is that cost, not the whole structure's.
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
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
                                {amountDiffersFromSchedule ? (
                                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-amber-800">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Differs from the schedule fee of ₱{peso(selectedQuote.amount)}.
                                        {!decisionLocked && (
                                            <button
                                                type="button"
                                                onClick={() => chooseFeeCategory(feeCategory)}
                                                className="font-semibold underline hover:text-amber-900"
                                            >
                                                Use the schedule fee
                                            </button>
                                        )}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-xs text-gray-500">
                                        The fee the applicant pays at the Treasury Office once the Administrator approves.
                                    </p>
                                )}
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

                            {denialCount > 0 && !decisionLocked && (
                                <DecisionNotice tone={willLockOnDenial ? "red" : "amber"} title={willLockOnDenial ? "This will be the final denial" : `Already denied ${denialCount} time(s)`}>
                                    {willLockOnDenial ? (
                                        <p>
                                            This application has been denied <span className="font-semibold">{denialCount}</span> time(s) already.
                                            Denying it again will permanently lock it from further online resubmission — the applicant will be
                                            told to visit the CPDO office in person to proceed.
                                        </p>
                                    ) : (
                                        <p>
                                            After <span className="font-semibold">{MAX_DENIALS - denialCount}</span> more denial(s), this
                                            application can no longer be resubmitted online.
                                        </p>
                                    )}
                                </DecisionNotice>
                            )}

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
                            {feeScheduleApplies && selectedQuote && (
                                <p className="mt-1 text-xs text-gray-600">
                                    {selectedQuote.category === "ZC" ? "Zoning Certification" : `Category ${selectedQuote.category}`}:{" "}
                                    {selectedQuote.formula}
                                    {amountDiffersFromSchedule && " — overridden"}
                                </p>
                            )}
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
                        {willLockOnDenial && (
                            <p className="mt-3 rounded bg-red-100 p-3 text-sm font-semibold text-red-800">
                                This is the {denialCount + 1}{denialCount + 1 === 3 ? "rd" : "th"} denial — it will permanently lock this
                                application from further online resubmission.
                            </p>
                        )}
                    </>
                )}
            </ConfirmDecisionDialog>

            <ConfirmDecisionDialog
                open={showAllowConfirm}
                title="Allow Resubmission?"
                tone="red"
                confirmLabel="Allow Resubmission"
                loading={allowing}
                onCancel={() => setShowAllowConfirm(false)}
                onConfirm={confirmAllowResubmission}
            >
                <p>
                    This lifts the online-resubmission lock for application{" "}
                    <span className="font-semibold">{request.application_number}</span>. The applicant will be able
                    to edit and resubmit it online again, and is notified that they may do so.
                </p>
                <p className="mt-2 text-xs text-gray-500">
                    Only do this after speaking with the applicant - it does not change this denial's own record,
                    only whether the application can be resubmitted.
                </p>
            </ConfirmDecisionDialog>
        </Card>
    );
}
