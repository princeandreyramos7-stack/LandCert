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
    Home,
    Mail,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { formatDate } from "./utils";

export function ViewRequestModal({ request, isOpen, onClose }) {
    if (!request) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] bg-white border-2 border-gray-300 rounded-xl overflow-hidden p-0 gap-0">
                <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 space-y-2">
                    <DialogTitle className="text-2xl font-bold text-white">
                        Request #{request?.id}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-blue-100 font-medium">
                        Submitted: {formatDate(request?.created_at)} • Status:{" "}
                        {(request?.status || "pending").charAt(0).toUpperCase() +
                            (request?.status || "pending").slice(1)}
                    </DialogDescription>
                </DialogHeader>

                {/* Denial Reason Alert - Only show for denied requests */}
                {request?.status === "rejected" && request?.report_description && (
                    <div className="mx-6 mt-4 mb-2 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <XCircle className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-red-800 mb-2">
                                    Application Denied
                                </h3>
                                <p className="text-sm text-red-700 mb-3 font-medium">
                                    Reason for rejection:
                                </p>
                                <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        {request.report_description}
                                    </p>
                                </div>
                                <p className="text-sm text-red-600 mt-3 flex items-center gap-2">
                                    <span className="text-lg">💡</span>
                                    <span>
                                        Please review the feedback and submit a new application
                                        with corrections.
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Grid - Compact 2 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Left Column */}
                    <div className="space-y-3">
                        {/* Applicant Information */}
                        <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-blue-600" />
                                Applicant Information
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[10px] font-medium text-gray-500">
                                            Applicant Name
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {request?.applicant_name || "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-medium text-gray-500">
                                            Applicant Address
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {request?.applicant_address || "N/A"}
                                        </p>
                                    </div>
                                </div>
                                {request?.corporation_name && (
                                    <>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Corporation Name
                                            </p>
                                            <p className="font-semibold">
                                                {request.corporation_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Corporation Address
                                            </p>
                                            <p className="font-medium">
                                                {request.corporation_address || "N/A"}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {request?.authorized_representative_name && (
                                    <>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Authorized Representative
                                            </p>
                                            <p className="font-semibold">
                                                {request.authorized_representative_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Representative Address
                                            </p>
                                            <p className="font-medium">
                                                {request.authorized_representative_address ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Project Details */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-purple-600" />
                                Project Details
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {request?.project_type && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Locational Clearance
                                            </p>
                                            <p className="font-semibold">
                                                {request.project_type}
                                            </p>
                                        </div>
                                    )}
                                    {request?.project_nature && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Project Classification
                                            </p>
                                            <p className="font-semibold">
                                                {request.project_nature}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {request?.project_nature_duration && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Project Duration
                                            </p>
                                            <p className="font-semibold">
                                                {request.project_nature_duration}
                                                {request.project_nature_years &&
                                                    ` (${request.project_nature_years} years)`}
                                            </p>
                                        </div>
                                    )}
                                    {request?.right_over_land && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Right Over Land
                                            </p>
                                            <p className="font-semibold">
                                                {request.right_over_land}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {request?.project_area_sqm && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Project Area
                                            </p>
                                            <p className="font-semibold">
                                                {parseFloat(
                                                    request.project_area_sqm
                                                ).toLocaleString()}{" "}
                                                sqm
                                            </p>
                                        </div>
                                    )}
                                    {request?.lot_area_sqm && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Lot Area
                                            </p>
                                            <p className="font-semibold">
                                                {parseFloat(
                                                    request.lot_area_sqm
                                                ).toLocaleString()}{" "}
                                                sqm
                                            </p>
                                        </div>
                                    )}
                                    {request?.bldg_improvement_sqm && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Building Area
                                            </p>
                                            <p className="font-semibold">
                                                {parseFloat(
                                                    request.bldg_improvement_sqm
                                                ).toLocaleString()}{" "}
                                                sqm
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {request?.project_cost && (
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Project Cost
                                        </p>
                                        <p className="font-semibold">
                                            ₱
                                            {parseFloat(
                                                request.project_cost
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 overflow-y-auto pr-2">
                        {/* Project Location */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                Project Location
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {request?.project_location_number && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                House/Lot Number
                                            </p>
                                            <p className="font-semibold">
                                                {request.project_location_number}
                                            </p>
                                        </div>
                                    )}
                                    {request?.project_location_street && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Street
                                            </p>
                                            <p className="font-semibold">
                                                {request.project_location_street}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {request?.project_location_barangay && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Barangay
                                            </p>
                                            <p className="font-semibold">
                                                {request.project_location_barangay}
                                            </p>
                                        </div>
                                    )}
                                    {(request?.project_location_municipality ||
                                        request?.project_location_city) && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Municipality/City
                                            </p>
                                            <p className="font-semibold">
                                                {request.project_location_municipality ||
                                                    request.project_location_city}
                                            </p>
                                        </div>
                                    )}
                                    {request?.project_location_province && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Province
                                            </p>
                                            <p className="font-semibold">
                                                {request.project_location_province}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Land Use Information */}
                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Home className="h-4 w-4 text-amber-600" />
                                Land Use Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {request?.existing_land_use && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Existing Land Use
                                            </p>
                                            <p className="font-semibold">
                                                {request.existing_land_use}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Written Notice to Tenants
                                        </p>
                                        <p className="font-semibold">
                                            {request?.has_written_notice === "yes"
                                                ? "Yes"
                                                : "No"}
                                        </p>
                                    </div>
                                </div>
                                {request?.has_written_notice === "yes" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {request.notice_officer_name && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">
                                                    Notice Officer Name
                                                </p>
                                                <p className="font-semibold">
                                                    {request.notice_officer_name}
                                                </p>
                                            </div>
                                        )}
                                        {request.notice_dates && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">
                                                    Notice Dates
                                                </p>
                                                <p className="font-semibold">
                                                    {request.notice_dates}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Similar Application Filed
                                        </p>
                                        <p className="font-semibold">
                                            {request?.has_similar_application === "yes"
                                                ? "Yes"
                                                : "No"}
                                        </p>
                                    </div>
                                </div>
                                {request?.has_similar_application === "yes" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {request.similar_application_offices && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">
                                                    Application Offices
                                                </p>
                                                <p className="font-semibold">
                                                    {request.similar_application_offices}
                                                </p>
                                            </div>
                                        )}
                                        {request.similar_application_dates && (
                                            <div>
                                                <p className="text-xs font-medium text-gray-500">
                                                    Application Dates
                                                </p>
                                                <p className="font-semibold">
                                                    {request.similar_application_dates}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Release Preference */}
                        {request?.preferred_release_mode && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-teal-600" />
                                    Release Preference
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">
                                            Preferred Release Mode
                                        </p>
                                        <p className="font-semibold capitalize">
                                            {request.preferred_release_mode.replace("_", " ")}
                                        </p>
                                    </div>
                                    {request.release_address && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Release Address
                                            </p>
                                            <p className="font-semibold">
                                                {request.release_address}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Certificate Information */}
                        {request?.payment_verified && request?.certificate_number && (
                            <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    Certificate Information
                                </h3>
                                <div className="space-y-3 text-sm mb-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Certificate Number
                                            </p>
                                            <p className="font-bold text-emerald-900">
                                                {request.certificate_number}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Issued
                                            </p>
                                            <p className="font-semibold text-emerald-800">
                                                {formatDate(request.certificate_issued_at)}
                                            </p>
                                        </div>
                                    </div>
                                    {(request.payment_amount || request.payment_date) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {request.payment_amount && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        Amount Paid
                                                    </p>
                                                    <p className="font-semibold text-emerald-800">
                                                        ₱
                                                        {parseFloat(
                                                            request.payment_amount
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                            {request.payment_date && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        Payment Date
                                                    </p>
                                                    <p className="font-semibold text-emerald-800">
                                                        {formatDate(request.payment_date)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
