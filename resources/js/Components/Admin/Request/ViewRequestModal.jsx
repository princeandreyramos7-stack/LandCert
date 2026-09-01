import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    User,
    Building2,
    MapPin,
    DollarSign,
    Home,
    FileText,
    CalendarDays,
} from "lucide-react";
import { formatDate } from "./utils";

export function ViewRequestModal({ isOpen, onClose, request }) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[99vw] w-full max-h-[98vh] bg-white border border-blue-300 rounded-lg overflow-hidden">
                <DialogHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 -m-6 mb-6 rounded-t-lg shadow-md">
                    <DialogTitle className="text-lg font-bold text-white">
                        Request Details #{request.id}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-white">
                        Submitted on {formatDate(request.created_at)} • Status:{" "}
                        {(request.status || "pending").charAt(0).toUpperCase() +
                            (request.status || "pending").slice(1)}
                    </DialogDescription>
                </DialogHeader>

                {/* Content - Horizontal Single Column Layout */}
                <div className="overflow-y-auto max-h-[calc(98vh-180px)] px-6 py-2">
                    <div className="space-y-6 max-w-[95vw] mx-auto">
                        {/* Applicant Information */}
                        <InfoSection icon={User} title="Applicant Information">
                            <InfoField
                                label="Name of Applicant"
                                value={request.applicant_name}
                            />
                            <InfoField
                                label="Address of Applicant"
                                value={request.applicant_address}
                            />
                            {request.corporation_name && (
                                <>
                                    <InfoField
                                        label="Name of Corporation"
                                        value={request.corporation_name}
                                    />
                                    <InfoField
                                        label="Address of Corporation"
                                        value={request.corporation_address}
                                    />
                                </>
                            )}
                        </InfoSection>

                        {/* Authorized Representative */}
                        {request.authorized_representative_name && (
                            <InfoSection
                                icon={User}
                                title="Authorized Representative"
                            >
                                <InfoField
                                    label="Name of Authorized Representative"
                                    value={request.authorized_representative_name}
                                />
                                <InfoField
                                    label="Address of Authorized Representative"
                                    value={
                                        request.authorized_representative_address
                                    }
                                />
                                {request.authorization_letter_path && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">
                                            Authorization Letter
                                        </p>
                                        <a
                                            href={`/requests/${request.application_id || request.id}/authorization-letter`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <FileText className="h-3 w-3" />
                                            View Document
                                        </a>
                                    </div>
                                )}
                            </InfoSection>
                        )}

                        {/* Project Details */}
                        <InfoSection icon={Building2} title="Project Details">
                            <InfoField
                                label="Locational Clearance"
                                value={request.project_type}
                            />
                            <InfoField
                                label="Project Classification"
                                value={request.project_nature}
                            />
                        </InfoSection>

                        {/* Project Location */}
                        <InfoSection icon={MapPin} title="Project Location">
                            <InfoField
                                label="House/Building Number"
                                value={request.project_location_number}
                            />
                            <InfoField
                                label="Street"
                                value={request.project_location_street}
                            />
                            <InfoField
                                label="Barangay"
                                value={request.project_location_barangay}
                            />
                            <InfoField
                                label="Municipality"
                                value={request.project_location_municipality}
                            />
                            <InfoField
                                label="Province"
                                value={request.project_location_province}
                            />
                        </InfoSection>

                        {/* Project Area Details */}
                        <InfoSection icon={Building2} title="Project Area">
                            <InfoField
                                label="Project Area (sqm)"
                                value={
                                    request.project_area_sqm
                                        ? `${parseFloat(
                                              request.project_area_sqm
                                          ).toLocaleString()} sqm`
                                        : "N/A"
                                }
                            />
                            <InfoField
                                label="Lot (sqm)"
                                value={
                                    request.lot_area_sqm
                                        ? `${parseFloat(
                                              request.lot_area_sqm
                                          ).toLocaleString()} sqm`
                                        : "N/A"
                                }
                            />
                            <InfoField
                                label="Bldg. Improvement (sqm)"
                                value={
                                    request.bldg_improvement_sqm
                                        ? `${parseFloat(
                                              request.bldg_improvement_sqm
                                          ).toLocaleString()} sqm`
                                        : "N/A"
                                }
                            />
                            <InfoField
                                label="Right Over Land"
                                value={request.right_over_land}
                            />
                        </InfoSection>

                        {/* Project Nature & Cost */}
                        <InfoSection
                            icon={DollarSign}
                            title="Project Nature & Cost"
                        >
                            <InfoField
                                label="Project Nature"
                                value={request.project_nature_duration}
                            />
                            {request.project_nature_duration === "Temporary" &&
                                request.project_nature_years && (
                                    <InfoField
                                        label="Specify Years"
                                        value={`${request.project_nature_years} years`}
                                    />
                                )}
                            <InfoField
                                label="Project Cost/Capitalization (in Pesos)"
                                value={
                                    request.project_cost
                                        ? `₱${parseFloat(
                                              request.project_cost
                                          ).toLocaleString()}`
                                        : "N/A"
                                }
                            />
                        </InfoSection>

                        {/* Land Use Information */}
                        <InfoSection icon={Home} title="Land Use Information">
                            <InfoField
                                label="Existing Land Uses of Project Use"
                                value={request.existing_land_use}
                            />
                            <InfoField
                                label="Written Notice from Office/Zoning Administrator"
                                value={
                                    request.has_written_notice
                                        ? request.has_written_notice.toUpperCase()
                                        : "N/A"
                                }
                            />
                            {request.has_written_notice === "yes" && (
                                <>
                                    <InfoField
                                        label="Name of HSRC Officer/Zoning Administrator"
                                        value={request.notice_officer_name}
                                    />
                                    <InfoField
                                        label="Date(s) of Notice(s)"
                                        value={request.notice_dates}
                                    />
                                </>
                            )}
                            <InfoField
                                label="Similar Application with Other Offices"
                                value={
                                    request.has_similar_application
                                        ? request.has_similar_application.toUpperCase()
                                        : "N/A"
                                }
                            />
                            {request.has_similar_application === "yes" && (
                                <>
                                    <InfoField
                                        label="Other HSRC Office(s) Where Filed"
                                        value={
                                            request.similar_application_offices
                                        }
                                    />
                                    <InfoField
                                        label="Date(s) Filed"
                                        value={
                                            request.similar_application_dates
                                        }
                                    />
                                </>
                            )}
                        </InfoSection>

                        {/* Submission Date */}
                        <InfoSection icon={CalendarDays} title="Submission Info">
                            <InfoField
                                label="Submitted On"
                                value={formatDate(request.created_at)}
                            />
                            <InfoField
                                label="Last Updated"
                                value={formatDate(request.updated_at)}
                            />
                        </InfoSection>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper Components
function InfoSection({ icon: Icon, title, children }) {
return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-3 border-b border-gray-300 pb-3">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Icon className="h-5 w-5 text-white" />
            </div>
            {title}
        </h3>
        <div className="grid grid-cols-4 gap-x-8 gap-y-4">{children}</div>
    </div>
    );
}

function InfoField({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">{label}</p>
            <p className="text-base font-semibold text-gray-900 break-words">
                {value || "N/A"}
            </p>
        </div>
    );
}
