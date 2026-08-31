import React, { useState } from "react";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Eye } from "lucide-react";

export function Step4Requirements({
    data,
    errors,
    onDataChange,
    requirements = [],
    existingDocuments = {}, // Add this prop to receive existing documents
    verifiedRequirements = {}, // Kept for compatibility with the parent form
    files = {},               // Selected files, owned by the parent (see note below)
    onFilesChange = () => {}, // Parent setter for those files
}) {
    // File objects deliberately live in the parent's plain React state rather than
    // Inertia's form state: useForm.setData deep-clones the form on every call and
    // lodash cloneDeep destroys File objects.
    const uploads = files;
    const [previews, setPreviews] = useState({});

    // Separate main, zoning-certification and additional requirements
    const mainRequirements = requirements.filter((req) => (req.section || 'main') === 'main');
    const zoningCertRequirements = requirements.filter((req) => req.section === 'zoning_certification');
    const additionalRequirements = requirements.filter((req) => req.section === 'additional');

    const handleFileSelect = (requirementId, files) => {
        const fileArray = Array.from(files);

        // Validate file types (PDF, JPG, PNG)
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            alert('Only PDF, JPG, and PNG files are allowed.');
            return;
        }

        // Validate file sizes (max 5MB each)
        const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert('File size must be less than 5MB.');
            return;
        }

        // Add to uploads (parent-owned state, so the File objects survive)
        onFilesChange(prev => ({
            ...prev,
            [requirementId]: [...(prev[requirementId] || []), ...fileArray]
        }));

        // Create previews for images
        fileArray.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({
                        ...prev,
                        [file.name]: reader.result
                    }));
                };
                reader.readAsDataURL(file);
            }
        });

        // NOTE: uploading a document does NOT verify the requirement. Verification
        // is the Zoning Officer's call after reviewing the file, so the officer's
        // "Mark as Verified" toggle stays off until they turn it on.
    };

    const handleFileRemove = (requirementId, fileIndex) => {
        const updatedFiles = [...(uploads[requirementId] || [])];
        const removedFile = updatedFiles.splice(fileIndex, 1)[0];

        onFilesChange(prev => ({
            ...prev,
            [requirementId]: updatedFiles
        }));

        // Remove preview
        if (removedFile && previews[removedFile.name]) {
            setPreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[removedFile.name];
                return newPreviews;
            });
        }

    };

    const handleViewDocument = (requirementId) => {
        const docs = existingDocuments[requirementId];
        if (docs && docs.length > 0) {
            // Open the first document
            window.open(`/storage/${docs[0].file_path}`, '_blank');
        }
    };

    const getFileIcon = (file) => {
        if (file.type === 'application/pdf') {
            return <FileText className="h-8 w-8 text-red-600" />;
        }
        return <FileText className="h-8 w-8 text-blue-600" />;
    };

    /**
     * One requirement row. The upload area is always visible — attaching a
     * document is the only action here, so there is nothing to toggle.
     */
    const renderRequirement = (requirement, { showOptionalHint = false } = {}) => {
        const reqFiles = uploads[requirement.id] || [];
        const hasFiles = reqFiles.length > 0;
        const existingDocs = existingDocuments[requirement.id] || [];
        const hasExistingDocs = existingDocs.length > 0;
        const isSupplied = hasFiles || hasExistingDocs;

        return (
            <Card key={requirement.id} className="p-4">
                <div className="space-y-3">
                    {/* Header with title, status and view button */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <Label className="text-base font-semibold text-gray-900">
                                {requirement.name}
                                {requirement.required && <span className="text-red-500 ml-1">*</span>}
                                {!requirement.required && (
                                    <span className="text-gray-500 ml-1 text-sm font-normal">
                                        {showOptionalHint ? '(Optional)' : '(Not required yet)'}
                                    </span>
                                )}
                            </Label>
                            {requirement.description && (
                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                    {requirement.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            {/* View Button - only show if has existing docs */}
                            {hasExistingDocs && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDocument(requirement.id)}
                                    className="flex items-center gap-1"
                                >
                                    <Eye className="h-4 w-4" />
                                    View
                                </Button>
                            )}
                            {isSupplied && (
                                <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Uploaded
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Show existing documents if editing */}
                    {hasExistingDocs && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Previously Uploaded:</p>
                            {existingDocs.map((doc, index) => (
                                <div key={`existing-${index}`} className="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-200">
                                    <div className="flex-shrink-0">
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {doc.original_filename}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Uploaded on {doc.uploaded_at}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* File upload area */}
                    <div>
                        <input
                            type="file"
                            id={`file-${requirement.id}`}
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileSelect(requirement.id, e.target.files)}
                            className="hidden"
                        />
                        <label
                            htmlFor={`file-${requirement.id}`}
                            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                            <Upload className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {isSupplied ? 'Add more files' : 'Click to upload files'}
                            </span>
                        </label>
                    </div>

                    {/* Uploaded files list */}
                    {hasFiles && (
                        <div className="space-y-2">
                            {reqFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                                    <div className="flex-shrink-0">
                                        {previews[file.name] ? (
                                            <img
                                                src={previews[file.name]}
                                                alt={file.name}
                                                className="h-10 w-10 rounded object-cover"
                                            />
                                        ) : (
                                            getFileIcon(file)
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFileRemove(requirement.id, index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Document Upload Requirements</h3>
                        <p className="text-sm text-blue-800">
                            Upload scanned copies or clear photos of the required documents.
                            Accepted formats: PDF, JPG, PNG (max 5MB per file).
                            <br />
                            <span className="text-red-600 font-semibold">* Required documents</span> must be uploaded before submission.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Requirements Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Main Requirements (1-5) <span className="text-red-500">*</span>
                </h3>
                {mainRequirements.map((requirement) => renderRequirement(requirement))}
            </div>

            {/* Requirements of Zoning Certification (CZC only) */}
            {zoningCertRequirements.length > 0 && (
                <div className="space-y-4">
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                            Requirements of Zoning Certification <span className="text-red-500">*</span>
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 mb-4">
                            Required for a Certificate of Zoning Compliance (CZC). All documents below
                            must be uploaded before you can submit.
                        </p>
                    </div>
                    {zoningCertRequirements.map((requirement) => renderRequirement(requirement))}
                </div>
            )}

            {/* Additional Requirements Section */}
            {additionalRequirements.length > 0 && (
                <div className="space-y-4">
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                            Additional Requirements (1-{additionalRequirements.length})
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 mb-4">
                            These requirements are situational. Upload only those that apply to your project.
                        </p>
                    </div>
                    {additionalRequirements.map((requirement) =>
                        renderRequirement(requirement, { showOptionalHint: true })
                    )}
                </div>
            )}

            {errors.requirement_uploads && (
                <div className="text-sm text-red-600 mt-2">
                    {errors.requirement_uploads}
                </div>
            )}
        </div>
    );
}
