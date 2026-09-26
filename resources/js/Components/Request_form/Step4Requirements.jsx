import React, { useState, useEffect } from "react";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/Components/ui/use-toast";
import { fetchWithCsrf } from "@/lib/csrf";

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
    // How many files are mid-check for a given requirement, so its upload
    // button can be disabled and show a spinner without one file's check
    // clobbering another's in-flight state.
    const [checkingCounts, setCheckingCounts] = useState({});
    const { toast } = useToast();

    // A file that arrived some way other than checkFile()'s own selection
    // flow - a draft restored after a refresh (see requestDraft.js) - never
    // got a preview generated for it there. Catches that once, for whatever
    // image files are missing one.
    useEffect(() => {
        Object.values(uploads).flat().forEach((file) => {
            if (file && file.type?.startsWith('image/') && !previews[file.name]) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, [file.name]: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploads]);

    // Separate main and additional requirements. A requirement flagged is_group
    // is only a heading — the documents it asks for are its children, matched by
    // parent_id — so the top level lists parents and standalone requirements only.
    const allMain = requirements.filter((req) => (req.section || 'main') === 'main');
    const mainRequirements = allMain.filter((req) => !req.parent_id);
    const childrenOf = (req) => allMain.filter((child) => child.parent_id === req.id);
    const additionalRequirements = requirements.filter((req) => req.section === 'additional');

    /**
     * One selected file is added only once the server confirms it is
     * legible (see ReadableDocument): a blank, tiny or blurred scan is
     * rejected right here, at the moment it is attached, rather than
     * silently sitting in the form until Submit is pressed at the end of
     * the wizard.
     */
    const checkFile = async (requirementId, file) => {
        setCheckingCounts(prev => ({ ...prev, [requirementId]: (prev[requirementId] || 0) + 1 }));

        try {
            const formData = new FormData();
            formData.append('document', file, file.name);

            const response = await fetchWithCsrf(route('requirements.check-readability'), {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            });

            if (!response.ok) {
                let payload = null;
                try { payload = await response.json(); } catch (_) { /* not JSON */ }
                const messages = payload?.errors ? Object.values(payload.errors).flat() : [];
                toast({
                    variant: 'destructive',
                    title: 'File rejected',
                    description: messages[0] || `"${file.name}" could not be verified. Please choose a clearer file.`,
                });
                return;
            }

            // Passed - now it actually joins the form (parent-owned state,
            // so the File object survives Inertia's setData clone).
            onFilesChange(prev => ({
                ...prev,
                [requirementId]: [...(prev[requirementId] || []), file]
            }));

            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, [file.name]: reader.result }));
                };
                reader.readAsDataURL(file);
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Could not verify file',
                description: `Check your connection and try attaching "${file.name}" again.`,
            });
        } finally {
            setCheckingCounts(prev => ({ ...prev, [requirementId]: Math.max(0, (prev[requirementId] || 1) - 1) }));
        }

        // NOTE: uploading a document does NOT verify the requirement. Verification
        // is the Zoning Officer's call after reviewing the file, so the officer's
        // "Mark as Verified" toggle stays off until they turn it on.
    };

    const handleFileSelect = (requirementId, files) => {
        const fileArray = Array.from(files);

        // Validate file types (PDF, JPG, PNG) - cheap and instant, so this
        // stays a local check rather than a round trip.
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            alert('Only PDF, JPG, and PNG files are allowed.');
            return;
        }

        // A requirement takes at most one separate image - several loose
        // photos (front and back, page after page) have to be combined into
        // a single PDF first (see RequestController::assertNoMultipleImagesPerRequirement,
        // which enforces the same rule server-side, in case this is ever
        // bypassed). A PDF has no such limit.
        const isImage = (file) => file.type.startsWith('image/');
        const existingImages = (uploads[requirementId] || []).filter(isImage).length;
        const newImages = fileArray.filter(isImage).length;

        if (existingImages + newImages > 1) {
            toast({
                variant: 'destructive',
                title: 'Only one photo per requirement',
                description: 'This requirement takes at most one separate photo. To add another page, please combine every page into a single PDF and upload that instead.',
            });
            return;
        }

        // File size is checked server-side (see checkFile below) against
        // the real shared limit (App\Support\UploadLimits) - not duplicated
        // here as a hardcoded number, which would only drift from it.

        // Everything cheap to check locally passed - now ask the server
        // whether each file is actually legible, in parallel.
        fileArray.forEach(file => { checkFile(requirementId, file); });
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
        const isChecking = (checkingCounts[requirement.id] || 0) > 0;

        return (
            <Card key={requirement.id} className="overflow-hidden p-3 sm:p-4">
                <div className="space-y-3">
                    {/* Header with title, status and view button */}
                    {/* Wraps rather than overflowing: a flex-1 column with no
                        min-w-0 refuses to shrink past its longest word, which
                        pushed the View button and the Uploaded badge outside
                        the card on narrow screens — worst in the indented
                        Right Over Land children like Tax Declaration. */}
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                        <div className="min-w-0 flex-1 basis-full sm:basis-0">
                            <Label className="block break-words text-base font-semibold text-gray-900">
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
                        <div className="flex shrink-0 items-center gap-2">
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
                                <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-green-700">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
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
                            disabled={isChecking}
                            onChange={(e) => {
                                handleFileSelect(requirement.id, e.target.files);
                                // Cleared so picking the same file again (a retry
                                // after fixing it, or after a rejection) still
                                // fires this - the browser skips onChange for an
                                // unchanged selection otherwise.
                                e.target.value = '';
                            }}
                            className="hidden"
                        />
                        <label
                            htmlFor={`file-${requirement.id}`}
                            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg transition-colors ${
                                isChecking
                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                    : 'border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                            {isChecking ? (
                                <>
                                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                                    <span className="text-sm font-medium text-gray-500">
                                        Checking file{(checkingCounts[requirement.id] || 0) > 1 ? 's' : ''}…
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-5 w-5 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {isSupplied ? 'Add more files' : 'Click to upload files'}
                                    </span>
                                </>
                            )}
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

    /**
     * A grouped requirement: the heading names the requirement, and each document
     * it asks for gets its own upload slot underneath.
     */
    const renderRequirementGroup = (requirement) => {
        // An application filed before this requirement was split into separate
        // slots has its document attached to the group itself — keep it visible.
        const hasOwnFiles =
            (uploads[requirement.id] || []).length > 0 ||
            (existingDocuments[requirement.id] || []).length > 0;

        return (
            <div key={requirement.id} className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 space-y-3 sm:p-4">
                {hasOwnFiles ? (
                    renderRequirement(requirement)
                ) : (
                    <div>
                        <Label className="text-base font-semibold text-gray-900">
                            {requirement.name}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        {requirement.description && (
                            <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                        )}
                    </div>
                )}
                <div className="space-y-3">
                    {childrenOf(requirement).map((child) => renderRequirement(child))}
                </div>
            </div>
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
                            Accepted formats: PDF, JPG, PNG (up to 100MB per file).
                            A requirement takes at most one separate photo — if it has several
                            pages, please combine them into a single PDF first.
                            <br />
                            <span className="text-red-600 font-semibold">* Required documents</span> must be uploaded before submission.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Requirements Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Main Requirements (1-{mainRequirements.length}) <span className="text-red-500">*</span>
                </h3>
                {mainRequirements.map((requirement) =>
                    requirement.is_group
                        ? renderRequirementGroup(requirement)
                        : renderRequirement(requirement)
                )}
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
