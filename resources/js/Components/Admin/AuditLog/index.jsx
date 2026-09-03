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
    routePrefix = "admin",
}) {
    const [selectedLog, setSelectedLog] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters || {});

    // Open the panel when a filter is already in force. Collapsed by default it
    // looked as though the full history was on screen, with no hint that the
    // list had been narrowed.
    const activeFilterCount = Object.values(filters || {}).filter(
        (value) => value !== null && value !== undefined && value !== ""
    ).length;
    const [showFilters, setShowFilters] = useState(activeFilterCount > 0);

    const auditLogsRoute = routePrefix === "super-admin" ? "super-admin.audit-logs" : "admin.audit-logs";
    const exportRoute    = routePrefix === "super-admin" ? "super-admin.audit-logs.export" : "admin.audit-logs.export";

    const handleFilter = () => {
        router.get(route(auditLogsRoute), localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setLocalFilters({});
        router.get(route(auditLogsRoute), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        window.location.href = route(exportRoute, localFilters);
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
                activeFilterCount={activeFilterCount}
                onApplyFilters={handleFilter}
                onClearFilters={handleClearFilters}
            />

            <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100 p-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#0d1f5c]">
                                <div className="p-1.5 rounded-lg" style={{background:"rgba(13,31,92,0.06)"}}>
                                    <Activity className="h-5 w-5 text-[#0d1f5c]" />
                                </div>
                                Activity History
                            </CardTitle>
                            <p className="text-gray-400 mt-1 text-sm">
                                Total: {logs.total} records
                            </p>
                        </div>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            size="sm"
                            className="gap-1 border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] hover:text-[#d4a017] h-8 text-xs"
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
