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
    Eye
} from 'lucide-react';
import { Alert, AlertDescription } from '@/Components/ui/alert';

export default function UploadRequirements({ application, requirements = [], uploadedDocuments = [] }) {
    const [uploads, setUploads] = useState({});
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState({});

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
                alert(`File "${file.name}" is not a valid type. Please upload only images (JPG, PNG) or PDF files`);
                continue;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`File "${file.name}" is too large. File size must be less than 5MB`);
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

    // Submit all uploads
    const handleSubmit = () => {
        const totalFiles = Object.values(uploads).reduce((sum, files) => sum + files.length, 0);
        
        if (totalFiles === 0) {
            alert('Please select at least one file to upload');
            return;
        }

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
            onSuccess: () => {
                setUploads({});
                setPreviews({});
                setUploading(false);
            },
            onError: (errors) => {
                console.error('Upload errors:', errors);
                setUploading(false);
                alert('Error uploading files. Please try again.');
            }
        });
    };

    // Count uploaded vs required documents
    const requiredDocs = requirements.filter(req => req.required);
    const uploadedRequired = requiredDocs.filter(req => isUploaded(req.id));
    const allRequiredUploaded = uploadedRequired.length === requiredDocs.length;

    // Count total files to upload
    const totalFilesToUpload = Object.values(uploads).reduce((sum, files) => sum + files.length, 0);

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

                    {/* Upload Status Alert - Responsive */}
                    {!allRequiredUploaded && (
                        <Alert className="border-blue-200 bg-blue-50">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-xs sm:text-sm">
                                Please upload all required documents marked with a red asterisk (*) to proceed with your application.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Requirements List - Responsive */}
                    <Card>
                        <CardHeader className="pb-3 sm:pb-6">
                            <CardTitle className="text-base sm:text-lg">Document Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 sm:space-y-4">
                                {requirements.map((requirement) => {
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
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-sm sm:text-base text-gray-900">
                                                            {requirement.name}
                                                            {requirement.required && (
                                                                <span className="text-red-500 ml-1">*</span>
                                                            )}
                                                        </h3>
                                                        {requirement.required && (
                                                            <Badge variant="destructive" className="text-[10px] sm:text-xs">
                                                                Required
                                                            </Badge>
                                                        )}
                                                    </div>

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
                                                                                href={`/storage/${doc.file_path}`}
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

                            {/* Submit Button - Responsive */}
                            {Object.keys(uploads).length > 0 && (
                                <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
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
                                        onClick={handleSubmit}
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
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
