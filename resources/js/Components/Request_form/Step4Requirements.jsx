import React, { useState } from "react";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Eye } from "lucide-react";

export function Step4Requirements({
    data,
    errors,
    onDataChange,
    requirements = [],
    existingDocuments = {}, // Add this prop to receive existing documents
    verifiedRequirements = {}, // Toggle switches state from database
}) {
    const [uploads, setUploads] = useState({});
    const [previews, setPreviews] = useState({});
    const [toggleStates, setToggleStates] = useState(verifiedRequirements || {});

    // Separate main and additional requirements
    const mainRequirements = requirements.filter((req) => (req.section || 'main') === 'main');
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

        // Add to uploads
        setUploads(prev => ({
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

        // Automatically toggle ON when file is uploaded
        setToggleStates(prev => ({
            ...prev,
            [requirementId]: true
        }));

        // Update parent form data
        onDataChange('requirement_uploads', {
            ...(data.requirement_uploads || {}),
            [requirementId]: [...(data.requirement_uploads?.[requirementId] || []), ...fileArray]
        });

        // Update verified requirements
        onDataChange('verified_requirements', {
            ...(data.verified_requirements || toggleStates),
            [requirementId]: true
        });
    };

    const handleFileRemove = (requirementId, fileIndex) => {
        const updatedFiles = [...(uploads[requirementId] || [])];
        const removedFile = updatedFiles.splice(fileIndex, 1)[0];
        
        setUploads(prev => ({
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

        // If no files left, toggle OFF
        if (updatedFiles.length === 0 && !existingDocuments[requirementId]?.length) {
            setToggleStates(prev => ({
                ...prev,
                [requirementId]: false
            }));

            onDataChange('verified_requirements', {
                ...(data.verified_requirements || toggleStates),
                [requirementId]: false
            });
        }

        // Update parent form data
        onDataChange('requirement_uploads', {
            ...(data.requirement_uploads || {}),
            [requirementId]: updatedFiles
        });
    };

    const handleToggleChange = (requirementId, checked) => {
        setToggleStates(prev => ({
            ...prev,
            [requirementId]: checked
        }));

        // Update parent form data
        onDataChange('verified_requirements', {
            ...(data.verified_requirements || toggleStates),
            [requirementId]: checked
        });
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
                {mainRequirements.map((requirement) => {
                    const reqFiles = uploads[requirement.id] || [];
                    const hasFiles = reqFiles.length > 0;
                    const hasExistingDocs = existingDocuments[requirement.id]?.length > 0;
                    const isToggled = toggleStates[requirement.id] ?? hasExistingDocs ?? false;

                    return (
                        <Card key={requirement.id} className="p-4">
                            <div className="space-y-3">
                                {/* Header with title, toggle and view button */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <Label className="text-base font-semibold text-gray-900">
                                            {requirement.name}
                                            {requirement.required && <span className="text-red-500 ml-1">*</span>}
                                        </Label>
                                        {requirement.description && (
                                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                                {requirement.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
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
                                        {/* Toggle Switch */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {isToggled ? 'ON' : 'OFF'}
                                            </span>
                                            <Switch
                                                checked={isToggled}
                                                onCheckedChange={(checked) => handleToggleChange(requirement.id, checked)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Conditionally show upload section and file list only if toggled ON or has files */}
                                {(isToggled || hasFiles || hasExistingDocs) && (
                                    <>
                                        {/* Show existing documents if editing */}
                                        {hasExistingDocs && (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-gray-700">Previously Uploaded:</p>
                                                {existingDocuments[requirement.id].map((doc, index) => (
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
                                                    {hasFiles ? 'Add more files' : 'Click to upload files'}
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
                                    </>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

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
                    {additionalRequirements.map((requirement) => {
                        const reqFiles = uploads[requirement.id] || [];
                        const hasFiles = reqFiles.length > 0;
                        const hasExistingDocs = existingDocuments[requirement.id]?.length > 0;
                        const isToggled = toggleStates[requirement.id] ?? hasExistingDocs ?? false;

                        return (
                            <Card key={requirement.id} className="p-4">
                                <div className="space-y-3">
                                    {/* Header with title, toggle and view button */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <Label className="text-base font-semibold text-gray-900">
                                                {requirement.name}
                                                {requirement.required && <span className="text-red-500 ml-1">*</span>}
                                                {!requirement.required && <span className="text-gray-500 ml-1 text-sm font-normal">(Optional)</span>}
                                            </Label>
                                            {requirement.description && (
                                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                                    {requirement.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
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
                                            {/* Toggle Switch */}
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">
                                                    {isToggled ? 'ON' : 'OFF'}
                                                </span>
                                                <Switch
                                                    checked={isToggled}
                                                    onCheckedChange={(checked) => handleToggleChange(requirement.id, checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Conditionally show upload section and file list only if toggled ON or has files */}
                                    {(isToggled || hasFiles || hasExistingDocs) && (
                                        <>
                                            {/* Show existing documents if editing */}
                                            {hasExistingDocs && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-700">Previously Uploaded:</p>
                                                    {existingDocuments[requirement.id].map((doc, index) => (
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
                                                        {hasFiles ? 'Add more files' : 'Click to upload files'}
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
                                        </>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
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
