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
} from "lucide-react";
import { formatDate, formatCurrency } from "./utils.jsx";
import { router } from "@inertiajs/react";
import { VerifyPaymentDialog } from "./VerifyPaymentDialog";

export function PaymentHistoryTable({
    payments = [],
    onViewDetails,
    onAddReceipt,
    routePrefix = "admin",
    className = "",
}) {
    const [verifyingPayment, setVerifyingPayment] = useState(null);
    // State for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    // Filter payments
    const filteredPayments = useMemo(() => {
        // Handle both array and paginated object
        const paymentsArray = Array.isArray(payments) ? payments : (payments?.data || []);
        let filtered = [...paymentsArray];

        // Filter by specific date (exact match)
        if (filterDate) {
            filtered = filtered.filter((p) => {
                const paymentDate = new Date(p.payment_date).toISOString().split('T')[0];
                return paymentDate === filterDate;
            });
        }

        // Filter by search term (OR Number, Request ID, Applicant Name)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.receipt_number?.toLowerCase().includes(searchLower) ||
                    p.request_id?.toString().includes(searchLower) ||
                    p.applicant_name?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [
        payments,
        filterDate,
        searchTerm,
    ]);

    // Pagination
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [filterDate, searchTerm]);

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setFilterDate("");
        setCurrentPage(1);
    };

    // Export Excel (CSV)
    const handleExportExcel = () => {
        const params = new URLSearchParams();
        params.set('format', 'excel');
        if (filterDate) params.set('date', filterDate);
        if (searchTerm) params.set('search', searchTerm);
        window.open(route('admin.export.payments') + '?' + params.toString(), '_blank');
    };

    // Export PDF
    const handleExportPdf = () => {
        const params = new URLSearchParams();
        params.set('format', 'pdf');
        if (filterDate) params.set('date', filterDate);
        if (searchTerm) params.set('search', searchTerm);
        window.open(route('admin.export.payments') + '?' + params.toString(), '_blank');
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
                                    placeholder="Search by OR Number, Request ID, or Applicant Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons — right side */}
                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="h-10 px-4 border-slate-200 hover:bg-slate-50"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportExcel}
                            className="h-10 px-4 text-green-700 border-green-200 hover:bg-green-50"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Excel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPdf}
                            className="h-10 px-4 text-red-700 border-red-200 hover:bg-red-50"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
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
                    {(searchTerm || filterDate) && (
                        <Badge variant="outline" className="text-xs">
                            <Filter className="h-3 w-3 mr-1" />
                            Filters Active
                        </Badge>
                    )}
                </div>
            </div>

            {/* Payment History Table */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
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
                                        colSpan="7"
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
                                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer"
                                        onClick={() => onViewDetails?.(payment)}
                                    >
                                        <td className="p-3">
                                            <div className="font-mono text-sm font-semibold text-blue-600">
                                                {payment.receipt_number ||
                                                    "N/A"}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-mono text-sm font-semibold text-[#0d1f5c]">
                                                {payment.application_number || `#${payment.request_id}`}
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
                                            <div className="text-sm text-slate-600">
                                                {formatDate(payment.payment_date)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm text-slate-700">
                                                {payment.verified_by_name ||
                                                    "—"}
                                            </div>
                                        </td>
                                        <td className="p-3">
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
                                                <DropdownMenuContent align="end" className="w-48">
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

                                                    {payment.payment_status === "pending" && (
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setVerifyingPayment(payment);
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
                                                                window.open(`/payments/${payment.id}/receipt`, '_blank');
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
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

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
                                    setCurrentPage((prev) => Math.max(1, prev - 1))
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
                                        Math.min(totalPages, prev + 1)
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
            <VerifyPaymentDialog
                isOpen={!!verifyingPayment}
                onClose={() => setVerifyingPayment(null)}
                payment={verifyingPayment}
                routePrefix={routePrefix}
            />
        </div>
    );
}
