import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
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
    Edit2,
    Save,
    Loader2,
    Printer,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";
import axios from "axios";

export default function ViewApplication({ request }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [editingProjectType, setEditingProjectType] = useState(false);
    const [projectType, setProjectType] = useState(request.project_type || '');
    const [savingProjectType, setSavingProjectType] = useState(false);
    const { toast } = useToast();

    const handleSaveProjectType = async () => {
        setSavingProjectType(true);
        try {
            await axios.post(`/super-admin/update-project-type/${request.id}`, {
                project_type: projectType
            });
            toast({
                title: "Success!",
                description: "Project type updated successfully.",
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

    // Define steps (only 1-3)
    const steps = [
        { number: 1, title: "Applicant Info", icon: User },
        { number: 2, title: "Project Details", icon: Building2 },
        { number: 3, title: "Land Use", icon: Home },
    ];

    return (
        <SuperAdminLayout 
            title="View Application" 
            breadcrumbs={[
                { label: "Dashboard", href: "/super-admin/dashboard" }, 
                { label: "Applications", href: "/super-admin/requests" },
                { label: "View Application" }
            ]}
        >
            <Head title={`View Application ${request.application_number || `TPZ-${request.id}`}`} />

            <div className="max-w-7xl mx-auto">
                {/* Back Button and Print Form Button */}
                <div className="mb-4 flex gap-3">
                    <Link href={route("super-admin.requests")}>
                        <Button variant="outline" size="sm" className="hover:bg-gray-100">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Applications
                        </Button>
                    </Link>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-gray-100"
                        onClick={() => window.open(route('super-admin.requests.print', request.id), '_blank')}
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Form
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
                                <Step2Content 
                                    request={request} 
                                    editingProjectType={editingProjectType}
                                    setEditingProjectType={setEditingProjectType}
                                    projectType={projectType}
                                    setProjectType={setProjectType}
                                    handleSaveProjectType={handleSaveProjectType}
                                    savingProjectType={savingProjectType}
                                />
                            )}
                            {currentStep === 3 && (
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
                            >
                                Next
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <Toaster />
        </SuperAdminLayout>
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

// Step 2: Project Details
function Step2Content({ request, editingProjectType, setEditingProjectType, projectType, setProjectType, handleSaveProjectType, savingProjectType }) {
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
