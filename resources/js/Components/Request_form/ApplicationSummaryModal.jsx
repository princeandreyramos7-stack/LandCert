import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

export function ApplicationSummaryModal({
    isOpen,
    onClose,
    onConfirm,
    processing,
    data = {},
    isEditing = false,
    // Selected files live in the parent's plain state, not in the Inertia form
    // (useForm's cloneDeep destroys File objects), so they are passed in directly.
    requirementFiles = {},
    requirements = [],
}) {
    /*
     * The declaration is a separate act from the consent given at sign-up:
     * that one covers the handling of personal information, this one is the
     * applicant certifying that what they are about to file is true. Filing
     * a falsified document with a government office is a criminal matter, so
     * it is stated plainly and ticked deliberately - and reset every time the
     * modal opens, so a second application cannot inherit the first one tick.
     */
    const [declared, setDeclared] = useState(false);

    useEffect(() => {
        if (isOpen) setDeclared(false);
    }, [isOpen]);

    // A Zoning Certification skips the project and land-use steps, so its
    // summary skips those sections too.
    const isZC = String(data.project_type || "").toUpperCase() === "ZC";

    // Only requirements that actually have at least one file attached.
    const uploadedEntries = Object.entries(requirementFiles)
        .filter(([, files]) => Array.isArray(files) && files.length > 0);

    const totalFiles = uploadedEntries.reduce((sum, [, files]) => sum + files.length, 0);

    const requirementLabel = (reqId) =>
        requirements.find((r) => String(r.id) === String(reqId))?.name || `Requirement #${reqId}`;

    const SummaryItem = ({ label, value }) => (
        <div className="flex justify-between gap-4">
            <span className="text-gray-600 text-xs">{label}:</span>
            <span className="text-gray-900 font-medium text-xs text-right">{value || "N/A"}</span>
        </div>
    );

    return (
        // While the submit is in flight the dialog cannot be dismissed — by the
        // close button, Escape, or a click outside. Losing the spinner mid-request
        // is what makes it look as though nothing happened.
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !processing) onClose(); }}>
            <DialogContent
                className="max-w-4xl max-h-[90vh] overflow-y-auto"
                onEscapeKeyDown={(e) => processing && e.preventDefault()}
                onPointerDownOutside={(e) => processing && e.preventDefault()}
                onInteractOutside={(e) => processing && e.preventDefault()}
            >
                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Application Summary
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                        Please review your information before {isEditing ? "resubmitting" : "submitting"} your application
                    </DialogDescription>
                </DialogHeader>

                {/* Content */}
                <div className="space-y-6 py-4">
                    {/* Applicant Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Applicant Information</h3>
                        <div className="space-y-2 text-sm">
                            <SummaryItem label="Name" value={data.applicant_name} />
                            <SummaryItem label="Address" value={data.applicant_address_preview || data.applicant_address_legacy || data.applicant_address} />
                            {data.corporation_name && (
                                <>
                                    <div className="border-t my-3 pt-3">
                                        <span className="text-xs font-semibold text-gray-700">Corporation Details</span>
                                    </div>
                                    <SummaryItem label="Corporation Name" value={data.corporation_name} />
                                    <SummaryItem label="Corporation Address" value={data.corporation_address} />
                                </>
                            )}
                            {data.authorized_representative_name && (
                                <>
                                    <div className="border-t my-3 pt-3">
                                        <span className="text-xs font-semibold text-gray-700">Authorized Representative</span>
                                    </div>
                                    <SummaryItem label="Representative Name" value={data.authorized_representative_name} />
                                    <SummaryItem label="Representative Address" value={data.authorized_representative_address_preview || data.authorized_representative_address_legacy || data.authorized_representative_address} />
                                    <SummaryItem label="Representative Email" value={data.authorized_representative_email} />
                                    <SummaryItem label="Authorization Letter" value={data.authorization_letter ? "Attached" : "Not attached"} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Project, location and land use — skipped for a Zoning
                        Certification, which has no project to describe. */}
                    {!isZC && (
                        <>
                    {/* Project Details */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Project Details</h3>
                            <div className="space-y-2 text-sm">
                                <SummaryItem label="Application Type" value={data.project_type} />
                                <SummaryItem label="Project Nature" value={data.project_nature} />
                                <SummaryItem label="Project Area - Lot (sqm)" value={data.lot_area_sqm} />
                                <SummaryItem label="Project Area - Bldg. Improvement (sqm)" value={data.bldg_improvement_sqm} />
                                <SummaryItem label="Right Over Land" value={data.right_over_land} />
                                <SummaryItem label="Project Tenure" value={
                                    String(data.project_nature_duration || '').toLowerCase() === 'temporary'
                                        ? `Temporary${data.project_nature_years ? ` (${data.project_nature_years} year${Number(data.project_nature_years) === 1 ? '' : 's'})` : ''}`
                                        : (data.project_nature_duration || null)
                                } />
                                <SummaryItem 
                                    label="Project Cost" 
                                    value={data.project_cost ? `₱${parseFloat(data.project_cost).toLocaleString()}` : 'N/A'} 
                                />
                            </div>
                        </div>
    
                        {/* Project Location */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Project Location</h3>
                            <div className="space-y-2 text-sm">
                                <SummaryItem label="House/Lot Number" value={data.project_location_number} />
                                <SummaryItem label="Street" value={data.project_location_street} />
                                <SummaryItem label="Barangay" value={data.project_location_barangay} />
                                <SummaryItem label="Municipality/City" value={data.project_location_municipality} />
                                <SummaryItem label="Province" value={data.project_location_province} />
                            </div>
                        </div>
    
                        {/* Land Use Information */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Land Use Information</h3>
                            <div className="space-y-2 text-sm">
                                <SummaryItem label="Existing Land Use" value={data.existing_land_use} />
                                <SummaryItem 
                                    label="Written Notice to Tenants" 
                                    value={data.has_written_notice === 'yes' ? 'Yes' : data.has_written_notice === 'no' ? 'No' : 'N/A'} 
                                />
                                {data.has_written_notice === 'yes' && (
                                    <>
                                        <SummaryItem label="Notice Officer Name" value={data.notice_officer_name} />
                                        <SummaryItem label="Notice Dates" value={data.notice_dates} />
                                    </>
                                )}
                                <SummaryItem 
                                    label="Similar Application Filed" 
                                    value={data.has_similar_application === 'yes' ? 'Yes' : data.has_similar_application === 'no' ? 'No' : 'N/A'} 
                                />
                                {data.has_similar_application === 'yes' && (
                                    <>
                                        <SummaryItem label="Application Offices" value={data.similar_application_offices} />
                                        <SummaryItem label="Application Dates" value={data.similar_application_dates} />
                                    </>
                                )}
                                <SummaryItem
                                    label="Preferred Release Mode"
                                    value={data.preferred_release_mode
                                        ? data.preferred_release_mode.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                                        : null}
                                />
                                {data.preferred_release_mode === 'delivery' && (
                                    <SummaryItem label="Delivery Address" value={data.release_address} />
                                )}
                            </div>
                        </div>
    
        </>
                    )}

                    {/* Requirements Uploaded */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Requirements Uploaded</h3>
                        <div className="space-y-2 text-sm">
                            {uploadedEntries.length > 0 ? (
                                <>
                                    {uploadedEntries.map(([reqId, files]) => (
                                        <div key={reqId} className="flex justify-between gap-4">
                                            <span className="text-gray-600 text-xs">{requirementLabel(reqId)}:</span>
                                            <span className="text-gray-900 font-medium text-xs whitespace-nowrap">
                                                {files.length} file{files.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t mt-3 pt-3">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-700 font-semibold text-xs">Total Files:</span>
                                            <span className="text-gray-900 font-bold text-xs">
                                                {totalFiles} file{totalFiles !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500 text-xs italic">No requirements uploaded yet</p>
                            )}
                        </div>
                    </div>

                    {/* What happens next */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Important:</p>
                        <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                            <li>Once submitted, you cannot edit this application</li>
                            <li>You will receive a confirmation email with your application details</li>
                            <li>The CPDO will review your application and notify you of the decision</li>
                        </ul>
                    </div>

                    {/* Declaration - required before the form can be filed */}
                    <div className="rounded-lg border-2 border-[#0d1f5c]/15 bg-[#0d1f5c]/[0.03] p-4">
                        <div className="mb-2.5 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#0d1f5c]" aria-hidden="true" />
                            <p className="text-sm font-bold text-[#0d1f5c]">Declaration</p>
                        </div>

                        <label htmlFor="declaration" className="flex cursor-pointer gap-3">
                            <input
                                id="declaration"
                                type="checkbox"
                                checked={declared}
                                onChange={(e) => setDeclared(e.target.checked)}
                                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-[#0d1f5c] focus:ring-2 focus:ring-[#d4a017]"
                            />
                            <span className="text-xs leading-relaxed text-gray-700">
                                I certify that the information in this application is true and
                                correct, and that every document I have uploaded is genuine. I
                                understand that filing a falsified document with a government
                                office is punishable under the Revised Penal Code, and that an
                                application or certificate obtained through false information may
                                be denied or revoked. I consent to the City Planning and
                                Development Office processing these details in order to act on
                                this application, as set out in the{" "}
                                <a href="/legal/privacy" target="_blank" rel="noopener noreferrer"
                                    className="font-semibold text-[#0d1f5c] underline underline-offset-2">
                                    Privacy Policy
                                </a>{" "}
                                and the{" "}
                                <a href="/legal/terms" target="_blank" rel="noopener noreferrer"
                                    className="font-semibold text-[#0d1f5c] underline underline-offset-2">
                                    Terms and Conditions
                                </a>.
                            </span>
                        </label>

                        <p className="mt-2.5 pl-7 text-[11px] text-gray-500">
                            Fees are paid at the City Treasurer&apos;s Office against the Order of
                            Payment this application will produce. See the{" "}
                            <a href="/legal/refund" target="_blank" rel="noopener noreferrer"
                                className="underline underline-offset-2 hover:text-[#0d1f5c]">
                                Refund Policy
                            </a>{" "}
                            for when a fee can be refunded.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={processing}
                        className="px-6"
                    >
                        Back to Edit
                    </Button>
                    <Button
                        type="button"
                        onClick={() => onConfirm({ declared })}
                        disabled={processing || !declared}
                        title={declared ? undefined : "Tick the declaration above to submit"}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 px-6 disabled:cursor-not-allowed"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isEditing ? "Updating..." : "Submitting..."}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                {isEditing ? "Confirm & Update" : "Confirm & Submit"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
