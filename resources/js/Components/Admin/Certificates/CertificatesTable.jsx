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
    FileText,
    CheckCircle,
    Eye,
    Download,
    RefreshCw,
    Filter,
} from "lucide-react";
import { router } from "@inertiajs/react";

export function CertificatesTable({
    certificates = {},
    filters = {},
    routePrefix = 'admin',
    onMarkReady,
    onRecordRelease,
    onDownload,
    onPreview,
    className = "",
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");

    // Handle certificate data (paginated object)
    const certificatesData = certificates?.data || [];
    const pagination = {
        current_page: certificates?.current_page || 1,
        last_page: certificates?.last_page || 1,
        from: certificates?.from || 0,
        to: certificates?.to || 0,
        total: certificates?.total || 0,
    };

    // Apply filters
    const handleFilterChange = () => {
        router.get(
            route(`${routePrefix}.certificates.index`),
            {
                search: searchTerm,
                status: statusFilter,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    // Clear filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        router.get(route(`${routePrefix}.certificates.index`), {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        const styles = {
            preparing: "bg-amber-100 text-amber-800 border-amber-200",
            ready_for_pickup: "bg-green-100 text-green-800 border-green-200",
            released: "bg-blue-100 text-blue-800 border-blue-200",
            cancelled: "bg-red-100 text-red-800 border-red-200",
        };
        return styles[status] || "bg-slate-100 text-slate-800 border-slate-200";
    };

    // Navigate to page
    const goToPage = (page) => {
        router.get(
            route(`${routePrefix}.certificates.index`),
            {
                search: searchTerm,
                status: statusFilter,
                page: page,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Filter Controls */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 space-y-4">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 group">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600" />
                        </div>
                        <Input
                            placeholder="Search by certificate number or applicant name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleFilterChange();
                            }}
                            className="pl-10 h-10 border-slate-200 bg-slate-50/50 focus:bg-white"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={(value) => {
                        setStatusFilter(value);
                        router.get(route(`${routePrefix}.certificates.index`), {
                            search: searchTerm,
                            status: value,
                        }, {
                            preserveState: true,
                            replace: true,
                        });
                    }}>
                        <SelectTrigger className="w-full lg:w-48 h-10 border-slate-200 bg-slate-50/50 hover:bg-white">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                            <SelectItem value="released">Released</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleFilterChange}
                            className="h-10 px-4 border-slate-200 hover:bg-slate-50"
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleClearFilters}
                            className="h-10 px-4 border-slate-200 hover:bg-slate-50"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                        Showing{" "}
                        <span className="font-semibold text-slate-800">
                            {pagination.from}-{pagination.to}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-800">
                            {pagination.total}
                        </span>{" "}
                        certificates
                    </p>
                    {(searchTerm || statusFilter !== "all") && (
                        <Badge variant="outline" className="text-xs">
                            <Filter className="h-3 w-3 mr-1" />
                            Filters Active
                        </Badge>
                    )}
                </div>
            </div>

            {/* Certificates Table */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-gray-100">
                            <tr className="bg-gray-50">
                                <th className="text-left px-4 py-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">
                                    Certificate No.
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">
                                    Applicant
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">
                                    Project Type
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">
                                    Issued Date
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">
                                    Status
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificatesData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-4 py-12 text-center text-slate-500"
                                    >
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="h-12 w-12 text-slate-300 mb-3" />
                                            <p className="text-lg font-semibold text-slate-700">
                                                No certificates found
                                            </p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Try adjusting your filters or search terms
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                certificatesData.map((certificate) => (
                                    <tr
                                        key={certificate.id}
                                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                                    >
                                        <td className="p-3">
                                            <div className="font-mono text-sm font-semibold text-blue-600">
                                                {certificate.certificate_number}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-medium text-slate-800">
                                                {certificate.request?.applicant?.applicant_name || "Unknown"}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Request #{certificate.request_id}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm text-slate-700">
                                                {(certificate.request?.project?.project_type || certificate.request?.project_type)?.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "—"}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-sm text-slate-600">
                                                {formatDate(certificate.issued_at)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <Badge className={getStatusBadge(certificate.status)}>
                                                {certificate.status?.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDownload(certificate)}
                                                    className="h-8 px-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                    title="Download PDF"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onPreview(certificate)}
                                                    className="h-8 px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                    title="Preview"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {certificate.status === "preparing" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onMarkReady(certificate)}
                                                        className="h-8 px-2 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                                        title="Mark Ready"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {certificate.status === "ready_for_pickup" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onRecordRelease(certificate)}
                                                        className="h-8 px-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                                        title="Record Release"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                        <div className="text-sm text-slate-600">
                            Page {pagination.current_page} of {pagination.last_page}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="h-8"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
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
