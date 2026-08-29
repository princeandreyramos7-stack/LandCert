import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { router } from "@inertiajs/react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { getStatusColor, getStatusIcon, getStatusLabel, formatDate, formatLocation } from "@/Components/Admin/Request/utils";
import { ApproveDialog } from "./ApproveDialog";
import { RejectDialog } from "./RejectDialog";

export function SuperAdminRequestList({ requests }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectionFeedback, setRejectionFeedback] = useState("");
    const { toast } = useToast();

    const requestsData = requests?.data || requests || [];

    const filteredRequests = useMemo(() => {
        let filtered = requestsData;

        if (filterStatus !== "all") {
            filtered = filtered.filter((r) => r.status === filterStatus);
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

    const handleApprove = (request) => {
        setSelectedRequest(request);
        setIsApproveDialogOpen(true);
    };

    const confirmApprove = () => {
        if (!selectedRequest) return;

        router.post(
            route("super-admin.quick-approve", selectedRequest.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsApproveDialogOpen(false);
                    setSelectedRequest(null);
                    toast({
                        title: "Request Approved!",
                        description: `Request #${selectedRequest.application_number || selectedRequest.id} from ${selectedRequest.applicant_name} has been approved successfully.`,
                    });
                },
                onError: () => {
                    setIsApproveDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Approval Failed!",
                        description: "Failed to approve the request.",
                    });
                },
            }
        );
    };

    const handleReject = (request) => {
        setSelectedRequest(request);
        setRejectionFeedback("");
        setIsRejectDialogOpen(true);
    };

    const confirmReject = () => {
        if (!selectedRequest) return;

        if (!rejectionFeedback.trim()) {
            toast({
                variant: "destructive",
                title: "Feedback Required",
                description: "Please provide a detailed rejection reason.",
            });
            return;
        }

        router.post(
            route("super-admin.quick-reject", selectedRequest.id),
            {
                description: rejectionFeedback.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsRejectDialogOpen(false);
                    setSelectedRequest(null);
                    setRejectionFeedback("");
                    toast({
                        title: "Request Rejected!",
                        description: `Request #${selectedRequest.application_number || selectedRequest.id} has been rejected.`,
                    });
                },
                onError: () => {
                    setIsRejectDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Rejection Failed!",
                        description: "Failed to reject the request.",
                    });
                },
            }
        );
    };

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
                    {/* Statistics Cards at the top */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-blue-600 uppercase mb-1">Total Requests</p>
                                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                                    <p className="text-xs text-blue-600 mt-1">All submissions</p>
                                </div>
                                <FileText className="h-8 w-8 text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-yellow-600 uppercase mb-1">For Verification</p>
                                    <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                                    <p className="text-xs text-yellow-600 mt-1">Awaiting document check</p>
                                </div>
                                <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-green-600 uppercase mb-1">Application Approved</p>
                                    <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
                                    <p className="text-xs text-green-600 mt-1">Successfully processed</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-red-600 uppercase mb-1">Application Rejected</p>
                                    <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
                                    <p className="text-xs text-red-600 mt-1">Needs attention</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-6"></div>

                    {/* Header with Title, Export, Filter, Search */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-[#0d1f5c]" />
                            <h2 className="text-lg font-semibold text-[#0d1f5c]">
                                All Applications ({filteredRequests.length})
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                                onClick={handleExport}
                            >
                                <Download className="h-4 w-4" />
                                Export Excel
                            </Button>
                            
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-200 rounded-md px-3 py-2 pr-8 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0d1f5c] focus:border-[#0d1f5c] cursor-pointer min-w-[220px]"
                            >
                                <option value="all">All Status of Application</option>
                                <option value="pending">For Verification</option>
                                <option value="reviewed">For Payment</option>
                                <option value="approved">Application Approved</option>
                                <option value="rejected">Application Rejected</option>
                            </select>

                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <Input
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-64 bg-white border-gray-200 focus:border-[#0d1f5c] text-sm"
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
                                    <TableHead className="font-bold text-[#0d1f5c] text-xs uppercase tracking-wide">Project Type</TableHead>
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
                                                            Document Verification
                                                        </DropdownMenuItem>
                                                     
                                                        <DropdownMenuItem
                                                            onClick={() => handleApprove(request)}
                                                            disabled={request.status === "approved"}
                                                            className="text-green-600"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Quick Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleReject(request)}
                                                            disabled={request.status === "rejected"}
                                                            className="text-red-600"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Quick Reject
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

            {/* Approval Dialog */}
            <ApproveDialog
                isOpen={isApproveDialogOpen}
                onClose={() => setIsApproveDialogOpen(false)}
                request={selectedRequest}
                onConfirm={confirmApprove}
            />

            {/* Rejection Dialog */}
            <RejectDialog
                isOpen={isRejectDialogOpen}
                onClose={() => setIsRejectDialogOpen(false)}
                request={selectedRequest}
                feedback={rejectionFeedback}
                onFeedbackChange={setRejectionFeedback}
                onConfirm={confirmReject}
            />
        </div>
    );
}
