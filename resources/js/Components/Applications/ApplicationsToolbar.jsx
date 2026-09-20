import { WithTooltip } from "@/Components/ui/icon-button";
import React from "react";
import { getStatusFiltersForRole } from "@/lib/applicationStatus";
import { CLEARANCE_TYPE_FILTERS } from "@/lib/clearanceTypes";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Search, Download, X, ArrowUpDown, Archive } from "lucide-react";

export const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "waiting", label: "Waiting longest" },
    { value: "applicant", label: "Applicant A–Z" },
];

const selectClass =
    "h-10 w-full min-w-0 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-700 focus:border-[#0d1f5c] focus:outline-none focus:ring-2 focus:ring-[#0d1f5c]/30 sm:w-auto lg:max-w-[200px] lg:shrink-0";

/**
 * Search, filters, sort and export for All Applications. Filters that are set
 * show a "Clear" so an officer can get back to the whole list in one click.
 */
export function ApplicationsToolbar({
    search, onSearch,
    status, onStatus,
    type, onType,
    sort, onSort,
    shown, total,
    onExport, onClear,
    role = "admin",
    archivedCount = 0,
}) {
    const filtered = search || (status !== "all" && status !== "archived") || type !== "all";
    const STATUS_FILTERS = getStatusFiltersForRole(role);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:flex-nowrap">
                <div className="relative w-full sm:w-64 lg:w-auto lg:min-w-[180px] lg:flex-1 lg:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search number, applicant, project, barangay…"
                        aria-label="Search applications"
                        className="h-10 w-full rounded-lg border-gray-200 bg-white pl-9 pr-8 text-sm focus:border-[#0d1f5c]"
                    />
                    {search && (
                        <button type="button" onClick={() => onSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:contents">
                    {/* Both selects keep to a fixed width so the row holds on one line. */}
                    <select value={status} onChange={(e) => onStatus(e.target.value)} aria-label="Filter by status" className={selectClass}>
                        {STATUS_FILTERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        <option value="archived">Archived{archivedCount ? ` (${archivedCount})` : ""}</option>
                    </select>
                    <select value={type} onChange={(e) => onType(e.target.value)} aria-label="Filter by application type" className={selectClass}>
                        {CLEARANCE_TYPE_FILTERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                    <label className="relative flex-1 sm:flex-none">
                        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                        <select value={sort} onChange={(e) => onSort(e.target.value)} aria-label="Sort" className={`${selectClass} pl-8`}>
                            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </label>
                    <WithTooltip
                        label="Export to Excel"
                        hint="Downloads the applications matching the filters above, not just this page"
                    >
                        <Button type="button" variant="outline" onClick={onExport} className="h-10 shrink-0 gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Export Excel</span>
                            <span className="sm:hidden">Excel</span>
                        </Button>
                    </WithTooltip>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                        Showing <span className="font-semibold text-gray-800">{shown}</span> of {total} application{total === 1 ? "" : "s"}
                    </span>
                    {/* The archive is also the last entry of the status list; a
                        link here so it is not only found by scrolling a dropdown. */}
                    {status === "archived" ? (
                        <button type="button" onClick={() => onStatus("all")} className="inline-flex items-center gap-1 font-semibold text-[#0d1f5c] hover:underline">
                            <Archive className="h-3 w-3" /> Back to the live board
                        </button>
                    ) : (
                        <button type="button" onClick={() => onStatus("archived")} className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-[#0d1f5c] hover:underline">
                            <Archive className="h-3 w-3" /> View archive{archivedCount ? ` (${archivedCount})` : ""}
                        </button>
                    )}
                </span>
                {filtered && (
                    <button type="button" onClick={onClear} className="inline-flex items-center gap-1 font-semibold text-[#0d1f5c] hover:underline">
                        <X className="h-3 w-3" /> Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
