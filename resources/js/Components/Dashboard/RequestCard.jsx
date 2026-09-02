import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { ProgressIndicator } from "@/Components/ui/progress-indicator";
import {
    CalendarDays,
    MapPin,
    User,
    Award,
    DollarSign,
    Download,
    Eye,
    XCircle,
} from "lucide-react";
import { getStatusColor, getStatusIcon, getStatusLabel, formatDate, formatLocation } from "./utils";

export function RequestCard({ request, onClick }) {
    const hasVerifiedPayment = request?.payment_verified && request?.certificate_number;
    
    return (
        <Card
            className={`group hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white rounded-xl border-2 shadow-lg ${
                hasVerifiedPayment
                    ? "shadow-emerald-200 border-emerald-300 hover:border-emerald-400 hover:shadow-emerald-300"
                    : request?.status === "approved"
                    ? "border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-200"
                    : request?.status === "rejected"
                    ? "border-rose-200 hover:border-rose-400 hover:shadow-rose-200"
                    : "border-blue-200 hover:border-blue-400 hover:shadow-blue-200"
            }`}
            onClick={onClick}
        >
            <CardHeader className="pb-4 space-y-3 bg-gradient-to-r from-gray-50 to-white rounded-t-xl border-b border-gray-100">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-100 rounded-lg">
                                <Award className="h-4 w-4 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg font-bold text-gray-900">
                                Request #{request?.id}
                            </CardTitle>
                            {hasVerifiedPayment && (
                                <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 rounded-full shadow-sm">
                                    <Award className="h-3.5 w-3.5 text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-700">
                                        Certified
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span className="font-medium">{formatDate(request?.created_at)}</span>
                        </div>
                    </div>
                    <Badge
                        className={`${getStatusColor(
                            request?.status || "pending"
                        )} shadow-md flex-shrink-0`}
                    >
                        <span className="flex items-center gap-1.5">
                            {getStatusIcon(request?.status || "pending")}
                            {getStatusLabel(request?.status || "pending")}
                        </span>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress Indicator */}
                <div className="mb-6">
                    <ProgressIndicator
                        currentStatus={
                            hasVerifiedPayment
                                ? "certificate_issued"
                                : request?.status || "pending"
                        }
                        rejectionReason={request?.report_description}
                    />
                </div>

                {/* Certificate Section - Priority Display */}
                {hasVerifiedPayment && (
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-emerald-200 rounded-full">
                                <Award className="h-4 w-4 text-emerald-700" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-emerald-900">
                                    Certificate Ready
                                </h4>
                                <p className="text-xs text-emerald-700">
                                    Your certificate is available for download
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs font-medium text-emerald-600">
                                    Certificate No.
                                </p>
                                <p className="font-mono font-semibold text-emerald-900">
                                    {request.certificate_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-emerald-600">
                                    Issued
                                </p>
                                <p className="font-semibold text-emerald-900">
                                    {formatDate(request.certificate_issued_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            {request.certificate_file_path ? (
                                <>
                                    <Button
                                        asChild
                                        size="sm"
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-md"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <a href={`/certificate/${request.certificate_id}/download`}>
                                            <Download className="h-3 w-3 mr-1" />
                                            Download
                                        </a>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <a href="/receipt">
                                            <Eye className="h-3 w-3 mr-1" />
                                            Receipt
                                        </a>
                                    </Button>
                                </>
                            ) : (
                                <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                    <p className="text-xs text-amber-700 text-center font-medium">
                                        Certificate is being prepared. Download will be available soon.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Applicant & Project Info */}
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                                {request?.applicant_name || "Unknown Applicant"}
                            </p>
                            {request?.corporation_name && (
                                <p className="text-sm text-gray-600 truncate">
                                    {request.corporation_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 line-clamp-2">
                                {formatLocation(request)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Project Summary */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {request?.project_type && (
                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Type
                                </p>
                                <p className="font-medium text-gray-900 truncate">
                                    {request.project_type}
                                </p>
                            </div>
                        )}
                        {request?.lot_area_sqm && (
                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Area
                                </p>
                                <p className="font-medium text-gray-900">
                                    {parseFloat(request.lot_area_sqm).toLocaleString()} sqm
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Payment Info for non-certified requests */}
                    {!hasVerifiedPayment && request?.payment_amount && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    Payment Required
                                </span>
                            </div>
                            <p className="text-sm text-blue-700">
                                ₱{parseFloat(request.payment_amount).toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Denial Reason Preview for denied requests */}
                    {request?.status === "rejected" && request?.report_description && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-medium text-red-900">
                                    Denial Reason
                                </span>
                            </div>
                            <p className="text-sm text-red-700 line-clamp-2">
                                {request.report_description.length > 100
                                    ? `${request.report_description.substring(0, 100)}...`
                                    : request.report_description}
                            </p>
                            <p className="text-xs text-red-600 mt-1 font-medium">
                                Click to view full details
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
