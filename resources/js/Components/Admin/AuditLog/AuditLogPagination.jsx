import React from "react";
import { TablePagination } from "@/Components/ui/table-pagination";

/**
 * Paging for the audit log, using the same pager as the applications, users and
 * reports tables so the screens behave alike.
 *
 * The difference is where the paging happens: those lists hold every row and
 * slice them in the browser, while the log is paginated by the server. So this
 * takes the page number TablePagination hands back and turns it into the URL
 * the server expects, instead of slicing anything itself.
 */
export function AuditLogPagination({ logs, onPageChange }) {
    if (!logs?.total) return null;

    const pageUrl = (page) => {
        // path() has no query string of its own; the caller re-applies the
        // active filters when it makes the request.
        const base = logs.path || window.location.pathname;
        return `${base}?page=${page}`;
    };

    return (
        <TablePagination
            currentPage={logs.current_page ?? 1}
            totalItems={logs.total ?? 0}
            perPage={logs.per_page ?? 15}
            onPageChange={(page) => onPageChange(pageUrl(page))}
            label="log entries"
        />
    );
}
