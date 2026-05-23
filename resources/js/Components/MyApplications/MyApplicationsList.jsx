import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    FileText,
    Search,
    Eye,
    Calendar,
    MapPin,
    DollarSign,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Download,
    Building2,
    User,
    Sparkles,
} from "lucide-react";

export function MyApplicationsList({ applications = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter applications
    const filteredApplications = useMemo(() => {
        let filtered = applications;

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter((app) => app.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (app) =>
                    app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.project_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.project_location_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.id?.toString().includes(searchTerm)
            );
        }

        return filtered;
    }, [applications, statusFilter, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm]);

    // Get category color scheme
    const getCategoryTheme = (category) => {
        const themes = {
            "TUP": {
                gradient: "from-blue-500 to-cyan-500",
                bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
                border: "border-blue-200 hover:border-blue-400",
                leftBorder: "hover:border-l-blue-500",
                icon: "text-blue-600",
                badge: "bg-blue-100 text-blue-700 border-blue-300"
            },
            "Zoning Clearance": {
                gradient: "from-green-500 to-emerald-500",
                bg: "bg-gradient-to-br from-green-50 to-emerald-50",
                border: "border-green-200 hover:border-green-400",
                leftBorder: "hover:border-l-green-500",
                icon: "text-green-600",
                badge: "bg-green-100 text-green-700 border-green-300"
            },
            "SUP": {
                gradient: "from-purple-500 to-pink-500",
                bg: "bg-gradient-to-br from-purple-50 to-pink-50",
                border: "border-purple-200 hover:border-purple-400",
                leftBorder: "hover:border-l-purple-500",
                icon: "text-purple-600",
                badge: "bg-purple-100 text-purple-700 border-purple-300"
            }
        };

        return themes[category] || {
            gradient: "from-gray-500 to-slate-500",
            bg: "bg-gradient-to-br from-gray-50 to-slate-50",
            border: "border-gray-200 hover:border-gray-400",
            leftBorder: "hover:border-l-gray-500",
            icon: "text-gray-600",
            badge: "bg-gray-100 text-gray-700 border-gray-300"
        };
    };

    // Get status badge with animation
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { 
                variant: "secondary", 
                icon: Clock, 
                label: "Pending",
                className: "bg-yellow-50 text-yellow-700 border-yellow-200"
            },
            approved: { 
                variant: "default", 
                icon: CheckCircle, 
                label: "Approved",
                className: "bg-green-50 text-green-700 border-green-200"
            },
            rejected: { 
                variant: "destructive", 
                icon: XCircle, 
                label: "Rejected",
                className: "bg-red-50 text-red-700 border-red-200"
            },
            "under review": { 
                variant: "outline", 
                icon: AlertCircle, 
                label: "Under Review",
                className: "bg-blue-50 text-blue-700 border-blue-200"
            },
        };

        const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge 
                variant="outline" 
                className={`flex items-center gap-1 w-fit transition-all duration-300 text-xs ${config.className}`}
            >
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
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

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return "N/A";
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    };

    // Handle view details
    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setIsModalOpen(true);
    };

    // Get unique statuses for filter
    const uniqueStatuses = useMemo(() => {
        const statuses = [...new Set(applications.map((app) => app.status))];
        return statuses.filter(Boolean);
    }, [applications]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header with gradient animation */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between animate-in slide-in-from-top duration-700">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            My Applications
                        </h1>
                        <p className="text-gray-600 mt-1">
                            View and track all your submitted applications
                        </p>
                    </div>
                    <div className="flex items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 transition-all duration-300">
                                {applications.length}
                            </p>
                            <p className="text-xs text-gray-600">Total Applications</p>
                        </div>
                    </div>
                </div>

                {/* Filters with stagger animation */}
                <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom duration-700">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                        <Input
                            placeholder="Search by name, project type, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:flex-1 transition-all duration-300 hover:border-blue-400">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {uniqueStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Applications Grid - Mobile Friendly with stagger animation */}
            {filteredApplications.length === 0 ? (
                <Card className="animate-in zoom-in duration-500">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="relative">
                            <FileText className="h-16 w-16 text-gray-300 mb-4 animate-bounce" />
                            <Sparkles className="h-6 w-6 text-blue-400 absolute -top-2 -right-2 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No Applications Found
                        </h3>
                        <p className="text-gray-600 text-center max-w-md">
                            {searchTerm || statusFilter !== "all"
                                ? "Try adjusting your search or filter criteria"
                                : "You haven't submitted any applications yet"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 md:gap-4">
                    {paginatedApplications.map((application, index) => {
                        const theme = getCategoryTheme(application.project_type);
                        return (
                            <Card
                                key={application.id}
                                className={`group hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer border-l-4 ${theme.border} ${theme.leftBorder} animate-in slide-in-from-bottom ${theme.bg}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => handleViewDetails(application)}
                            >
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`text-xs font-semibold ${theme.icon} group-hover:scale-110 transition-transform duration-300`}>
                                                    #{application.id}
                                                </span>
                                                {getStatusBadge(application.status)}
                                            </div>
                                            <CardTitle className={`text-base md:text-lg truncate font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                                                {application.applicant_name}
                                            </CardTitle>
                                            {/* Category Badge */}
                                            {application.project_type && (
                                                <Badge 
                                                    variant="outline" 
                                                    className={`mt-1.5 text-xs ${theme.badge}`}
                                                >
                                                    {application.project_type}
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleViewDetails(application);
                                            }}
                                            className={`shrink-0 hover:bg-opacity-20 ${theme.icon} transition-all duration-300 hover:scale-110 h-8 w-8 p-0`}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2 px-4 pb-3">
                                    {/* Location */}
                                    <div className="flex items-start gap-2 group/item hover:translate-x-1 transition-transform duration-300">
                                        <MapPin className={`h-4 w-4 ${theme.icon} group-hover/item:scale-110 shrink-0 mt-0.5 transition-all duration-300`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-900 line-clamp-1">
                                                {[
                                                    application.project_location_barangay,
                                                    application.project_location_city,
                                                    application.project_location_municipality,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ") || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 text-xs">
                                        {/* Submitted Date */}
                                        <div className="flex items-center gap-1.5 group/item">
                                            <Calendar className={`h-3.5 w-3.5 ${theme.icon} group-hover/item:scale-110 transition-all duration-300`} />
                                            <span className="text-gray-600">
                                                {formatDate(application.created_at)}
                                            </span>
                                        </div>

                                        {/* Project Cost */}
                                        {application.project_cost && (
                                            <div className="flex items-center gap-1.5 group/item">
                                                <DollarSign className={`h-3.5 w-3.5 ${theme.icon} group-hover/item:scale-110 transition-all duration-300`} />
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(application.project_cost)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Certificate Badge - Removed */}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-700">
                    <p className="text-sm text-gray-600 text-center sm:text-left">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredApplications.length)} of{" "}
                        {filteredApplications.length} applications
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {totalPages <= 5 ? (
                                Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-10 transition-all duration-300 hover:scale-110"
                                    >
                                        {page}
                                    </Button>
                                ))
                            ) : (
                                <>
                                    {currentPage > 2 && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(1)}
                                                className="w-10 transition-all duration-300 hover:scale-110"
                                            >
                                                1
                                            </Button>
                                            {currentPage > 3 && (
                                                <span className="px-2 text-gray-500">...</span>
                                            )}
                                        </>
                                    )}
                                    
                                    {[currentPage - 1, currentPage, currentPage + 1]
                                        .filter((page) => page > 0 && page <= totalPages)
                                        .map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className="w-10 transition-all duration-300 hover:scale-110"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    
                                    {currentPage < totalPages - 1 && (
                                        <>
                                            {currentPage < totalPages - 2 && (
                                                <span className="px-2 text-gray-500">...</span>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(totalPages)}
                                                className="w-10 transition-all duration-300 hover:scale-110"
                                            >
                                                {totalPages}
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            {/* HORIZONTAL MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent landscape={true} className="!max-w-[98vw] !w-[98vw] h-[90vh] max-h-[90vh] overflow-hidden p-0 gap-0 sm:!max-w-[95vw] sm:!w-[95vw]">
                    {selectedApplication && (() => {
                        const theme = getCategoryTheme(selectedApplication.project_type);
                        return (
                            <>
                                {/* Accessible Dialog Title and Description (visually hidden) */}
                                <DialogHeader className="sr-only">
                                    <DialogTitle>
                                        Application Details - {selectedApplication.applicant_name}
                                    </DialogTitle>
                                    <DialogDescription>
                                        View detailed information about application #{selectedApplication.id}
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Header with Gradient Background */}
                                <div className={`relative ${theme.bg} border-b-4 ${theme.border} overflow-hidden`}>
                                    {/* Decorative Background Pattern */}
                                    <div className="absolute inset-0 opacity-10">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                                    </div>
                                    
                                    <div className="relative px-3 sm:px-6 py-3">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1 w-full sm:w-auto">
                                                <div className="w-full sm:w-auto">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <Badge variant="outline" className={`${theme.badge} font-semibold text-xs`}>
                                                            #{selectedApplication.id}
                                                        </Badge>
                                                        {getStatusBadge(selectedApplication.status)}
                                                    </div>
                                                    <h2 className={`text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent break-words`}>
                                                        {selectedApplication.applicant_name}
                                                    </h2>
                                                </div>
                                                {selectedApplication.project_type && (
                                                    <Badge variant="outline" className={`${theme.badge} text-xs sm:text-sm`}>
                                                        {selectedApplication.project_type}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-left sm:text-right w-full sm:w-auto">
                                                <p className="text-xs text-gray-600 mb-1">Submitted</p>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatDate(selectedApplication.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Horizontal Content Layout */}
                                <div className="overflow-y-auto h-[calc(90vh-100px)] p-2 sm:p-4">
                                    <div className="space-y-3">
                                        {/* Quick Stats Row - Responsive: 2 cols on mobile, 4 cols on desktop */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 min-w-0">
                                            <div className={`${theme.bg} rounded-xl p-3 border ${theme.border} hover:shadow-md transition-all duration-300`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Building2 className={`h-4 w-4 ${theme.icon}`} />
                                                    <p className="text-xs text-gray-600">Project Area</p>
                                                </div>
                                                <p className="text-base font-bold text-gray-900">
                                                    {selectedApplication.project_area_sqm || "N/A"} <span className="text-xs font-normal">sqm</span>
                                                </p>
                                            </div>
                                            <div className={`${theme.bg} rounded-xl p-3 border ${theme.border} hover:shadow-md transition-all duration-300`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin className={`h-4 w-4 ${theme.icon}`} />
                                                    <p className="text-xs text-gray-600">Lot Area</p>
                                                </div>
                                                <p className="text-base font-bold text-gray-900">
                                                    {selectedApplication.lot_area_sqm || "N/A"} <span className="text-xs font-normal">sqm</span>
                                                </p>
                                            </div>
                                            <div className={`${theme.bg} rounded-xl p-3 border ${theme.border} hover:shadow-md transition-all duration-300`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <DollarSign className={`h-4 w-4 ${theme.icon}`} />
                                                    <p className="text-xs text-gray-600">Project Cost</p>
                                                </div>
                                                <p className="text-base font-bold text-gray-900">
                                                    {formatCurrency(selectedApplication.project_cost)}
                                                </p>
                                            </div>
                                            <div className={`${theme.bg} rounded-xl p-3 border ${theme.border} hover:shadow-md transition-all duration-300`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className={`h-4 w-4 ${theme.icon}`} />
                                                    <p className="text-xs text-gray-600">Right Over Land</p>
                                                </div>
                                                <p className="text-base font-bold text-gray-900">
                                                    {selectedApplication.right_over_land || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Main Content - Responsive: 1 col on mobile, 3 cols on desktop */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 min-w-0">
                                            {/* Column 1: Applicant Information */}
                                            <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-gray-200 transition-colors duration-300">
                                                <div className={`${theme.bg} px-4 py-2.5 border-b ${theme.border}`}>
                                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                        <User className={`h-4 w-4 ${theme.icon}`} />
                                                        Applicant Information
                                                    </h3>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedApplication.applicant_name}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</p>
                                                        <p className="text-sm text-gray-900 break-words">{selectedApplication.applicant_address || "N/A"}</p>
                                                    </div>
                                                    {selectedApplication.corporation_name && (
                                                        <>
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Corporation</p>
                                                                <p className="text-sm font-semibold text-gray-900">{selectedApplication.corporation_name}</p>
                                                            </div>
                                                            {selectedApplication.corporation_address && (
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Corporation Address</p>
                                                                    <p className="text-sm text-gray-900 break-words">{selectedApplication.corporation_address}</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    {selectedApplication.authorized_representative_name && (
                                                        <>
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Authorized Representative</p>
                                                                <p className="text-sm font-semibold text-gray-900">{selectedApplication.authorized_representative_name}</p>
                                                            </div>
                                                            {selectedApplication.authorized_representative_address && (
                                                                <div className="space-y-1">
                                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Representative Address</p>
                                                                    <p className="text-sm text-gray-900 break-words">{selectedApplication.authorized_representative_address}</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Column 2: Project Details */}
                                            <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-gray-200 transition-colors duration-300">
                                                <div className={`${theme.bg} px-4 py-2.5 border-b ${theme.border}`}>
                                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                        <Building2 className={`h-4 w-4 ${theme.icon}`} />
                                                        Project Details
                                                    </h3>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className={`${theme.bg} rounded-lg p-2.5 border ${theme.border}`}>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Type</p>
                                                            <p className="text-sm font-semibold text-gray-900">{selectedApplication.project_type || "N/A"}</p>
                                                        </div>
                                                        <div className={`${theme.bg} rounded-lg p-2.5 border ${theme.border}`}>
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Nature</p>
                                                            <p className="text-sm font-semibold text-gray-900">{selectedApplication.project_nature || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={`${theme.bg} rounded-lg p-2.5 border ${theme.border}`}>
                                                        <div className="flex items-start gap-2">
                                                            <MapPin className={`h-4 w-4 ${theme.icon} mt-0.5 shrink-0`} />
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                                                                <p className="text-sm font-medium text-gray-900 break-words">
                                                                    {[
                                                                        selectedApplication.project_location_street,
                                                                        selectedApplication.project_location_barangay,
                                                                        selectedApplication.project_location_city,
                                                                        selectedApplication.project_location_municipality,
                                                                        selectedApplication.project_location_province,
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(", ") || "N/A"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                                                            <p className="text-sm font-semibold text-gray-900">{selectedApplication.project_nature_duration || "N/A"}</p>
                                                        </div>
                                                        {selectedApplication.project_nature_years && (
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Years</p>
                                                                <p className="text-sm font-semibold text-gray-900">{selectedApplication.project_nature_years}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Existing Land Use</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedApplication.existing_land_use || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Column 3: Additional Information */}
                                            <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-gray-200 transition-colors duration-300">
                                                <div className={`${theme.bg} px-4 py-2.5 border-b ${theme.border}`}>
                                                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                        <FileText className={`h-4 w-4 ${theme.icon}`} />
                                                        Additional Information
                                                    </h3>
                                                </div>
                                                <div className="p-4 space-y-3">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preferred Release Mode</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedApplication.preferred_release_mode || "N/A"}</p>
                                                    </div>
                                                    {selectedApplication.release_address && (
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Release Address</p>
                                                            <p className="text-sm text-gray-900 break-words">{selectedApplication.release_address}</p>
                                                        </div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Has Written Notice</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedApplication.has_written_notice || "N/A"}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Similar Application</p>
                                                        <p className="text-sm font-semibold text-gray-900">{selectedApplication.has_similar_application || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
