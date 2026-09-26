import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import { RequirementsChecklist } from "@/Components/RequirementsTable";
import OfficerDecision from "@/Components/Applications/OfficerDecision";
import {
    User,
    Building2,
    MapPin,
    Home,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Check,
    Edit2,
    Save,
    Loader2,
    Printer,
    FileCheck,
    ArrowLeft,
    Sparkles,
    History,
    Upload,
    Download,
    Eye,
    X,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";
import axios from "axios";
import { getStatusConfig } from "@/lib/applicationStatus";
import { DocumentViewLink } from "@/Components/DocumentViewLink";

/**
 * Display-only formatting for peso amount fields.
 */
const formatAmountForDisplay = (rawValue) => {
    if (rawValue === null || rawValue === undefined || rawValue === "") return "";
    const raw = String(rawValue);
    const [integerPart, ...decimalParts] = raw.split(".");
    const hasDecimalPoint = raw.includes(".");
    const groupedInteger = integerPart === "" ? "" : Number(integerPart).toLocaleString("en-US");
    return hasDecimalPoint ? `${groupedInteger}.${decimalParts.join("")}` : groupedInteger;
};

/**
 * Strips the display formatting back down to a plain number string.
 */
const parseAmountInput = (displayValue) => {
    let cleaned = String(displayValue).replace(/[^\d.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
        const integerPart = cleaned.slice(0, firstDot);
        const decimalPart = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
        cleaned = `${integerPart}.${decimalPart}`;
    }
    return cleaned;
};


export default function ViewApplication({ request, uploadedRequirements = [] }) {
    const { toast } = useToast();
    
    // Auto-refresh every 30 seconds to show new uploads/changes
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['request', 'uploadedRequirements'], preserveScroll: true });
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, []);
    
    // ============================================
    // STATE FROM ViewApplication (Application Details)
    // ============================================
    const [currentStep, setCurrentStep] = useState(1);
    const [editingProjectCost, setEditingProjectCost] = useState(false);
    const [projectCost, setProjectCost] = useState(
        request.project_cost === null || request.project_cost === undefined ? '' : String(request.project_cost)
    );
    const [savingProjectCost, setSavingProjectCost] = useState(false);

    // Editable Application Number
    const [editingAppNumber, setEditingAppNumber] = useState(false);
    const [appNumber, setAppNumber] = useState(request.application_number || '');
    const [savingAppNumber, setSavingAppNumber] = useState(false);

    // Editable Project Type
    const [editingProjectType, setEditingProjectType] = useState(false);
    const [projectType, setProjectType] = useState(request.project_type || '');
    const [savingProjectType, setSavingProjectType] = useState(false);

    // ============================================
    // STATE FROM DocumentVerification (Requirements)
    // ============================================
    const [selectedRequirements, setSelectedRequirements] = useState(() => {
        return request.verified_requirements || {};
    });

    // What "Mark as Reviewed" needs: the lot number (the "Title Number
    // (TCT/CCT)" field) and the tax declaration number, as the applicant
    // supplied them at submission - Property Details is read-only now, so
    // these never change after the page loads. Read from lot_number, not
    // title_number, matching Property Details' own display.
    const titleNumber = request.lot_number || request.title_number || "";
    const taxDecNo = request.tax_declaration_no || "";
    const [showAutoFillSuggestion, setShowAutoFillSuggestion] = useState(false);

    // "Document Verification" in the applications menu and the workflow
    // notifications land here with ?section=requirements (a query, not a
    // fragment: the id-bearing link redirects to this clean address, and a
    // fragment does not survive that under Inertia). The checklist is rendered
    // by React after load, so the scroll has to happen here, not in the browser.
    useEffect(() => {
        const wanted =
            new URLSearchParams(window.location.search).get("section") === "requirements" ||
            window.location.hash === "#requirements";
        if (!wanted) return;
        document.getElementById("requirements")?.scrollIntoView({ block: "start" });
    }, []);

    // ============================================
    // COMMON COMPUTED VALUES
    // ============================================
    const statusConfig = getStatusConfig(request.status || "pending");
    const StatusIcon = statusConfig.icon;
    const isZC = String(request.project_type || "").toUpperCase() === "ZC";
    
    const steps = [
        { number: 1, title: "Applicant Info", icon: User },
        { number: 2, title: "Project Details", icon: Building2 },
        ...(isZC ? [] : [{ number: 3, title: "Land Use", icon: Home }]),
    ];


    // ============================================
    // EVENT HANDLERS - Application Details
    // ============================================
    const handleSaveProjectCost = async () => {
        setSavingProjectCost(true);
        try {
            await axios.post(`/admin/requests/${request.id}/application-details`, {
                project_cost: projectCost === '' ? null : projectCost,
            });
            request.project_cost = projectCost === '' ? null : projectCost;
            toast({
                title: "Success!",
                description: "Project cost updated successfully.",
            });
            setEditingProjectCost(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description:
                    error.response?.data?.errors?.project_cost?.[0] ||
                    "Failed to update the project cost.",
            });
        } finally {
            setSavingProjectCost(false);
        }
    };

    const handleSaveAppNumber = async () => {
        setSavingAppNumber(true);
        try {
            await axios.post(`/admin/requests/${request.id}/application-details`, {
                application_number: appNumber,
            });
            request.application_number = appNumber;
            toast({
                title: "Success!",
                description: "Application number updated successfully.",
            });
            setEditingAppNumber(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to update application number.",
            });
        } finally {
            setSavingAppNumber(false);
        }
    };

    const handleSaveProjectType = async () => {
        setSavingProjectType(true);
        try {
            // update-project-type, not application-details: the latter only
            // knows the application number and project cost and dropped the
            // type on the floor, so "Mark as Reviewed" kept refusing for want
            // of an Application Type the officer had just saved.
            await axios.post(`/admin/update-project-type/${request.id}`, {
                project_type: projectType,
            });
            request.project_type = projectType;
            toast({
                title: "Success!",
                description: "Application type updated successfully.",
            });
            setEditingProjectType(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description:
                    error.response?.data?.errors?.project_type?.[0] ||
                    error.response?.data?.message ||
                    "Failed to update the application type.",
            });
        } finally {
            setSavingProjectType(false);
        }
    };

    // ============================================
    // EVENT HANDLERS - Requirements Verification
    // ============================================
    // Each toggle is saved as it is flipped. Only the checklist goes here: the
    // lot and tax numbers are saved by Property Details (certificate-details).
    const handleRequirementChange = async (reqId, reqName, isChecked) => {
        const updated = { ...selectedRequirements, [reqId]: isChecked };
        setSelectedRequirements(updated);

        try {
            await axios.post(`/admin/requests/${request.id}/verify-requirements`, {
                verified_requirements: updated,
            });
        } catch (error) {
            console.error('Error saving requirement verification:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save the requirement's verified status.",
            });
        }
    };


    // ============================================
    // RENDER
    // ============================================
    return (
        <AdminLayout 
            title="View Application"
            breadcrumbs={[
                { label: "Dashboard", href: "/admin/dashboard" },
                { label: "Applications", href: "/admin/requests" },
            ]}
        >
            <Head title={`View Application ${request.application_number || `TPZ-${request.id}`}`} />

            <div className="max-w-7xl mx-auto">
                {/* ============================================ */}
                {/* SECTION 1: APPLICATION DETAILS */}
                {/* ============================================ */}
                <div>

                        {/* The application form: printed, or saved as a file
                            that keeps this layout wherever it is opened. */}
                            <div className="mb-4 flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-gray-100"
                                    onClick={() => router.visit(route('admin.requests'))}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Applications
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-gray-100"
                                    onClick={() => window.open(route('admin.requests.print', request.id), '_blank')}
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Form
                                </Button>
                                {/* The same page, told to save itself: the file
                                    it writes keeps this layout in any program. */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-gray-100"
                                    onClick={() => window.open(route('admin.requests.print', request.id) + '?download=1', '_blank')}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Form
                                </Button>
                            </div>

                        {/* Application Details Card */}
                        <Card className="mb-6">
                            <CardHeader className="bg-white border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <FileText className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            {!editingAppNumber ? (
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-2xl text-gray-900">
                                                        {appNumber || `TPZ-${request.id}`}
                                                    </CardTitle>
                                                    <button
                                                        onClick={() => setEditingAppNumber(true)}
                                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        <Edit2 className="h-3 w-3" />
                                                        Edit
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={appNumber}
                                                        onChange={(e) => setAppNumber(e.target.value)}
                                                        placeholder="e.g. TPZ-09-26-0004"
                                                        className="text-xl font-bold border-2 border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <button
                                                        onClick={handleSaveAppNumber}
                                                        disabled={savingAppNumber}
                                                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50"
                                                    >
                                                        {savingAppNumber ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Save className="h-3 w-3" />
                                                        )}
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setAppNumber(request.application_number || '');
                                                            setEditingAppNumber(false);
                                                        }}
                                                        disabled={savingAppNumber}
                                                        className="text-xs text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
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
                                        <Step1Content request={request} isZC={isZC} />
                                    )}
                                    {currentStep === 2 && (
                                        <Step2Content 
                                            request={request} 
                                            uploadedRequirements={uploadedRequirements}
                                            editingProjectCost={editingProjectCost}
                                            setEditingProjectCost={setEditingProjectCost}
                                            projectCost={projectCost}
                                            setProjectCost={setProjectCost}
                                            handleSaveProjectCost={handleSaveProjectCost}
                                            savingProjectCost={savingProjectCost}
                                            isZC={isZC}
                                            editingProjectType={editingProjectType}
                                            setEditingProjectType={setEditingProjectType}
                                            projectType={projectType}
                                            setProjectType={setProjectType}
                                            handleSaveProjectType={handleSaveProjectType}
                                            savingProjectType={savingProjectType}
                                        />
                                    )}
                                    {currentStep === 3 && !isZC && (
                                        <Step3Content request={request} />
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
                                        className="bg-[#0d1f5c] hover:bg-[#0d1f5c]/90 text-white"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                {/* ============================================ */}
                {/* SECTION 2: REQUIREMENTS VERIFICATION (BOTTOM) */}
                {/* ============================================ */}
                <div id="requirements" className="scroll-mt-20">
                        {/* Requirements Checklist */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileCheck className="h-5 w-5" />
                                    Required Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RequirementsChecklist request={request} uploadedRequirements={uploadedRequirements} selectedRequirements={selectedRequirements} onRequirementChange={handleRequirementChange} userRole="admin" />
                            </CardContent>
                        </Card>

                        {/* The Zoning Officer's decision: Mark as Reviewed (with the
                            Treasury fee) or Denied. See Components/Applications/OfficerDecision. */}
                        <OfficerDecision
                            request={request}
                            projectType={projectType}
                            lotNumber={titleNumber}
                            taxDeclarationNo={taxDecNo}
                            verifiedRequirements={selectedRequirements}
                            uploadedRequirements={uploadedRequirements}
                        />
                    </div>

            </div>

            <Toaster />
        </AdminLayout>
    );
}


// ============================================================================
// HELPER COMPONENTS FROM VIEWAPPLICATION.JSX
// ============================================================================

const RELEASE_MODE_LABELS = {
    pickup: "Pick up at CPDO office",
    mail_applicant: "Mail to applicant's address",
    mail_representative: "Mail to representative's address",
    mail_other: "Mail to another address",
};

// Step Indicator Component
function StepIndicator({ steps, currentStep, onStepClick }) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8 relative">
                {/* Progress Line - Behind the icons */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0">
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
                            className="flex flex-col items-center flex-1 cursor-pointer relative z-10"
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

// Section Title Component
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

// Info Field Component
function InfoField({ label, value, num }) {
    return (
        <div className="group">
            <p className="mb-1.5 flex items-baseline gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {num && (
                    <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-bold tabular-nums text-gray-600">
                        {num}
                    </span>
                )}
                <span>{label}</span>
            </p>
            <p className="text-sm text-gray-900 font-medium">
                {value || <span className="text-gray-400 italic">Not provided</span>}
            </p>
        </div>
    );
}

// Edit Field Component
function EditField({ label, value, onChange, placeholder }) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                {label}
            </p>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
}

// Step 1: Applicant Information
function Step1Content({ request, isZC = false }) {
    const n = isZC
        ? { name: "1", address: "2", contact: "3", email: "4" }
        : { name: "1", address: "3", contact: "3a", email: "3b" };

    return (
        <div className="space-y-6">
            <SectionTitle icon={User} title="Applicant Information" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField
                    num={n.name}
                    label="Name of Applicant"
                    value={request.applicant_name}
                />
                <InfoField
                    num={n.address}
                    label="Address of Applicant"
                    value={request.applicant_address}
                />
                <InfoField
                    num={n.contact}
                    label="Contact Number"
                    value={request.applicant_contact}
                />
                <InfoField
                    num={n.email}
                    label="Email Address"
                    value={request.user_email}
                />
            </div>

            {request.corporation_name && (
                <>
                    <div className="pt-4 border-t">
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Corporation Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoField
                                num={isZC ? null : "2"}
                                label="Name of Corporation"
                                value={request.corporation_name}
                            />
                            <InfoField
                                num={isZC ? null : "4"}
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
                                num={isZC ? null : "5"}
                                label="Name of Authorized Representative"
                                value={request.authorized_representative_name}
                            />
                            <InfoField
                                num={isZC ? null : "6"}
                                label="Address of Authorized Representative"
                                value={request.authorized_representative_address}
                            />
                            <InfoField
                                label="Email of Authorized Representative"
                                value={request.authorized_representative_email}
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

// Step 2: Project Details
function Step2Content({ request, uploadedRequirements = [], editingProjectCost, setEditingProjectCost, projectCost, setProjectCost, handleSaveProjectCost, savingProjectCost, isZC = false, editingProjectType, setEditingProjectType, projectType, setProjectType, handleSaveProjectType, savingProjectType }) {
    return (
        <div className="space-y-6">
            <SectionTitle icon={Building2} title="Project Details" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* EDITABLE PROJECT TYPE */}
                <div className="group">
                    <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <span className="mr-1.5 rounded bg-gray-100 px-1.5 py-0.5 font-bold tabular-nums text-gray-600">{isZC ? "5" : "7"}</span>
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
                            <option value="">Select type...</option>
                            <option value="ZC">ZC - Zoning Certification</option>
                            <option value="CZC">CZC - Certificate of Zoning Compliance</option>
                            <option value="TUP">TUP - Temporary Use Permit</option>
                        </select>
                    ) : (
                        <p className="text-sm text-gray-900 font-medium">
                            {projectType || <span className="text-gray-400 italic">Not set</span>}
                        </p>
                    )}
                </div>

                {!isZC && (
                    <InfoField
                        num="8"
                        label="Project Nature"
                        value={request.project_nature}
                    />
                )}
            </div>

            {!isZC && (
                <>
            <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-gray-600">9</span>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField
                            num="10"
                            label="Project Area — Lot (sqm)"
                            value={
                                request.lot_area_sqm
                                    ? `${parseFloat(request.lot_area_sqm).toLocaleString()} sqm`
                                    : "N/A"
                            }
                        />
                        <InfoField
                            num="10"
                            label="Project Area — Bldg. Improvement (sqm)"
                            value={
                                request.bldg_improvement_sqm
                                    ? `${parseFloat(request.bldg_improvement_sqm).toLocaleString()} sqm`
                                    : "N/A"
                            }
                        />
                        <InfoField
                            num="11"
                            label="Right Over Land"
                            value={request.right_over_land}
                        />
                    </div>
                </div>
    
    </>
            )}

            <PropertyDetailsEditor request={request} isZC={isZC} />

            {!isZC && (
                <>
            <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Project Nature & Cost</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoField
                            num="12"
                            label="Project Tenure"
                            value={request.project_nature_duration}
                        />
                        {request.project_nature_years && (
                            <InfoField
                                num="12"
                                label="Tenure — Specify Years"
                                value={`${request.project_nature_years} ${Number(request.project_nature_years) === 1 ? "year" : "years"}`}
                            />
                        )}
                        <div className="group">
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    <span className="mr-1.5 rounded bg-gray-100 px-1.5 py-0.5 font-bold tabular-nums text-gray-600">14</span>
                                    Project Cost/Capitalization (in pesos)
                                </p>
                            </div>
                            <p className="text-sm text-gray-900 font-medium">
                                {request.project_cost !== null && request.project_cost !== undefined && request.project_cost !== ''
                                    ? `₱${parseFloat(request.project_cost).toLocaleString()}`
                                    : <span className="text-gray-400 italic">Not set</span>}
                            </p>
                        </div>
                    </div>
                </div>
    </>
            )}
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
                    num="13"
                    label="Existing Land Uses of Project Site"
                    value={request.existing_land_use}
                />
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4"><span className="mr-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-gray-600">15</span>Written Notice from Office/Zoning Administrator</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        num="15"
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
                                num="15a"
                                label="Name of HSRC Officer/Zoning Administrator"
                                value={request.notice_officer_name}
                            />
                            <InfoField
                                num="15b"
                                label="Date(s) of Notice(s)"
                                value={request.notice_dates}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4"><span className="mr-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-gray-600">16</span>Similar Application with Other Offices</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        num="16"
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
                                num="16a"
                                label="Other HSRC Office(s) Where Filed"
                                value={request.similar_application_offices}
                            />
                            <InfoField
                                num="16b"
                                label="Date(s) Filed"
                                value={request.similar_application_dates}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-4"><span className="mr-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-gray-600">17</span>Release of Certificate</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField
                        num="17"
                        label="Preferred Release Mode"
                        value={RELEASE_MODE_LABELS[request.preferred_release_mode] || request.preferred_release_mode}
                    />
                </div>
            </div>
        </div>
    );
}

// Property Details - read-only. The applicant supplies the Lot Number and
// Tax Declaration No. at submission (Step 1/2 of the request form), so
// there is nothing left for the office to type in here; this mirrors
// SuperAdmin's already-read-only version of the same panel.
function PropertyDetailsEditor({ request, isZC = false }) {
    const missingRequired = !request.lot_number && !request.tax_declaration_no;

    return (
        <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">
                    {isZC && (
                        <span className="mr-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-gray-600">6</span>
                    )}
                    Property Details
                </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField label="Title Number (TCT/CCT)" value={request.lot_number} />
                <InfoField label="Tax Declaration No." value={request.tax_declaration_no} />
            </div>

            {missingRequired && (
                <div className="mt-3 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                        Title Number (TCT/CCT) and Tax Declaration No. must be set before this application
                        can be marked as reviewed.
                    </span>
                </div>
            )}
        </div>
    );
}


// ============================================================================
// HELPER COMPONENTS FROM DOCUMENTVERIFICATION.JSX
// ============================================================================

