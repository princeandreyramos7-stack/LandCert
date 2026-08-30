import React from "react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { router } from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    MoreVertical,
    Eye,
    FileCheck,
} from "lucide-react";
import { getStatusColor, getStatusIcon, getStatusLabel, formatDate, formatLocation, formatProjectType } from "./utils";

export function RequestTable({
    requests,
    onEdit,
    onDelete,
}) {
    const handleReviewClick = (request) => {
        router.visit(route('admin.requests.review', request.id));
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Application No.</th>
                        <th className="text-left p-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Applicant</th>
                        <th className="text-left p-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Locational Clearance</th>
                        <th className="text-left p-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Location</th>
                        <th className="text-left p-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Date</th>
                        <th className="text-left p-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Status of Application</th>
                        <th className="text-left p-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="p-8 text-center text-gray-500">
                                No requests found
                            </td>
                        </tr>
                    ) : (
                        requests.map((request) => (
                            <tr
                                key={request.id}
                                className="border-b hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-3 font-mono text-sm font-bold text-[#0d1f5c]">
                                    {request.application_number || `#${request.id}`}
                                </td>
                                <td className="p-3">
                                    <div>
                                        <p className="font-medium">
                                            {request.applicant_name}
                                        </p>
                                        {request.corporation_name && (
                                            <p className="text-xs text-gray-500">
                                                {request.corporation_name}
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-sm">
                                    {formatProjectType(request.project_type) ?? (
                                        <span className="text-slate-400 italic text-xs">Not specified</span>
                                    )}
                                </td>
                                <td className="p-3 text-sm max-w-xs truncate">
                                    {formatLocation(request) !== "Location not specified"
                                        ? formatLocation(request)
                                        : <span className="text-slate-400 italic text-xs">Not specified</span>
                                    }
                                </td>
                                <td className="p-3 text-sm">
                                    {formatDate(request.created_at)}
                                </td>
                                <td className="p-3">
                                    <Badge
                                        className={getStatusColor(
                                            request.status
                                        )}
                                    >
                                        <span className="flex items-center gap-1">
                                            {getStatusIcon(request.status)}
                                            {getStatusLabel(request.status)}
                                        </span>
                                    </Badge>
                                </td>
                                <td className="p-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => router.visit(route('admin.requests.view-application', request.id))}
                                                className="text-blue-600 font-medium"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Application
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => router.visit(route('admin.requests.document-verification', request.id))}
                                                className="text-purple-600 font-medium"
                                            >
                                                <FileCheck className="h-4 w-4 mr-2" />
                                                Document Verification
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
