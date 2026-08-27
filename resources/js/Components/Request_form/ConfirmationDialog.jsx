import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { AlertCircle, CheckCircle2, FileText, Loader2, Send, User } from "lucide-react";

export function ConfirmationDialog({ isOpen, onClose, onConfirm, processing, data = {}, isEditing = false }) {
    const applicantName = data.corporation_name || data.applicant_name || "Applicant";
    const projectType = data.project_type || "N/A";
    const projectNature = data.project_nature || "N/A";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[calc(100vw-1rem)] max-w-lg sm:w-full max-h-[92vh] overflow-y-auto p-0 gap-0">
                {/* Simple header */}
                <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
                    <DialogHeader className="space-y-1.5 text-left">
                        <DialogTitle className="flex items-center gap-2.5 pr-8 text-gray-900 text-base sm:gap-3 sm:text-lg">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 sm:h-10 sm:w-10">
                                <Send className="h-4 w-4 text-[#0d1f5c] sm:h-5 sm:w-5" />
                            </div>
                            {isEditing ? "Ready to resubmit your application?" : "Ready to submit your application?"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-xs sm:text-sm sm:pl-[52px]">
                            {isEditing 
                                ? "Please confirm your updated details before resubmitting to the CPDO office."
                                : "Please double-check your details before sending them to the CPDO office."
                            }
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-4 py-4 space-y-3.5 sm:px-6 sm:space-y-4">
                    {/* Quick summary chips */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-center sm:p-3">
                            <p className="truncate text-sm font-bold text-[#0d1f5c] sm:text-base">
                                {projectType}
                            </p>
                            <p className="text-[10px] font-medium leading-tight text-blue-700 sm:text-[11px]">
                                Application Type
                            </p>
                        </div>
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-center sm:p-3">
                            <p className="truncate text-sm font-bold text-[#0d1f5c] sm:text-base">
                                {projectNature}
                            </p>
                            <p className="text-[10px] font-medium leading-tight text-blue-700 sm:text-[11px]">
                                Project Nature
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-gray-50 px-3 py-2">
                        <User className="h-4 w-4 shrink-0 text-gray-400" />
                        <p className="min-w-0 break-words text-xs text-gray-600">
                            Applicant{' '}
                            <span className="font-semibold text-gray-900">{applicantName}</span>
                        </p>
                    </div>

                    {/* Next step reminder */}
                    <div className="rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3">
                        <div className="mb-2 flex items-start gap-2">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                            <p className="min-w-0 text-xs font-semibold leading-snug text-gray-900 sm:text-sm">
                                Next step after submission
                            </p>
                        </div>
                        <p className="pl-0 text-[11px] leading-relaxed text-gray-600 sm:pl-6 sm:text-xs">
                            You'll be automatically redirected to upload the required softcopy documents
                            (scanned copies or photos of your requirements).
                        </p>
                    </div>

                    {/* Friendly reminder */}
                    <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5 sm:p-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div className="min-w-0 text-[11px] leading-relaxed text-amber-900 sm:text-xs">
                            <p className="mb-1 font-medium">Important:</p>
                            <ul className="list-disc space-y-0.5 pl-4">
                                <li>Once submitted, you cannot edit the application</li>
                                <li>You'll receive a confirmation email with your application details</li>
                                <li>The admin will review your application and notify you of the decision</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
                    <DialogFooter className="gap-2 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={processing}
                            className="h-11 w-full rounded-lg border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:h-10 sm:w-auto sm:px-5"
                        >
                            Let me check again
                        </Button>
                        <Button
                            type="button"
                            onClick={onConfirm}
                            disabled={processing}
                            className="h-11 w-full gap-2 rounded-lg bg-[#0d1f5c] px-4 text-sm font-semibold text-white hover:bg-[#1a3a8f] sm:h-10 sm:w-auto sm:px-5"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isEditing ? "Updating..." : "Submitting..."}
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    {isEditing ? "Yes, update now" : "Yes, submit now"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
