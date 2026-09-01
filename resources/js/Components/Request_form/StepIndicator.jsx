import React from "react";
import { Check, FileText, MapPin, Home, Upload, Info } from "lucide-react";

const ALL_STEPS = [
    { number: 1, title: "Applicant Info", icon: FileText },
    { number: 2, title: "Project Details", icon: MapPin },
    { number: 3, title: "Land Use", icon: Home },
    { number: 4, title: "Requirements", icon: Upload },
];

export function StepIndicator({ currentStep, completedSteps, onStepClick, isEditing = false, activeSteps = [1, 2, 3, 4] }) {
    // A Zoning Certification skips Project Details and Land Use, so the
    // indicator only draws the steps this application actually has.
    // Renumbered for display: a Zoning Certification's Requirements step is
    // its second step, so it reads "Step 2", not "Step 4".
    const steps = ALL_STEPS.filter((s) => activeSteps.includes(s.number)).map((s, i) => ({
        ...s,
        position: i + 1,
    }));

    const handleStepClick = (stepNumber) => {
        // When editing, allow all steps to be clicked
        // When creating, only allow current step, completed steps, or the next step
        if (isEditing || isClickable(stepNumber)) {
            onStepClick?.(stepNumber);
        }
    };

    const isClickable = (stepNumber) => {
        // In edit mode, all steps are clickable
        if (isEditing) return true;
        // In create mode, only the current step, earlier ones, and the step right
        // after the last completed one. Compared by position, since a Zoning
        // Certification jumps straight from step 1 to step 4.
        const target = activeSteps.indexOf(stepNumber);
        const here = activeSteps.indexOf(currentStep);
        return target <= here || completedSteps.includes(activeSteps[target - 1]);
    };

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 shadow-lg shadow-blue-300/50"
                        style={{
                            width: `${((completedSteps.length) / (steps.length - 1)) * 100}%`,
                        }}
                    />
                </div>

                {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.number);
                    const isCurrent = currentStep === step.number;
                    const clickable = isClickable(step.number);
                    const Icon = step.icon;

                    return (
                        <div 
                            key={step.number} 
                            className="flex flex-col items-center flex-1 group"
                        >
                            <button
                                onClick={() => handleStepClick(step.number)}
                                disabled={!clickable}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                                    isCompleted
                                        ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-300/50"
                                        : isCurrent
                                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-4 ring-blue-200 shadow-xl shadow-blue-400/50"
                                        : clickable
                                        ? "bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-pointer"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                } ${
                                    clickable && !isCurrent ? "hover:scale-110 hover:shadow-xl" : ""
                                }`}
                            >
                                {isCompleted ? (
                                    <Check className="h-6 w-6 animate-scaleIn" />
                                ) : (
                                    <Icon className={`h-6 w-6 ${isCurrent ? "animate-pulse" : ""}`} />
                                )}
                                
                                {/* Hover tooltip */}
                                {clickable && !isCurrent && (
                                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        Click to jump to this step
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                    </div>
                                )}
                            </button>
                            <div className="mt-2 text-center">
                                <p
                                    className={`text-sm font-semibold transition-colors ${
                                        isCurrent
                                            ? "text-blue-600"
                                            : isCompleted
                                            ? "text-green-600"
                                            : "text-gray-500"
                                    }`}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Step {step.position}
                                    {isCompleted && <span className="ml-1 text-green-500">✓</span>}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Helper text */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Info className="w-4 h-4" />
                    Click on a step number to jump between sections
                </p>
            </div>
            
            <style>{`
                @keyframes scaleIn {
                    from {
                        transform: scale(0);
                    }
                    to {
                        transform: scale(1);
                    }
                }
                
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
