import React, { useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { useToast } from "@/Components/ui/use-toast";
import {
    FileText,
    User,
    Building2,
    MapPin,
    Home,
    ListChecks,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Eye,
    Upload,
    Package,
    Lock,
} from "lucide-react";

const STATUS_STYLES = {
    pending:               { label: "Pending Review",        cls: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
    in_applicant:          { label: "Awaiting Your Action",  cls: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertCircle },
    reviewed:              { label: "Waiting for Approval",  cls: "bg-sky-100 text-sky-800 border-sky-200",          icon: Clock },
    approved:              { label: "Approved — For Payment", cls: "bg-green-100 text-green-800 border-green-200",   icon: CheckCircle2 },
    rejected:              { label: "Denied",                cls: "bg-red-100 text-red-800 border-red-200",          icon: XCircle },
    // After payment is verified the applicant just sees "Application Approved".
    payment_confirmed:     { label: "Application Approved",  cls: "bg-green-100 text-green-800 border-green-200",     icon: CheckCircle2 },
    certificate_preparing: { label: "Application Approved",  cls: "bg-green-100 text-green-800 border-green-200",     icon: CheckCircle2 },
    certificate_ready:     { label: "Application Approved",  cls: "bg-green-100 text-green-800 border-green-200",     icon: CheckCircle2 },
    released:              { label: "Application Approved",  cls: "bg-green-100 text-green-800 border-green-200",     icon: CheckCircle2 },
    completed:             { label: "Application Approved",  cls: "bg-green-100 text-green-800 border-green-200",     icon: CheckCircle2 },
    for_payment:           { label: "Approved — For Payment", cls: "bg-amber-100 text-amber-800 border-amber-200",    icon: Clock },
    pending_payment:       { label: "Approved — For Payment", cls: "bg-amber-100 text-amber-800 border-amber-200",    icon: Clock },
};

function Field({ label, value }) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm text-gray-900 font-medium break-words">
                {value !== null && value !== undefined && value !== ""
                    ? value
                    : <span className="text-gray-400 italic font-normal">Not provided</span>}
            </p>
        </div>
    );
}

function Section({ icon: Icon, title, children }) {
    return (
        <Card>
            <CardHeader className="border-b bg-gray-50/60">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                    <Icon className="h-5 w-5 text-blue-600" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">{children}</CardContent>
        </Card>
    );
}

const yesNo = (v) => (v ? String(v).toUpperCase() : null);
const formatPeso = (n) =>
    n ? `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : null;
const formatSqm = (n) =>
    n ? `${Number(n).toLocaleString()} sqm` : null;

export default function ApplicationDetails({ application, requirements = [], documents = {} }) {
    const { toast } = useToast();
    const fileInputs = useRef({});
    const [uploadingId, setUploadingId] = useState(null);

    const statusKey = String(application.request_status || application.status || "pending").toLowerCase();
    // An unmapped status is shown as itself: reporting an approved application
    // as "Pending Review" is worse than showing an unfamiliar label.
    const status = STATUS_STYLES[statusKey] || {
        label: statusKey
            ? statusKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : "Pending Review",
        cls: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Clock,
    };
    const StatusIcon = status.icon;

    const isZC = String(application.project_type || "").toUpperCase() === "ZC";

    // A requirement flagged is_group is a heading whose documents are its
    // children (matched by parent_id); it has no upload slot of its own.
    const allMain = requirements.filter((r) => (r.section || "main") === "main");
    const mainRequirements = allMain.filter((r) => !r.parent_id);
    const childrenOf = (req) => allMain.filter((c) => c.parent_id === req.id);
    const zoningCertRequirements = requirements.filter((r) => r.section === "zoning_certification");
    const additionalRequirements = requirements.filter((r) => r.section === "additional");

    const docsFor = (id) => documents?.[id] || documents?.[String(id)] || [];

    // Once submitted, the application's documents are frozen — the applicant
    // cannot add or replace anything while it sits with the office. Uploading
    // only reopens when the office hands it back (in_applicant) or denies it
    // (rejected). Both actions are gated identically: a missing document is no
    // more editable than one already on file.
    const canUpload = ["in_applicant", "rejected"].includes(statusKey);
    const canReplace = canUpload;

    const handleUpload = (req, file) => {
        if (!file) return;

        setUploadingId(req.id);

        const form = new FormData();
        form.append("document", file, file.name);
        form.append("requirement_id", req.id);
        form.append("requirement_name", req.name);

        router.post(route("my-applications.requirement-upload", application.id), form, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () =>
                toast({ title: "Uploaded", description: `${req.name} has been submitted.` }),
            onError: (errors) =>
                toast({
                    variant: "destructive",
                    title: "Upload failed",
                    description:
                        Object.values(errors || {}).flat().join(" ") ||
                        "Use a PDF, JPG or PNG under 5MB.",
                }),
            onFinish: () => setUploadingId(null),
        });
    };

    const renderRequirement = (req) => {
        const files = docsFor(req.id);
        const uploaded = files.length > 0;
        const busy = uploadingId === req.id;
        const allowed = uploaded ? canReplace : canUpload;

        return (
            <div
                key={req.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white"
            >
                <div className="flex-shrink-0 mt-0.5">
                    {uploaded ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                            {req.name}
                            {req.required
                                ? <span className="text-red-500 ml-1">*</span>
                                : <span className="text-gray-400 ml-1 text-xs font-normal">(Optional)</span>}
                        </p>

                        {allowed ? (
                            <>
                                <input
                                    type="file"
                                    ref={(el) => { fileInputs.current[req.id] = el; }}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                        const picked = e.target.files?.[0];
                                        e.target.value = "";
                                        handleUpload(req, picked);
                                    }}
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={uploaded ? "outline" : "default"}
                                    disabled={busy}
                                    onClick={() => fileInputs.current[req.id]?.click()}
                                    className={`h-7 px-2.5 text-xs gap-1 ${uploaded ? "" : "bg-blue-600 hover:bg-blue-700"}`}
                                >
                                    <Upload className="h-3.5 w-3.5" />
                                    {busy ? "Uploading…" : uploaded ? "Replace" : "Upload"}
                                </Button>
                            </>
                        ) : uploaded ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                                <Lock className="h-3 w-3" />
                                Locked while under review
                            </span>
                        ) : null}
                    </div>

                    {req.description && (
                        <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{req.description}</p>
                    )}

                    {uploaded ? (
                        <div className="mt-2 space-y-1.5">
                            {files.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between gap-2 bg-gray-50 rounded px-3 py-2"
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-gray-800 truncate">
                                            {doc.original_filename}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {(doc.file_size / 1024).toFixed(0)} KB · {doc.uploaded_at}
                                        </p>
                                    </div>
                                    <a
                                        href={`/requirements/${doc.id}/view`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 mt-1">No document uploaded</p>
                    )}
                </div>
            </div>
        );
    };

    /**
     * A grouped requirement: the heading names it, and each document it asks for
     * gets its own row underneath.
     */
    const renderRequirementGroup = (req) => (
        <div key={req.id} className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 space-y-2">
            {/* An application filed before this requirement was split into separate
                slots has its document attached to the group itself — keep it visible. */}
            {docsFor(req.id).length > 0 ? (
                renderRequirement(req)
            ) : (
                <div>
                    <p className="text-sm font-semibold text-gray-900">
                        {req.name}
                        <span className="text-red-500 ml-1">*</span>
                    </p>
                    {req.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{req.description}</p>
                    )}
                </div>
            )}
            <div className="space-y-2">{childrenOf(req).map(renderRequirement)}</div>
        </div>
    );

    return (
        <>
            <Head title={`${application.application_number || "Application"} — CPDO`} />
            <ApplicantLayout title="Application Details">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <FileText className="h-7 w-7 text-blue-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {application.application_number || `Application #${application.id}`}
                                        </h1>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Submitted {application.created_at}
                                            {application.decision_number && (
                                                <> · Decision No. <span className="font-semibold text-gray-700">{application.decision_number}</span></>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <Badge className={`${status.cls} border px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5`}>
                                    <StatusIcon className="h-4 w-4" />
                                    {status.label}
                                </Badge>
                            </div>

                            {application.rejection_reason && (
                                <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-900">Reason for Denial</p>
                                        <p className="text-sm text-red-700 mt-1 whitespace-pre-line">
                                            {application.rejection_reason}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {application.admin_notes && (
                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">Note from the Zoning Office</p>
                                        <p className="text-sm text-blue-700 mt-1 whitespace-pre-line">
                                            {application.admin_notes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* The fee is only actionable once the Zoning Administrator has
                                approved the application. While it is still "Waiting for
                                Approval" the applicant cannot pay yet, so the amount is hidden. */}
                            {application.payment_amount && statusKey === "approved" && (
                                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-900">Amount to Pay at the Treasury</p>
                                        <p className="text-sm text-amber-800 mt-1">{formatPeso(application.payment_amount)}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Applicant */}
                    <Section icon={User} title="Applicant Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Name of Applicant" value={application.applicant_name} />
                            <Field label="Address" value={application.applicant_address} />
                            <Field label="Contact Number" value={application.applicant_contact} />
                            <Field label="Email" value={application.applicant_email} />
                        </div>

                        {(application.corporation_name || application.representative_name) && (
                            <div className="mt-6 pt-5 border-t grid grid-cols-1 md:grid-cols-2 gap-5">
                                {application.corporation_name && (
                                    <>
                                        <Field label="Corporation" value={application.corporation_name} />
                                        <Field label="Corporation Address" value={application.corporation_address} />
                                    </>
                                )}
                                {application.representative_name && (
                                    <>
                                        <Field label="Authorized Representative" value={application.representative_name} />
                                        <Field label="Representative Address" value={application.representative_address} />
                                    </>
                                )}
                            </div>
                        )}
                    </Section>

                    {/* Project */}
                    <Section icon={Building2} title="Project Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Field label="Locational Clearance" value={application.project_type} />
                            {!isZC && (
                                <>
                                    <Field label="Project Classification" value={application.project_nature} />
                                    <Field label="Nature / Duration" value={application.project_nature_duration} />
                                    <Field
                                        label="Nature Duration (Years)"
                                        value={application.project_nature_years ? `${application.project_nature_years} year(s)` : null}
                                    />
                                    <Field label="Project Cost" value={formatPeso(application.project_cost)} />
                                    <div className="md:col-span-2">
                                        <Field label="Project Description" value={application.project_description} />
                                    </div>
                                </>
                            )}
                        </div>
                    </Section>

                    {!isZC && (
                        <>
                    {/* Location */}
                        <Section icon={MapPin} title="Project Location">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Lot / Blk / House No." value={application.lot_number} />
                                <Field label="Street" value={application.project_location_street} />
                                <Field label="Barangay" value={application.project_location_barangay} />
                                <Field label="City / Municipality" value={application.project_location_city} />
                                <Field label="Province" value={application.project_location_province} />
                            </div>
                        </Section>
    
                        {/* Property & Land Use */}
                        <Section icon={Home} title="Property &amp; Land Use">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Lot Area" value={formatSqm(application.lot_area_sqm)} />
                                <Field label="Building / Improvement" value={formatSqm(application.bldg_improvement_sqm)} />
                                <Field label="Title Number" value={application.title_number} />
                                <Field label="Tax Declaration No." value={application.tax_declaration_no} />
                                <Field label="Zone Classification" value={application.zone_classification} />
                                <Field label="Right Over Land" value={application.right_over_land} />
                                <Field label="Existing Land Use" value={application.existing_land_use} />
                            </div>
    
                            <div className="mt-6 pt-5 border-t grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Written Notice Received" value={yesNo(application.has_written_notice)} />
                                <Field label="Notice Officer" value={application.notice_officer_name} />
                                <Field label="Notice Date(s)" value={application.notice_dates} />
                                <Field label="Similar Application Filed" value={yesNo(application.has_similar_application)} />
                                <Field label="Filed With (Offices)" value={application.similar_application_offices} />
                                <Field label="Similar Application Date(s)" value={application.similar_application_dates} />
                            </div>
                        </Section>
    
                        {/* Release */}
                        <Section icon={Package} title="Release of Certificate">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field
                                    label="Preferred Release Mode"
                                    value={application.preferred_release_mode
                                        ? application.preferred_release_mode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                                        : null}
                                />
                                <Field label="Release Address" value={application.release_address} />
                            </div>
                        </Section>
    
        </>
                    )}

                    {/* Requirements */}
                    <Section icon={ListChecks} title="Requirements">
                        {canUpload ? (
                            <p className="text-xs text-gray-500 mb-4">
                                {statusKey === "rejected"
                                    ? "Your application was denied. You can upload or replace a document for any requirement below."
                                    : "Your application has been returned to you. You can upload or replace a document for any requirement below."}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-500 mb-4">
                                Your documents are locked while the office reviews
                                your application. You can upload or replace them
                                only if the office returns the application to you.
                            </p>
                        )}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Main Requirements</h4>
                                <div className="space-y-2">
                                    {mainRequirements.map((req) =>
                                        req.is_group
                                            ? renderRequirementGroup(req)
                                            : renderRequirement(req)
                                    )}
                                </div>
                            </div>

                            {zoningCertRequirements.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Requirements of Zoning Certification</h4>
                                    <div className="space-y-2">
                                        {zoningCertRequirements.map(renderRequirement)}
                                    </div>
                                </div>
                            )}

                            {additionalRequirements.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <h4 className="text-sm font-semibold text-gray-700">Additional Requirements</h4>
                                    <div className="space-y-2">
                                        {additionalRequirements.map(renderRequirement)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Section>
                </div>
            </ApplicantLayout>
        </>
    );
}
