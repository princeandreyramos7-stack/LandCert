import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { CheckCircle2, Upload, ArrowRight } from "lucide-react";

export function SuccessDialog({ isOpen, applicationId, controlNumber }) {
    const [countdown, setCountdown] = useState(10);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleRedirect();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, applicationId]);

    const handleRedirect = () => {
        if (isRedirecting) return;
        setIsRedirecting(true);
        router.visit(route('requirements.upload.page', applicationId));
    };

    const handleViewApplications = () => {
        router.visit(route('my-applications'));
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <div className="p-4 bg-green-100 rounded-full animate-bounce">
                                <CheckCircle2 className="h-16 w-16 text-green-600" />
                            </div>
                            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                        </div>
                        <DialogTitle className="text-2xl text-green-700">
                            Application Submitted Successfully! 🎉
                        </DialogTitle>
                    </div>
                    <DialogDescription className="pt-6 space-y-4">
                        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                            <p className="text-sm text-green-800 mb-2">
                                <strong>Control Number:</strong>
                            </p>
                            <p className="text-2xl font-bold text-green-700 tracking-wider">
                                {controlNumber}
                            </p>
                            <p className="text-xs text-green-600 mt-2">
                                Save this number for your reference
                            </p>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Upload className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <p className="font-bold text-blue-900 mb-2 text-base">
                                        📋 Next Step: Upload Requirements
                                    </p>
                                    <p className="text-sm text-blue-800 mb-3">
                                        Please upload softcopy documents (scanned copies or photos) 
                                        of your required documents to complete your application.
                                    </p>
                                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                                        <p className="text-xs text-blue-700 font-semibold mb-1">
                                            ⏱️ Auto-redirecting in:
                                        </p>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="text-3xl font-bold text-blue-600 tabular-nums">
                                                {countdown}
                                            </div>
                                            <span className="text-sm text-blue-600">seconds</span>
                                        </div>
                                        <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
                                                style={{ width: `${(10 - countdown) * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-xs text-gray-600">
                                ✅ A confirmation email has been sent to your registered email address
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={handleViewApplications}
                        disabled={isRedirecting}
                        className="flex-1"
                    >
                        View My Applications
                    </Button>
                    <Button
                        onClick={handleRedirect}
                        disabled={isRedirecting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                        {isRedirecting ? (
                            <>Redirecting...</>
                        ) : (
                            <>
                                Upload Now
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
