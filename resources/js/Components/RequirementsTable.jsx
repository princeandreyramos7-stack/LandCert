import React, { useState, useEffect } from "react";
import { FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useToast } from "@/Components/ui/use-toast";
import axios from "axios";
import { DocumentViewLink } from "@/Components/DocumentViewLink";
import { router } from "@inertiajs/react";

/**
 * Requirements Checklist Component
 * Shows ALL requirements with:
 * - Mark as Verified checkbox
 * - Remarks column (automatic label)
 * - Upload Docs column for admin
 * 
 * For Zoning Administrator (SuperAdmin):
 * - Shows read-only view
 * - Only displays verified requirements
 * - Hides Mark as Verified and Upload Docs columns
 */
export function RequirementsChecklist({ request, uploadedRequirements = [], selectedRequirements, onRequirementChange, userRole }) {
    const { toast } = useToast();
    const [remarks, setRemarks] = useState({});
    const [uploading, setUploading] = useState({});

    // Determine if current user is Zoning Administrator (super_admin)
    const isZoningAdministrator = userRole === 'super_admin' || window.location.pathname.includes('/super-admin/');

    // Initialize remarks from selectedRequirements
    useEffect(() => {
        const initialRemarks = {};
        Object.keys(selectedRequirements).forEach(reqId => {
            if (selectedRequirements[reqId]) {
                initialRemarks[reqId] = 'Verified';
            } else {
                initialRemarks[reqId] = 'Not Set';
            }
        });
        setRemarks(initialRemarks);
    }, []);

    // Group uploaded requirements by their requirement_id
    const uploadedMap = {};
    uploadedRequirements.forEach(group => {
        uploadedMap[group.key] = group;
    });

    // Get all requirements from reference
    const allMainRequirements = (request.requirements_reference || []).filter(r => r.section === 'main');
    const uploadableMainRequirements = allMainRequirements.filter(r => !r.is_group);
    
    const mainRequirementRows = [];
    allMainRequirements
        .filter(r => !r.parent_id)
        .forEach((req, index) => {
            const number = String(index + 1);
            mainRequirementRows.push({ req, number, isGroup: !!req.is_group });
            if (req.is_group) {
                allMainRequirements
                    .filter(child => child.parent_id === req.id)
                    .forEach((child, childIndex) => {
                        mainRequirementRows.push({
                            req: child,
                            number: `${number}.${childIndex + 1}`,
                            isChild: true,
                        });
                    });
            }
        });

    const allZoningRequirements = (request.requirements_reference || []).filter(r => r.section === 'zoning_certification');
    const allAdditionalRequirements = (request.requirements_reference || []).filter(r => r.section === 'additional');

    const mainUploadedCount = mainRequirementRows.filter(row => !row.isGroup && uploadedMap[row.req.id]?.files.length > 0).length;
    const zoningUploadedCount = allZoningRequirements.filter(req => uploadedMap[req.id]?.files.length > 0).length;
    const additionalUploadedCount = allAdditionalRequirements.filter(req => uploadedMap[req.id]?.files.length > 0).length;

    const handleToggleChange = (reqId, reqName, isChecked) => {
        // Update the verification status
        onRequirementChange(reqId, reqName, isChecked);
        
        // Auto-update remarks based on toggle
        const newRemark = isChecked ? 'Verified' : 'Not Set';
        setRemarks(prev => ({ ...prev, [reqId]: newRemark }));
    };

    // Helper function to remove numbering from requirement names (e.g., "1. " or "1.2 ")
    const stripNumbering = (name) => {
        if (!name) return '';
        // Remove patterns like "1. ", "2. ", "1.1 ", "1.2 ", etc.
        return name.replace(/^\d+(\.\d+)?\.\s*/, '');
    };

    const handleFileUpload = async (reqId, reqName, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [reqId]: true }));

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('request_id', request.id);
            formData.append('requirement_id', reqId);
            formData.append('requirement_name', reqName);
            
            // Determine the correct URL based on current path
            const currentPath = window.location.pathname;
            const uploadUrl = currentPath.includes('/super-admin/') 
                ? '/super-admin/upload-requirement-document' 
                : '/admin/upload-requirement-document';
            
            await axios.post(uploadUrl, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast({
                title: "Uploaded!",
                description: "Requirement document uploaded successfully.",
            });

            // Ask only for the application again, rather than
            // reloading the document. A full reload re-downloads and
            // re-parses the whole front end, throws away the scroll
            // position and everything the reviewer had open, and on a
            // slow connection takes seconds - to show one new file in
            // a list that is already on screen.
            router.reload({ only: ['request'] });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to upload document.",
            });
        } finally {
            setUploading(prev => ({ ...prev, [reqId]: false }));
        }
    };

    const renderRequirementRow = (reqRef, number, isChild, isGroup) => {
        if (isGroup) {
            return (
                <tr key={reqRef.id} className="bg-gray-50">
                    <td className="p-3 text-sm font-semibold text-gray-700 border-r border-gray-200">
                        {number}
                    </td>
                    <td className="p-3" colSpan={isZoningAdministrator ? 1 : 4}>
                        <p className="text-sm font-semibold text-gray-700">{stripNumbering(reqRef.name)}</p>
                        {reqRef.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{reqRef.description}</p>
                        )}
                    </td>
                </tr>
            );
        }

        const uploadedGroup = uploadedMap[reqRef.id];
        const hasUploads = uploadedGroup?.files && uploadedGroup.files.length > 0;
        const isChecked = selectedRequirements[reqRef.id] || false;

        // For Zoning Administrator: only show verified requirements
        if (isZoningAdministrator && !isChecked) {
            return null;
        }

        return (
            <tr key={reqRef.id} className="hover:bg-gray-50">
                <td className="p-3 text-sm font-semibold text-gray-700 border-r border-gray-200">
                    {number}
                </td>
                <td className="p-3 border-r border-gray-200">
                    <div className={isChild ? 'pl-4 border-l-2 border-gray-200' : undefined}>
                        <p className="text-sm font-medium text-gray-700">{stripNumbering(reqRef.name)}</p>
                        {reqRef.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{reqRef.description}</p>
                        )}
                        {hasUploads && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {uploadedGroup.files.map(file => (
                                    <DocumentViewLink
                                        key={file.id}
                                        doc={file}
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
                                        // The officer can mark the requirement
                                        // verified while looking at the scan,
                                        // instead of closing it and finding the
                                        // toggle in the row behind. Not offered
                                        // to the Administrator, whose view of
                                        // the checklist is read-only.
                                        verified={isChecked}
                                        onVerify={isZoningAdministrator
                                            ? null
                                            : (next) => handleToggleChange(reqRef.id, reqRef.name, next)}
                                    >
                                        <FileText className="h-3 w-3" />
                                        View
                                    </DocumentViewLink>
                                ))}
                            </div>
                        )}
                    </div>
                </td>
                {!isZoningAdministrator && (
                    <td className="p-3 border-r border-gray-200 text-center">
                        <label className={`inline-flex items-center ${!hasUploads ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleToggleChange(reqRef.id, reqRef.name, e.target.checked)}
                                disabled={!hasUploads}
                                className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"></div>
                        </label>
                        {!hasUploads && (
                            <div className="mt-1 text-xs text-gray-400">No documents</div>
                        )}
                    </td>
                )}
                <td className={`p-3 text-center ${isZoningAdministrator ? '' : 'border-r border-gray-200'}`}>
                    <span className={`text-sm font-medium ${isChecked ? 'text-green-600' : 'text-gray-500'}`}>
                        {remarks[reqRef.id] || 'Not Set'}
                    </span>
                </td>
                {!isZoningAdministrator && (
                    <td className="p-3 text-center">
                        <label className="cursor-pointer inline-block">
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(reqRef.id, reqRef.name, e)}
                                disabled={uploading[reqRef.id]}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={uploading[reqRef.id]}
                                className="flex items-center gap-1"
                                asChild
                            >
                                <span>
                                    {uploading[reqRef.id] ? (
                                        <>Uploading...</>
                                    ) : (
                                        <>
                                            <Upload className="h-3 w-3" />
                                            Upload
                                        </>
                                    )}
                                </span>
                            </Button>
                        </label>
                    </td>
                )}
            </tr>
        );
    };

    return (
        <div className="space-y-6">
            {/* Main Requirements Section */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">REQUIRED</span>
                    Main Requirements ({mainUploadedCount}/{uploadableMainRequirements.length} uploaded)
                </h4>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-16 border-r border-gray-200">NO.</th>
                                <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide border-r border-gray-200">Requirement Name</th>
                                {!isZoningAdministrator && (
                                    <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Mark as Verified</th>
                                )}
                                <th className={`text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-28 ${isZoningAdministrator ? '' : 'border-r border-gray-200'}`}>Remarks</th>
                                {!isZoningAdministrator && (
                                    <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32">Upload Docs</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mainRequirementRows
                                .map(({ req: reqRef, number, isGroup, isChild }) => 
                                    renderRequirementRow(reqRef, number, isChild, isGroup)
                                )
                                .filter(row => row !== null)}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Zoning Requirements Section (CZC only) */}
            {allZoningRequirements.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">ZONING CERT</span>
                        Requirements of Zoning Certification ({zoningUploadedCount}/{allZoningRequirements.length} uploaded)
                    </h4>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-16 border-r border-gray-200">NO.</th>
                                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide border-r border-gray-200">Requirement Name</th>
                                    {!isZoningAdministrator && (
                                        <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Mark as Verified</th>
                                    )}
                                    <th className={`text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-28 ${isZoningAdministrator ? '' : 'border-r border-gray-200'}`}>Remarks</th>
                                    {!isZoningAdministrator && (
                                        <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32">Upload Docs</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {allZoningRequirements
                                    .map((reqRef, index) => 
                                        renderRequirementRow(reqRef, String(index + 1), false, false)
                                    )
                                    .filter(row => row !== null)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Additional Requirements Section */}
            {allAdditionalRequirements.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">ADDITIONAL</span>
                        Additional Requirements ({additionalUploadedCount}/{allAdditionalRequirements.length} uploaded)
                    </h4>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-16 border-r border-gray-200">NO.</th>
                                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide border-r border-gray-200">Requirement Name</th>
                                    {!isZoningAdministrator && (
                                        <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Mark as Verified</th>
                                    )}
                                    <th className={`text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-28 ${isZoningAdministrator ? '' : 'border-r border-gray-200'}`}>Remarks</th>
                                    {!isZoningAdministrator && (
                                        <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32">Upload Docs</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {allAdditionalRequirements
                                    .map((reqRef, index) => 
                                        renderRequirementRow(reqRef, String(index + 1), false, false)
                                    )
                                    .filter(row => row !== null)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
