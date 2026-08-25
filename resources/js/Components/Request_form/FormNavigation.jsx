import React from "react";
import { Button } from "@/Components/ui/button";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

export function FormNavigation({
    currentStep,
    totalSteps,
    processing,
    onPrevious,
    onNext,
    onSubmit,
}) {
    return (
        <div className="flex justify-between items-center pt-4 sm:pt-6 border-t px-3 sm:px-0">
            <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={processing}
                className="gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
            >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">
                    {currentStep === 1 ? "Back to Overview" : "Previous"}
                </span>
                <span className="inline sm:hidden">Back</span>
            </Button>

            <div className="text-xs sm:text-sm text-gray-500 font-medium">
                Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={processing}
                    className="gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
                >
                    Next
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
            ) : (
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={processing}
                    className="gap-1 sm:gap-2 h-9 sm:h-10 px-3 sm:px-4 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                >
                    {processing ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            <span className="hidden sm:inline">Submitting...</span>
                            <span className="inline sm:hidden">Wait...</span>
                        </>
                    ) : (
                        <>
                            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Submit Application</span>
                            <span className="inline sm:hidden">Submit</span>
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}
