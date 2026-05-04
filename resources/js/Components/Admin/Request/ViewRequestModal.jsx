import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
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
            <DialogContent className="max-w-[98vw] w-full max-h-[95vh] bg-white border border-blue-300 rounded-lg overflow-hidden">
                <DialogHeader className="pb-3 bg-blue-600 text-white p-4 -m-6 mb-4 rounded-t-lg">
                    <DialogTitle className="text-lg font-bold text-white">
                        Request Details #{request.id}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-white">
                        Submitted on {formatDate(request.created_at)} • Status:{" "}
                        {(request.status || "pending").charAt(0).toUpperCase() +
                            (request.status || "pending").slice(1)}
                    </DialogDescription>
                </DialogHeader>

                {/* Content Grid - 2 Column Layout */}
                <div className="grid grid-cols-2 gap-6 overflow-y-auto max-h-[calc(90vh-120px)] px-1">
                    {/* Left Column */}
                    <div className="space-y-4">
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
                                            href={`/storage/${request.authorization_letter_path}`}
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
                                label="Project Type"
                                value={request.project_type}
                            />
                            <InfoField
                                label="Project Nature"
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
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
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
        <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {title}
            </h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function InfoField({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-semibold text-gray-900">
                {value || "N/A"}
            </p>
        </div>
    );
}
