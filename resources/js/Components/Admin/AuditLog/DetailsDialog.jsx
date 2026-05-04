import React from "react";
import { Badge } from "@/Components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Eye, User, Activity } from "lucide-react";
import { getActionBadge, formatDate, formatActionLabel } from "./utils";

export function DetailsDialog({ isOpen, onOpenChange, selectedLog }) {
    if (!selectedLog) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="bg-blue-600 p-3 rounded-t-lg sticky top-0 z-10">
                    <DialogTitle className="text-base font-bold flex items-center gap-2 !text-white">
                        <Eye className="h-4 w-4 text-white" />
                        <span className="text-white">Audit Log Details</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="p-3 space-y-2.5 overflow-y-auto max-h-[calc(90vh-64px)]">
                    {/* Top Row - User Info and Action */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {/* User Information */}
                        <div className="bg-blue-50 rounded-md p-2.5 border border-blue-200">
                            <h3 className="text-xs font-semibold text-blue-900 mb-1.5 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                User Information
                            </h3>
                            <div className="space-y-1.5">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">
                                        User
                                    </label>
                                    <p className="mt-0.5 text-sm font-medium text-gray-900">
                                        {selectedLog.user_name || "System"}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {selectedLog.user_email}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">
                                        Action
                                    </label>
                                    <p className="mt-0.5">
                                        <Badge
                                            variant={getActionBadge(
                                                selectedLog.action
                                            )}
                                            className="text-xs"
                                        >
                                            {formatActionLabel(
                                                selectedLog.action
                                            )}
                                        </Badge>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Details */}
                        <div className="bg-gray-50 rounded-md p-2.5 border border-gray-200">
                            <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                Action Details
                            </h3>
                            <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                    <label className="text-xs font-medium text-gray-600">
                                        Date & Time
                                    </label>
                                    <p className="mt-0.5 text-xs text-gray-900">
                                        {formatDate(selectedLog.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600">
                                        IP Address
                                    </label>
                                    <p className="mt-0.5 font-mono text-xs text-gray-900">
                                        {selectedLog.ip_address}
                                    </p>
                                </div>
                                {selectedLog.model_type && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-600">
                                            Model
                                        </label>
                                        <p className="mt-0.5 text-xs text-gray-900">
                                            {selectedLog.model_type}
                                            {selectedLog.model_id &&
                                                ` #${selectedLog.model_id}`}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-medium text-gray-600">
                                        Method
                                    </label>
                                    <p className="mt-0.5 text-xs text-gray-900">
                                        {selectedLog.method}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description - Full Width */}
                    <div className="bg-gray-50 rounded-md p-2.5 border border-gray-200">
                        <label className="text-xs font-medium text-gray-600">
                            Description
                        </label>
                        <p className="mt-0.5 text-sm text-gray-900">
                            {selectedLog.description}
                        </p>
                    </div>

                    {/* Technical Details - Full Width */}
                    <div className="bg-gray-50 rounded-md p-2.5 border border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-900 mb-1.5">
                            Technical Details
                        </h3>
                        <div className="grid grid-cols-2 gap-2.5">
                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    URL
                                </label>
                                <p className="mt-0.5 text-xs text-gray-900 break-all">
                                    {selectedLog.url}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">
                                    User Agent
                                </label>
                                <p className="mt-0.5 text-xs text-gray-600 break-all">
                                    {selectedLog.user_agent}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Changes Made */}
                    {selectedLog.old_values &&
                        Object.keys(selectedLog.old_values).length > 0 && (
                            <div className="bg-amber-50 rounded-md p-2.5 border border-amber-200">
                                <h3 className="text-xs font-semibold text-amber-900 mb-1.5 flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    Changes Made
                                </h3>
                                <div className="space-y-1.5">
                                    {Object.keys(selectedLog.old_values).map(
                                        (key) => {
                                            const oldValue =
                                                selectedLog.old_values[key];
                                            const newValue =
                                                selectedLog.new_values?.[key];
                                            if (oldValue !== newValue) {
                                                return (
                                                    <div
                                                        key={key}
                                                        className="bg-white rounded-md border border-amber-200 p-2"
                                                    >
                                                        <div className="font-semibold text-xs text-gray-900 mb-1 capitalize">
                                                            {key.replace(
                                                                /_/g,
                                                                " "
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1.5">
                                                            <div className="bg-red-50 rounded p-1.5 border border-red-200">
                                                                <span className="text-xs font-medium text-red-700">
                                                                    Before:
                                                                </span>
                                                                <p className="text-xs text-gray-900 mt-0.5 break-words">
                                                                    {oldValue || (
                                                                        <span className="text-gray-400 italic">
                                                                            (empty)
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="bg-green-50 rounded p-1.5 border border-green-200">
                                                                <span className="text-xs font-medium text-green-700">
                                                                    After:
                                                                </span>
                                                                <p className="text-xs text-gray-900 mt-0.5 break-words">
                                                                    {newValue || (
                                                                        <span className="text-gray-400 italic">
                                                                            (empty)
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
