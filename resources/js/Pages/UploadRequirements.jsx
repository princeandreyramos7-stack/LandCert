import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppSidebar } from '@/Components/app-sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from '@/Components/ui/breadcrumb';
import { Separator } from '@/Components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/Components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
    Upload, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    Loader2,
    AlertCircle,
    Image as ImageIcon,
    File,
    X,
    Eye,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    ClipboardList,
    Check
} from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/Components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { useToast } from '@/Components/ui/use-toast';
import { Toaster } from '@/Components/ui/toaster';

export default function UploadRequirements({ application, requirements = [], uploadedDocuments = [] }) {
    const [uploads, setUploads] = useState({});
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState({});
    const [openItems, setOpenItems] = useState({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    // Two-page flow: 1 = Main Requirements, 2 = Additional Requirements
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();

    // Handle multiple file selection
    const handleFileSelect = (requirementId, event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        // Validate each file
        const validFiles = [];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        
        for (const file of files) {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                toast({
                    variant: 'destructive',
                    title: 'Unsupported file type',
                    description: `"${file.name}" was skipped. Please upload images (JPG, PNG) or PDF files only.`,
                });
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    variant: 'destructive',
                    title: 'File too large',
                    description: `"${file.name}" was skipped. Each file must be smaller than 5MB.`,
                });
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        // Get existing files for this requirement (if any)
        const existingFiles = uploads[requirementId] || [];
        
        // Combine existing and new files
        const allFiles = [...existingFiles, ...validFiles];

        // Store files
        setUploads(prev => ({
            ...prev,
            [requirementId]: allFiles
        }));

        // Create previews for images
        const newPreviews = [];
        validFiles.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({
                        ...prev,
                        [requirementId]: [
                            ...(prev[requirementId] || []),
                            { url: reader.result, name: file.name }
                        ]
                    }));
                };
                reader.readAsDataURL(file);
            } else {
                setPreviews(prev => ({
                    ...prev,
                    [requirementId]: [
                        ...(prev[requirementId] || []),
                        { url: null, name: file.name, isPdf: true }
                    ]
                }));
            }
        });
    };

    // Remove a specific file from the list
    const handleRemoveFile = (requirementId, fileIndex) => {
        setUploads(prev => {
            const files = [...(prev[requirementId] || [])];
            files.splice(fileIndex, 1);
            
            if (files.length === 0) {
                const newUploads = { ...prev };
                delete newUploads[requirementId];
                return newUploads;
            }
            
            return {
                ...prev,
                [requirementId]: files
            };
        });

        setPreviews(prev => {
            const previews = [...(prev[requirementId] || [])];
            previews.splice(fileIndex, 1);
            
            if (previews.length === 0) {
                const newPreviews = { ...prev };
                delete newPreviews[requirementId];
                return newPreviews;
            }
            
            return {
                ...prev,
                [requirementId]: previews
            };
        });
    };

    // Check if document is already uploaded
    const isUploaded = (requirementId) => {
        return uploadedDocuments.some(doc => doc.requirement_id === requirementId);
    };

    // Get uploaded documents for a requirement
    const getUploadedDocs = (requirementId) => {
        return uploadedDocuments.filter(doc => doc.requirement_id === requirementId);
    };

    // Ask for confirmation before uploading
    const handleUploadClick = () => {
        const totalFiles = Object.values(uploads).reduce((sum, files) => sum + files.length, 0);

        if (totalFiles === 0) {
            toast({
                variant: 'destructive',
                title: 'No files selected',
                description: 'Please choose at least one file before uploading.',
            });
            return;
        }

        setConfirmOpen(true);
    };

    // Submit all uploads
    const handleSubmit = () => {
        const totalFiles = Object.values(uploads).reduce((sum, files) => sum + files.length, 0);
        
        if (totalFiles === 0) {
            toast({
                variant: 'destructive',
                title: 'No files selected',
                description: 'Please choose at least one file before uploading.',
            });
            return;
        }

        // Capture counts before state is cleared so the notification can report them
        const requirementCount = Object.keys(uploads).length;

        setConfirmOpen(false);
        setUploading(true);

        const formData = new FormData();
        formData.append('application_id', application.id);

        Object.entries(uploads).forEach(([requirementId, files]) => {
            files.forEach((file, index) => {
                formData.append(`documents[${requirementId}][]`, file);
            });
            formData.append(`requirement_ids[]`, requirementId);
        });

        router.post(route('requirements.upload'), formData, {
            onSuccess: (page) => {
                setUploads({});
                setPreviews({});
                setUploading(false);

                toast({
                    title: 'Requirements uploaded successfully!',
                    description:
                        page?.props?.flash?.success ||
                        `${totalFiles} file${totalFiles > 1 ? 's' : ''} added to ${requirementCount} requirement${requirementCount > 1 ? 's' : ''}.`,
                });
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
                setUploading(false);

                const firstError = Object.values(errors || {})[0];

                toast({
                    variant: 'destructive',
                    title: 'Upload failed',
                    description:
                        firstError || 'We could not upload your files. Please check them and try again.',
                });
            }
        });
    };

    // Count uploaded vs required documents
    const requiredDocs = requirements.filter(req => req.required);
    const uploadedRequired = requiredDocs.filter(req => isUploaded(req.id));
    const allRequiredUploaded = uploadedRequired.length === requiredDocs.length;

    // Split into two sections: main (core 1-5 requirements) and additional
    // (situational requirements, e.g. only if tenanted land / manufacturing / etc.)
    // Falls back to treating everything as "main" if a requirement has no section
    // (keeps this page working even if the backend hasn't been updated yet).
    const mainRequirements = requirements.filter((req) => (req.section || 'main') === 'main');
    const additionalRequirements = requirements.filter((req) => req.section === 'additional');

    // Count total files to upload
    const totalFilesToUpload = Object.values(uploads).reduce((sum, files) => sum + files.length, 0);

    // Whether every required item on the Main page is satisfied (uploaded already,
    // or staged for upload) - lets us gate the "Next" button.
    const isRequirementSatisfied = (requirement) =>
        isUploaded(requirement.id) || (uploads[requirement.id] || []).length > 0;

    const hasAdditionalPage = additionalRequirements.length > 0;
    const totalPages = hasAdditionalPage ? 2 : 1;

    const handleGoToNextPage = () => {
        setCurrentPage(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGoToPreviousPage = () => {
        setCurrentPage(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Head title="Upload Requirements" />

                {/* Header */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Upload Requirements</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* Main Content - Responsive padding */}
                <div className="flex flex-1 flex-col gap-3 sm:gap-4 p-3 sm:p-4">
                    {/* Application Info - Responsive */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0" />
                                    <span className="text-sm sm:text-base">
                                        Application {application.control_number}
                                        <span className="hidden sm:inline"> - {application.project_type}</span>
                                    </span>
                                </div>
                                <Badge variant={allRequiredUploaded ? 'success' : 'secondary'} className="text-[10px] sm:text-xs whitespace-nowrap">
                                    {uploadedRequired.length} / {requiredDocs.length} Required
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                                <p className="sm:hidden"><strong>Type:</strong> {application.project_type}</p>
                                <p><strong>Applicant:</strong> {application.applicant_name}</p>
                                <p><strong>Project:</strong> {application.project_nature}</p>
                                <p className="mt-2 text-[10px] sm:text-xs text-gray-500">
                                    Upload softcopies (images or PDFs) of your requirements. Maximum file size: 5MB per file.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Step Indicator - only shown when there's an Additional Requirements page */}
                    {hasAdditionalPage && (
                        <div className="bg-white rounded-lg border p-4 sm:p-6">
                            <div className="flex items-center justify-between relative max-w-md mx-auto">
                                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                                        style={{ width: currentPage === 2 ? '100%' : '0%' }}
                                    />
                                </div>

                                {[
                                    { number: 1, title: 'Main Requirements', icon: FileText },
                                    { number: 2, title: 'Additional Requirements', icon: ClipboardList },
                                ].map((step) => {
                                    const isCompleted = currentPage > step.number;
                                    const isCurrent = currentPage === step.number;
                                    const clickable = true;
                                    const Icon = step.icon;

                                    return (
                                        <div key={step.number} className="flex flex-col items-center flex-1">
                                            <button
                                                type="button"
                                                onClick={() => clickable && setCurrentPage(step.number)}
                                                disabled={!clickable}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                    isCompleted
                                                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-300/50'
                                                        : isCurrent
                                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-4 ring-blue-200 shadow-xl shadow-blue-400/50'
                                                        : clickable
                                                        ? 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-pointer'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                                                ) : (
                                                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isCurrent ? 'animate-pulse' : ''}`} />
                                                )}
                                            </button>
                                            <div className="mt-2 text-center">
                                                <p className={`text-xs sm:text-sm font-semibold ${
                                                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                                }`}>
                                                    {step.title}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-gray-400">
                                                    Step {step.number}
                                                    {isCompleted && <span className="ml-1 text-green-500">✓</span>}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Upload Status Alert - Responsive (Main Requirements page only) */}
                    {currentPage === 1 && !allRequiredUploaded && (
                        <Alert className="border-blue-200 bg-blue-50">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-xs sm:text-sm">
                                Please upload all required documents marked with a red asterisk (*) to proceed with your application.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Page 1: Main Requirements */}
                    {currentPage === 1 && (
                    <Card>
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">1</span>
                                Main Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4 mb-2">
                                {mainRequirements.map((requirement) => {
                                    const uploaded = isUploaded(requirement.id);
                                    const uploadedDocs = getUploadedDocs(requirement.id);
                                    const pendingUploads = uploads[requirement.id] || [];
                                    const pendingPreviews = previews[requirement.id] || [];

                                    return (
                                        <div
                                            key={requirement.id}
                                            className={`border rounded-lg p-3 sm:p-4 ${
                                                uploaded ? 'bg-green-50 border-green-200' : 'bg-white'
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                                                {/* Document Info */}
                                                <div className="flex-1 w-full sm:w-auto">
                                                    <Collapsible
                                                        open={!!openItems[requirement.id]}
                                                        onOpenChange={() =>
                                                            setOpenItems((prev) => ({
                                                                ...prev,
                                                                [requirement.id]: !prev[requirement.id],
                                                            }))
                                                        }
                                                    >
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            {requirement.description ? (
                                                                <CollapsibleTrigger asChild>
                                                                    <button
                                                                        type="button"
                                                                        className="flex items-start gap-2 text-left hover:text-blue-600 transition-colors"
                                                                    >
                                                                        {openItems[requirement.id] ? (
                                                                            <ChevronDown className="h-4 w-4 shrink-0 mt-0.5" />
                                                                        ) : (
                                                                            <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                                                                        )}
                                                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                                                                            {requirement.name}
                                                                            {requirement.required && (
                                                                                <span className="text-red-500 ml-1">*</span>
                                                                            )}
                                                                        </h3>
                                                                    </button>
                                                                </CollapsibleTrigger>
                                                            ) : (
                                                                <h3 className="font-semibold text-sm sm:text-base text-gray-900 ml-6">
                                                                    {requirement.name}
                                                                    {requirement.required && (
                                                                        <span className="text-red-500 ml-1">*</span>
                                                                    )}
                                                                </h3>
                                                            )}
                                                            {requirement.required && (
                                                                <Badge variant="destructive" className="text-[10px] sm:text-xs">
                                                                    Required
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {requirement.description && (
                                                            <CollapsibleContent>
                                                                <div className="ml-6 mb-3 space-y-1 text-xs sm:text-sm text-gray-600">
                                                                    {requirement.description.split('\n').map((line, idx) => {
                                                                        const trimmed = line.trim();
                                                                        if (!trimmed) return null;

                                                                        const leadingSpaces = line.match(/^ */)[0].length;
                                                                        const indentLevel = Math.floor(leadingSpaces / 3);

                                                                        return (
                                                                            <div
                                                                                key={idx}
                                                                                className="leading-relaxed"
                                                                                style={{ marginLeft: `${indentLevel * 16}px` }}
                                                                            >
                                                                                {trimmed}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </CollapsibleContent>
                                                        )}
                                                    </Collapsible>

                                                    {/* Already Uploaded Documents */}
                                                    {uploadedDocs.length > 0 && (
                                                        <div className="mb-3 space-y-2">
                                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-700 font-semibold">
                                                                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                                <span>Uploaded ({uploadedDocs.length}):</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-2">
                                                                {uploadedDocs.map((doc, index) => (
                                                                    <div key={doc.id} className="flex items-center justify-between bg-white rounded border border-green-200 p-2">
                                                                        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                                                            <File className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                                                                            <span className="text-xs sm:text-sm text-gray-700 truncate">
                                                                                {doc.original_filename}
                                                                            </span>
                                                                            <span className="text-[10px] sm:text-xs text-gray-500 shrink-0 hidden sm:inline">
                                                                                ({new Date(doc.created_at).toLocaleDateString()})
                                                                            </span>
                                                                        </div>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="shrink-0 ml-2 h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200"
                                                                            asChild
                                                                        >
                                                                            <a
                                                                                href={`/requirements/${doc.id}/view`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center justify-center"
                                                                                title="View Document"
                                                                            >
                                                                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                            </a>
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Pending Upload Preview - Responsive */}
                                                    {pendingUploads.length > 0 && (
                                                        <div className="mt-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                                                    Ready to upload ({pendingUploads.length} file{pendingUploads.length > 1 ? 's' : ''})
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                                                                {pendingPreviews.map((preview, index) => (
                                                                    <div key={index} className="relative group">
                                                                        {preview.url ? (
                                                                            <div className="relative">
                                                                                <img
                                                                                    src={preview.url}
                                                                                    alt={`Preview ${index + 1}`}
                                                                                    className="w-full h-32 object-cover rounded border border-gray-300"
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveFile(requirement.id, index)}
                                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 sm:p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                                                                                    title="Remove file"
                                                                                >
                                                                                    <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="relative flex items-center justify-center h-32 bg-gray-100 rounded border border-gray-300">
                                                                                <div className="text-center">
                                                                                    <File className="h-8 w-8 mx-auto text-gray-400 mb-1" />
                                                                                    <p className="text-xs text-gray-600 truncate px-2">{preview.name}</p>
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveFile(requirement.id, index)}
                                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 sm:p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                                                                                    title="Remove file"
                                                                                >
                                                                                    <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{pendingUploads[index].name}</p>
                                                                        <p className="text-[10px] sm:text-xs text-gray-400">
                                                                            {(pendingUploads[index].size / 1024).toFixed(2)} KB
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Upload Button - Responsive */}
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <label>
                                                        <input
                                                            type="file"
                                                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                            onChange={(e) => handleFileSelect(requirement.id, e)}
                                                            className="hidden"
                                                            multiple
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="cursor-pointer h-8 px-2 sm:h-9 sm:px-3 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 text-[10px] sm:text-xs font-semibold whitespace-nowrap"
                                                            asChild
                                                        >
                                                            <span>
                                                                <Upload className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                                <span className="hidden sm:inline">
                                                                    {pendingUploads.length > 0 ? 'Add More' : 'Choose Files'}
                                                                </span>
                                                                {/* Mobile: Just show "+" or icon */}
                                                                <span className="inline sm:hidden">
                                                                    {pendingUploads.length > 0 ? '+' : 'Files'}
                                                                </span>
                                                            </span>
                                                        </Button>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Next / Submit button for Page 1 */}
                            <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                                {hasAdditionalPage ? (
                                    <Button
                                        type="button"
                                        onClick={handleGoToNextPage}
                                        className="h-9 sm:h-10 px-4 sm:px-6 bg-[#0d1f5c] hover:bg-[#1a3a8f] text-white gap-2 rounded-lg font-semibold min-w-[160px] text-sm"
                                    >
                                        <span>Next: Additional Requirements</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                ) : Object.keys(uploads).length > 0 && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setUploads({});
                                                setPreviews({});
                                            }}
                                            disabled={uploading}
                                            className="h-9 sm:h-10 px-3 sm:px-4 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleUploadClick}
                                            disabled={uploading}
                                            className="h-9 sm:h-10 px-4 sm:px-6 bg-[#0d1f5c] hover:bg-[#1a3a8f] text-white gap-2 rounded-lg font-semibold min-w-[120px] sm:min-w-32 text-sm"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                    <span className="hidden sm:inline">Uploading...</span>
                                                    <span className="inline sm:hidden">Upload...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">
                                                        Upload {totalFilesToUpload} File{totalFilesToUpload > 1 ? 's' : ''}
                                                    </span>
                                                    <span className="inline sm:hidden">
                                                        Upload ({totalFilesToUpload})
                                                    </span>
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {/* Page 2: Additional Requirements */}
                    {currentPage === 2 && hasAdditionalPage && (
                    <Card>
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">2</span>
                                Additional Requirements
                            </CardTitle>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Only applicable if relevant to your project. Skip any that do not apply.</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4 mb-2">
                                {additionalRequirements.map((requirement) => {
                                            const uploaded = isUploaded(requirement.id);
                                            const uploadedDocs = getUploadedDocs(requirement.id);
                                            const pendingUploads = uploads[requirement.id] || [];
                                            const pendingPreviews = previews[requirement.id] || [];

                                            return (
                                                <div
                                                    key={requirement.id}
                                                    className={`border rounded-lg p-3 sm:p-4 ${
                                                        uploaded ? 'bg-green-50 border-green-200' : 'bg-white'
                                                    }`}
                                                >
                                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                                                        {/* Document Info */}
                                                        <div className="flex-1 w-full sm:w-auto">
                                                            <Collapsible
                                                                open={!!openItems[requirement.id]}
                                                                onOpenChange={() =>
                                                                    setOpenItems((prev) => ({
                                                                        ...prev,
                                                                        [requirement.id]: !prev[requirement.id],
                                                                    }))
                                                                }
                                                            >
                                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                    {requirement.description ? (
                                                                        <CollapsibleTrigger asChild>
                                                                            <button
                                                                                type="button"
                                                                                className="flex items-start gap-2 text-left hover:text-blue-600 transition-colors"
                                                                            >
                                                                                {openItems[requirement.id] ? (
                                                                                    <ChevronDown className="h-4 w-4 shrink-0 mt-0.5" />
                                                                                ) : (
                                                                                    <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" />
                                                                                )}
                                                                                <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                                                                                    {requirement.name}
                                                                                    {requirement.required && (
                                                                                        <span className="text-red-500 ml-1">*</span>
                                                                                    )}
                                                                                </h3>
                                                                            </button>
                                                                        </CollapsibleTrigger>
                                                                    ) : (
                                                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 ml-6">
                                                                            {requirement.name}
                                                                            {requirement.required && (
                                                                                <span className="text-red-500 ml-1">*</span>
                                                                            )}
                                                                        </h3>
                                                                    )}
                                                                    {requirement.required && (
                                                                        <Badge variant="destructive" className="text-[10px] sm:text-xs">
                                                                            Required
                                                                        </Badge>
                                                                    )}
                                                                </div>

                                                                {requirement.description && (
                                                                    <CollapsibleContent>
                                                                        <div className="ml-6 mb-3 space-y-1 text-xs sm:text-sm text-gray-600">
                                                                            {requirement.description.split('\n').map((line, idx) => {
                                                                                const trimmed = line.trim();
                                                                                if (!trimmed) return null;

                                                                                const leadingSpaces = line.match(/^ */)[0].length;
                                                                                const indentLevel = Math.floor(leadingSpaces / 3);

                                                                                return (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className="leading-relaxed"
                                                                                        style={{ marginLeft: `${indentLevel * 16}px` }}
                                                                                    >
                                                                                        {trimmed}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </CollapsibleContent>
                                                                )}
                                                            </Collapsible>

                                                            {/* Already Uploaded Documents */}
                                                            {uploadedDocs.length > 0 && (
                                                                <div className="mb-3 space-y-2">
                                                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-green-700 font-semibold">
                                                                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                                        <span>Uploaded ({uploadedDocs.length}):</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {uploadedDocs.map((doc, index) => (
                                                                            <div key={doc.id} className="flex items-center justify-between bg-white rounded border border-green-200 p-2">
                                                                                <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                                                                    <File className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" />
                                                                                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                                                                                        {doc.original_filename}
                                                                                    </span>
                                                                                    <span className="text-[10px] sm:text-xs text-gray-500 shrink-0 hidden sm:inline">
                                                                                        ({new Date(doc.created_at).toLocaleDateString()})
                                                                                    </span>
                                                                                </div>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="shrink-0 ml-2 h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200"
                                                                                    asChild
                                                                                >
                                                                                    <a
                                                                                        href={`/requirements/${doc.id}/view`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="flex items-center justify-center"
                                                                                        title="View Document"
                                                                                    >
                                                                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                                    </a>
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Pending Upload Preview - Responsive */}
                                                            {pendingUploads.length > 0 && (
                                                                <div className="mt-3">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                                                                            Ready to upload ({pendingUploads.length} file{pendingUploads.length > 1 ? 's' : ''})
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                                                                        {pendingPreviews.map((preview, index) => (
                                                                            <div key={index} className="relative group">
                                                                                {preview.url ? (
                                                                                    <div className="relative">
                                                                                        <img
                                                                                            src={preview.url}
                                                                                            alt={`Preview ${index + 1}`}
                                                                                            className="w-full h-32 object-cover rounded border border-gray-300"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleRemoveFile(requirement.id, index)}
                                                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 sm:p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                                                                                            title="Remove file"
                                                                                        >
                                                                                            <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="relative flex items-center justify-center h-32 bg-gray-100 rounded border border-gray-300">
                                                                                        <div className="text-center">
                                                                                            <File className="h-8 w-8 mx-auto text-gray-400 mb-1" />
                                                                                            <p className="text-xs text-gray-600 truncate px-2">{preview.name}</p>
                                                                                        </div>
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleRemoveFile(requirement.id, index)}
                                                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 sm:p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                                                                                            title="Remove file"
                                                                                        >
                                                                                            <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">{pendingUploads[index].name}</p>
                                                                                <p className="text-[10px] sm:text-xs text-gray-400">
                                                                                    {(pendingUploads[index].size / 1024).toFixed(2)} KB
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Upload Button - Responsive */}
                                                        <div className="flex flex-col gap-2 shrink-0">
                                                            <label>
                                                                <input
                                                                    type="file"
                                                                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                                                                    onChange={(e) => handleFileSelect(requirement.id, e)}
                                                                    className="hidden"
                                                                    multiple
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="cursor-pointer h-8 px-2 sm:h-9 sm:px-3 rounded-lg text-blue-600 hover:bg-blue-50 border border-blue-200 text-[10px] sm:text-xs font-semibold whitespace-nowrap"
                                                                    asChild
                                                                >
                                                                    <span>
                                                                        <Upload className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                                        <span className="hidden sm:inline">
                                                                            {pendingUploads.length > 0 ? 'Add More' : 'Choose Files'}
                                                                        </span>
                                                                        {/* Mobile: Just show "+" or icon */}
                                                                        <span className="inline sm:hidden">
                                                                            {pendingUploads.length > 0 ? '+' : 'Files'}
                                                                        </span>
                                                                    </span>
                                                                </Button>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                            </div>

                            {/* Back / Submit buttons for Page 2 */}
                            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-2 sm:gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGoToPreviousPage}
                                    disabled={uploading}
                                    className="h-9 sm:h-10 px-3 sm:px-4 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Back: Main Requirements</span>
                                </Button>

                                {Object.keys(uploads).length > 0 && (
                                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setUploads({});
                                                setPreviews({});
                                            }}
                                            disabled={uploading}
                                            className="h-9 sm:h-10 px-3 sm:px-4 border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleUploadClick}
                                            disabled={uploading}
                                            className="h-9 sm:h-10 px-4 sm:px-6 bg-[#0d1f5c] hover:bg-[#1a3a8f] text-white gap-2 rounded-lg font-semibold min-w-[120px] sm:min-w-32 text-sm"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                                    <span className="hidden sm:inline">Uploading...</span>
                                                    <span className="inline sm:hidden">Upload...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                                                    <span className="hidden sm:inline">
                                                        Upload {totalFilesToUpload} File{totalFilesToUpload > 1 ? 's' : ''}
                                                    </span>
                                                    <span className="inline sm:hidden">
                                                        Upload ({totalFilesToUpload})
                                                    </span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    )}
                </div>

                {/* Upload Confirmation Dialog */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent className="w-[calc(100vw-1rem)] max-w-lg sm:w-full max-h-[92vh] overflow-y-auto p-0 gap-0">
                        {/* Friendly header banner */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0d1f5c] to-[#1a3a8f] px-4 py-4 text-white sm:px-6 sm:py-5">
                            <DialogHeader className="space-y-1.5 text-left">
                                <DialogTitle className="flex items-center gap-2.5 pr-8 text-white text-base sm:gap-3 sm:text-lg">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 sm:h-10 sm:w-10">
                                        <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    Ready to upload your documents?
                                </DialogTitle>
                                <DialogDescription className="text-blue-100 text-xs sm:text-sm sm:pl-[52px]">
                                    Please double-check your files before sending them to the CPDO office.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-4 py-4 space-y-3.5 sm:px-6 sm:space-y-4">
                            {/* Quick summary chips */}
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-center sm:p-3">
                                    <p className="text-xl font-bold text-[#0d1f5c] sm:text-2xl">
                                        {totalFilesToUpload}
                                    </p>
                                    <p className="text-[10px] font-medium leading-tight text-blue-700 sm:text-[11px]">
                                        File{totalFilesToUpload > 1 ? 's' : ''} to upload
                                    </p>
                                </div>
                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-center sm:p-3">
                                    <p className="text-xl font-bold text-[#0d1f5c] sm:text-2xl">
                                        {Object.keys(uploads).length}
                                    </p>
                                    <p className="text-[10px] font-medium leading-tight text-blue-700 sm:text-[11px]">
                                        Requirement{Object.keys(uploads).length > 1 ? 's' : ''} covered
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-gray-50 px-3 py-2">
                                <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                                <p className="min-w-0 break-words text-xs text-gray-600">
                                    Application{' '}
                                    <span className="font-semibold text-gray-900">
                                        {application.control_number}
                                    </span>
                                </p>
                            </div>

                            {/* File list grouped by requirement */}
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    What you're sending
                                </p>
                                <div className="space-y-2.5 sm:max-h-56 sm:overflow-y-auto sm:pr-1">
                                    {Object.entries(uploads).map(([requirementId, files]) => {
                                        const requirement = requirements.find(
                                            (req) => String(req.id) === String(requirementId)
                                        );

                                        return (
                                            <div
                                                key={requirementId}
                                                className="rounded-xl border border-gray-200 bg-white p-2.5 sm:p-3"
                                            >
                                                <div className="mb-2 flex items-start gap-2">
                                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                                                    <p className="min-w-0 break-words text-xs font-semibold leading-snug text-gray-900 sm:text-sm">
                                                        {requirement?.name || `Requirement #${requirementId}`}
                                                    </p>
                                                </div>
                                                <ul className="space-y-1.5 pl-0 sm:pl-6">
                                                    {files.map((file, index) => (
                                                        <li
                                                            key={index}
                                                            className="flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5"
                                                        >
                                                            {file.type?.startsWith('image/') ? (
                                                                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                                                            ) : (
                                                                <File className="h-3.5 w-3.5 shrink-0 text-red-500" />
                                                            )}
                                                            <span className="min-w-0 flex-1 truncate text-[11px] text-gray-700 sm:text-xs">
                                                                {file.name}
                                                            </span>
                                                            <span className="shrink-0 text-[10px] font-medium text-gray-400">
                                                                {(file.size / 1024).toFixed(0)} KB
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Friendly reminder */}
                            <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5 sm:p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                <p className="min-w-0 text-[11px] leading-relaxed text-amber-900 sm:text-xs">
                                    Make sure each document is clear and fully readable. Blurry or incomplete files may
                                    delay your application.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 sm:py-4">
                            <DialogFooter className="gap-2 sm:gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setConfirmOpen(false)}
                                    disabled={uploading}
                                    className="h-11 w-full rounded-lg border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:h-10 sm:w-auto sm:px-5"
                                >
                                    Let me check again
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={uploading}
                                    className="h-11 w-full gap-2 rounded-lg bg-[#0d1f5c] px-4 text-sm font-semibold text-white hover:bg-[#1a3a8f] sm:h-10 sm:w-auto sm:px-5"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            Yes, upload now
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>

                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    );
}
