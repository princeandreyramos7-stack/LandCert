import { SuperAdminSidebar } from "@/Components/super-admin-sidebar";
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
    DollarSign,
    Home,
    FileText,
    CalendarDays,
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Check,
    Shield,
    UserCog,
    MessageSquare,
    Loader2,
    History,
    Edit2,
    Save,
} from "lucide-react";
import { formatDate } from "@/Components/Admin/Request/utils";
import { useState, useMemo } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";
import axios from "axios";

export default function SuperAdminReviewRequest({ request }) {
    const [currentStep, setCurrentStep] = useState(1);
    
    // Pre-select action based on current request status
    const getInitialAction = () => {
        if (request.status === 'approved') {
            return 'approved';
        } else if (request.status === 'rejected') {
            return 'rejected';
        }
        return '';
    };
    
    const [action, setAction] = useState(getInitialAction());

    // Once approved (or the certificate flow has started), the decision is final and
    // can no longer be flipped to denied.
    const decisionLocked = ['approved', 'certificate_preparing', 'certificate_ready', 'released']
        .includes(String(request.status || '').toLowerCase());

    // Whether the Zoning Officer has already marked the application reviewed.
    // If not, the Zoning Administrator reviews AND decides in one step.
    const officerReviewed = String(request.status || '').toLowerCase() === 'reviewed';

    const [formData, setFormData] = useState({
        rejection_reason: request.rejection_reason || 'Lacking of Requirements', // Use existing or default
        assign_to_admin: false,
        payment_amount: request.payment_amount ? String(request.payment_amount) : '',
    });
    const [loading, setLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    
    // Track which requirements are verified/correct - Load from database
    const [requirementChecks, setRequirementChecks] = useState(request.verified_requirements || {});
    
    const { toast} = useToast();
    
    // Save requirement checks to database whenever they change
    const handleToggleRequirement = async (key, name, checked) => {
        const updated = {
            ...requirementChecks,
            [key]: checked
        };
        
        setRequirementChecks(updated);
        
        // Save to database
        try {
            await axios.post(route('super-admin.save-requirement-verification'), {
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
    // as one entry with all of its files listed, instead of duplicate-looking cards.
    // Also split into "Main" vs "Additional" sections using requirements_reference
    // (the full requirement list for this project type) so this matches what the
    // applicant saw when uploading.
    // UPDATED: Now shows ALL requirements, not just uploaded ones
    const groupedRequirements = useMemo(() => {
        const docs = request.uploaded_requirements || [];
        const reference = request.requirements_reference || [];
        
        console.log('=== SuperAdmin ReviewRequest Debug ===');
        console.log('Uploaded requirements:', docs);
        console.log('Requirements reference:', reference);
        
        // Create groups for ALL requirements from reference
        const groups = new Map();
        
        // First, add all requirements from reference (even if not uploaded)
        reference.forEach((req) => {
            groups.set(req.id, {
                key: req.id,
                requirement_name: req.name,
                section: req.section || 'main',
                files: [],
                required: req.required || false,
            });
        });
        
        // Then, populate files for requirements that were uploaded
        docs.forEach((doc) => {
            const key = doc.requirement_id;
            if (groups.has(key)) {
                groups.get(key).files.push(doc);
            } else {
                // Fallback for documents without proper requirement_id
                groups.set(doc.requirement_name, {
                    key: doc.requirement_name,
                    requirement_name: doc.requirement_name,
                    section: 'main',
                    files: [doc],
                    required: false,
                });
            }
        });

        const result = Array.from(groups.values());
        console.log('Grouped requirements (ALL):', result);
        
        return result;
    }, [request.uploaded_requirements, request.requirements_reference]);

    const mainUploadedGroups = groupedRequirements.filter((g) => g.section !== 'additional');
    const additionalUploadedGroups = groupedRequirements.filter((g) => g.section === 'additional');

    // Generate missing requirements message for denial
    const getMissingRequirements = () => {
        const allGroups = [...mainUploadedGroups, ...additionalUploadedGroups];
        const missing = allGroups.filter(group => !requirementChecks[group.key]);
        
        if (missing.length === 0) return '';
        
        return 'Missing or Incomplete Requirements:\n' + 
               missing.map(group => `- ${group.requirement_name}`).join('\n');
    };

    // Update denial reason when action changes to denied
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (decisionLocked) {
            toast({
                variant: "destructive",
                title: "Decision Locked",
                description: "This application has already been approved. The decision can no longer be changed.",
            });
            return;
        }

        if (action === 'approved' && !officerReviewed) {
            const amount = parseFloat(formData.payment_amount);
            if (!formData.payment_amount || Number.isNaN(amount) || amount < 0) {
                toast({
                    variant: "destructive",
                    title: "Treasury fee required",
                    description: "Enter the amount the applicant must pay at the Treasury before approving.",
                });
                return;
            }
        }

        setShowConfirmDialog(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmDialog(false);
        setLoading(true);

        try {
            let endpoint;
            let payload;
            if (officerReviewed) {
                endpoint = action === 'approved'
                    ? route('super-admin.approve-request', request.report_id)
                    : route('super-admin.reject-request', request.report_id);
                payload = {
                    description: action === 'rejected' ? formData.rejection_reason : 'Application approved by Super Admin',
                    issued_by: 'Super Admin',
                    assign_to_admin: formData.assign_to_admin,
                };
            } else {
                // The officer has not reviewed — review AND decide in one step.
                endpoint = route('super-admin.review-and-decide', request.id);
                payload = action === 'approved'
                    ? { action: 'approved', payment_amount: formData.payment_amount }
                    : { action: 'rejected', rejection_reason: formData.rejection_reason };
            }

            await axios.post(endpoint, payload);

            toast({
                title: "Success!",
                description: `Application ${action === 'approved' ? 'approved' : 'rejected'} successfully!`,
            });
            
            setTimeout(() => {
                router.visit(route('super-admin.requests'));
            }, 1500);
        } catch (error) {
            console.error('Review failed:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to submit review.",
            });
        } finally {
            setLoading(false);
        }
    };

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
                label: "Denied",
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

    const steps = [
        { number: 1, title: "Applicant Info", icon: User },
        { number: 2, title: "Project Details", icon: Building2 },
        { number: 3, title: "Land Use", icon: Home },
        { number: 4, title: "Requirements", icon: FileText },
    ];

    return (
        <SidebarProvider>
            <Head title={`Review ${request.application_number || `TPZ-${request.id}`} - Zoning Administrator`} />
            <SuperAdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-white">
                    <div className="flex items-center gap-2 px-4 w-full">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <Link
                                        href={route("super-admin.dashboard")}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span className="mx-2 text-gray-400">›</span>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <Link
                                        href={route("super-admin.requests")}
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        Requests
                                    </Link>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <span className="mx-2 text-gray-400">›</span>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{request.application_number || `TPZ-${request.id}`}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-6 bg-gray-50 min-h-screen">
                    <div className="max-w-7xl mx-auto w-full">
                        {/* Back Button */}
                        <div className="mb-4">
                            <Link href={route("super-admin.requests")}>
                                <Button variant="outline" size="sm" className="hover:bg-gray-100">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Requests
                                </Button>
                            </Link>
                        </div>

                        {/* Super Admin Badge */}
                        <div className="mb-4 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-600">Super Admin Review Mode</span>
                        </div>

                        {/* Application Details Card */}
                        <Card className="mb-6 border">
                            <CardHeader className="bg-white border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <FileText className="h-6 w-6 text-gray-600" />
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
                                <StepIndicator
                                    steps={steps}
                                    currentStep={currentStep}
                                    onStepClick={setCurrentStep}
                                />

                                <div className="mt-8">
                                    {currentStep === 1 && <Step1Content request={request} />}
                                    {currentStep === 2 && <Step2Content request={request} />}
                                    {currentStep === 3 && <Step3Content request={request} />}
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

                        {/* Super Admin Review Form */}
                        <Card className="border">
                            <CardHeader className="bg-white border-b">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Shield className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <CardTitle className="text-2xl text-gray-900">
                                        Super Admin Decision
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {/* No Requirements Message */}
                                {(!request.uploaded_requirements || request.uploaded_requirements.length === 0) && (
                                    <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm text-amber-800">
                                            <p className="font-semibold">No Requirements Uploaded</p>
                                            <p className="text-xs mt-1">The applicant has not uploaded any requirement documents yet.</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Previous Decision Banner */}
                                {getInitialAction() && (
                                    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <History className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-900">Previous Decision</h4>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    This application was previously <span className="font-bold">
                                                        {request.status === 'approved' ? 'APPROVED' : 'DENIED'}
                                                    </span>.
                                                    {request.rejection_reason && ` Reason: "${request.rejection_reason}"`}
                                                    <br />
                                                    <span className="text-xs">
                                                        {decisionLocked
                                                            ? 'This decision is final and can no longer be changed.'
                                                            : 'You can modify the decision below. Changes will be logged in audit trail.'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* The officer has not reviewed yet — the Administrator does both steps here. */}
                                {!officerReviewed && !decisionLocked && (
                                    <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-900">Review &amp; decide in one step</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                The Zoning Officer has not reviewed this application yet. You can review it
                                                and approve or deny it now — set the Treasury fee below when approving.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Action Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                                            Final Decision <span className="text-red-500">*</span>
                                        </label>
                                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${decisionLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                                            <label className={`relative flex items-center p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                                action === 'approved'
                                                    ? 'border-green-500 bg-green-50 shadow-md'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="action"
                                                    value="approved"
                                                    checked={action === 'approved'}
                                                    onChange={(e) => handleActionChange(e.target.value)}
                                                    disabled={decisionLocked}
                                                    className="w-5 h-5 text-green-600"
                                                    required
                                                />
                                                <div className="ml-3">
                                                    <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        APPROVE
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`relative flex items-center p-5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                                action === 'rejected' 
                                                    ? 'border-red-500 bg-red-50 shadow-md' 
                                                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="action"
                                                    value="rejected"
                                                    checked={action === 'rejected'}
                                                    onChange={(e) => handleActionChange(e.target.value)}
                                                    disabled={decisionLocked}
                                                    className="w-5 h-5 text-red-600"
                                                    required
                                                />
                                                <div className="ml-3">
                                                    <div className="flex items-center gap-2 font-semibold text-red-700 text-base">
                                                        <XCircle className="h-5 w-5" />
                                                        DENIED
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Approved Form */}
                                    {action === 'approved' && (
                                        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                                            {/* Treasury fee — required when the officer has not set one */}
                                            {!officerReviewed && (
                                                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                                                        Amount to Pay at the Treasury <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative max-w-xs">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={formData.payment_amount}
                                                            onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                                                            placeholder="0.00"
                                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:border-green-400 focus:ring-1 focus:ring-green-400"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        The applicant will be asked to pay this amount at the Treasury Office.
                                                    </p>
                                                </div>
                                            )}

                                            {/* Assign to Admin */}
                                            <div className="flex items-center gap-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    id="assign_to_admin"
                                                    checked={formData.assign_to_admin}
                                                    onChange={(e) => setFormData({ ...formData, assign_to_admin: e.target.checked })}
                                                    className="w-5 h-5 text-gray-600 rounded focus:ring-gray-500"
                                                />
                                                <label htmlFor="assign_to_admin" className="flex items-center gap-2 cursor-pointer">
                                                    <UserCog className="h-5 w-5 text-gray-600" />
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        Immediately assign to Admin for further processing
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Deny Form */}
                                    {action === 'rejected' && (
                                        <div className="animate-in slide-in-from-top-2 duration-300">
                                            <div className="bg-white rounded-lg p-5 border-2 border-gray-200">
                                                <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                    Denial Reason <span className="text-red-500">*</span>
                                                </label>
                                                
                                                <textarea
                                                    value={formData.rejection_reason}
                                                    onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                                                    rows="5"
                                                    required
                                                    maxLength="1000"
                                                    placeholder="Provide a comprehensive reason for denial..."
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all resize-none"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {formData.rejection_reason.length}/1000 characters
                                                </p>

                                                {/* Quick Reasons */}
                                                <div className="mt-4">
                                                    <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            'Non-compliant with regulations',
                                                            'Incomplete documentation',
                                                            'Location not zoned for this use',
                                                            'Policy violation',
                                                            'Environmental concerns'
                                                        ].map((reason) => (
                                                            <button
                                                                key={reason}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, rejection_reason: reason })}
                                                                className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                                            >
                                                                {reason}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Link href={route('super-admin.requests')}>
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
                                            disabled={loading || !action || decisionLocked}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : decisionLocked ? (
                                                <>
                                                    Decision Final
                                                </>
                                            ) : (
                                                <>
                                                    Submit Decision
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
            
            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="px-6 py-5 border-b">
                            <h3 className="text-xl font-bold text-gray-900">
                                Confirm Your Decision
                            </h3>
                        </div>
                        
                        <div className="px-6 py-5">
                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">
                                    {action === 'approved' ? (
                                        <>
                                            You are about to <span className="font-bold text-green-600">APPROVE</span> this application.
                                            <p className="mt-3 text-sm text-gray-600">
                                                The applicant will be notified and can proceed to the payment stage.
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            You are about to <span className="font-bold text-red-600">DENY</span> this application:
                                            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <p className="text-sm text-gray-700 italic">
                                                    "{formData.rejection_reason || 'No reason provided'}"
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </p>
                                
                                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Note:</span> The applicant will be notified immediately via email.
                                    </p>
                                </div>
                            </div>
                            
                            <p className="text-center font-medium text-gray-900 mb-4">
                                Do you want to proceed?
                            </p>
                            
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="flex-1 border-2 hover:bg-gray-100"
                                    disabled={loading}
                                >
                                    No, Go Back
                                </Button>
                                <Button
                                    type="button"
                                    onClick={confirmSubmit}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>Yes, Confirm</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <Toaster />
        </SidebarProvider>
    );
}

// Step Indicator Component (same as Admin version)
function StepIndicator({ steps, currentStep, onStepClick }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between relative">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                    <div
                        className="h-full bg-gray-600 transition-all duration-500"
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

// Step Content Components (reuse from Admin version)
function Step1Content({ request }) {
    return (
        <div className="space-y-6">
            <SectionTitle icon={User} title="Applicant Information" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Name of Applicant" value={request.applicant_name} />
                <InfoField label="Address of Applicant" value={request.applicant_address} />
            </div>

            {request.corporation_name && (
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Corporation Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField label="Name of Corporation" value={request.corporation_name} />
                        <InfoField label="Address of Corporation" value={request.corporation_address} />
                    </div>
                </div>
            )}

            {request.authorized_representative_name && (
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Authorized Representative</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField label="Name" value={request.authorized_representative_name} />
                        <InfoField label="Address" value={request.authorized_representative_address} />
                    </div>
                    {request.authorization_letter_path && (
                        <div className="mt-4">
                            <a
                                href={`/requests/${request.application_id || request.id}/authorization-letter`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                                <FileText className="h-4 w-4" />
                                View Authorization Letter
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

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
                description: "Locational Clearance updated successfully.",
            });
            setEditingProjectType(false);
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
                {/* EDITABLE LOCATIONAL CLEARANCE */}
                <div className="group">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Locational Clearance
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
                <InfoField label="Project Nature" value={request.project_nature} />
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Project Location
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Street" value={request.project_location_street} />
                    <InfoField label="Barangay" value={request.project_location_barangay} />
                    <InfoField label="Municipality" value={request.project_location_municipality} />
                    <InfoField label="Province" value={request.project_location_province} />
                </div>
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Project Area</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        label="Lot (sqm)"
                        value={request.lot_area_sqm ? `${parseFloat(request.lot_area_sqm).toLocaleString()} sqm` : "N/A"}
                    />
                    <InfoField
                        label="Building (sqm)"
                        value={request.bldg_improvement_sqm ? `${parseFloat(request.bldg_improvement_sqm).toLocaleString()} sqm` : "N/A"}
                    />
                    <InfoField label="Right Over Land" value={request.right_over_land} />
                    <InfoField
                        label="Project Cost"
                        value={request.project_cost ? `₱${parseFloat(request.project_cost).toLocaleString()}` : "N/A"}
                    />
                </div>
            </div>
        </div>
    );
}

function Step3Content({ request }) {
    return (
        <div className="space-y-6">
            <SectionTitle icon={Home} title="Land Use Information" />
            
            <InfoField label="Existing Land Use" value={request.existing_land_use} />

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Written Notice</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Has Written Notice" value={request.has_written_notice?.toUpperCase()} />
                    {request.has_written_notice === "yes" && (
                        <>
                            <InfoField label="Officer Name" value={request.notice_officer_name} />
                            <InfoField label="Notice Dates" value={request.notice_dates} />
                        </>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Similar Applications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Has Similar Application" value={request.has_similar_application?.toUpperCase()} />
                    {request.has_similar_application === "yes" && (
                        <>
                            <InfoField label="Other Offices" value={request.similar_application_offices} />
                            <InfoField label="Dates Filed" value={request.similar_application_dates} />
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

function SectionTitle({ icon: Icon, title }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="h-5 w-5 text-gray-600" />
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
    const hasFiles = group.files && group.files.length > 0;
    
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

            {/* Show files only if uploaded */}
            {hasFiles && (
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
            )}
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
