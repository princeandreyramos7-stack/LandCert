import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { router } from "@inertiajs/react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequestStats } from "@/Components/Admin/Request/RequestStats";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical,
    CheckCircle,
    XCircle,
    FileText,
    FileCheck,
    Download,
    Eye,
    Clock,
    Search,
} from "lucide-react";
import { getStatusColor, getStatusIcon, getStatusLabel, formatDate, formatLocation } from "@/Components/Admin/Request/utils";
import { useLiveData, useNewItemCount } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/Components/LiveIndicator";

// Props refreshed by the live poller. Declared outside the component so the
// array identity is stable and the polling effect is not re-created each render.
const LIVE_PROPS = ["requests"];

export function SuperAdminRequestList({ requests }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const { toast } = useToast();

    const requestsData = requests?.data || requests || [];

    // Keep the list current without a manual browser refresh.
    const { lastUpdated, isRefreshing, refreshNow } = useLiveData({ only: LIVE_PROPS });
    const { newCount, acknowledge } = useNewItemCount(requestsData);

    const filteredRequests = useMemo(() => {
        let filtered = requestsData;

        if (filterStatus !== "all") {
            // "application_approved" groups every post-payment lifecycle status.
            const paidStatuses = ["payment_confirmed", "certificate_preparing", "certificate_ready", "released", "approved_with_payment"];
            filtered = filtered.filter((r) =>
                filterStatus === "application_approved"
                    ? paidStatuses.includes(r.status)
                    : r.status === filterStatus
            );
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (r) =>
                    r.applicant_name?.toLowerCase().includes(term) ||
                    r.user_email?.toLowerCase().includes(term) ||
                    r.project_type?.toLowerCase().includes(term) ||
                    r.application_number?.toLowerCase().includes(term) ||
                    r.id?.toString().includes(term)
            );
        }

        return filtered;
    }, [requestsData, filterStatus, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: requestsData.length,
            pending: requestsData.filter((r) => r.status === "pending" || r.status === "for_verification").length,
            approved: requestsData.filter((r) => r.status === "approved").length,
            rejected: requestsData.filter((r) => r.status === "rejected").length,
            reviewed: requestsData.filter((r) => r.status === "reviewed" || r.status === "for_payment" || r.status === "pending_payment").length,
        };
    }, [requestsData]);

    const handleExport = () => {
        const url = route("super-admin.export.requests", {
            status: filterStatus,
            format: "csv",
        });
        window.location.href = url;
        toast({
            title: "Export Started",
            description: "Your Excel file will download shortly.",
        });
    };

    return (
        <div className="space-y-6 p-6">
            {/* Single unified card containing everything */}
            <Card className="bg-white shadow-lg border border-gray-100">
                <CardContent className="p-6">
                    {/* Live refresh status — the list updates itself, no reload
                        needed. It renders into the layout's top bar. */}
                    <LiveIndicator
                        isRefreshing={isRefreshing}
                        lastUpdated={lastUpdated}
                        newCount={newCount}
                        onAcknowledge={acknowledge}
                        onRefreshNow={refreshNow}
                        label="applications"
                        className="justify-end mb-3"
                    />

                    {/* Same four counts the admin page shows, and clickable
                       filters here too - this page used to hand-roll its own
                       static copy of them. */}
                    <div className="mb-6">
                        <RequestStats stats={stats} onFilterChange={setFilterStatus} />
                    </div>
                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Header with Title, Export, Filter, Search */}
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <FileText className="h-5 w-5 shrink-0 text-[#0d1f5c]" />
                            <h2 className="truncate text-base font-semibold text-[#0d1f5c] sm:text-lg">
                                All Applications ({filteredRequests.length})
                            </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                title="Export Excel"
                                aria-label="Export Excel"
                                className="shrink-0 gap-2 border-gray-200 px-2.5 text-gray-700 hover:bg-gray-50 sm:px-4"
                                onClick={handleExport}
                            >
                                <Download className="h-4 w-4 shrink-0" />
                                <span className="hidden sm:inline">Export Excel</span>
                            </Button>
                            
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="min-w-0 flex-1 cursor-pointer rounded-md border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:border-[#0d1f5c] focus:outline-none focus:ring-2 focus:ring-[#0d1f5c] sm:min-w-[220px] sm:flex-none"
                            >
                                <option value="all">All Status of Application</option>
                                <option value="pending">For Verification</option>
                                <option value="reviewed">For Payment</option>
                                <option value="approved">Approved — For Payment</option>
                                <option value="application_approved">Application Approved (paid)</option>
                                <option value="rejected">Application Denied</option>
                            </select>

                            <div className="relative min-w-0 flex-1 sm:flex-none">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-[#0d1f5c] sm:w-64"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Application No.</TableHead>
                                    <TableHead className="font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Applicant</TableHead>
                                    <TableHead className="font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Locational Clearance</TableHead>
                                    <TableHead className="font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Location</TableHead>
                                    <TableHead className="font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Date</TableHead>
                                    <TableHead className="font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Status of Application</TableHead>
                                    <TableHead className="text-right font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="7" className="text-center text-muted-foreground py-8">
                                            {searchTerm || filterStatus !== "all"
                                                ? "No requests match your filters"
                                                : "No requests found"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <TableRow
                                            key={request.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <TableCell className="font-mono font-bold text-[#0d1f5c] text-sm">
                                                {request.application_number || `#${request.id}`}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900">{request.applicant_name}</p>
                                                    {request.corporation_name && (
                                                        <p className="text-xs text-gray-500">{request.corporation_name}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-700">
                                                {request.project_type || <span className="text-slate-400 italic text-xs">Not specified</span>}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-700 max-w-xs truncate">
                                                {formatLocation(request) !== "Location not specified"
                                                    ? formatLocation(request)
                                                    : <span className="text-slate-400 italic text-xs">Not specified</span>
                                                }
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-700">{formatDate(request.created_at)}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(request.status)}>
                                                    <span className="flex items-center gap-1">
                                                        {getStatusIcon(request.status)}
                                                        {getStatusLabel(request.status)}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => router.visit(route('super-admin.requests.view-application', request.id))}
                                                            className="text-blue-600 font-medium"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View Application
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => router.visit(route('super-admin.requests.document-verification', request.id))}
                                                            className="text-purple-600 font-medium"
                                                        >
                                                            <FileCheck className="h-4 w-4 mr-2" />
                                                            Review &amp; Decide
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
