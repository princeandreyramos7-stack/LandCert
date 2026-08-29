import { AdminSidebar } from "@/Components/admin-sidebar";
import { Head, Link, router } from "@inertiajs/react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/Components/ui/breadcrumb";
import { Separator } from "@/Components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/Components/ui/sidebar";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import {
    User,
    Building2,
    MapPin,
    Home,
    FileText,
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Check,
    Sparkles,
    Loader2,
    Edit2,
    Save,
    History,
} from "lucide-react";
import { formatDate } from "@/Components/Admin/Request/utils";
import { useState, useMemo } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";
import axios from "axios";

/**
 * Display-only formatting for peso amount fields.
 * Adds thousand separators while keeping any decimal point the user is typing.
 * The raw (unformatted) value is what stays in state and gets submitted.
 */
const formatAmountForDisplay = (rawValue) => {
    if (rawValue === null || rawValue === undefined || rawValue === "") return "";

    const raw = String(rawValue);
    const [integerPart, ...decimalParts] = raw.split(".");
    const hasDecimalPoint = raw.includes(".");

    const groupedInteger =
        integerPart === "" ? "" : Number(integerPart).toLocaleString("en-US");

    return hasDecimalPoint
        ? `${groupedInteger}.${decimalParts.join("")}`
        : groupedInteger;
};

/**
 * Strips the display formatting back down to a plain number string,
 * allowing a single decimal point and at most 2 decimal places.
 */
const parseAmountInput = (displayValue) => {
    let cleaned = String(displayValue).replace(/[^\d.]/g, "");

    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
        const integerPart = cleaned.slice(0, firstDot);
        const decimalPart = cleaned
            .slice(firstDot + 1)
            .replace(/\./g, "")
            .slice(0, 2);
        cleaned = `${integerPart}.${decimalPart}`;
    }

    return cleaned;
};

export default function ReviewRequest({ request }) {
    const [currentStep, setCurrentStep] = useState(1);
    
    // Pre-select action based on current request status
    const getInitialAction = () => {
        if (request.status === 'reviewed' || request.status === 'approved') {
            return 'reviewed';
        } else if (request.status === 'rejected' || request.status === 'denied') {
            return 'rejected';
        }
        return '';
    };
    
    const [action, setAction] = useState(getInitialAction());
    const [formData, setFormData] = useState({
        rejection_reason: request.rejection_reason || 'Lacking of Requirements', // Use existing or default
        payment_amount: '',
        admin_notes: request.admin_notes || '',
    });
    const [loading, setLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    
    // Track which requirements are verified/correct - Load from database
    const [requirementChecks, setRequirementChecks] = useState(request.verified_requirements || {});
    
    const { toast } = useToast();
    
    // Save requirement checks to database whenever they change
    const handleToggleRequirement = async (key, name, checked) => {
        const updated = {
            ...requirementChecks,
            [key]: checked
        };
        
        setRequirementChecks(updated);
        
        // Save to database
        try {
            await axios.post(route('admin.save-requirement-verification'), {
                request_id: request.id,
                verified_requirements: updated
            });
        } catch (error) {
            console.error('Error saving requirement verification:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save requirement verification status"
            });
        }
    };

    // Group uploaded documents by requirement so a requirement with multiple
    // files (e.g. "1. Application Form" uploaded as 3 separate pages) shows
    // as one entry with all of its files listed, instead of 3 duplicate-looking cards.
    // Also split into "Main" vs "Additional" sections using requirements_reference
    // (the full requirement list for this project type) so admins see the same
    // two-section structure the applicant saw when uploading.
    const groupedRequirements = useMemo(() => {
        const docs = request.uploaded_requirements || [];
        const reference = request.requirements_reference || [];
        
        console.log('=== Admin ReviewRequest Debug ===');
        console.log('Uploaded requirements:', docs);
        console.log('Requirements reference:', reference);
        
        const sectionById = new Map(reference.map((r) => [r.id, r.section || 'main']));

        const groups = new Map();

        docs.forEach((doc) => {
            const key = doc.requirement_id ?? doc.requirement_name;
            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    requirement_name: doc.requirement_name,
                    section: sectionById.get(doc.requirement_id) || 'main',
                    files: [],
                });
            }
            groups.get(key).files.push(doc);
        });

        const result = Array.from(groups.values());
        console.log('Grouped requirements:', result);
        
        return result;
    }, [request.uploaded_requirements, request.requirements_reference]);

    const mainUploadedGroups = groupedRequirements.filter((g) => g.section !== 'additional');
    const additionalUploadedGroups = groupedRequirements.filter((g) => g.section === 'additional');

    // Generate missing requirements message for rejection
    const getMissingRequirements = () => {
        const allGroups = [...mainUploadedGroups, ...additionalUploadedGroups];
        const missing = allGroups.filter(group => !requirementChecks[group.key]);
        
        if (missing.length === 0) return '';
        
        return 'Missing or Incomplete Requirements:\n' + 
               missing.map(group => `- ${group.requirement_name}`).join('\n');
    };

    // Update rejection reason when action changes to rejected
    const handleActionChange = (newAction) => {
        setAction(newAction);
        
        if (newAction === 'rejected') {
            const missingReqs = getMissingRequirements();
            if (missingReqs) {
                setFormData(prev => ({
                    ...prev,
                    rejection_reason: missingReqs
                }));
            }
        }
    };

    // Remove the useEffect for fetching requirements - no longer needed

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirmDialog(true); // Show confirmation dialog instead of submitting directly
    };

    const confirmSubmit = async () => {
        setShowConfirmDialog(false);
        setLoading(true);

        try {
            const response = await axios.post('/admin/review-application', {
                request_id: request.id,
                action: action,
                ...formData
            });

            toast({
                title: "Success!",
                description: "Application review submitted successfully!",
            });
            
            // Redirect back to requests page after a short delay
            setTimeout(() => {
                router.visit(route('admin.requests'));
            }, 1500);
        } catch (error) {
            console.error('Review failed:', error);
            
            // Show validation errors if available
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat().join('\n');
                toast({
                    variant: "destructive",
                    title: "Validation Error",
                    description: errorMessages,
                });
            } else if (error.response?.data?.message) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.response.data.message,
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to submit review. Please try again.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Status badge configuration
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                icon: Clock,
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                label: "Pending Review",
            },
            approved: {
                icon: CheckCircle2,
                color: "bg-green-100 text-green-800 border-green-200",
                label: "Approved",
            },
            rejected: {
                icon: XCircle,
                color: "bg-red-100 text-red-800 border-red-200",
                label: "Rejected",
            },
            reviewed: {
                icon: AlertCircle,
                color: "bg-blue-100 text-blue-800 border-blue-200",
                label: "Under Review",
            },
        };
        return configs[status] || configs.pending;
    };

    const statusConfig = getStatusConfig(request.status || "pending");
    const StatusIcon = statusConfig.icon;

    // Define steps
    const steps = [
        { number: 1, title: "Applicant Info", icon: User },
        { number: 2, title: "Project Details", icon: Building2 },
        { number: 3, title: "Land Use", icon: Home },
        { number: 4, title: "Requirements", icon: FileText },
    ];

    return (
        <SidebarProvider>
            <Head title={`Review ${request.application_number || `TPZ-${request.id}`}`} />
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-white">
                    <div className="flex items-center gap-2 px-4 w-full">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <Link
                                        href={route("admin.dashboard")}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span className="mx-2 text-gray-400">
                                        ›
                                    </span>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <Link
                                        href={route("admin.requests")}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Requests
                                    </Link>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span className="mx-2 text-gray-400">
                                        ›
                                    </span>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {request.application_number || `TPZ-${request.id}`}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
                    <div className="max-w-7xl mx-auto w-full">
                        {/* Back Button */}
                        <div className="mb-4">
                            <Link href={route("admin.requests")}>
                                <Button variant="outline" size="sm" className="hover:bg-gray-100">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Requests
                                </Button>
                            </Link>
                        </div>

                        {/* Application Details Card */}
                        <Card className="mb-6">
                            <CardHeader className="bg-white border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-gray-900">
                                                {request.application_number || `TPZ-${request.id}`}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Application Type: <span className="font-semibold text-gray-900">{request.application_category || "N/A"}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={`${statusConfig.color} border px-4 py-2 text-sm font-semibold flex items-center gap-2`}>
                                        <StatusIcon className="h-4 w-4" />
                                        {statusConfig.label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Step Indicator */}
                                <StepIndicator
                                    steps={steps}
                                    currentStep={currentStep}
                                    onStepClick={setCurrentStep}
                                />

                                {/* Step Content */}
                                <div className="mt-8">
                                    {currentStep === 1 && (
                                        <Step1Content request={request} />
                                    )}
                                    {currentStep === 2 && (
                                        <Step2Content request={request} />
                                    )}
                                    {currentStep === 3 && (
                                        <Step3Content request={request} />
                                    )}
                                    {currentStep === 4 && (
                                        <Step4Content 
                                            request={request}
                                            mainUploadedGroups={mainUploadedGroups}
                                            additionalUploadedGroups={additionalUploadedGroups}
                                            requirementChecks={requirementChecks}
                                            onToggleRequirement={handleToggleRequirement}
                                        />
                                    )}
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex justify-between pt-6 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                        disabled={currentStep === 1}
                                    >
                                        Previous
                                    </Button>
                                    <div className="text-sm text-gray-500">
                                        Step {currentStep} of {steps.length}
                                    </div>
                                    <Button
                                        onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                                        disabled={currentStep === steps.length}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Review Form */}
                        <Card>
                            <CardHeader className="bg-white border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-purple-100 rounded-full">
                                        <Sparkles className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <CardTitle className="text-2xl text-gray-900">
                                        Review & Decision
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {/* Previous Decision Banner */}
                                {getInitialAction() && (
                                    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <History className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-900">Previous Decision</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    This application was previously <span className="font-bold">
                                                        {request.status === 'reviewed' || request.status === 'approved' ? 'APPROVED' : 'DENIED'}
                                                    </span>. 
                                                    {request.rejection_reason && ` Reason: "${request.rejection_reason}"`}
                                                    <br />
                                                    <span className="text-xs">You can modify the decision below. Changes will be logged in audit trail.</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Action Selection - SIMPLIFIED */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Select Action <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                                action === 'reviewed' 
                                                    ? 'border-green-500 bg-green-50 shadow-md' 
                                                    : 'border-gray-200 hover:border-green-300'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="action"
                                                    value="reviewed"
                                                    checked={action === 'reviewed'}
                                                    onChange={(e) => handleActionChange(e.target.value)}
                                                    className="w-5 h-5 text-green-600"
                                                    required
                                                />
                                                <div className="ml-3">
                                                    <div className="flex items-center gap-2 font-semibold text-green-700">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        MARK AS REVIEWED
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                                action === 'rejected' 
                                                    ? 'border-red-500 bg-red-50 shadow-md' 
                                                    : 'border-gray-200 hover:border-red-300'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="action"
                                                    value="rejected"
                                                    checked={action === 'rejected'}
                                                    onChange={(e) => handleActionChange(e.target.value)}
                                                    className="w-5 h-5 text-red-600"
                                                    required
                                                />
                                                <div className="ml-3">
                                                    <div className="flex items-center gap-2 font-semibold text-red-700">
                                                        <XCircle className="h-5 w-5" />
                                                        DENIED
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Reviewed Form - Applicant can pay automatically */}
                                    {action === 'reviewed' && (
                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-3 bg-green-600 rounded-full">
                                                        <CheckCircle2 className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900">Mark as Reviewed</h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Applicant will be notified and can proceed with payment automatically.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Payment Amount */}
                                                <div className="mb-4">
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                                        Payment Amount <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">₱</span>
                                                        <input
                                                            type="text"
                                                            value={formatAmountForDisplay(formData.payment_amount)}
                                                            onChange={(e) => {
                                                                const raw = parseAmountInput(e.target.value);
                                                                setFormData({ ...formData, payment_amount: raw });
                                                            }}
                                                            required
                                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-lg font-semibold"
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Enter the amount the applicant needs to pay at the Treasury Office.
                                                    </p>
                                                </div>

                                                {/* Admin Notes */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                                        Notes for Applicant (Optional)
                                                    </label>
                                                    <textarea
                                                        value={formData.admin_notes}
                                                        onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                                                        rows={4}
                                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none"
                                                        placeholder="Additional instructions or information for the applicant (optional)"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        This message will be included in the notification to the applicant.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reject Form */}
                                    {action === 'rejected' && (
                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border-2 border-red-200">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="p-2 bg-red-600 rounded-lg">
                                                        <XCircle className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-800">Rejection Reason</h3>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Detailed Reason <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={formData.rejection_reason}
                                                        onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                                                        rows="4"
                                                        required
                                                        maxLength="1000"
                                                        placeholder="Please provide a clear and detailed reason for rejection..."
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none"
                                                    />
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-xs text-gray-500">
                                                            {formData.rejection_reason.length}/1000 characters
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Quick Reasons */}
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {/* Missing Requirements Button - Auto-populated from unchecked requirements */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const missing = getMissingRequirements();
                                                                setFormData({ ...formData, rejection_reason: missing || 'Lacking of Requirements' });
                                                            }}
                                                            className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-sm flex items-center gap-1.5"
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                            Missing Requirements
                                                        </button>
                                                        
                                                        {[
                                                            'Incomplete Documents',
                                                            'Invalid Location',
                                                            'Zoning Violation',
                                                            'Missing Information'
                                                        ].map((reason) => (
                                                            <button
                                                                key={reason}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, rejection_reason: reason })}
                                                                className="px-3 py-1.5 text-sm font-medium bg-white border-2 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all duration-200"
                                                            >
                                                                {reason}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Info about Missing Requirements button */}
                                                    <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                                                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                                        <span>
                                                            <span className="font-semibold">Missing Requirements</span> button will list all requirements that are not marked as verified (toggle not turned on).
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Warning */}
                                                <div className="mt-4 flex items-start gap-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-yellow-800">
                                                        <span className="font-semibold">Note:</span> The applicant will receive an email with your rejection reason. Please ensure it's clear and professional.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Link href={route('admin.requests')}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={loading}
                                            >
                                                Cancel
                                            </Button>
                                        </Link>
                                        <Button
                                            type="submit"
                                            disabled={loading || !action}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Submit Review
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
            
            {/* Confirmation Dialog - Simple White Modal */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Confirm Your Decision
                            </h3>
                        </div>
                        
                        <div className="px-6 py-4">
                            <div className="mb-4">
                                {action === 'reviewed' ? (
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-gray-700 mb-2">
                                                Mark this application as <span className="font-semibold text-green-600">REVIEWED</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                This will forward the application to SuperAdmin for final approval.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-gray-700 mb-2">
                                                <span className="font-semibold text-red-600">REJECT</span> this application
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">Reason:</p>
                                            <p className="text-sm text-gray-700 italic bg-gray-50 p-2 rounded border">
                                                "{formData.rejection_reason || 'No reason provided'}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-gray-400">
                                <p className="text-sm text-gray-700">
                                    This action cannot be undone. The applicant will be notified.
                                </p>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmSubmit}
                                disabled={loading}
                                className={`flex-1 ${
                                    action === 'reviewed' 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-red-600 hover:bg-red-700'
                                } text-white`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>Confirm</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            <Toaster />
        </SidebarProvider>
    );
}

// Step Indicator Component
function StepIndicator({ steps, currentStep, onStepClick }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                        }}
                    />
                </div>

                {steps.map((step) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    const Icon = step.icon;

                    return (
                        <div 
                            key={step.number} 
                            className="flex flex-col items-center flex-1 cursor-pointer"
                            onClick={() => onStepClick(step.number)}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCompleted
                                        ? "bg-green-600 text-white"
                                        : isCurrent
                                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                        : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <Icon className="h-5 w-5" />
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p
                                    className={`text-sm font-medium ${
                                        isCurrent
                                            ? "text-blue-600"
                                            : isCompleted
                                            ? "text-green-600"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-400">Step {step.number}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Step 1: Applicant Information
function Step1Content({ request }) {
    return (
        <div className="space-y-6">
            <SectionTitle icon={User} title="Applicant Information" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                    label="Name of Applicant"
                    value={request.applicant_name}
                />
                <InfoField
                    label="Address of Applicant"
                    value={request.applicant_address}
                />
            </div>

            {request.corporation_name && (
                <>
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Corporation Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField
                                label="Name of Corporation"
                                value={request.corporation_name}
                            />
                            <InfoField
                                label="Address of Corporation"
                                value={request.corporation_address}
                            />
                        </div>
                    </div>
                </>
            )}

            {request.authorized_representative_name && (
                <>
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Authorized Representative</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField
                                label="Name of Authorized Representative"
                                value={request.authorized_representative_name}
                            />
                            <InfoField
                                label="Address of Authorized Representative"
                                value={request.authorized_representative_address}
                            />
                        </div>
                        {request.authorization_letter_path && (
                            <div className="mt-4">
                                <p className="text-xs font-medium text-gray-500 mb-2">
                                    Authorization Letter
                                </p>
                                <a
                                    href={`/requests/${request.application_id || request.id}/authorization-letter`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all"
                                >
                                    <FileText className="h-4 w-4" />
                                    View Document
                                </a>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// Step 2: Project Details - WITH EDITABLE PROJECT TYPE
function Step2Content({ request }) {
    const [editingProjectType, setEditingProjectType] = useState(false);
    const [projectType, setProjectType] = useState(request.project_type || '');
    const [savingProjectType, setSavingProjectType] = useState(false);
    const { toast } = useToast();

    const handleSaveProjectType = async () => {
        setSavingProjectType(true);
        try {
            await axios.post(`/admin/update-project-type/${request.id}`, {
                project_type: projectType
            });
            toast({
                title: "Success!",
                description: "Project type updated successfully.",
            });
            setEditingProjectType(false);
            // Update the request object
            request.project_type = projectType;
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update project type.",
            });
        } finally {
            setSavingProjectType(false);
        }
    };

    return (
        <div className="space-y-6">
            <SectionTitle icon={Building2} title="Project Details" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EDITABLE PROJECT TYPE */}
                <div className="group">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Project Type
                        </p>
                        {!editingProjectType ? (
                            <button
                                onClick={() => setEditingProjectType(true)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Edit2 className="h-3 w-3" />
                                Edit
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSaveProjectType}
                                    disabled={savingProjectType}
                                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                                >
                                    {savingProjectType ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <Save className="h-3 w-3" />
                                    )}
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setProjectType(request.project_type || '');
                                        setEditingProjectType(false);
                                    }}
                                    disabled={savingProjectType}
                                    className="text-xs text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                    {editingProjectType ? (
                        <select
                            value={projectType}
                            onChange={(e) => setProjectType(e.target.value)}
                            className="w-full px-3 py-2 text-sm border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">N/A</option>
                            <option value="TUP">TUP (Temporary Use Permit)</option>
                            <option value="SUP">SUP (Special Use Permit)</option>
                            <option value="CZC">CZC (Certificate of Zoning Compliance)</option>
                        </select>
                    ) : (
                        <p className="text-sm text-gray-900 font-medium">
                            {projectType || <span className="text-gray-400 italic">Not set</span>}
                        </p>
                    )}
                </div>

                <InfoField
                    label="Project Nature"
                    value={request.project_nature}
                />
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Project Location
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        label="House/Building Number"
                        value={request.project_location_number}
                    />
                    <InfoField
                        label="Street"
                        value={request.project_location_street}
                    />
                    <InfoField
                        label="Barangay"
                        value={request.project_location_barangay}
                    />
                    <InfoField
                        label="Municipality"
                        value={request.project_location_municipality}
                    />
                    <InfoField
                        label="Province"
                        value={request.project_location_province}
                    />
                </div>
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Project Area</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        label="Project Area (sqm)"
                        value={
                            request.project_area_sqm
                                ? `${parseFloat(request.project_area_sqm).toLocaleString()} sqm`
                                : "N/A"
                        }
                    />
                    <InfoField
                        label="Lot (sqm)"
                        value={
                            request.lot_area_sqm
                                ? `${parseFloat(request.lot_area_sqm).toLocaleString()} sqm`
                                : "N/A"
                        }
                    />
                    <InfoField
                        label="Bldg. Improvement (sqm)"
                        value={
                            request.bldg_improvement_sqm
                                ? `${parseFloat(request.bldg_improvement_sqm).toLocaleString()} sqm`
                                : "N/A"
                        }
                    />
                    <InfoField
                        label="Right Over Land"
                        value={request.right_over_land}
                    />
                </div>
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Project Nature & Cost</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        label="Project Nature"
                        value={request.project_nature_duration}
                    />
                    {request.project_nature_duration === "Temporary" &&
                        request.project_nature_years && (
                            <InfoField
                                label="Specify Years"
                                value={`${request.project_nature_years} years`}
                            />
                        )}
                    <InfoField
                        label="Project Cost/Capitalization (in Pesos)"
                        value={
                            request.project_cost
                                ? `₱${parseFloat(request.project_cost).toLocaleString()}`
                                : "N/A"
                        }
                    />
                </div>
            </div>
        </div>
    );
}

// Step 3: Land Use Information
function Step3Content({ request }) {
    return (
        <div className="space-y-6">
            <SectionTitle icon={Home} title="Land Use Information" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                    label="Existing Land Uses of Project Use"
                    value={request.existing_land_use}
                />
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Written Notice from Office/Zoning Administrator</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        label="Has Written Notice"
                        value={
                            request.has_written_notice
                                ? request.has_written_notice.toUpperCase()
                                : "N/A"
                        }
                    />
                    {request.has_written_notice === "yes" && (
                        <>
                            <InfoField
                                label="Name of HSRC Officer/Zoning Administrator"
                                value={request.notice_officer_name}
                            />
                            <InfoField
                                label="Date(s) of Notice(s)"
                                value={request.notice_dates}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Similar Application with Other Offices</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        label="Has Similar Application"
                        value={
                            request.has_similar_application
                                ? request.has_similar_application.toUpperCase()
                                : "N/A"
                        }
                    />
                    {request.has_similar_application === "yes" && (
                        <>
                            <InfoField
                                label="Other HSRC Office(s) Where Filed"
                                value={request.similar_application_offices}
                            />
                            <InfoField
                                label="Date(s) Filed"
                                value={request.similar_application_dates}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Step 4: Requirements Upload
function Step4Content({ request, mainUploadedGroups, additionalUploadedGroups, requirementChecks, onToggleRequirement }) {
    // Get all requirements from reference (what SHOULD be uploaded)
    const allMainRequirements = (request.requirements_reference || []).filter(r => r.section === 'main');
    const allAdditionalRequirements = (request.requirements_reference || []).filter(r => r.section === 'additional');
    
    // Map uploaded requirement IDs for quick lookup
    const uploadedMainIds = new Set(mainUploadedGroups.map(g => g.key));
    const uploadedAdditionalIds = new Set(additionalUploadedGroups.map(g => g.key));
    
    return (
        <div className="space-y-6">
            <SectionTitle icon={FileText} title="Requirements Checklist" />
            
            {/* Main Requirements Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">REQUIRED</span>
                    Main Requirements ({mainUploadedGroups.length}/{allMainRequirements.length} uploaded)
                </h4>
                <div className="space-y-3">
                    {allMainRequirements.map((reqRef) => {
                        // Find if this requirement was uploaded
                        const uploadedGroup = mainUploadedGroups.find(g => g.key === reqRef.id);
                        
                        if (uploadedGroup) {
                            // Show uploaded requirement with files
                            return (
                                <UploadedRequirementGroup 
                                    key={reqRef.id} 
                                    group={uploadedGroup} 
                                    isChecked={requirementChecks[uploadedGroup.key] || false}
                                    onToggle={(checked) => onToggleRequirement(uploadedGroup.key, uploadedGroup.requirement_name, checked)}
                                />
                            );
                        } else {
                            // Show missing requirement placeholder
                            return (
                                <MissingRequirementCard 
                                    key={reqRef.id}
                                    requirement={reqRef}
                                    isChecked={requirementChecks[reqRef.id] || false}
                                    onToggle={(checked) => onToggleRequirement(reqRef.id, reqRef.name, checked)}
                                />
                            );
                        }
                    })}
                </div>
            </div>

            {/* Additional Requirements Section */}
            <div className="space-y-4 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">OPTIONAL</span>
                    Additional Requirements ({additionalUploadedGroups.length}/{allAdditionalRequirements.length} uploaded)
                </h4>
                <div className="space-y-3">
                    {allAdditionalRequirements.map((reqRef) => {
                        // Find if this requirement was uploaded
                        const uploadedGroup = additionalUploadedGroups.find(g => g.key === reqRef.id);
                        
                        if (uploadedGroup) {
                            // Show uploaded requirement with files
                            return (
                                <UploadedRequirementGroup 
                                    key={reqRef.id} 
                                    group={uploadedGroup}
                                    isChecked={requirementChecks[uploadedGroup.key] || false}
                                    onToggle={(checked) => onToggleRequirement(uploadedGroup.key, uploadedGroup.requirement_name, checked)}
                                />
                            );
                        } else {
                            // Show missing requirement placeholder
                            return (
                                <MissingRequirementCard 
                                    key={reqRef.id}
                                    requirement={reqRef}
                                    isChecked={requirementChecks[reqRef.id] || false}
                                    onToggle={(checked) => onToggleRequirement(reqRef.id, reqRef.name, checked)}
                                />
                            );
                        }
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <h5 className="text-sm font-semibold text-blue-900 mb-1">Requirements Summary</h5>
                        <p className="text-sm text-blue-700">
                            Total Uploaded: <span className="font-bold">{mainUploadedGroups.length + additionalUploadedGroups.length}</span>
                            {' / '}
                            <span className="font-bold">{allMainRequirements.length + allAdditionalRequirements.length}</span>
                            {' • '}
                            Main: <span className="font-bold">{mainUploadedGroups.length}/{allMainRequirements.length}</span>
                            {' • '}
                            Additional: <span className="font-bold">{additionalUploadedGroups.length}/{allAdditionalRequirements.length}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
function SectionTitle({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
    );
}

function InfoField({ label, value }) {
    return (
        <div className="group">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {label}
            </p>
            <p className="text-sm text-gray-900 font-medium">
                {value || <span className="text-gray-400 italic">Not provided</span>}
            </p>
        </div>
    );
}

function UploadedRequirementGroup({ group, isChecked, onToggle }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                        {group.requirement_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {group.files.length} {group.files.length === 1 ? 'file' : 'files'} uploaded
                    </p>
                </div>

                {/* Toggle Switch */}
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <Switch
                        checked={isChecked}
                        onCheckedChange={onToggle}
                        className="data-[state=checked]:bg-green-600"
                    />
                    <span className="text-[9px] font-medium text-gray-500">
                        {isChecked ? 'On' : 'Off'}
                    </span>
                </div>
            </div>

            {/* Files list - collapsed by default, shows on hover or when expanded */}
            <div className="mt-3 space-y-2 pl-0 sm:pl-[52px]">
                {group.files.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-800 truncate">
                                {doc.original_filename}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-gray-400">
                                    {(doc.file_size / 1024).toFixed(0)} KB
                                </span>
                                <span className="text-[11px] text-gray-300">•</span>
                                <span className="text-[11px] text-gray-400">
                                    {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        {/* View Button */}
                        <a
                            href={`/requirements/${doc.id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            <FileText className="h-3.5 w-3.5" />
                            View
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Component to show requirements that were NOT uploaded
function MissingRequirementCard({ requirement, isChecked, onToggle }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                        {requirement.name}
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">
                        Not uploaded
                    </p>
                </div>
                
                {/* Toggle Switch */}
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                    <Switch
                        checked={isChecked || false}
                        onCheckedChange={onToggle}
                        className="data-[state=checked]:bg-green-600"
                        disabled
                    />
                    <span className="text-[9px] font-medium text-gray-400">
                        Off
                    </span>
                </div>
            </div>
        </div>
    );
}
