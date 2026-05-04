import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination";

export function AuditLogPagination({ logs, onPageChange }) {
    if (!logs?.links || logs.links.length <= 3) return null;

    return (
        <Pagination className="mt-4">
            <PaginationContent>
                {logs.links.map((link, index) => {
                    if (index === 0) {
                        return (
                            <PaginationItem key={index}>
                                <PaginationPrevious
                                    onClick={() => onPageChange(link.url)}
                                    className={
                                        !link.url
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        );
                    }

                    if (index === logs.links.length - 1) {
                        return (
                            <PaginationItem key={index}>
                                <PaginationNext
                                    onClick={() => onPageChange(link.url)}
                                    className={
                                        !link.url
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer"
                                    }
                                />
                            </PaginationItem>
                        );
                    }

                    if (link.label === "...") {
                        return (
                            <PaginationItem key={index}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={index}>
                            <PaginationLink
                                onClick={() => onPageChange(link.url)}
                                isActive={link.active}
                                className="cursor-pointer"
                            >
                                {link.label}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </Pagination>
    );
}
