import { useState, useEffect, useMemo } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { useToast } from "@/Components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { FileText } from "lucide-react";

// Local Components
import { WelcomeBoard } from "./WelcomeBoard";
import { StepIndicator } from "./StepIndicator";
import { ClearanceTypeSelector } from "./ClearanceTypeSelector";
import { Step1ApplicantInfo } from "./Step1ApplicantInfo";
import { Step2ProjectDetails } from "./Step2ProjectDetails";
import { Step3LandUse } from "./Step3LandUse";
import { Step4Requirements } from "./Step4Requirements";
import { FormNavigation } from "./FormNavigation";
import { ApplicationSummaryModal } from "./ApplicationSummaryModal";
import { validateStep1, validateStep2, validateStep3, validateStep4 } from "./utils";
import { fetchWithCsrf, hasCsrfToken, appendCsrfField } from "@/lib/csrf";

export default function RequestForm({ isEditing = false, existingApplication = null }) {
    // Welcome/requirements board is shown first; applicants proceed to Step 1 when ready
    const [showWelcome, setShowWelcome] = useState(!isEditing); // Skip welcome if editing
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [hasRepresentative, setHasRepresentative] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    // The submit goes out through fetch(), not Inertia, so useForm's `processing`
    // never flips and the spinner it drives never appeared. This tracks the real
    // request.
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitErrors, setSubmitErrors] = useState([]);
    // 'form'   -> the messages are validation problems the applicant can fix
    // 'system' -> the message is a server/system failure, nothing to fix in the form
    const [submitErrorKind, setSubmitErrorKind] = useState(null);
    const { toast } = useToast();
    const page = usePage();
    const flash = page.props.flash || {};

    const { data, setData, post, put, processing, errors, reset } = useForm({
        // Step 1: Applicant Information
        applicant_name: existingApplication?.applicant_name || "",
        corporation_name: existingApplication?.corporation_name || "",
        applicant_address: existingApplication?.applicant_address || "",
        corporation_address: existingApplication?.corporation_address || "",
        authorized_representative_name: existingApplication?.authorized_representative_name || "",
        authorized_representative_address: existingApplication?.authorized_representative_address || "",
        authorized_representative_email: "",
        authorization_letter: null,

        // Step 2: Project Details
        project_type: existingApplication?.project_type || "",
        project_nature: existingApplication?.project_nature || "",
        project_location_number: existingApplication?.project_location_number || "",
        project_location_street: existingApplication?.project_location_street || "",
        project_location_barangay: existingApplication?.project_location_barangay || "",
        project_location_municipality: existingApplication?.project_location_municipality || "City of Ilagan",
        project_location_province: existingApplication?.project_location_province || "Isabela",
        lot_area_sqm: existingApplication?.lot_area_sqm || "",
        bldg_improvement_sqm: existingApplication?.bldg_improvement_sqm || "",
        right_over_land: existingApplication?.right_over_land || "",
        project_nature_duration: existingApplication?.project_nature_duration || "",
        project_nature_years: existingApplication?.project_nature_years || "",
        project_cost: existingApplication?.project_cost || "",
        existing_land_use: existingApplication?.existing_land_use || "",

        // Step 3: Land Use
        has_written_notice: existingApplication?.has_written_notice || "",
        notice_officer_name: existingApplication?.notice_officer_name || "",
        notice_dates: existingApplication?.notice_dates || "",
        has_similar_application: existingApplication?.has_similar_application || "",
        similar_application_offices: existingApplication?.similar_application_offices || "",
        similar_application_dates: existingApplication?.similar_application_dates || "",
        preferred_release_mode: existingApplication?.preferred_release_mode || "",
        release_address: existingApplication?.release_address || "",
        
        // Step 4: Requirements Upload
        requirement_uploads: {},
        verified_requirements: existingApplication?.verified_requirements || {},
    });

    // Requirement files are held OUTSIDE Inertia's useForm on purpose.
    // useForm.setData runs lodash cloneDeep over the whole form on every call,
    // and cloneDeep destroys File objects — so any File parked in form state is
    // silently shredded by the next setData and never reaches the server.
    const [requirementFiles, setRequirementFiles] = useState({});

    // Define requirements structure (ALL requirements - main + additional).
    // Mirrors app/Constants/ApplicationRequirements.php.
    const requirements = useMemo(() => {
        // Zoning Certification is a standalone category with its own short
        // document set — nothing else is asked for.
        if (String(data.project_type || "").toUpperCase() === "ZC") {
            return [
                { id: 1, name: "1. Title", required: true, section: "main" },
                { id: 2, name: "2. Tax Declaration", required: true, section: "main" },
                { id: 3, name: "3. VICINITY MAP", required: true, section: "main" },
                { id: 4, name: "4. Latest Tax Receipt", required: true, section: "main" },
                { id: 5, name: "5. Sketch Plan with signature of Geodetic Engr.", required: true, section: "main" },
            ];
        }

        return [
            // Main Requirements
            // Not required at submission time: the applicant has to print this form,
            // get it notarized, then upload it afterwards from My Applications.
            { id: 1, name: "1. Accomplished and notarized APPLICATION FORM", required: false, section: "main", description: "You can submit without this. After submitting, print your application form, have it notarized, then upload it from My Applications." },
            // Right Over Land is a group: the header carries no upload of its own,
            // the three documents under it do.
            { id: 2, name: "2. Right Over Land Documentation", required: true, section: "main", is_group: true, description: "Submit all three documents below." },
            { id: 13, name: "Title", required: true, section: "main", parent_id: 2 },
            { id: 14, name: "Tax Declaration", required: true, section: "main", parent_id: 2 },
            { id: 15, name: "Tax Receipt", required: true, section: "main", parent_id: 2 },
            { id: 3, name: "3. VICINITY MAP", required: true, section: "main" },
            { id: 4, name: "4. SITE DEVELOPMENT PLAN", required: true, section: "main" },
            { id: 5, name: "5. ESTIMATED PROJECT COST / BILL OF MATERIALS", required: true, section: "main" },
            { id: 12, name: "6. Barangay Clearance", required: true, section: "main" },
            // Additional Requirements (all situational)
            { id: 6, name: "Endorsement/recommendation from Department of Agrarian Reform", required: false, section: "additional", description: "Required only for projects situated in tenanted rice and/or corn lands." },
            { id: 7, name: "Description of Industry (Manufacturing Projects)", required: false, section: "additional" },
            { id: 8, name: "Sworn Special Power of Attorney", required: false, section: "additional", description: "Required if the application is filed by an authorized representative." },
            { id: 9, name: "Affidavit of No Objection", required: false, section: "additional" },
            { id: 10, name: "Environmental Compliance Certificate (ECC) / Certificate of Non-Coverage (CNC)", required: false, section: "additional" },
            { id: 11, name: "Certification of road right-of-way from DPWH", required: false, section: "additional", description: "Required if the project is located within a National Road." },
        ];
    }, [data.project_type]);

    // A Zoning Certification has no project to describe: the applicant fills in
    // their details and uploads the documents, so steps 2 and 3 drop out.
    const activeSteps = useMemo(
        () =>
            String(data.project_type || "").toUpperCase() === "ZC"
                ? [1, 4]
                : [1, 2, 3, 4],
        [data.project_type]
    );
    const stepPosition = Math.max(1, activeSteps.indexOf(currentStep) + 1);

    // If the category changes to one with fewer steps while standing on a step
    // that no longer exists, fall back to the last step that does.
    useEffect(() => {
        if (!activeSteps.includes(currentStep)) {
            setCurrentStep(activeSteps[activeSteps.length - 1]);
        }
    }, [activeSteps, currentStep]);

    // Set hasRepresentative based on existing data
    useEffect(() => {
        if (existingApplication?.authorized_representative_name) {
            setHasRepresentative(true);
        }
    }, [existingApplication]);

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

    // Handle data changes
    const handleDataChange = (field, value) => {
        setData(field, value);
    };

    // Check if current step should be marked as completed based on validation
    useEffect(() => {
        if (currentStep === 3) {
            // For step 3, check if it's valid and mark as completed
            const step3Errors = validateStep3(data);
            if (step3Errors.length === 0 && !completedSteps.includes(3)) {
                setCompletedSteps([...completedSteps, 3]);
            } else if (step3Errors.length > 0 && completedSteps.includes(3)) {
                // Remove from completed if validation fails
                setCompletedSteps(completedSteps.filter(s => s !== 3));
            }
        }
        if (currentStep === 4) {
            // For step 4, check if at least main requirements are uploaded
            const step4Errors = validateStep4(data, requirements, existingApplication?.existing_documents || {}, requirementFiles);
            if (step4Errors.length === 0 && !completedSteps.includes(4)) {
                setCompletedSteps([...completedSteps, 4]);
            } else if (step4Errors.length > 0 && completedSteps.includes(4)) {
                setCompletedSteps(completedSteps.filter(s => s !== 4));
            }
        }
    }, [data, currentStep, requirementFiles]);

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
            case 4:
                validationErrors = validateStep4(data, requirements, existingApplication?.existing_documents || {}, requirementFiles);
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

        // Move to the next step this application actually has
        const next = activeSteps[activeSteps.indexOf(currentStep) + 1];
        if (next === undefined) return;
        setCurrentStep(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle previous step
    const handlePrevious = () => {
        if (currentStep === activeSteps[0]) {
            // Go back to the welcome/requirements board instead of nowhere
            setShowWelcome(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        setCurrentStep(activeSteps[activeSteps.indexOf(currentStep) - 1]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle continuing from the welcome board into the actual form. Picking a
    // category card starts the application in that category; the plain Continue
    // button leaves it unset for staff to decide later.
    const handleContinueFromWelcome = (projectType) => {
        if (projectType) {
            setData("project_type", projectType);
        }
        setShowWelcome(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    
    // Handle direct step navigation
    const handleStepClick = (stepNumber) => {
        // When editing, allow free navigation between all steps
        // When creating new, only allow navigation to current/completed steps
        if (isEditing) {
            setCurrentStep(stepNumber);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Only allow navigation to the current step, a completed one, or the
            // step right after the last completed one. Compared by position, since
            // a Zoning Certification jumps straight from step 1 to step 4.
            const target = activeSteps.indexOf(stepNumber);
            const here = activeSteps.indexOf(currentStep);
            const previous = activeSteps[target - 1];
            if (target <= here || completedSteps.includes(previous)) {
                setCurrentStep(stepNumber);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    };

    // Handle submit
    const handleSubmit = () => {
        if (!validateCurrentStep()) {
            return;
        }
        
        // Mark final step as completed when validation passes
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
        }
        
        // Log form data before showing confirmation dialog
        console.log('Form data before submit:', {
            applicant_name: data.applicant_name,
            applicant_address: data.applicant_address,
            project_type: data.project_type,
            project_nature: data.project_nature,
            existing_land_use: data.existing_land_use,
            has_written_notice: data.has_written_notice,
            requirement_uploads: data.requirement_uploads,
        });
        
        setIsConfirmDialogOpen(true);
    };

    // Confirm and submit - USING FETCH API TO BYPASS INERTIA
    const confirmSubmit = async () => {
        // The dialog deliberately stays open while the request is in flight, so
        // the button can show its spinner. Closing it first left the applicant
        // looking at an unchanged form with no sign anything was happening —
        // which is what led to pressing Submit again.
        setIsSubmitting(true);
        setSubmitErrors([]);
        setSubmitErrorKind(null);

        if (isEditing && existingApplication?.id) {
            console.log('=== EDIT SUBMIT START (FETCH API) ===');
            console.log('data.requirement_uploads:', data.requirement_uploads);
            
            // Create FormData
            const formData = new FormData();
            formData.append('_method', 'PUT');
            appendCsrfField(formData);
            
            // Add all text fields
            Object.keys(data).forEach(key => {
                if (key !== 'requirement_uploads') {
                    const value = data[key];
                    if (value !== null && value !== undefined && value !== '') {
                        formData.append(key, value);
                    }
                }
            });
            
            // Add file uploads. Read from the parent-owned file state, not the
            // Inertia form — useForm's cloneDeep would have destroyed the Files.
            let fileCount = 0;
            Object.entries(requirementFiles).forEach(([reqId, files]) => {
                if (!Array.isArray(files)) return;
                const requirement = requirements.find((r) => String(r.id) === String(reqId));
                files.forEach((file, index) => {
                    formData.append(`requirement_uploads[${reqId}][${index}]`, file, file.name);
                    fileCount++;
                });
                if (requirement) {
                    formData.append(`requirement_names[${reqId}]`, requirement.name);
                }
            });
            
            console.log(`Total files to upload: ${fileCount}`);
            console.log('FormData entries:');
            for (let pair of formData.entries()) {
                console.log(pair[0], '=', pair[1]);
            }
            
            console.log('Submitting via fetch...');
            
            try {
                const response = await fetchWithCsrf(route('requests.update', existingApplication.id), {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                
                console.log('Response status:', response.status);
                
                if (response.ok) {
                    toast({
                        title: "Success!",
                        description: "Application updated and resubmitted for review.",
                    });
                    
                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = route('my-applications.index');
                    }, 1000);
                } else {
                    const errorData = await response.json();
                    console.error('Update failed:', errorData);
                    
                    toast({
                        title: "Error",
                        description: errorData.message || "Failed to update application.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error('Fetch error:', error);
                toast({
                    title: "Error",
                    description: "Network error. Please try again.",
                    variant: "destructive",
                });
            }
            
        } else {
            // CREATE MODE: Submit new application.
            // Build FormData by hand so the File objects reach the server intact —
            // they are held outside useForm precisely because setData's cloneDeep
            // would destroy them.
            const formData = new FormData();

            Object.keys(data).forEach((key) => {
                if (key === 'requirement_uploads') return;
                const value = data[key];
                if (value === null || value === undefined || value === '') return;
                if (value instanceof File) {
                    formData.append(key, value, value.name);
                } else if (typeof value === 'object') {
                    // Send plain objects as real array fields so Laravel's
                    // `array` validation rules still see them as arrays.
                    Object.entries(value).forEach(([k, v]) => {
                        formData.append(`${key}[${k}]`, v ? '1' : '0');
                    });
                } else {
                    formData.append(key, value);
                }
            });

            Object.entries(requirementFiles).forEach(([reqId, files]) => {
                if (!Array.isArray(files)) return;
                const requirement = requirements.find((r) => String(r.id) === String(reqId));
                files.forEach((file, index) => {
                    formData.append(`requirement_uploads[${reqId}][${index}]`, file, file.name);
                });
                if (requirement) {
                    formData.append(`requirement_names[${reqId}]`, requirement.name);
                }
            });

            // Submit via fetch (not router.post) so the real HTTP status and
            // error body are visible - the caller needs to know whether a failure
            // is a form/validation problem (422) or a server problem (500).
            try {
                if (!hasCsrfToken()) {
                    throw new Error('Your session has expired. Please refresh the page and try again.');
                }

                const response = await fetchWithCsrf("/request", {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                });

                if (response.ok || response.redirected) {
                    toast({
                        title: "Application Submitted",
                        description: "Your application has been received.",
                    });
                    setTimeout(() => {
                        window.location.href = route('my-applications');
                    }, 800);
                    return;
                }

                // Try to read a structured error body.
                let payload = null;
                try { payload = await response.json(); } catch (_) { /* not JSON */ }

                if (response.status === 422) {
                    // Validation failure - a FORM problem. Show every field message.
                    const fieldErrors = payload?.errors || {};
                    const messages = Object.values(fieldErrors).flat().filter(Boolean);
                    console.warn('Application validation failed:', fieldErrors);
                    setSubmitErrors(messages.length ? messages : [payload?.message || 'Some fields need attention.']);
                    setSubmitErrorKind('form');
                    toast({
                        variant: "destructive",
                        title: "Please fix the form",
                        description: messages.length
                            ? (messages.length > 1
                                ? messages[0] + ' (+' + (messages.length - 1) + ' more below)'
                                : messages[0])
                            : (payload?.message || 'Some fields need attention.'),
                    });
                } else if (response.status === 401 || response.status === 419) {
                    // The session went while the form was being filled in.
                    // "System error — HTTP 401 — Unauthenticated" tells an
                    // applicant nothing they can act on, so say what actually
                    // happened and send them somewhere useful.
                    console.warn('Application submission rejected: session expired', response.status);
                    setSubmitErrors([
                        'Your session has expired. Please sign in again — your answers are still on this page, so keep this tab open, sign in from another tab, then press Submit again.',
                    ]);
                    setSubmitErrorKind('system');
                    toast({
                        variant: "destructive",
                        title: "Session expired",
                        description: "Please sign in again to submit your application.",
                    });
                } else {
                    // 500 / anything else - a SYSTEM problem, not the form.
                    const serverMessage = payload?.message || response.statusText || 'Unknown server error';
                    console.error('Application submission server error:', response.status, payload);
                    setSubmitErrors(['HTTP ' + response.status + ' — ' + serverMessage]);
                    setSubmitErrorKind('system');
                    toast({
                        variant: "destructive",
                        title: 'System error (HTTP ' + response.status + ')',
                        description: serverMessage,
                    });
                }
            } catch (error) {
                console.error('Application submission request failed:', error);
                setSubmitErrors([error.message || 'Check your connection and try again.']);
                setSubmitErrorKind('system');
                toast({
                    variant: "destructive",
                    title: "Could not reach the server",
                    description: error.message || 'Check your connection and try again.',
                });
            }
        }

        // Whatever happened, the request is over: stop the spinner and put the
        // applicant back on the form. On success the page has already been sent
        // to My Applications, so this only matters for the failure paths.
        setIsSubmitting(false);
        setIsConfirmDialogOpen(false);
    };

    if (showWelcome) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl opacity-10 blur-2xl animate-pulse-slow" />
                    <Card className="relative border-none shadow-2xl shadow-blue-200/30 overflow-hidden backdrop-blur-sm bg-white/95">
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                        <CardContent className="p-6 sm:p-8">
                            <WelcomeBoard onContinue={handleContinueFromWelcome} />
                        </CardContent>
                    </Card>
                </div>
                <style>{`
                    @keyframes pulse-slow {
                        0%, 100% { opacity: 0.1; }
                        50% { opacity: 0.2; }
                    }
                    .animate-pulse-slow {
                        animation: pulse-slow 3s ease-in-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="relative">
                {/* Animated background particles */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl opacity-10 blur-2xl animate-pulse-slow" />
                
                <Card className="relative border-none shadow-2xl shadow-blue-200/30 overflow-hidden backdrop-blur-sm bg-white/95">
                    {/* Top accent bar */}
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                    
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
                                            {isEditing ? "Edit Application" : "Submit New Request"}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Fill out the form below to submit your land certification request
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Clearance category: decides which steps the applicant sees */}
                            <ClearanceTypeSelector
                                value={data.project_type}
                                error={errors.project_type}
                                onChange={(value) => setData("project_type", value)}
                            />

                            {/* Step Indicator with animation */}
                            <div className="animate-slideIn">
                                <StepIndicator
                                    currentStep={currentStep}
                                    completedSteps={completedSteps}
                                    onStepClick={handleStepClick}
                                    isEditing={isEditing}
                                    activeSteps={activeSteps}
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

                                <div className={`transition-all duration-500 ${currentStep === 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'}`}>
                                    {currentStep === 4 && (
                                        <Step4Requirements
                                            data={data}
                                            errors={errors}
                                            onDataChange={handleDataChange}
                                            requirements={requirements}
                                            existingDocuments={existingApplication?.existing_documents || {}}
                                            verifiedRequirements={data.verified_requirements || {}}
                                            files={requirementFiles}
                                            onFilesChange={setRequirementFiles}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Real submission error - tells the applicant whether the
                                problem is their form (fixable) or the system (not their fault). */}
                            {submitErrors.length > 0 && (
                                <div
                                    className={`mb-4 rounded-lg border-2 p-4 ${
                                        submitErrorKind === 'system'
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-amber-300 bg-amber-50'
                                    }`}
                                >
                                    <p
                                        className={`text-sm font-semibold mb-2 ${
                                            submitErrorKind === 'system' ? 'text-red-800' : 'text-amber-800'
                                        }`}
                                    >
                                        {submitErrorKind === 'system'
                                            ? 'System error — this is not a problem with your form. Please try again later or contact the CPDO office with the message below.'
                                            : 'Please fix the following before submitting:'}
                                    </p>
                                    <ul
                                        className={`list-disc list-inside space-y-1 text-sm ${
                                            submitErrorKind === 'system' ? 'text-red-700' : 'text-amber-700'
                                        }`}
                                    >
                                        {submitErrors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Navigation with enhanced styling */}
                            <div className="animate-slideUp">
                                <FormNavigation
                                    currentStep={stepPosition}
                                    totalSteps={activeSteps.length}
                                    processing={processing || isSubmitting}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                    onSubmit={handleSubmit}
                                />
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <ApplicationSummaryModal
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={confirmSubmit}
                processing={processing || isSubmitting}
                data={data}
                isEditing={isEditing}
                requirementFiles={requirementFiles}
                requirements={requirements}
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
