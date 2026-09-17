import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Download, Activity, CalendarDays, ShieldAlert, Users, Zap } from "lucide-react";
import { router } from "@inertiajs/react";
import { FilterCard } from "./FilterCard";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogPagination } from "./AuditLogPagination";
import { DetailsDialog } from "./DetailsDialog";
import { LiveRefresh } from "@/Components/LiveRefresh";

export function AuditLogComponent({
    logs,
    users,
    actions,
    modelTypes,
    filters,
    stats = {},
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

    // The ranges the office actually asks for, one click each. "All" clears
    // only the dates, leaving any other filter in force.
    const ymd = (d) => d.toISOString().slice(0, 10);
    const quickRange = (days) => {
        const next = { ...localFilters };
        if (days === null) {
            delete next.date_from;
            delete next.date_to;
        } else {
            const to = new Date();
            const from = new Date();
            from.setDate(to.getDate() - days);
            next.date_from = ymd(from);
            next.date_to = ymd(to);
        }
        setLocalFilters(next);
        router.get(route(auditLogsRoute), next, { preserveState: true, preserveScroll: true });
    };
    const activeRange = (() => {
        if (!localFilters.date_from && !localFilters.date_to) return null;
        const to = new Date();
        for (const days of [0, 7, 30]) {
            const from = new Date();
            from.setDate(to.getDate() - days);
            if (localFilters.date_from === ymd(from) && localFilters.date_to === ymd(to)) return days;
        }
        return "custom";
    })();

    const tiles = [
        { label: "Today", value: stats.today ?? 0, icon: Zap, tone: "text-[#0d1f5c] bg-[#0d1f5c]/5" },
        { label: "Last 7 days", value: stats.week ?? 0, icon: CalendarDays, tone: "text-[#d4a017] bg-[#d4a017]/10" },
        { label: "Active users (7 days)", value: stats.active_users ?? 0, icon: Users, tone: "text-emerald-700 bg-emerald-50" },
        {
            label: (stats.lockouts ?? 0) > 0
                ? `Failed logins · ${stats.lockouts} lockout${stats.lockouts === 1 ? "" : "s"}`
                : "Failed logins (7 days)",
            value: stats.failed_logins ?? 0,
            icon: ShieldAlert,
            tone: (stats.failed_logins ?? 0) > 0 ? "text-rose-700 bg-rose-50" : "text-gray-500 bg-gray-50",
        },
    ];

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
            {/* How busy the system is, and whether anyone has been at the door. */}
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {tiles.map((tile) => (
                    <div key={tile.label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                        <div className={`rounded-lg p-2 ${tile.tone}`}>
                            <tile.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xl font-black leading-tight text-gray-900">{Number(tile.value).toLocaleString()}</p>
                            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-400">{tile.label}</p>
                        </div>
                    </div>
                ))}
            </div>

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
                                {logs.total
                                    ? `Showing ${logs.from ?? 1}–${logs.to ?? logs.data.length} of ${Number(logs.total).toLocaleString()} entries`
                                    : "No entries"}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* New entries arrive on their own: the list and the
                                tiles are re-fetched every few seconds, keeping the
                                filters and the page the reader is on. */}
                            <LiveRefresh only={["logs", "stats"]} items={logs} label="entries" interval={10000} className="mr-1" />
                            <div className="flex rounded-lg border border-gray-200 p-0.5 text-xs" role="group" aria-label="Date range">
                                {[["Today", 0], ["7 days", 7], ["30 days", 30], ["All", null]].map(([label, days]) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => quickRange(days)}
                                        className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                                            activeRange === days
                                                ? "bg-[#0d1f5c] text-white"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
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
