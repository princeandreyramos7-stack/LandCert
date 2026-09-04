import React from "react";
import { STATUS_FILTERS } from "@/lib/applicationStatus";
import { CLEARANCE_TYPE_FILTERS } from "@/lib/clearanceTypes";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { FileText, Download, Search } from "lucide-react";

export function RequestTableHeader({
    filteredCount,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    filterType = "all",
    onTypeChange,
    onClearFilter,
    onExport,
}) {
    return (
        <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
            <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Title with icon and count */}
                    <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-[#0d1f5c]" />
                        <h2 className="truncate text-base font-semibold text-[#0d1f5c] sm:text-lg">
                            All Applications ({filteredCount})
                        </h2>
                    </div>

                    {/* Right: Export, Filter, Search */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onExport}
                            // Below sm the label is dropped and the button
                            // collapses to its icon, so the filter and search
                            // keep the width they need.
                            title="Export Excel"
                            aria-label="Export Excel"
                            className="shrink-0 gap-2 border-gray-200 px-2.5 text-gray-700 hover:bg-gray-50 sm:px-4"
                        >
                            <Download className="h-4 w-4 shrink-0" />
                            <span className="hidden sm:inline">Export Excel</span>
                        </Button>

                        <select
                            value={filterStatus}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="min-w-0 flex-1 cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-[#0d1f5c] focus:outline-none focus:ring-2 focus:ring-[#0d1f5c] sm:min-w-[220px] sm:flex-none"
                        >
                            {STATUS_FILTERS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterType}
                            onChange={(e) => onTypeChange?.(e.target.value)}
                            aria-label="Filter by locational clearance type"
                            className="min-w-0 flex-1 cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-[#0d1f5c] focus:outline-none focus:ring-2 focus:ring-[#0d1f5c] sm:min-w-[200px] sm:flex-none"
                        >
                            {CLEARANCE_TYPE_FILTERS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <div className="relative min-w-0 flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-[#0d1f5c] sm:w-64"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
