import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { useToast } from "@/Components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { FileText } from "lucide-react";

// Local Components
import { CategorySelection } from "./CategorySelection";
import { StepIndicator } from "./StepIndicator";
import { Step1ApplicantInfo } from "./Step1ApplicantInfo";
import { Step2ProjectDetails } from "./Step2ProjectDetails";
import { Step3LandUse } from "./Step3LandUse";
import { FormNavigation } from "./FormNavigation";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { validateStep1, validateStep2, validateStep3 } from "./utils";

export default function RequestForm() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [hasRepresentative, setHasRepresentative] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const { toast } = useToast();
    const page = usePage();
    const flash = page.props.flash || {};

    const { data, setData, post, processing, errors, reset } = useForm({
        // Step 1: Applicant Information
        applicant_name: "",
        corporation_name: "",
        applicant_address: "",
        corporation_address: "",
        authorized_representative_name: "",
        authorized_representative_address: "",
        authorized_representative_email: "",
        authorization_letter: null,

        // Step 2: Project Details
        project_type: "",
        project_nature: "",
        project_location_number: "",
        project_location_street: "",
        project_location_barangay: "",
        project_location_municipality: "City of Ilagan",
        project_location_province: "Isabela",
        project_area_sqm: "",
        lot_area_sqm: "",
        bldg_improvement_sqm: "",
        right_over_land: "",
        project_nature_duration: "",
        project_nature_years: "",
        project_cost: "",
        existing_land_use: "",

        // Step 3: Land Use
        has_written_notice: "",
        notice_officer_name: "",
        notice_dates: "",
        has_similar_application: "",
        similar_application_offices: "",
        similar_application_dates: "",
        preferred_release_mode: "",
        release_address: "",
    });

    // Handle flash messages
    useEffect(() => {
        if (flash.success) {
            toast({
                title: "Success!",
                description: flash.success,
                variant: "default",
            });
        }
        if (flash.error) {
            toast({
                title: "Error",
                description: flash.error,
                variant: "destructive",
            });
        }
    }, [flash]);

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setData("project_type", category);
    };

    // Handle data changes
    const handleDataChange = (field, value) => {
        setData(field, value);
    };

    // Handle representative toggle
    const handleRepresentativeToggle = (checked) => {
        setHasRepresentative(checked);
        if (!checked) {
            setData({
                ...data,
                authorized_representative_name: "",
                authorized_representative_address: "",
                authorized_representative_email: "",
                authorization_letter: null,
            });
        }
    };

    // Validate current step
    const validateCurrentStep = () => {
        let validationErrors = [];

        switch (currentStep) {
            case 1:
                validationErrors = validateStep1(data);
                break;
            case 2:
                validationErrors = validateStep2(data);
                break;
            case 3:
                validationErrors = validateStep3(data);
                break;
            default:
                break;
        }

        if (validationErrors.length > 0) {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: (
                    <div>
                        <p className="mb-2">Please fill in the following required fields:</p>
                        <ul className="list-disc list-inside">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                ),
            });
            return false;
        }

        return true;
    };

    // Handle next step
    const handleNext = () => {
        if (!validateCurrentStep()) {
            return;
        }

        // Mark current step as completed
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
        }

        // Move to next step
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle previous step
    const handlePrevious = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    
    // Handle direct step navigation
    const handleStepClick = (stepNumber) => {
        // Only allow navigation to current step, completed steps, or next step after completing current
        if (stepNumber <= currentStep || completedSteps.includes(stepNumber - 1)) {
            setCurrentStep(stepNumber);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Handle submit
    const handleSubmit = () => {
        if (!validateCurrentStep()) {
            return;
        }
        setIsConfirmDialogOpen(true);
    };

    // Confirm and submit
    const confirmSubmit = () => {
        post("/request", {
            onSuccess: () => {
                toast({
                    title: "Application Submitted!",
                    description:
                        "Your application has been submitted successfully. You will receive a confirmation email shortly.",
                });
                reset();
                setCurrentStep(1);
                setCompletedSteps([]);
                setHasRepresentative(false);
                setSelectedCategory(null);
                setIsConfirmDialogOpen(false);
            },
            onError: (errors) => {
                toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description:
                        "There was an error submitting your application. Please check the form and try again.",
                });
                setIsConfirmDialogOpen(false);
            },
        });
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="relative">
                {/* Animated background particles */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl opacity-10 blur-2xl animate-pulse-slow" />
                
                <Card className="relative border-none shadow-2xl shadow-blue-200/30 overflow-hidden backdrop-blur-sm bg-white/95">
                    {/* Top accent bar */}
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                    
                    {!selectedCategory ? (
                        <div className="animate-fadeIn">
                            <CardHeader className="pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                        <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                                            <FileText className="h-7 w-7 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-3xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            Land Certification Request Form
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Select your application category to begin
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <CategorySelection onSelectCategory={handleCategorySelect} />
                            </CardContent>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                                                <FileText className="h-7 w-7 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                                Land Certification Request Form
                                            </CardTitle>
                                            <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                                                    {selectedCategory}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedCategory(null);
                                            setData("project_type", "");
                                        }}
                                        className="group hover:bg-gray-50 transition-all duration-300 hover:shadow-md"
                                    >
                                        <svg className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Change Category
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Step Indicator with animation */}
                                <div className="animate-slideIn">
                                    <StepIndicator
                                        currentStep={currentStep}
                                        completedSteps={completedSteps}
                                        onStepClick={handleStepClick}
                                    />
                                </div>

                                {/* Step Content with smooth transitions */}
                                <div className="relative min-h-[400px]">
                                    <div className={`transition-all duration-500 ${currentStep === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'}`}>
                                        {currentStep === 1 && (
                                            <Step1ApplicantInfo
                                                data={data}
                                                errors={errors}
                                                hasRepresentative={hasRepresentative}
                                                onDataChange={handleDataChange}
                                                onRepresentativeToggle={handleRepresentativeToggle}
                                            />
                                        )}
                                    </div>

                                    <div className={`transition-all duration-500 ${currentStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'}`}>
                                        {currentStep === 2 && (
                                            <Step2ProjectDetails
                                                data={data}
                                                errors={errors}
                                                onDataChange={handleDataChange}
                                            />
                                        )}
                                    </div>

                                    <div className={`transition-all duration-500 ${currentStep === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'}`}>
                                        {currentStep === 3 && (
                                            <Step3LandUse
                                                data={data}
                                                errors={errors}
                                                hasRepresentative={hasRepresentative}
                                                onDataChange={handleDataChange}
                                                onToast={toast}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Navigation with enhanced styling */}
                                <div className="animate-slideUp">
                                    <FormNavigation
                                        currentStep={currentStep}
                                        totalSteps={3}
                                        processing={processing}
                                        onPrevious={handlePrevious}
                                        onNext={handleNext}
                                        onSubmit={handleSubmit}
                                    />
                                </div>
                            </CardContent>
                        </div>
                    )}
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={confirmSubmit}
                processing={processing}
            />
            
            {/* Add custom animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 0.1;
                    }
                    50% {
                        opacity: 0.2;
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.4s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
