import React, { useState, useMemo } from "react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/Components/ui/dropdown-menu";
import {
    Search,
    Eye,
    Calendar,
    Filter,
    Download,
    RefreshCw,
    FileText,
    Upload,
    Image,
    MoreVertical,
    ThumbsUp,
    ThumbsDown,
    Receipt,
} from "lucide-react";
import {
    formatDate,
    formatCurrency,
    PaymentStatusBadge,
    PAYMENT_STATUS,
} from "./utils.jsx";
import { router } from "@inertiajs/react";
import { VerifyPaymentDialog } from "./VerifyPaymentDialog";

/**
 * What can be done with one payment. Shared by the table row and the card
 * shown in its place on a phone, so the two can never drift apart.
 */
function PaymentRowActions({
    payment,
    routePrefix,
    canVerify,
    onViewDetails,
    onAddReceipt,
    onVerify,
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                side="bottom"
                sideOffset={5}
                className="w-48"
                style={{
                    transform: 'translateX(-20px)'
                }}
            >
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails?.(payment);
                    }}
                    className="cursor-pointer"
                >
                    <Eye className="h-4 w-4 mr-2 text-blue-600" />
                    <span>View Details</span>
                </DropdownMenuItem>

                {/* The Order of Payment is the slip the applicant
                            pays against, so it is reachable from the payment
                            it belongs to. */}
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                            route(
                                `${routePrefix}.generate-order-of-payment`,
                                payment.request_id,
                            ),
                            "_blank",
                        );
                    }}
                    className="cursor-pointer"
                >
                    <Receipt className="h-4 w-4 mr-2 text-[#d4a017]" />
                    <span>Order of Payment</span>
                </DropdownMenuItem>

                {canVerify && payment.payment_status === "pending" && (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onVerify(payment);
                        }}
                        className="cursor-pointer text-emerald-600"
                    >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        <span>Verify Payment</span>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {payment.receipt_file_path ? (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                                `/payments/${payment.id}/receipt`,
                                "_blank",
                            );
                        }}
                        className="cursor-pointer"
                    >
                        <FileText className="h-4 w-4 mr-2 text-emerald-600" />
                        <span>View Receipt</span>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddReceipt?.(payment);
                        }}
                        className="cursor-pointer"
                    >
                        <Upload className="h-4 w-4 mr-2 text-amber-600" />
                        <span>Add Receipt</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function PaymentHistoryTable({
    payments = [],
    onViewDetails,
    onAddReceipt,
    routePrefix = "admin",
    // Verifying a payment is the Zoning Officer's counter duty. The Zoning
    // Administrator opens this same table for oversight, with verify withheld.
    canVerify = true,
    className = "",
    // Status filter: "all" | "pending" | "verified" | "rejected". The page's
    // stat cards drive it when they pass these; otherwise it is the table's own.
    statusFilter: statusFilterProp,
    onStatusFilterChange,
}) {
    const [verifyingPayment, setVerifyingPayment] = useState(null);
    // State for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [ownStatusFilter, setOwnStatusFilter] = useState("all");
    const statusFilter = statusFilterProp ?? ownStatusFilter;
    const setStatusFilter = (value) => {
        setOwnStatusFilter(value);
        onStatusFilterChange?.(value);
    };
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const paymentsArray = Array.isArray(payments)
        ? payments
        : payments?.data || [];
    const countByStatus = useMemo(
        () => ({
            all: paymentsArray.length,
            pending: paymentsArray.filter((p) => p.payment_status === "pending")
                .length,
            verified: paymentsArray.filter(
                (p) => p.payment_status === "verified",
            ).length,
            rejected: paymentsArray.filter(
                (p) => p.payment_status === "rejected",
            ).length,
        }),
        [paymentsArray],
    );

    // Filter payments
    const filteredPayments = useMemo(() => {
        let filtered = [...paymentsArray];

        if (statusFilter !== "all") {
            filtered = filtered.filter(
                (p) => p.payment_status === statusFilter,
            );
        }

        // Filter by specific date (exact match)
        if (filterDate) {
            filtered = filtered.filter((p) => {
                const paymentDate = new Date(p.payment_date)
                    .toISOString()
                    .split("T")[0];
                return paymentDate === filterDate;
            });
        }

        // Filter by search term (OR Number, Request ID, Applicant Name)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.receipt_number?.toLowerCase().includes(searchLower) ||
                    p.application_number?.toLowerCase().includes(searchLower) ||
                    p.request_id?.toString().includes(searchLower) ||
                    p.applicant_name?.toLowerCase().includes(searchLower),
            );
        }

        return filtered;
    }, [paymentsArray, statusFilter, filterDate, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [filterDate, searchTerm, statusFilter]);

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterDate("");
        setStatusFilter("all");
        setCurrentPage(1);
    };

    // Export Excel (CSV)
    const handleExportExcel = () => {
        const params = new URLSearchParams();
        params.set("format", "excel");
        if (filterDate) params.set("date", filterDate);
        if (searchTerm) params.set("search", searchTerm);
        window.open(
            route("admin.export.payments") + "?" + params.toString(),
            "_blank",
        );
    };

    // Export PDF
    const handleExportPdf = () => {
        const params = new URLSearchParams();
        params.set("format", "pdf");
        if (filterDate) params.set("date", filterDate);
        if (searchTerm) params.set("search", searchTerm);
        window.open(
            route("admin.export.payments") + "?" + params.toString(),
            "_blank",
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Filter Controls */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 space-y-4">
                {/* Filters — Payment Date + Search on the left, actions on the right */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
                        {/* Payment Date */}
                        <div className="space-y-1 sm:w-52 shrink-0">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Payment Date
                            </label>
                            <Input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="h-10 border-slate-200 bg-slate-50/50 focus:bg-white"
                            />
                        </div>

                        {/* Search */}
                        <div className="space-y-1 flex-1 min-w-0">
                            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                                <Search className="h-3 w-3" />
                                Search
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300">
                                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600" />
                                </div>
                                <Input
                                    placeholder="Search by OR number, application number or applicant..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons — right side. Below sm the two exports drop
                        their labels and sit as icons so all three fit one row. */}
                    <div className="flex shrink-0 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="h-10 shrink-0 border-slate-200 px-3 hover:bg-slate-50 sm:px-4"
                        >
                            <RefreshCw className="h-4 w-4 shrink-0 sm:mr-2" />
                            <span className="hidden sm:inline">Clear</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportExcel}
                            title="Export Excel"
                            aria-label="Export Excel"
                            className="h-10 shrink-0 border-green-200 px-3 text-green-700 hover:bg-green-50 sm:px-4"
                        >
                            <Download className="h-4 w-4 shrink-0 sm:mr-2" />
                            <span className="hidden sm:inline">
                                Export Excel
                            </span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPdf}
                            title="Export PDF"
                            aria-label="Export PDF"
                            className="h-10 shrink-0 border-red-200 px-3 text-red-700 hover:bg-red-50 sm:px-4"
                        >
                            <FileText className="h-4 w-4 shrink-0 sm:mr-2" />
                            <span className="hidden sm:inline">Export PDF</span>
                        </Button>
                    </div>
                </div>

                {/* Status */}
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { key: "all", label: "All" },
                        { key: "pending", label: PAYMENT_STATUS.pending.label },
                        {
                            key: "verified",
                            label: PAYMENT_STATUS.verified.label,
                        },
                        {
                            key: "rejected",
                            label: PAYMENT_STATUS.rejected.label,
                        },
                    ].map((option) => {
                        const active = statusFilter === option.key;
                        return (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setStatusFilter(option.key)}
                                aria-pressed={active}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                                    active
                                        ? "border-[#0d1f5c] bg-[#0d1f5c] text-white"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                }`}
                            >
                                {option.label}
                                <span
                                    className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}
                                >
                                    {countByStatus[option.key]}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                        Showing{" "}
                        <span className="font-semibold text-slate-800">
                            {startIndex + 1}-
                            {Math.min(endIndex, filteredPayments.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-800">
                            {filteredPayments.length}
                        </span>{" "}
                        payments
                    </p>
                    {(searchTerm || filterDate || statusFilter !== "all") && (
                        <Badge variant="outline" className="text-xs">
                            <Filter className="h-3 w-3 mr-1" />
                            Filters Active
                        </Badge>
                    )}
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                {/* From a tablet up: the full table. Below that it is
                    unreadable - seven columns on a 390px screen cut the date,
                    who verified it and the actions off the right-hand edge -
                    so the same rows are drawn as cards instead. */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    OR Number
                                </th>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    Application Number
                                </th>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    Applicant
                                </th>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    Amount
                                </th>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    Status
                                </th>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    Date
                                </th>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    Verified By
                                </th>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPayments.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="p-12 text-center text-slate-500"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="h-12 w-12 text-slate-300 mb-3" />
                                            <p className="text-lg font-semibold text-slate-700">
                                                No payments found
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Try adjusting your filters or
                                                search terms
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPayments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                                    >
                                        <td className="p-3">
                                            <div className="font-mono text-sm font-semibold text-blue-600">
                                                {payment.receipt_number ||
                                                    "N/A"}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-mono text-sm font-semibold text-[#0d1f5c]">
                                                {payment.application_number ||
                                                    `#${payment.request_id}`}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium text-slate-800">
                                                {payment.applicant_name ||
                                                    "Unknown"}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-semibold text-slate-800">
                                                {formatCurrency(payment.amount)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <PaymentStatusBadge
                                                status={payment.payment_status}
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm text-slate-600">
                                                {formatDate(
                                                    payment.payment_date,
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm text-slate-700">
                                                {payment.payment_status ===
                                                    "verified" &&
                                                payment.verified_by_name &&
                                                payment.verified_by_name !==
                                                    "N/A"
                                                    ? payment.verified_by_name
                                                    : "—"}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <PaymentRowActions
                                                payment={payment}
                                                routePrefix={routePrefix}
                                                canVerify={canVerify}
                                                onViewDetails={onViewDetails}
                                                onAddReceipt={onAddReceipt}
                                                onVerify={setVerifyingPayment}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phones */}
                <ul className="divide-y divide-slate-100 md:hidden">
                    {paginatedPayments.length === 0 ? (
                        <li className="flex flex-col items-center justify-center px-6 py-12 text-center">
                            <Search className="mb-3 h-10 w-10 text-slate-300" />
                            <p className="font-semibold text-slate-700">
                                No payments found
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Try adjusting your filters or search terms
                            </p>
                        </li>
                    ) : (
                        paginatedPayments.map((payment) => (
                            <li key={payment.id} className="px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-mono text-sm font-semibold text-blue-600">
                                            {payment.receipt_number ||
                                                "No OR number"}
                                        </p>
                                        <p className="truncate text-sm font-medium text-slate-800">
                                            {payment.applicant_name ||
                                                "Unknown"}
                                        </p>
                                        <p className="truncate font-mono text-xs text-slate-500">
                                            {payment.application_number ||
                                                `#${payment.request_id}`}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-start gap-1">
                                        <span className="whitespace-nowrap font-semibold text-slate-800">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                        <PaymentRowActions
                                            payment={payment}
                                            routePrefix={routePrefix}
                                            canVerify={canVerify}
                                            onViewDetails={onViewDetails}
                                            onAddReceipt={onAddReceipt}
                                            onVerify={setVerifyingPayment}
                                        />
                                    </div>
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                    <PaymentStatusBadge
                                        status={payment.payment_status}
                                    />
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(payment.payment_date)}
                                    </span>
                                    {payment.payment_status === "verified" &&
                                        payment.verified_by_name &&
                                        payment.verified_by_name !== "N/A" && (
                                            <span>
                                                Verified by{" "}
                                                {payment.verified_by_name}
                                            </span>
                                        )}
                                </div>
                            </li>
                        ))
                    )}
                </ul>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                        <div className="text-sm text-slate-600">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(1, prev - 1),
                                    )
                                }
                                disabled={currentPage === 1}
                                className="h-8"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(totalPages, prev + 1),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="h-8"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Verify / Deny Payment Dialog */}
            {canVerify && (
                <VerifyPaymentDialog
                    isOpen={!!verifyingPayment}
                    onClose={() => setVerifyingPayment(null)}
                    payment={verifyingPayment}
                    routePrefix={routePrefix}
                />
            )}
        </div>
    );
}
