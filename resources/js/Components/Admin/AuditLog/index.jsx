import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Download, Activity } from "lucide-react";
import { router } from "@inertiajs/react";
import { FilterCard } from "./FilterCard";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogPagination } from "./AuditLogPagination";
import { DetailsDialog } from "./DetailsDialog";

export function AuditLogComponent({
    logs,
    users,
    actions,
    modelTypes,
    filters,
}) {
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters || {});

    const handleFilter = () => {
        router.get(route("admin.audit-logs"), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setLocalFilters({});
        router.get(
            route("admin.audit-logs"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleExport = () => {
        window.location.href = route("admin.audit-logs.export", localFilters);
    };

    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setShowDetails(true);
    };

    const handlePageChange = (url) => {
        if (url) {
            router.get(url, localFilters, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <FilterCard
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                localFilters={localFilters}
                setLocalFilters={setLocalFilters}
                users={users}
                actions={actions}
                modelTypes={modelTypes}
                onApplyFilters={handleFilter}
                onClearFilters={handleClearFilters}
            />

            <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CardHeader className="bg-blue-600 border-b border-blue-700 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                Activity History
                            </CardTitle>
                            <p className="text-blue-100 mt-1 text-sm">
                                Total: {logs.total} records
                            </p>
                        </div>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            size="sm"
                            className="gap-1 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm h-8 text-xs"
                        >
                            <Download className="h-3.5 w-3.5" />
                            Export PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <AuditLogTable
                        logs={logs}
                        onViewDetails={handleViewDetails}
                    />
                    <AuditLogPagination
                        logs={logs}
                        onPageChange={handlePageChange}
                    />
                </CardContent>
            </Card>

            <DetailsDialog
                isOpen={showDetails}
                onOpenChange={setShowDetails}
                selectedLog={selectedLog}
            />
        </>
    );
}
