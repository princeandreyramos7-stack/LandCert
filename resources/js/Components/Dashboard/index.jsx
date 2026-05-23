import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Link } from "@inertiajs/react";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    TrendingUp,
    Calendar,
    ArrowRight,
    Activity,
} from "lucide-react";

export function Dashboard({ requests }) {
    const requestsData = requests?.data || requests || [];

    // Calculate statistics
    const stats = useMemo(() => {
        const total = requestsData.length;
        const pending = requestsData.filter(r => r.status?.toLowerCase() === 'pending').length;
        const approved = requestsData.filter(r => r.status?.toLowerCase() === 'approved').length;
        const rejected = requestsData.filter(r => r.status?.toLowerCase() === 'rejected').length;
        const underReview = requestsData.filter(r => r.status?.toLowerCase() === 'under review').length;

        return { total, pending, approved, rejected, underReview };
    }, [requestsData]);

    // Get recent applications (last 5)
    const recentApplications = useMemo(() => {
        return requestsData.slice(0, 5);
    }, [requestsData]);

    // Get status config
    const getStatusConfig = (status) => {
        const configs = {
            pending: { 
                icon: Clock, 
                label: "Pending",
                className: "bg-yellow-50 text-yellow-700 border-yellow-200"
            },
            approved: { 
                icon: CheckCircle, 
                label: "Approved",
                className: "bg-green-50 text-green-700 border-green-200"
            },
            rejected: { 
                icon: XCircle, 
                label: "Rejected",
                className: "bg-red-50 text-red-700 border-red-200"
            },
            "under review": { 
                icon: AlertCircle, 
                label: "Under Review",
                className: "bg-blue-50 text-blue-700 border-blue-200"
            },
        };
        return configs[status?.toLowerCase()] || configs.pending;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
                        <p className="text-blue-100">
                            Track and manage your applications in one place
                        </p>
                    </div>
                    <Activity className="h-16 w-16 opacity-20" />
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Total Applications */}
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Applications
                        </CardTitle>
                        <FileText className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            All submitted applications
                        </p>
                    </CardContent>
                </Card>

                {/* Pending Applications */}
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Pending Review
                        </CardTitle>
                        <Clock className="h-5 w-5 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Awaiting processing
                        </p>
                    </CardContent>
                </Card>

                {/* Approved Applications */}
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Approved
                        </CardTitle>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Successfully approved
                        </p>
                    </CardContent>
                </Card>

                {/* Under Review */}
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Under Review
                        </CardTitle>
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{stats.underReview}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Being evaluated
                        </p>
                    </CardContent>
                </Card>

                {/* Rejected */}
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Rejected
                        </CardTitle>
                        <XCircle className="h-5 w-5 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{stats.rejected}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Not approved
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Applications */}
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold">Recent Applications</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Your latest submitted applications
                            </p>
                        </div>
                        <Link href="/my-applications">
                            <Button variant="outline" size="sm" className="gap-2">
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentApplications.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No Applications Yet
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Start by submitting your first application
                            </p>
                            <Link href="/request">
                                <Button className="gap-2">
                                    <FileText className="h-4 w-4" />
                                    New Application
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentApplications.map((application) => {
                                const statusConfig = getStatusConfig(application.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={application.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    #{application.id}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate">
                                                    {application.applicant_name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(application.created_at)}</span>
                                                    {application.project_type && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate">{application.project_type}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`flex items-center gap-1 ${statusConfig.className}`}>
                                            <StatusIcon className="h-3 w-3" />
                                            {statusConfig.label}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <Link href="/request">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">New Application</h3>
                                    <p className="text-sm text-gray-600">Submit a new request</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <Link href="/my-applications">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Track Applications</h3>
                                    <p className="text-sm text-gray-600">View all your applications</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
