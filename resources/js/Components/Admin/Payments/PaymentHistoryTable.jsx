import React, { useState, useMemo } from "react";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Search,
    Eye,
    Calendar,
    Filter,
    Download,
    RefreshCw,
    FileText,
} from "lucide-react";
import { getStatusColor, getStatusIcon, formatDate, formatCurrency } from "./utils";
import { router } from "@inertiajs/react";

export function PaymentHistoryTable({
    payments = [],
    onViewDetails,
    className = "",
}) {
    // State for filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    // Filter payments
    const filteredPayments = useMemo(() => {
        // Handle both array and paginated object
        const paymentsArray = Array.isArray(payments) ? payments : (payments?.data || []);
        let filtered = [...paymentsArray];

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((p) => p.payment_status === statusFilter);
        }

        // Filter by payment method
        if (paymentMethodFilter !== "all") {
            filtered = filtered.filter(
                (p) => p.payment_method === paymentMethodFilter
            );
        }

        // Filter by date range
        if (dateFrom) {
            filtered = filtered.filter(
                (p) => new Date(p.payment_date) >= new Date(dateFrom)
            );
        }
        if (dateTo) {
            filtered = filtered.filter(
                (p) => new Date(p.payment_date) <= new Date(dateTo)
            );
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
        statusFilter,
        paymentMethodFilter,
        dateFrom,
        dateTo,
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
    }, [statusFilter, paymentMethodFilter, dateFrom, dateTo, searchTerm]);

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setPaymentMethodFilter("all");
        setDateFrom("");
        setDateTo("");
        setCurrentPage(1);
    };

    // Export Excel (CSV)
    const handleExportExcel = () => {
        const params = new URLSearchParams();
        params.set('format', 'excel');
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (paymentMethodFilter !== 'all') params.set('payment_method', paymentMethodFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (searchTerm) params.set('search', searchTerm);
        window.open(route('admin.export.payments') + '?' + params.toString(), '_blank');
    };

    // Export PDF
    const handleExportPdf = () => {
        const params = new URLSearchParams();
        params.set('format', 'pdf');
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (paymentMethodFilter !== 'all') params.set('payment_method', paymentMethodFilter);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (searchTerm) params.set('search', searchTerm);
        window.open(route('admin.export.payments') + '?' + params.toString(), '_blank');
    };

    // Get unique payment methods
    const uniquePaymentMethods = useMemo(() => {
        // Handle both array and paginated object
        const paymentsArray = Array.isArray(payments) ? payments : (payments?.data || []);
        const methods = [
            ...new Set(paymentsArray.map((p) => p.payment_method).filter(Boolean)),
        ];
        return methods;
    }, [payments]);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Filter Controls */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 space-y-4">
                {/* Search and Quick Filters Row */}
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600" />
                        </div>
                        <Input
                            placeholder="Search by OR Number, Request ID, or Applicant Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full lg:w-48 h-10 border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Payment Method Filter */}
                    <Select
                        value={paymentMethodFilter}
                        onValueChange={setPaymentMethodFilter}
                    >
                        <SelectTrigger className="w-full lg:w-48 h-10 border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300">
                            <SelectValue placeholder="All Methods" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Methods</SelectItem>
                            {uniquePaymentMethods.map((method) => (
                                <SelectItem key={method} value={method}>
                                    {method
                                        ?.replace(/_/g, " ")
                                        .split(" ")
                                        .map(
                                            (w) =>
                                                w.charAt(0).toUpperCase() +
                                                w.slice(1)
                                        )
                                        .join(" ")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Range Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            From Date
                        </label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="h-10 border-slate-200 bg-slate-50/50 focus:bg-white"
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            To Date
                        </label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="h-10 border-slate-200 bg-slate-50/50 focus:bg-white"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
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
                            className="h-10 px-4 border-slate-200 hover:bg-slate-50 text-green-700 border-green-200 hover:bg-green-50"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Excel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportPdf}
                            className="h-10 px-4 border-slate-200 hover:bg-slate-50 text-red-700 border-red-200 hover:bg-red-50"
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
                    {(searchTerm ||
                        statusFilter !== "all" ||
                        paymentMethodFilter !== "all" ||
                        dateFrom ||
                        dateTo) && (
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
                                    Request ID
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
                                    Status
                                </th>
                                <th className="text-left p-3 font-semibold text-slate-700 text-sm">
                                    Certificate
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
                                        colSpan="9"
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
                                            <div className="font-mono text-sm text-slate-700">
                                                #{payment.request_id}
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
                                            <Badge
                                                className={getStatusColor(
                                                    payment.payment_status
                                                )}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {(() => {
                                                        const { Icon, className } = getStatusIcon(payment.payment_status);
                                                        return <Icon className={className}/>;
                                                    })()}
                                                    {payment.payment_status
                                                        ?.charAt(0)
                                                        .toUpperCase() +
                                                        payment.payment_status?.slice(
                                                            1
                                                        )}
                                                </span>
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            {payment.certificate ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-xs font-mono text-blue-600 font-semibold">
                                                        {payment.certificate.certificate_number}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(route('admin.certificates.download', payment.certificate.id), '_blank');
                                                        }}
                                                        className="h-7 px-2 text-xs text-green-600 hover:bg-green-50 hover:text-green-700"
                                                    >
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        Download PDF
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">
                                                    No certificate
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onViewDetails?.(payment);
                                                }}
                                                className="h-8 px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
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
        </div>
    );
}
