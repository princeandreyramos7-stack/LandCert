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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/Components/ui/dropdown-menu";
import {
    Search,
    FileText,
    CheckCircle,
    Eye,
    Download,
    RefreshCw,
    Filter,
    MoreVertical,
    Upload,
    Printer,
    Send,
    Undo2,
} from "lucide-react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";

export function CertificatesTable({
    certificates = {},
    filters = {},
    routePrefix = 'admin',
    onMarkReady,
    onRecordRelease,
    onDownload,
    onPreview,
    onUploadCertificate,
    className = "",
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [statusFilter, setStatusFilter] = useState(filters.status || "all");
    // { certificate, released } — releasing notifies the applicant by SMS and
    // withdrawing takes a document back they may already have been told about,
    // so both are confirmed rather than fired straight off the menu item.
    const [pendingRelease, setPendingRelease] = useState(null);

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
                            <SelectItem value="released">Released</SelectItem>
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
                                    Application Number
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">
                                    Applicant
                                </th>
                                <th className="text-left px-4 py-3 font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">
                                    Locational Clearance
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
                                        colSpan="7"
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
                                            <div className="font-mono text-sm font-semibold text-[#0d1f5c]">
                                                {certificate.request?.application_number || `#${certificate.request_id}`}
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
                                            {certificate.request?.released_to_applicant_at ? (
                                                <div
                                                    title={`Released by ${certificate.request?.releaser?.name || "staff"} on ${formatDate(certificate.request.released_to_applicant_at)}`}
                                                >
                                                    <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-100">
                                                        Released
                                                    </Badge>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        by {certificate.request?.releaser?.name || "staff"}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {formatDate(certificate.request.released_to_applicant_at)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100">
                                                    Preparing
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    {/* The controller only generates for an approved application or a later
                                                        certificate-lifecycle stage; denied / pre-approval requests are blocked
                                                        server-side and would silently redirect back, so don't offer the action. */}
                                                    {["approved", "certificate_preparing", "certificate_ready", "released"]
                                                        .includes(String(certificate.request?.status || "").toLowerCase())
                                                        ? (certificate.has_verified_payment ? (
                                                        <>
                                                        {/* Until the office releases it, the applicant cannot print anything. */}
                                                        {certificate.request?.released_to_applicant_at ? (
                                                            <DropdownMenuItem
                                                                onClick={() => setPendingRelease({ certificate, released: false })}
                                                                className="text-amber-700 font-medium"
                                                            >
                                                                <Undo2 className="h-4 w-4 mr-2" />
                                                                Withdraw from Applicant
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() => setPendingRelease({ certificate, released: true })}
                                                                className="text-emerald-700 font-medium"
                                                            >
                                                                <Send className="h-4 w-4 mr-2" />
                                                                Release to Applicant
                                                            </DropdownMenuItem>
                                                        )}
                                                        {String(
                                                            certificate.request?.project?.project_type
                                                            || certificate.request?.project_type
                                                            || ''
                                                        ).toUpperCase() === 'ZC' ? (
                                                            <DropdownMenuItem
                                                                onClick={() => router.visit(route(`${routePrefix}.generate-certificate`, certificate.request_id))}
                                                                className="text-green-600 font-medium"
                                                            >
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Generate Certificate
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() => router.visit(route(`${routePrefix}.generate-clearance`, certificate.request_id))}
                                                                className="text-blue-600 font-medium"
                                                            >
                                                                <Printer className="h-4 w-4 mr-2" />
                                                                Generate Clearance
                                                            </DropdownMenuItem>
                                                        )}
                                                        </>
                                                    ) : (
                                                        <div className="px-3 py-2 text-sm text-slate-500 text-center">
                                                            <p className="font-medium">Payment Required</p>
                                                            <p className="text-xs mt-1">Awaiting treasury payment verification</p>
                                                        </div>
                                                    )) : (
                                                        <div className="px-3 py-2 text-sm text-slate-500 text-center">
                                                            <p className="font-medium">Not available</p>
                                                            <p className="text-xs mt-1">
                                                                Application is {(certificate.request?.status || "not approved").replace(/_/g, " ")}
                                                            </p>
                                                        </div>
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

            {/* Release / withdraw confirmation */}
            <Dialog open={!!pendingRelease} onOpenChange={(open) => !open && setPendingRelease(null)}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {pendingRelease?.released
                                ? "Release to applicant?"
                                : "Withdraw from applicant?"}
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div className="space-y-2 pt-1 text-sm text-slate-600">
                                <p>
                                    Application{" "}
                                    <span className="font-semibold text-slate-800">
                                        {pendingRelease?.certificate?.request?.application_number
                                            || `#${pendingRelease?.certificate?.request_id ?? ""}`}
                                    </span>
                                    {pendingRelease?.certificate?.request?.applicant?.applicant_name && (
                                        <> — {pendingRelease.certificate.request.applicant.applicant_name}</>
                                    )}
                                </p>
                                <p>
                                    {pendingRelease?.released
                                        ? "The applicant will be able to print their document, and will be notified by SMS and in the app."
                                        : "The applicant will no longer be able to print their document. They are not notified of the withdrawal."}
                                </p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setPendingRelease(null)}>
                            Cancel
                        </Button>
                        <Button
                            className={pendingRelease?.released
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-amber-600 hover:bg-amber-700"}
                            onClick={() => {
                                const { certificate, released } = pendingRelease;
                                setPendingRelease(null);
                                router.post(
                                    route(`${routePrefix}.release-to-applicant`, certificate.request_id),
                                    { released },
                                    { preserveScroll: true }
                                );
                            }}
                        >
                            {pendingRelease?.released ? "Release" : "Withdraw"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
