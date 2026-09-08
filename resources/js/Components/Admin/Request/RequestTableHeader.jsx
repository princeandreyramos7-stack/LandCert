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
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4">
                    {/* One column: the title had to share a row with four
                       controls and was being squeezed to "All Applications (…".
                       It now gets its own line and the controls get theirs. */}
                    <div className="flex min-w-0 items-center gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-[#0d1f5c]" />
                        <h2 className="truncate text-base font-semibold text-[#0d1f5c] sm:text-lg">
                            All Applications ({filteredCount})
                        </h2>
                    </div>

                    {/* On a phone the controls stack instead of wrapping.
                       Wrapping gave each of them whatever width was left over,
                       so the search box ended up a few characters wide and the
                       status filter showed "Application Appro…". */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search applications..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-[#0d1f5c]"
                            />
                        </div>

                        {/* The two dropdowns share one row on a phone. From sm
                           up `contents` drops this wrapper out of the layout so
                           they sit directly in the flex row as before. */}
                        <div className="grid grid-cols-2 gap-3 sm:contents">
                            <select
                                value={filterStatus}
                                onChange={(e) => onFilterChange(e.target.value)}
                                aria-label="Filter by status"
                                className="w-full min-w-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-[#0d1f5c] focus:outline-none focus:ring-2 focus:ring-[#0d1f5c] sm:w-auto sm:min-w-[180px]"
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
                                className="w-full min-w-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-[#0d1f5c] focus:outline-none focus:ring-2 focus:ring-[#0d1f5c] sm:w-auto sm:min-w-[170px]"
                            >
                                {CLEARANCE_TYPE_FILTERS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            variant="outline"
                            onClick={onExport}
                            // The button has a row to itself on a phone, so it
                            // can keep its label there instead of collapsing to
                            // a bare icon nobody could identify.
                            title="Export Excel"
                            className="w-full shrink-0 justify-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 sm:w-auto sm:px-4"
                        >
                            <Download className="h-4 w-4 shrink-0" />
                            <span>Export Excel</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
