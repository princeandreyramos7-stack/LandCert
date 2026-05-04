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

export function RequestPagination({ paginationData, onPageChange }) {
    if (!paginationData?.links || paginationData.links.length <= 3) {
        return null;
    }

    return (
        <Pagination className="mt-6">
            <PaginationContent>
                {paginationData.links.map((link, index) => {
                    // Previous button
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

                    // Next button
                    if (index === paginationData.links.length - 1) {
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

                    // Ellipsis
                    if (link.label === "...") {
                        return (
                            <PaginationItem key={index}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }

                    // Page numbers
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
