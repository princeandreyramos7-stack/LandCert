import React from "react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Calendar, User, Eye } from "lucide-react";
import { getActionBadge, formatDate, formatActionLabel } from "./utils";

export function AuditLogTable({ logs, onViewDetails }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-xs">Date & Time</TableHead>
                        <TableHead className="text-xs">User</TableHead>
                        <TableHead className="text-xs">Action</TableHead>
                        <TableHead className="text-xs">Description</TableHead>
                        <TableHead className="text-xs">Model</TableHead>
                        <TableHead className="text-xs">IP Address</TableHead>
                        <TableHead className="text-right text-xs">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.data.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center py-6 text-gray-500 text-sm"
                            >
                                No audit logs found
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.data.map((log) => (
                            <TableRow
                                key={log.id}
                                className="hover:bg-gray-50"
                            >
                                <TableCell className="whitespace-nowrap py-2">
                                    <div className="flex items-center text-xs">
                                        <Calendar className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                                        {formatDate(log.created_at)}
                                    </div>
                                </TableCell>
                                <TableCell className="py-2">
                                    <div className="flex items-center">
                                        <User className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                                        <div>
                                            <div className="font-medium text-xs">
                                                {log.user_name || "System"}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {log.user_email}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="py-2">
                                    <Badge
                                        variant={getActionBadge(log.action)}
                                        className="text-xs"
                                    >
                                        {formatActionLabel(log.action)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="max-w-md truncate text-xs py-2">
                                    {log.description}
                                </TableCell>
                                <TableCell className="py-2">
                                    {log.model_type && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {log.model_type}
                                            {log.model_id && ` #${log.model_id}`}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="font-mono text-xs py-2">
                                    {log.ip_address}
                                </TableCell>
                                <TableCell className="text-right py-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewDetails(log)}
                                        className="h-7 w-7 p-0"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
