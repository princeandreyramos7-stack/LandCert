import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import { useToast } from "@/components/ui/use-toast";
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
        // Category
        application_category: "",
        
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
        setData("application_category", category);
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
        <div>
            {!selectedCategory ? (
                <CategorySelection onSelectCategory={handleCategorySelect} />
            ) : (
                <div className="max-w-4xl mx-auto p-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <FileText className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">
                                            Land Certification Request Form
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Application Type: <span className="font-semibold text-blue-600">{selectedCategory}</span>
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setData("application_category", "");
                                    }}
                                >
                                    Change Category
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Step Indicator */}
                            <StepIndicator
                                currentStep={currentStep}
                                completedSteps={completedSteps}
                            />

                            {/* Step Content */}
                            {currentStep === 1 && (
                                <Step1ApplicantInfo
                                    data={data}
                                    errors={errors}
                                    hasRepresentative={hasRepresentative}
                                    onDataChange={handleDataChange}
                                    onRepresentativeToggle={handleRepresentativeToggle}
                                />
                            )}

                            {currentStep === 2 && (
                                <Step2ProjectDetails
                                    data={data}
                                    errors={errors}
                                    onDataChange={handleDataChange}
                                />
                            )}

                            {currentStep === 3 && (
                                <Step3LandUse
                                    data={data}
                                    errors={errors}
                                    hasRepresentative={hasRepresentative}
                                    onDataChange={handleDataChange}
                                    onToast={toast}
                                />
                            )}

                            {/* Navigation */}
                            <FormNavigation
                                currentStep={currentStep}
                                totalSteps={3}
                                processing={processing}
                                onPrevious={handlePrevious}
                                onNext={handleNext}
                                onSubmit={handleSubmit}
                            />
                        </CardContent>
                    </Card>

                    {/* Confirmation Dialog */}
                    <ConfirmationDialog
                        isOpen={isConfirmDialogOpen}
                        onClose={() => setIsConfirmDialogOpen(false)}
                        onConfirm={confirmSubmit}
                        processing={processing}
                    />
                </div>
            )}
        </div>
    );
}
