import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Switch } from "@/Components/ui/switch";
import {
    FileText,
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Check,
    Sparkles,
    Loader2,
    History,
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { Toaster } from "@/Components/ui/toaster";
import axios from "axios";
import { getStatusConfig } from "@/lib/applicationStatus";

/**
 * Display-only formatting for peso amount fields.
 */
const formatAmountForDisplay = (rawValue) => {
    if (rawValue === null || rawValue === undefined || rawValue === "") return "";
    const raw = String(rawValue);
    const [integerPart, ...decimalParts] = raw.split(".");
    const hasDecimalPoint = raw.includes(".");
    const groupedInteger = integerPart === "" ? "" : Number(integerPart).toLocaleString("en-US");
    return hasDecimalPoint ? `${groupedInteger}.${decimalParts.join("")}` : groupedInteger;
};

export default function DocumentVerification({ request }) {
    // Pre-select action based on current request status
    const getInitialAction = () => {
        if (request.status === 'reviewed' || request.status === 'approved') {
            return 'approved';
        } else if (request.status === 'rejected') {
            return 'rejected';
        }
        return '';
    };
    
    const [action, setAction] = useState(getInitialAction());

    // Once approved (or the certificate flow has started), the decision is final —
    // Mark as Reviewed / Denied are locked.
    const decisionLocked = ['approved', 'certificate_preparing', 'certificate_ready', 'released']
        .includes(String(request.status || '').toLowerCase());

    // Whether the Zoning Officer has already marked the application reviewed.
    // If not, the Zoning Administrator reviews AND decides in one step.
    const officerReviewed = String(request.status || '').toLowerCase() === 'reviewed';

    const [formData, setFormData] = useState({
        rejection_reason: request.rejection_reason || 'Lacking of Requirements',
        admin_notes: request.admin_notes || '',
        payment_amount: request.payment_amount ? String(request.payment_amount) : '',
    });
    const [loading, setLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [requirementChecks, setRequirementChecks] = useState(request.verified_requirements || {});
    const { toast } = useToast();
    
    // Save requirement checks to database
    const handleToggleRequirement = async (key, name, checked) => {
        const updated = { ...requirementChecks, [key]: checked };
        setRequirementChecks(updated);
        
        try {
            await axios.post(route('super-admin.save-requirement-verification'), {
                request_id: request.id,
                verified_requirements: updated
            });
        } catch (error) {
            console.error('Error saving requirement verification:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save requirement verification status"
            });
        }
    };

    // Group uploaded documents by requirement
    const groupedRequirements = useMemo(() => {
        const docs = request.uploaded_requirements || [];
        const reference = request.requirements_reference || [];
        const sectionById = new Map(reference.map((r) => [r.id, r.section || 'main']));
        const groups = new Map();

        docs.forEach((doc) => {
            const key = doc.requirement_id ?? doc.requirement_name;
            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    requirement_name: doc.requirement_name,
                    section: sectionById.get(doc.requirement_id) || 'main',
                    files: [],
                });
            }
            groups.get(key).files.push(doc);
        });

        return Array.from(groups.values());
    }, [request.uploaded_requirements, request.requirements_reference]);

    const mainUploadedGroups = groupedRequirements.filter((g) => g.section !== 'additional' && g.section !== 'zoning_certification');
    const zoningUploadedGroups = groupedRequirements.filter((g) => g.section === 'zoning_certification');
    const additionalUploadedGroups = groupedRequirements.filter((g) => g.section === 'additional');

    // Generate missing requirements message for denial
    const getMissingRequirements = () => {
        const allRequirements = [...(request.requirements_reference || [])];
        const uploadedIds = new Set(groupedRequirements.map(g => g.key));
        const missing = allRequirements.filter(req => !uploadedIds.has(req.id) || !requirementChecks[req.id]);
        
        if (missing.length === 0) return '';
        return 'Missing or Incomplete Requirements:\n' + missing.map(req => `- ${req.name}`).join('\n');
    };

    // Update denial reason when action changes to denied
    const handleActionChange = (newAction) => {
        setAction(newAction);
        if (newAction === 'rejected') {
            const missingReqs = getMissingRequirements();
            if (missingReqs) {
                setFormData(prev => ({ ...prev, rejection_reason: missingReqs }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (decisionLocked) {
            toast({
                variant: "destructive",
                title: "Decision Locked",
                description: "This application has already been approved. The decision can no longer be changed.",
            });
            return;
        }

        if (action === 'approved') {
            const amount = parseFloat(formData.payment_amount);
            if (!formData.payment_amount || Number.isNaN(amount) || amount < 0) {
                toast({
                    variant: "destructive",
                    title: "Treasury fee required",
                    description: "Enter the amount the applicant must pay at the Treasury before approving.",
                });
                return;
            }
        }

        setShowConfirmDialog(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmDialog(false);
        setLoading(true);

        // If the Zoning Officer already reviewed, use the plain approve/deny
        // endpoints. Otherwise the Zoning Administrator reviews AND decides in
        // one step via review-and-decide (creates the report on the fly).
        let endpoint;
        let payload;
        if (officerReviewed) {
            endpoint = action === 'approved'
                ? route('super-admin.approve-request', request.report_id)
                : route('super-admin.reject-request', request.report_id);
            payload = action === 'rejected'
                ? { description: formData.rejection_reason }
                : {};
        } else {
            endpoint = route('super-admin.review-and-decide', request.id);
            payload = action === 'approved'
                ? { action: 'approved', payment_amount: formData.payment_amount, admin_notes: formData.admin_notes }
                : { action: 'rejected', rejection_reason: formData.rejection_reason };
        }

        router.post(endpoint, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: "Success!",
                    description: action === 'approved'
                        ? "Application approved. The applicant has been notified."
                        : "Application denied. The applicant has been notified.",
                });
                setTimeout(() => router.visit(route('super-admin.requests')), 1200);
            },
            onError: (errors) => {
                toast({
                    variant: "destructive",
                    title: "Could not submit decision",
                    description: Object.values(errors || {}).flat().join(' ')
                        || "Please try again.",
                });
            },
            onFinish: () => setLoading(false),
        });
    };

    // Status badge: the derived status can be any step of the lifecycle.
    const statusConfig = getStatusConfig(request.status || "pending");
    const StatusIcon = statusConfig.icon;

    // Get all requirements from reference
    const allMainRequirements = (request.requirements_reference || []).filter(r => r.section === 'main');
    const allZoningRequirements = (request.requirements_reference || []).filter(r => r.section === 'zoning_certification');
    const allAdditionalRequirements = (request.requirements_reference || []).filter(r => r.section === 'additional');

    return (
        <SuperAdminLayout 
            title="Document Verification" 
            breadcrumbs={[
                { label: "Dashboard", href: "/super-admin/dashboard" }, 
                { label: "Applications", href: "/super-admin/requests" }
            ]}
        >
            <Head title={`Document Verification ${request.application_number || `TPZ-${request.id}`}`} />

            <div className="max-w-7xl mx-auto">
               

                {/* Application Header */}
                <Card className="mb-6">
                    <CardHeader className="bg-white border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-gray-900">
                                        {request.application_number || `TPZ-${request.id}`}
                                    </CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Document Verification & Review
                                    </p>
                                </div>
                            </div>
                            <Badge className={`${statusConfig.color} border px-4 py-2 text-sm font-semibold flex items-center gap-2`}>
                                <StatusIcon className="h-4 w-4" />
                                {statusConfig.label}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                {/* Requirements Checklist */}
                <Card className="mb-6">
                    <CardHeader className="bg-white border-b">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-full">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-2xl text-gray-900">
                                Requirements Checklist
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {/* Main Requirements Section */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">REQUIRED</span>
                                    Main Requirements ({mainUploadedGroups.length}/{allMainRequirements.length} uploaded)
                                </h4>
                                
                                {/* Requirements Table */}
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-16 border-r border-gray-200">NO.</th>
                                                <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide border-r border-gray-200">Requirement Name</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Mark as Verified</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Remarks</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-40">Upload Docs</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {allMainRequirements.map((reqRef, index) => {
                                                const uploadedGroup = mainUploadedGroups.find(g => g.key === reqRef.id);
                                                const isChecked = requirementChecks[reqRef.id] || false;
                                                
                                                return (
                                                    <RequirementTableRow
                                                        key={reqRef.id}
                                                        number={index + 1}
                                                        requirement={reqRef}
                                                        uploadedGroup={uploadedGroup}
                                                        isChecked={isChecked}
                                                        onToggle={(checked) => handleToggleRequirement(reqRef.id, reqRef.name, checked)}
                                                        requestId={request.id}
                                                    />
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Requirements of Zoning Certification (CZC only) */}
                            {allZoningRequirements.length > 0 && (
                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">ZONING CERT</span>
                                    Requirements of Zoning Certification ({zoningUploadedGroups.length}/{allZoningRequirements.length} uploaded)
                                </h4>

                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-16 border-r border-gray-200">NO.</th>
                                                <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide border-r border-gray-200">Requirement Name</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Mark as Verified</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Remarks</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-40">Upload Docs</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {allZoningRequirements.map((reqRef, index) => {
                                                const uploadedGroup = zoningUploadedGroups.find(g => g.key === reqRef.id);
                                                const isChecked = requirementChecks[reqRef.id] || false;
                                                return (
                                                    <RequirementTableRow
                                                        key={reqRef.id}
                                                        number={index + 1}
                                                        requirement={reqRef}
                                                        uploadedGroup={uploadedGroup}
                                                        isChecked={isChecked}
                                                        onToggle={(checked) => handleToggleRequirement(reqRef.id, reqRef.name, checked)}
                                                        requestId={request.id}
                                                    />
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            )}

                            {/* Additional Requirements Section */}
                            <div className="space-y-4 pt-4 border-t">
                                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">OPTIONAL</span>
                                    Additional Requirements ({additionalUploadedGroups.length}/{allAdditionalRequirements.length} uploaded)
                                </h4>
                                
                                {/* Additional Requirements Table */}
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-16 border-r border-gray-200">NO.</th>
                                                <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide border-r border-gray-200">Requirement Name</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Mark as Verified</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32 border-r border-gray-200">Remarks</th>
                                                <th className="text-center p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-40">Upload Docs</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {allAdditionalRequirements.map((reqRef, index) => {
                                                const uploadedGroup = additionalUploadedGroups.find(g => g.key === reqRef.id);
                                                const isChecked = requirementChecks[reqRef.id] || false;
                                                
                                                return (
                                                    <RequirementTableRow
                                                        key={reqRef.id}
                                                        number={index + 1}
                                                        requirement={reqRef}
                                                        uploadedGroup={uploadedGroup}
                                                        isChecked={isChecked}
                                                        onToggle={(checked) => handleToggleRequirement(reqRef.id, reqRef.name, checked)}
                                                        requestId={request.id}
                                                    />
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-semibold text-blue-900 mb-1">Requirements Summary</h5>
                                        <p className="text-sm text-blue-700">
                                            Total Uploaded: <span className="font-bold">{mainUploadedGroups.length + zoningUploadedGroups.length + additionalUploadedGroups.length}</span>
                                            {' / '}
                                            <span className="font-bold">{allMainRequirements.length + allZoningRequirements.length + allAdditionalRequirements.length}</span>
                                            {' • '}
                                            Main: <span className="font-bold">{mainUploadedGroups.length}/{allMainRequirements.length}</span>
                                            {' • '}
                                            Zoning Cert: <span className="font-bold">{zoningUploadedGroups.length}/{allZoningRequirements.length}</span>
                                            {' • '}
                                            Additional: <span className="font-bold">{additionalUploadedGroups.length}/{allAdditionalRequirements.length}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Review Form */}
                <Card>
                    <CardHeader className="bg-white border-b">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-full">
                                <Sparkles className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-2xl text-gray-900">
                                Review & Decision
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {/* Previous Decision Banner — only once an actual decision exists */}
                        {(decisionLocked || ['rejected'].includes(String(request.status || '').toLowerCase())) && (
                            <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <History className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900">Previous Decision</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            This application was previously <span className="font-bold">
                                                {decisionLocked ? 'APPROVED' : 'DENIED'}
                                            </span>.
                                            {request.rejection_reason && ` Reason: "${request.rejection_reason}"`}
                                            <br />
                                            <span className="text-xs">
                                                This decision is final and can no longer be changed.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* The officer has not reviewed yet — the Administrator does both steps here. */}
                        {!officerReviewed && !decisionLocked && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-900">Review &amp; decide in one step</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            The Zoning Officer has not reviewed this application yet. As the Zoning
                                            Administrator you can review it and approve or deny it now — set the
                                            Treasury fee below when approving.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Action Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Action <span className="text-red-500">*</span>
                                </label>
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${decisionLocked ? 'opacity-60 pointer-events-none' : ''}`}>
                                    <label className={`relative flex items-center p-3 border rounded-lg transition-all ${decisionLocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                                        action === 'approved'
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="action"
                                            value="approved"
                                            checked={action === 'approved'}
                                            onChange={(e) => handleActionChange(e.target.value)}
                                            disabled={decisionLocked}
                                            className="w-4 h-4"
                                            required
                                        />
                                        <div className="ml-3">
                                            <div className="font-medium text-gray-900 text-sm">
                                                APPROVE
                                            </div>
                                        </div>
                                    </label>

                                    <label className={`relative flex items-center p-3 border rounded-lg transition-all ${decisionLocked ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                                        action === 'rejected'
                                            ? 'border-red-400 bg-red-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}>
                                        <input
                                            type="radio"
                                            name="action"
                                            value="rejected"
                                            checked={action === 'rejected'}
                                            onChange={(e) => handleActionChange(e.target.value)}
                                            disabled={decisionLocked}
                                            className="w-4 h-4"
                                            required
                                        />
                                        <div className="ml-3">
                                            <div className="font-medium text-gray-900 text-sm">
                                                DENY
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Approve */}
                            {action === 'approved' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">Approve Application</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                A decision number is issued and the applicant is notified so they can pay
                                                the fee set by the Zoning Officer at the Treasury Office.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Treasury fee. Read-only when the officer already set it during
                                        review; editable when the Administrator is reviewing here. */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount to Pay at the Treasury <span className="text-red-500">*</span>
                                        </label>
                                        {officerReviewed ? (
                                            <>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    {request.payment_amount
                                                        ? `₱${formatAmountForDisplay(request.payment_amount)}`
                                                        : <span className="text-sm font-normal text-gray-500 italic">Not set by the officer</span>}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Set by the Zoning Officer when the application was reviewed.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="relative max-w-xs">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={formData.payment_amount}
                                                        onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
                                                        placeholder="0.00"
                                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:border-green-400 focus:ring-1 focus:ring-green-400"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    The applicant will be asked to pay this amount at the Treasury Office.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Deny Form */}
                            {action === 'rejected' && (
                                <div>
                                    <div className="bg-white rounded-lg p-5 border border-gray-200">
                                        <div className="mb-4">
                                            <h3 className="text-base font-semibold text-gray-900">Denial Reason</h3>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Detailed Reason <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={formData.rejection_reason}
                                                onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                                                rows="4"
                                                required
                                                maxLength="1000"
                                                placeholder="Please provide a clear and detailed reason for denial..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 resize-none"
                                            />
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-xs text-gray-500">
                                                    {formData.rejection_reason.length}/1000 characters
                                                </p>
                                            </div>
                                        </div>

                                        {/* Quick Reasons */}
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const missing = getMissingRequirements();
                                                        setFormData({ ...formData, rejection_reason: missing || 'Lacking of Requirements' });
                                                    }}
                                                    className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 shadow-sm flex items-center gap-1.5"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Missing Requirements
                                                </button>
                                                
                                                {[
                                                    'Incomplete Documents',
                                                    'Invalid Location',
                                                    'Zoning Violation',
                                                    'Missing Information'
                                                ].map((reason) => (
                                                    <button
                                                        key={reason}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, rejection_reason: reason })}
                                                        className="px-3 py-1.5 text-sm font-medium bg-white border-2 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 rounded-lg transition-all duration-200"
                                                    >
                                                        {reason}
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            <p className="text-xs text-gray-500 mt-2 flex items-start gap-1.5">
                                                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                                                <span>
                                                    <span className="font-semibold">Missing Requirements</span> button will list all requirements that are not marked as verified (toggle not turned on).
                                                </span>
                                            </p>
                                        </div>

                                        {/* Warning */}
                                        <div className="mt-4 flex items-start gap-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-yellow-800">
                                                <span className="font-semibold">Note:</span> The applicant will receive an email with your denial reason. Please ensure it's clear and professional.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Link href={route('super-admin.requests')}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={loading || !action || decisionLocked}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : decisionLocked ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Decision Final
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-2" />
                                            Submit Decision
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            
            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Confirm Your Decision
                            </h3>
                        </div>
                        
                        <div className="px-6 py-4">
                            <div className="mb-4">
                                {action === 'approved' ? (
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-gray-700 mb-2">
                                                <span className="font-semibold text-green-600">APPROVE</span> this application
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                The applicant will be asked to pay{' '}
                                                <span className="font-semibold text-gray-900">
                                                    ₱{formatAmountForDisplay(officerReviewed ? request.payment_amount : formData.payment_amount) || '0.00'}
                                                </span>{' '}
                                                at the Treasury Office, and is notified immediately.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-gray-700 mb-2">
                                                <span className="font-semibold text-red-600">DENY</span> this application
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">Reason:</p>
                                            <p className="text-sm text-gray-700 italic bg-gray-50 p-2 rounded border">
                                                "{formData.rejection_reason || 'No reason provided'}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-4 p-3 bg-gray-50 rounded border-l-4 border-gray-400">
                                <p className="text-sm text-gray-700">
                                    This action cannot be undone. The applicant will be notified.
                                </p>
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmSubmit}
                                disabled={loading}
                                className={`flex-1 ${
                                    action === 'approved'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                } text-white`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>Confirm</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            <Toaster />
        </SuperAdminLayout>
    );
}

// Requirement Table Row Component
function RequirementTableRow({ number, requirement, uploadedGroup, isChecked, onToggle, requestId }) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);
    const { toast } = useToast();

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setUploadError('File size must be less than 10MB');
            toast({
                variant: "destructive",
                title: "File too large",
                description: "File size must be less than 10MB"
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('request_id', requestId);
        formData.append('requirement_id', requirement.id);
        formData.append('requirement_name', requirement.name);

        setUploading(true);
        setUploadError('');

        try {
            await axios.post('/super-admin/upload-requirement-document', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast({
                title: "Success",
                description: "Document uploaded successfully"
            });

            // Reload the page to show the uploaded document
            window.location.reload();
        } catch (error) {
            console.error('Upload error:', error);
            const errorMsg = error.response?.data?.message || 'Failed to upload document';
            setUploadError(errorMsg);
            toast({
                variant: "destructive",
                title: "Upload failed",
                description: errorMsg
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <tr className="hover:bg-gray-50">
            {/* Number */}
            <td className="p-3 text-sm font-semibold text-gray-700 border-r border-gray-200">
                {number}
            </td>

            {/* Requirement Name */}
            <td className="p-3 border-r border-gray-200">
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        {requirement.name}
                    </p>
                    {uploadedGroup && uploadedGroup.files && (
                        <div className="mt-2 space-y-1">
                            {uploadedGroup.files.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-2 text-xs text-gray-600">
                                    <FileText className="h-3 w-3" />
                                    <span className="truncate max-w-xs">{doc.original_filename}</span>
                                    <a
                                        href={`/requirements/${doc.id}/view`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline whitespace-nowrap"
                                    >
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                    {!uploadedGroup && (
                        <p className="text-xs text-red-600 mt-1">Not uploaded</p>
                    )}
                </div>
            </td>

            {/* Mark as Verified */}
            <td className="p-3 text-center border-r border-gray-200">
                <div className="flex justify-center">
                    <Switch
                        checked={isChecked}
                        onCheckedChange={onToggle}
                        className="data-[state=checked]:bg-green-600"
                        disabled={!uploadedGroup}
                    />
                </div>
            </td>

            {/* Remarks */}
            <td className="p-3 text-center border-r border-gray-200">
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    isChecked 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                }`}>
                    {isChecked ? 'Verified' : 'Not Set'}
                </span>
            </td>

            {/* Upload Docs */}
            <td className="p-3 text-center">
                <div className="flex justify-center">
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-xs"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <FileText className="h-3 w-3 mr-1" />
                                Upload
                            </>
                        )}
                    </Button>
                </div>
                {uploadError && (
                    <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                )}
            </td>
        </tr>
    );
}
