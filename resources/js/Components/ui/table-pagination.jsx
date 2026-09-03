import React from "react";
import { Button } from "@/Components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pager for a client-side table.
 *
 * Renders nothing when everything already fits on one page, so a short list is
 * not cluttered with dead controls.
 *
 * @param {number} currentPage  1-based page currently shown.
 * @param {number} totalItems   Rows after filtering, not the unfiltered total.
 * @param {number} perPage      Rows per page.
 * @param {function} onPageChange Called with the new 1-based page.
 * @param {string} label        Plural noun for the count line ("users", "entries").
 */
export function TablePagination({
    currentPage,
    totalItems,
    perPage,
    onPageChange,
    label = "items",
}) {
    const totalPages = Math.ceil(totalItems / perPage);
    if (totalPages <= 1) return null;

    const firstShown = (currentPage - 1) * perPage + 1;
    const lastShown = Math.min(currentPage * perPage, totalItems);

    return (
        <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                    {firstShown}-{lastShown}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
                {label}
            </p>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                </Button>

                <span className="whitespace-nowrap px-1 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
