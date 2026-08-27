import React from "react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ApplicationSummaryModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    processing, 
    data = {}, 
    isEditing = false 
}) {
    const SummaryItem = ({ label, value }) => (
        <div className="flex justify-between gap-4">
            <span className="text-gray-600 text-xs">{label}:</span>
            <span className="text-gray-900 font-medium text-xs text-right">{value || "N/A"}</span>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Application Summary
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        Please review your information before {isEditing ? "resubmitting" : "submitting"} your application
                    </p>
                </DialogHeader>

                {/* Content */}
                <div className="space-y-6 py-4">
                    {/* Applicant Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Applicant Information</h3>
                        <div className="space-y-2 text-sm">
                            <SummaryItem label="Name" value={data.applicant_name} />
                            <SummaryItem label="Address" value={data.applicant_address} />
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
                                    <SummaryItem label="Representative Address" value={data.authorized_representative_address} />
                                    <SummaryItem label="Representative Email" value={data.authorized_representative_email} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Project Details</h3>
                        <div className="space-y-2 text-sm">
                            <SummaryItem label="Project Type" value={data.project_type} />
                            <SummaryItem label="Project Nature" value={data.project_nature} />
                            <SummaryItem label="Project Area (sqm)" value={data.project_area_sqm} />
                            <SummaryItem label="Lot Area (sqm)" value={data.lot_area_sqm} />
                            <SummaryItem label="Right Over Land" value={data.right_over_land} />
                            <SummaryItem label="Project Duration" value={
                                data.project_nature_duration === 'temporary' 
                                    ? `Temporary (${data.project_nature_years} years)`
                                    : data.project_nature_duration === 'permanent' 
                                    ? 'Permanent' 
                                    : data.project_nature_duration
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
                            <SummaryItem label="Preferred Release Mode" value={data.preferred_release_mode} />
                            {data.preferred_release_mode === 'delivery' && (
                                <SummaryItem label="Delivery Address" value={data.release_address} />
                            )}
                        </div>
                    </div>

                    {/* Requirements Uploaded */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Requirements Uploaded</h3>
                        <div className="space-y-2 text-sm">
                            {data.requirement_uploads && Object.keys(data.requirement_uploads).length > 0 ? (
                                <>
                                    {Object.entries(data.requirement_uploads).map(([reqId, files]) => (
                                        <div key={reqId} className="flex justify-between gap-4">
                                            <span className="text-gray-600 text-xs">Requirement #{reqId}:</span>
                                            <span className="text-gray-900 font-medium text-xs">
                                                {files.length} file{files.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="border-t mt-3 pt-3">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-700 font-semibold text-xs">Total Files:</span>
                                            <span className="text-gray-900 font-bold text-xs">
                                                {Object.values(data.requirement_uploads).reduce((sum, files) => sum + files.length, 0)} files
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500 text-xs italic">No requirements uploaded yet</p>
                            )}
                        </div>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Important:</p>
                        <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                            <li>Once submitted, you cannot edit this application</li>
                            <li>You will receive a confirmation email with your application details</li>
                            <li>The CPDO admin will review your application and notify you of their decision</li>
                        </ul>
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
                        onClick={onConfirm}
                        disabled={processing}
                        className="gap-2 bg-blue-600 hover:bg-blue-700 px-6"
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
