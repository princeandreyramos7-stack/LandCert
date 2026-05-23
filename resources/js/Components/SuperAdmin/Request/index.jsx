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
    Eye,
    CheckCircle,
    XCircle,
    FileText,
} from "lucide-react";
import { getStatusColor, getStatusIcon, formatDate, formatLocation } from "@/Components/Admin/Request/utils";

export function SuperAdminRequestList({ requests }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const { toast } = useToast();

    const requestsData = requests?.data || requests || [];

    const filteredRequests = useMemo(() => {
        let filtered = requestsData;

        if (filterStatus !== "all") {
            filtered = filtered.filter((r) => r.status === filterStatus);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (r) =>
                    r.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.project_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.id?.toString().includes(searchTerm)
            );
        }

        return filtered;
    }, [requestsData, filterStatus, searchTerm]);

    const stats = useMemo(() => {
        return {
            total: requestsData.length,
            pending: requestsData.filter((r) => r.status === "pending").length,
            approved: requestsData.filter((r) => r.status === "approved").length,
            rejected: requestsData.filter((r) => r.status === "rejected").length,
            reviewed: requestsData.filter((r) => r.status === "reviewed").length,
        };
    }, [requestsData]);

    const handleApprove = (request) => {
        if (!request.report_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No report found for this request.",
            });
            return;
        }

        router.post(
            route("super-admin.approve-request", request.report_id),
            {
                description: "Application approved by Super Admin",
                issued_by: "Super Admin",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Request Approved!",
                        description: `Request #${request.id} has been approved.`,
                    });
                },
                onError: () => {
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
        if (!request.report_id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No report found for this request.",
            });
            return;
        }

        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        router.post(
            route("super-admin.reject-request", request.report_id),
            {
                description: reason,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title: "Request Rejected!",
                        description: `Request #${request.id} has been rejected.`,
                    });
                },
                onError: () => {
                    toast({
                        variant: "destructive",
                        title: "Rejection Failed!",
                        description: "Failed to reject the request.",
                    });
                },
            }
        );
    };

    return (
        <div
            className="space-y-6 min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6"
            style={{
                backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
                `,
            }}
        >
            {/* Enhanced Header with Pure Blue Background */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <FileText className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Request Management</h1>
                            <p className="text-blue-100">Approve or reject applications with full authority</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Statistics Cards with Animated Progress Bars */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="border-l-4 border-l-purple-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                                <p className="text-3xl font-bold text-purple-700">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-purple-500" />
                        </div>
                        <div className="mt-2 h-1 bg-purple-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
                            </div>
                            <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="mt-2 h-1 bg-yellow-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                                <p className="text-3xl font-bold text-blue-700">{stats.reviewed}</p>
                            </div>
                            <Eye className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                                <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="mt-2 h-1 bg-green-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.approved / stats.total) * 100 : 0}%` }}></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                                <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="mt-2 h-1 bg-red-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" style={{ width: `${stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter Section - Cleaner Design */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter & Search
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <Input
                                placeholder="Search by name, email, contact..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-gray-300 rounded-md px-4 py-2 pr-10 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer min-w-[200px]"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Requests Table */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-6">
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gradient-to-r from-purple-50 to-indigo-50">
                                    <TableHead>ID</TableHead>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Project Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan="8" className="text-center text-muted-foreground py-8">
                                            {searchTerm || filterStatus !== "all"
                                                ? "No requests match your filters"
                                                : "No requests found"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <TableRow
                                            key={request.id}
                                            className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300"
                                        >
                                            <TableCell className="font-mono font-bold">#{request.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900">{request.applicant_name}</p>
                                                    {request.corporation_name && (
                                                        <p className="text-xs text-gray-500">{request.corporation_name}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{request.user_name}</p>
                                                    <p className="text-xs text-gray-500">{request.user_email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-700">{request.project_type || "?"}</TableCell>
                                            <TableCell className="text-sm text-gray-700 max-w-xs truncate">{formatLocation(request)}</TableCell>
                                            <TableCell className="text-sm text-gray-700">{formatDate(request.created_at)}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(request.status)}>
                                                    <span className="flex items-center gap-1">
                                                        {getStatusIcon(request.status)}
                                                        {(request.status || "pending").charAt(0).toUpperCase() +
                                                            (request.status || "pending").slice(1)}
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
                                                            onClick={() => handleApprove(request)}
                                                            disabled={request.status === "approved"}
                                                            className="text-green-600"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleReject(request)}
                                                            disabled={request.status === "rejected"}
                                                            className="text-red-600"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Reject
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
