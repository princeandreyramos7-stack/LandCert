import { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/Components/ui/use-toast";

export function UploadCertificateModal({ isOpen, onClose, certificate, routePrefix = 'admin' }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setError(null);

        if (selectedFile) {
            // Validate file type (PDF only)
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a PDF file only');
                setFile(null);
                return;
            }

            // Validate file size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                setFile(null);
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file) {
            setError('Please select a PDF file to upload');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('certificate_file', file);
        formData.append('certificate_id', certificate.id);

        router.post(route(`${routePrefix}.certificates.upload-softcopy`), formData, {
            forceFormData: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast({
                    title: "Certificate uploaded successfully!",
                    description: `Certificate PDF has been uploaded and is now available for download.`,
                });
                handleClose();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setError(errors.certificate_file || 'Failed to upload certificate. Please try again.');
            },
        });
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        setIsSubmitting(false);
        onClose();
    };

    if (!certificate) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#0d1f5c]">
                        Upload Certificate Softcopy
                    </DialogTitle>
                    <DialogDescription>
                        Upload the digital copy (PDF) of the certificate for the applicant to download
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Certificate Info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-slate-500">Certificate Number:</span>
                                <span className="ml-2 font-semibold text-[#0d1f5c]">
                                    {certificate.certificate_number || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Applicant:</span>
                                <span className="ml-2 font-semibold">
                                    {certificate.request?.applicant?.applicant_name || 'Unknown'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Project Type:</span>
                                <span className="ml-2 font-semibold">
                                    {certificate.request?.project?.project_type || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500">Status:</span>
                                <span className="ml-2 font-semibold capitalize">
                                    {certificate.status?.replace(/_/g, ' ') || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* File Upload Area */}
                    <div className="space-y-2">
                        <Label htmlFor="certificate_file" className="text-sm font-semibold text-slate-700">
                            Certificate PDF File *
                        </Label>
                        
                        {!file ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#d4a017] transition-colors">
                                <input
                                    type="file"
                                    id="certificate_file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="certificate_file"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <div className="p-4 bg-slate-100 rounded-full mb-3">
                                        <Upload className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        PDF only (max 10MB)
                                    </p>
                                </label>
                            </div>
                        ) : (
                            <div className="border border-slate-300 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center">
                                            <FileText className="h-8 w-8 text-red-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </p>
                                            <div className="flex items-center gap-1 mt-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                <span className="text-xs text-emerald-600 font-medium">
                                                    File ready to upload
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveFile}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-slate-500 mt-2">
                            * Upload the official certificate PDF that the applicant can download
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!file || isSubmitting}
                            className="bg-[#0d1f5c] hover:bg-[#0d1f5c]/90 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Certificate
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
