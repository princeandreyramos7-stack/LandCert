import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    Calendar,
    FileText,
    Upload,
} from "lucide-react";
import { getStatusColor, formatDate } from "./utils";

export function ReceiptCard({ request, onUploadClick }) {
    const getStatusIcon = (status) => {
        switch (status) {
            case "verified":
                return <CheckCircle2 className="h-4 w-4" />;
            case "rejected":
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const renderActionButtons = () => {
        if (request.payment_status === "verified" && request.certificate_id) {
            return (
                <>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2"
                        asChild
                    >
                        <a
                            href={route(
                                "certificate.download",
                                request.certificate_id
                            )}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Download Certificate
                        </a>
                    </Button>
                    {request.receipt_file_path && (
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={`/storage/${request.receipt_file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                View Receipt
                            </a>
                        </Button>
                    )}
                </>
            );
        }

        if (!request.payment_id || request.payment_status === "rejected") {
            return (
                <Button onClick={() => onUploadClick(request)}>
                    <Upload className="h-4 w-4 mr-2" />
                    {request.payment_status === "rejected"
                        ? "Resubmit"
                        : "Upload Receipt"}
                </Button>
            );
        }

        if (request.payment_status === "pending") {
            return (
                <>
                    <Badge variant="outline" className="text-blue-600">
                        Awaiting Verification
                    </Badge>
                    {request.receipt_file_path && (
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={`/storage/${request.receipt_file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                View Receipt
                            </a>
                        </Button>
                    )}
                </>
            );
        }

        if (request.payment_status === "verified") {
            return (
                <>
                    <Badge variant="outline" className="text-emerald-600">
                        Payment Verified ✓
                    </Badge>
                    {request.receipt_file_path && (
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={`/storage/${request.receipt_file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                View Receipt
                            </a>
                        </Button>
                    )}
                </>
            );
        }

        if (request.receipt_file_path) {
            return (
                <Button variant="outline" size="sm" asChild>
                    <a
                        href={`/storage/${request.receipt_file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        View Receipt
                    </a>
                </Button>
            );
        }

        return null;
    };

    return (
        <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">
                                Request #{request.id}
                            </h3>
                            {request.payment_status === "verified" && (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Verified
                                    </span>
                                </Badge>
                            )}
                            {request.payment_status &&
                                request.payment_status !== "verified" && (
                                    <Badge
                                        className={getStatusColor(
                                            request.payment_status
                                        )}
                                    >
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(
                                                request.payment_status
                                            )}
                                            {request.payment_status
                                                .charAt(0)
                                                .toUpperCase() +
                                                request.payment_status.slice(1)}
                                        </span>
                                    </Badge>
                                )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                            <strong>Applicant:</strong> {request.applicant_name}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                            <strong>Project:</strong>{" "}
                            {request.project_type || "N/A"}
                        </p>
                        {request.payment_amount && (
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <strong>Amount Paid:</strong> ₱
                                {parseFloat(
                                    request.payment_amount
                                ).toLocaleString()}
                            </p>
                        )}
                        {request.payment_date && (
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <strong>Payment Date:</strong>{" "}
                                {formatDate(request.payment_date)}
                            </p>
                        )}
                        {request.payment_status === "verified" &&
                            request.certificate_number && (
                                <div className="mt-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        <span className="font-semibold text-emerald-800">
                                            Certificate Information
                                        </span>
                                    </div>
                                    <p className="text-sm text-emerald-800 mb-1">
                                        <strong>Certificate Number:</strong>{" "}
                                        {request.certificate_number}
                                    </p>
                                    <p className="text-sm text-emerald-800">
                                        <strong>Issued:</strong>{" "}
                                        {formatDate(request.issued_at)}
                                    </p>
                                </div>
                            )}
                        {request.rejection_reason && (
                            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-md">
                                <p className="text-sm text-rose-800">
                                    <strong>Rejection Reason:</strong>{" "}
                                    {request.rejection_reason}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        {renderActionButtons()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
