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
    Building2,
    User,
    Sparkles,
    ListChecks,
    Award,
} from "lucide-react";

export function MyApplicationsList({ applications = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadReceiptModalOpen, setIsUploadReceiptModalOpen] = useState(false);
    const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
    const [receiptFile, setReceiptFile] = useState(null);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
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

    // Get category color scheme - Single Blue Theme
    const getCategoryTheme = (category) => {
        // All categories use the same blue theme
        return {
            gradient: "from-blue-600 to-blue-600",
            bg: "bg-blue-50/50",
            border: "border-blue-200 hover:border-blue-400",
            leftBorder: "hover:border-l-blue-600",
            icon: "text-blue-600",
            badge: "bg-blue-100 text-blue-800 border-blue-300",
            shadow: "hover:shadow-blue-100"
        };
    };

    // Get status badge with animation - Enhanced for better UX
    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { 
                variant: "secondary", 
                icon: Clock, 
                label: "Pending Review",
                className: "bg-amber-50 text-amber-700 border-amber-300",
                pulse: false
            },
            approved: { 
                variant: "default", 
                icon: CheckCircle, 
                label: "Approved",
                className: "bg-emerald-50 text-emerald-700 border-emerald-300",
                pulse: false
            },
            rejected: { 
                variant: "destructive", 
                icon: XCircle, 
                label: "Rejected",
                className: "bg-red-50 text-red-700 border-red-300",
                pulse: false
            },
            "under review": { 
                variant: "outline", 
                icon: AlertCircle, 
                label: "Under Review",
                className: "bg-sky-50 text-sky-700 border-sky-300",
                pulse: false
            },
        };

        const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all duration-300 text-xs font-semibold ${config.className}`}>
                <Icon className="h-3.5 w-3.5" />
                <span>{config.label}</span>
            </div>
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

    const handleAttachReceipt = () => {
        setIsUploadReceiptModalOpen(true);
    };

    const handleReceiptFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadReceipt = async () => {
        if (!receiptFile || !selectedApplication) return;

        setUploadingReceipt(true);
        
        const formData = new FormData();
        formData.append('receipt', receiptFile);
        formData.append('request_id', selectedApplication.id);
        formData.append('amount', selectedApplication.report_amount || '');
        formData.append('payment_method', 'bank_transfer');
        formData.append('payment_date', new Date().toISOString().split('T')[0]);

        try {
            // Get CSRF token safely
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page.');
            }

            const response = await fetch('/payments', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formData,
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Success - close modals and reset
                setIsUploadReceiptModalOpen(false);
                setIsModalOpen(false);
                setReceiptFile(null);
                setReceiptPreview(null);
                alert(data.message || 'Receipt uploaded successfully!');
                window.location.reload(); // Refresh to show updated status
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert(error.message || 'Failed to upload receipt. Please try again.');
        } finally {
            setUploadingReceipt(false);
        }
    };

    // Get unique statuses for filter
    const uniqueStatuses = useMemo(() => {
        const statuses = [...new Set(applications.map((app) => app.status))];
        return statuses.filter(Boolean);
    }, [applications]);

    // Requirements data based on project type
    const getRequirements = (projectType) => {
        // Normalize the project type to handle variations
        const normalizedType = projectType?.trim();
        
        const requirements = {
            "TUP": {
                title: "Requirements for TUP (Temporary Use Permit)",
                description: "Please bring the following documents to your scheduled appointment at the CPDO office",
                items: [
                    "Accomplished application form",
                    "Letter request stating temporary use/purpose",
                    "Valid ID of applicant",
                    "Proof of ownership / authorization from owner",
                    "Sketch plan / vicinity map",
                    "Barangay clearance",
                    "Business permit (if commercial activity)",
                    "Photos of site/location (if required)",
                    "Payment of processing fees"
                ]
            },
            "Zoning Clearance": {
                title: "Requirements for Zoning Clearance",
                description: "Please bring the following documents to your scheduled appointment at the CPDO office",
                items: [
                    "Duly accomplished and notarized APPLICATION FORM",
                    "Any of the following requirements relative to RIGHT OVER LAND:",
                    "• Photocopy of the Cert. of Title in case registered in the name of the applicant & latest Tax declaration",
                    "• In the absence of any existing certification of title, submit (1) certified true copy of the latest tax declaration and (2) pro forma affidavit",
                    "VICINITY MAP showing the existing land uses within the prescribed radius from the lot boundary of the project site",
                    "SITE DEVELOPMENT PLAN showing the project site, lot area boundaries & dimension of proposed improvement",
                    "ESTIMATED PROJECT COST / BILL OF MATERIALS",
                    "Barangay clearance",
                    "For projects in Tenanted Rice and/or Corn lands: Endorsement/recommendation from the Department of Agrarian Reform",
                    "For manufacturing projects: DESCRIPTION OF INDUSTRY",
                    "AFFIDAVIT OF NO OBJECTION",
                    "ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC)/CERTIFICATE OF NON-COVERAGE(CNC)",
                    "Certification of road right-of-way from DPWH (if the project is located within the National Road)"
                ]
            },
            "SUP": {
                title: "Requirements for SUP (Special Use Permit)",
                description: "Please bring the following documents to your scheduled appointment at the CPDO office",
                items: [
                    "Accomplished application form",
                    "Letter request describing proposed special use",
                    "Valid ID of applicant",
                    "Land title / tax declaration / lease contract",
                    "Site development plan / lot plan",
                    "Zoning clearance or locational clearance request",
                    "Barangay clearance / endorsement",
                    "Environmental or safety clearances (if needed)",
                    "Business documents (if company/applicant is business)",
                    "Payment of fees"
                ]
            }
        };

        return requirements[normalizedType] || {
            title: `Requirements for ${normalizedType || 'Application'}`,
            description: "Please bring the following documents to your scheduled appointment at the CPDO office",
            items: [
                "Valid ID of applicant",
                "Proof of ownership or authorization letter from property owner",
                "Barangay clearance",
                "Location/vicinity map of the project site",
                "Any previous permits or clearances related to the property",
                "Please contact CPDO office for complete list of specific requirements for this application type"
            ]
        };
    };

    const handleViewRequirements = () => {
        setIsRequirementsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
                {/* Enhanced Header with Modern Design */}
                <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg border border-blue-100">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 bg-blue-600/5"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
                    
                    <div className="relative px-6 py-8 sm:px-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                                        <FileText className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">
                                            My Applications
                                        </h1>
                                        <p className="text-slate-600 mt-0.5 text-sm sm:text-base">
                                            Track and manage your submitted applications
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Stats Card */}
                            <div className="flex items-center gap-6 bg-white rounded-xl px-6 py-4 shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {applications.length}
                                    </p>
                                    <p className="text-xs font-medium text-slate-600 mt-1">Total</p>
                                </div>
                                <div className="h-12 w-px bg-blue-300"></div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-blue-600">
                                        {applications.filter(app => app.status === 'pending').length}
                                    </p>
                                    <p className="text-xs font-medium text-slate-600 mt-1">Pending</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filters */}
                <div className="bg-white rounded-xl shadow-md border border-blue-100 p-4 animate-in slide-in-from-bottom duration-700">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300">
                                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 group-focus-within:scale-110" />
                            </div>
                            <Input
                                placeholder="Search by name, project type, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 border-slate-200 bg-slate-50/50 focus:bg-white transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48 h-12 border-slate-200 bg-slate-50/50 hover:bg-white transition-all duration-300 hover:border-blue-400 rounded-xl">
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

                {/* Applications Grid - Enhanced Design */}
                {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-12 animate-in zoom-in duration-500">
                    <div className="flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full"></div>
                            <FileText className="relative h-20 w-20 text-blue-300 animate-bounce" />
                            <Sparkles className="h-8 w-8 text-blue-500 absolute -top-2 -right-2 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            No Applications Found
                        </h3>
                        <p className="text-slate-600 text-center max-w-md">
                            {searchTerm || statusFilter !== "all"
                                ? "Try adjusting your search or filter criteria"
                                : "You haven't submitted any applications yet"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {paginatedApplications.map((application, index) => {
                        const theme = getCategoryTheme(application.project_type);
                        return (
                            <div
                                key={application.id}
                                className={`group relative bg-white rounded-2xl border-l-4 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl ${theme.shadow} hover:-translate-y-1 ${theme.border} ${theme.leftBorder} animate-in slide-in-from-bottom`}
                                style={{ animationDelay: `${index * 50}ms` }}
                                onClick={() => handleViewDetails(application)}
                            >
                                {/* Decorative gradient overlay */}
                                <div className={`absolute inset-0 ${theme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                
                                <div className="relative">
                                    <div className="px-5 pt-5 pb-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0 space-y-2">
                                                {/* ID and Status Row */}
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 shadow-sm">
                                                        <span className="text-xs font-bold text-white">
                                                            #{application.id}
                                                        </span>
                                                    </div>
                                                    {getStatusBadge(application.status)}
                                                </div>
                                                
                                                {/* Applicant Name */}
                                                <h3 className="text-xl font-bold text-blue-600 group-hover:scale-[1.02] transition-transform duration-300">
                                                    {application.applicant_name || "N/A"}
                                                </h3>
                                                
                                                {/* Project Type Badge - Enhanced */}
                                                {application.project_type && (
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                                                        <Award className="h-4 w-4 text-blue-600" />
                                                        <div>
                                                            <p className="text-xs text-blue-600 font-medium">Category</p>
                                                            <p className="text-sm font-bold text-blue-600">
                                                                {application.project_type}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* View Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDetails(application);
                                                }}
                                                className="shrink-0 h-10 w-10 rounded-xl text-blue-600 hover:bg-blue-100 transition-all duration-300 hover:scale-110 hover:rotate-3"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="px-5 pb-5 space-y-3">
                                        {/* Location Section - Enhanced */}
                                        <div className="relative overflow-hidden">
                                            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 group/item hover:border-blue-300 transition-all duration-300">
                                                <div className="p-2.5 rounded-xl bg-white shadow-md text-blue-600 group-hover/item:scale-110 transition-transform">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Project Location</p>
                                                    <p className="text-sm font-bold text-slate-900 leading-relaxed">
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
                                        </div>

                                        {/* Info Grid - Enhanced with Certificate Type */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {/* Certificate Type - Prominent Display */}
                                            <div className="sm:col-span-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-blue-600 rounded-lg shadow-md">
                                                        <FileText className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-medium text-blue-600 mb-0.5">Application Category</p>
                                                        <p className="text-lg font-bold text-blue-900">
                                                            {application.project_type || "Not Specified"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Submitted Date */}
                                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Submitted</p>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {formatDate(application.created_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Project Cost */}
                                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`p-2 rounded-lg bg-green-50 text-green-600`}>
                                                    <DollarSign className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Cost</p>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {formatCurrency(application.project_cost)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Project Area */}
                                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`p-2 rounded-lg bg-purple-50 text-purple-600`}>
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium">Area</p>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {application.project_area_sqm ? `${application.project_area_sqm} m²` : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <div className="bg-white rounded-xl shadow-md border border-blue-100 p-4 animate-in slide-in-from-bottom duration-700">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm font-medium text-slate-600 text-center sm:text-left">
                            Showing <span className="font-bold text-blue-600">{startIndex + 1}</span> to{" "}
                            <span className="font-bold text-blue-600">{Math.min(endIndex, filteredApplications.length)}</span> of{" "}
                            <span className="font-bold text-blue-600">{filteredApplications.length}</span> applications
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-10 px-4 border-blue-200 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 rounded-lg"
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
                            className="h-10 px-4 border-blue-200 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 rounded-lg"
                        >
                            Next
                        </Button>
                        </div>
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
                                            <div className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden hover:border-blue-200 transition-colors duration-300 shadow-sm">
                                                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 border-b border-blue-400">
                                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                        <User className="h-4 w-4 text-white" />
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
                                            <div className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden hover:border-blue-200 transition-colors duration-300 shadow-sm">
                                                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 border-b border-blue-400">
                                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-white" />
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
                                            <div className="bg-white rounded-xl border-2 border-blue-100 overflow-hidden hover:border-blue-200 transition-colors duration-300 shadow-sm">
                                                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 border-b border-blue-400">
                                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-white" />
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

                                    {/* Action Buttons Footer */}
                                    <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-between gap-3 shadow-lg">
                                        <Button
                                            variant="outline"
                                            onClick={handleViewRequirements}
                                            className="px-6 border-purple-300 text-purple-700 hover:bg-purple-50"
                                        >
                                            <ListChecks className="h-5 w-5 mr-2" />
                                            View Requirements
                                        </Button>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsModalOpen(false)}
                                                className="px-6"
                                            >
                                                Close
                                            </Button>
                                            {selectedApplication.status === 'approved' && (
                                                <Button
                                                    onClick={handleAttachReceipt}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Attach Receipt
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </DialogContent>
            </Dialog>

            {/* Upload Receipt Modal */}
            <Dialog open={isUploadReceiptModalOpen} onOpenChange={setIsUploadReceiptModalOpen}>
                <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">
                            Upload Payment Receipt
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Upload a photo of your payment receipt for application #{selectedApplication?.id}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* File Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Receipt Image *
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    {receiptPreview ? (
                                        <div className="relative w-full h-full p-2">
                                            <img
                                                src={receiptPreview}
                                                alt="Receipt preview"
                                                className="w-full h-full object-contain rounded"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setReceiptFile(null);
                                                    setReceiptPreview(null);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-4">
                                            <svg className="w-10 h-10 mb-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="mb-1 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleReceiptFileChange}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1.5">
                            <h4 className="font-semibold text-sm text-blue-900">Payment Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600">Application ID:</span>
                                    <span className="ml-1 font-semibold">#{selectedApplication?.id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="ml-1 font-semibold">₱{selectedApplication?.report_amount || 'TBD'}</span>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-gray-600">Applicant:</span>
                                    <span className="ml-1 font-semibold">{selectedApplication?.applicant_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <h4 className="font-semibold text-sm text-yellow-900 mb-1.5 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Important Notes
                            </h4>
                            <ul className="text-xs text-yellow-800 space-y-0.5 list-disc list-inside">
                                <li>Ensure the receipt is clear and readable</li>
                                <li>Include amount, date, reference number</li>
                                <li>Max file size: 5MB</li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsUploadReceiptModalOpen(false);
                                setReceiptFile(null);
                                setReceiptPreview(null);
                            }}
                            disabled={uploadingReceipt}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUploadReceipt}
                            disabled={!receiptFile || uploadingReceipt}
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                        >
                            {uploadingReceipt ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </>
                            ) : (
                                'Upload Receipt'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Requirements Modal */}
            {selectedApplication && (
                <Dialog open={isRequirementsModalOpen} onOpenChange={setIsRequirementsModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-purple-50 to-slate-50">
                        <DialogHeader>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <div className="p-2 bg-purple-100 rounded-full">
                                    <ListChecks className="h-6 w-6 text-purple-600" />
                                </div>
                                {getRequirements(selectedApplication.project_type).title}
                            </DialogTitle>
                            <DialogDescription className="text-base">
                                {getRequirements(selectedApplication.project_type).description}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="mt-6 space-y-3">
                            {getRequirements(selectedApplication.project_type).items.map((requirement, index) => (
                                <div 
                                    key={index} 
                                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex items-start gap-4"
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 leading-relaxed">{requirement}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 p-5 bg-white border-l-4 border-yellow-500 rounded-lg shadow-md">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div className="p-2 bg-yellow-100 rounded-full">
                                        <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">Important Reminder for Your Appointment</h4>
                                    <p className="text-sm text-gray-700 mb-2">
                                        <strong>Please bring ALL the required documents listed above to your scheduled appointment at the CPDO office.</strong>
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        All documents must be valid and up-to-date. Incomplete requirements may result in delays or rescheduling of your appointment. 
                                        Please ensure all documents are properly signed and notarized where required.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setIsRequirementsModalOpen(false)} className="bg-purple-600 hover:bg-purple-700">
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            </div>
        </div>
    );
}
