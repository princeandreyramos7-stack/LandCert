import React from "react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { router } from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    MoreVertical,
    CheckCircle,
    Trash2,
} from "lucide-react";
import { getStatusColor, getStatusIcon, formatDate, formatLocation, formatProjectType } from "./utils";

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
                    <tr className="border-b">
                        <th className="text-left p-3 font-semibold">ID</th>
                        <th className="text-left p-3 font-semibold">
                            Applicant
                        </th>
                        <th className="text-left p-3 font-semibold">User</th>
                        <th className="text-left p-3 font-semibold">
                            Project Type
                        </th>
                        <th className="text-left p-3 font-semibold">
                            Location
                        </th>
                        <th className="text-left p-3 font-semibold">Date</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="p-8 text-center text-gray-500">
                                No requests found
                            </td>
                        </tr>
                    ) : (
                        requests.map((request) => (
                            <tr
                                key={request.id}
                                className="border-b hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-3 font-mono text-sm">
                                    #{request.id}
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
                                <td className="p-3">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {request.user_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {request.user_email}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-3 text-sm">
                                    {formatProjectType(request.project_type) ?? (
                                        <span className="text-slate-400 italic text-xs">Not specified</span>
                                    )}
                                </td>
                                <td className="p-3 text-sm max-w-xs truncate">
                                    {formatLocation(request)}
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
                                            {(request.status || "pending")
                                                .charAt(0)
                                                .toUpperCase() +
                                                (
                                                    request.status || "pending"
                                                ).slice(1)}
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
                                                onClick={() => handleReviewClick(request)}
                                                className="text-blue-600 font-medium"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Review Application
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onDelete(request)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
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
