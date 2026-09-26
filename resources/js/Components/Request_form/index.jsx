import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import { useToast } from "@/Components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { FileText } from "lucide-react";

// Local Components
import { WelcomeBoard } from "./WelcomeBoard";
import { StepIndicator } from "./StepIndicator";
import { ClearanceTypeSelector } from "./ClearanceTypeSelector";
import { Step1ApplicantInfo } from "./Step1ApplicantInfo";
import { Step2ProjectDetails } from "./Step2ProjectDetails";
import { Step3LandUse } from "./Step3LandUse";
import { Step4Requirements } from "./Step4Requirements";
import { FormNavigation } from "./FormNavigation";
import { ApplicationSummaryModal } from "./ApplicationSummaryModal";
import { validateStep1, validateStep2, validateStep3, validateStep4 } from "./utils";
import { hasCsrfToken, appendCsrfField } from "@/lib/csrf";
import { describeOversizedUpload } from "./uploadLimits";
import { saveDraftMeta, loadDraftMeta, saveDraftFiles, loadDraftFiles, clearDraft, fetchServerDraft, saveServerDraft, clearServerDraft } from "@/lib/requestDraft";
import { fetchUntilOnline } from "@/lib/resilientSubmit";

export default function RequestForm({ isEditing = false, existingApplication = null }) {
    const { toast } = useToast();
    const page = usePage();
    const flash = page.props.flash || {};
    // What the server will accept in one POST, shared from php.ini.
    const uploadLimits = page.props.uploadLimits || {};

    // A new application starts with the applicant's own name and address
    // from their account, so the first page is mostly done before they begin.
    const me = page.props.auth?.user || {};

    // A brand-new application (never one being edited/resubmitted) left
    // behind by an earlier tab that was refreshed or closed mid-fill: its
    // typed answers, so the welcome board is skipped and the wizard opens
    // straight back where it was left, not a blank Step 1. Read
    // synchronously (sessionStorage allows it) so this never flashes the
    // welcome board before flipping past it. See resources/js/lib/requestDraft.js.
    const restoredDraftMeta = useMemo(
        () => (isEditing ? null : loadDraftMeta(me.id)),
        // Looked up once, on this page's first render only - not on every
        // re-render, which an empty dependency array via useMemo(fn, []) gives.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // Welcome/requirements board is shown first; applicants proceed to Step 1 when ready
    const [showWelcome, setShowWelcome] = useState(!isEditing && !restoredDraftMeta); // Skip welcome if editing or resuming
    const [currentStep, setCurrentStep] = useState(restoredDraftMeta?.currentStep ?? 1);
    const [completedSteps, setCompletedSteps] = useState(restoredDraftMeta?.completedSteps ?? []);
    const [hasRepresentative, setHasRepresentative] = useState(restoredDraftMeta?.hasRepresentative ?? false);
    // True once a draft (this device's or, once fetched, the account's) has
    // actually been applied to the form - drives the "Apply for New
    // Application" button, which only makes sense once there is something to
    // discard.
    const [draftWasRestored, setDraftWasRestored] = useState(Boolean(restoredDraftMeta));
    const [isStartNewConfirmOpen, setIsStartNewConfirmOpen] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    // The submit goes out through fetch(), not Inertia, so useForm's `processing`
    // never flips and the spinner it drives never appeared. This tracks the real
    // request.
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 'idle' | 'waiting' | 'retrying' - the connection dropped mid-submit and
    // this is retrying on its own (see resources/js/lib/resilientSubmit.js).
    const [connectionState, setConnectionState] = useState('idle');
    // Lets "Cancel and keep editing" actually stop the retry loop instead of
    // just hiding it while it keeps trying in the background.
    const submitAbortRef = useRef(null);
    const [submitErrors, setSubmitErrors] = useState([]);
    // 'form'   -> the messages are validation problems the applicant can fix
    // 'system' -> the message is a server/system failure, nothing to fix in the form
    const [submitErrorKind, setSubmitErrorKind] = useState(null);
    // Inline marks from the step validators, keyed by field (see validateCurrentStep).
    const [stepErrors, setStepErrors] = useState({});
    // Track previous project type to detect changes
    const previousProjectType = useRef(existingApplication?.project_type || "");

    // Restored draft answers are applied last: they only override a field
    // that was actually typed into, so an application/account default this
    // wizard would otherwise have filled in for a fresh visit still applies
    // to any field the draft never touched.
    const initialFormData = {
        // Step 1: Applicant Information
        applicant_name: existingApplication?.applicant_name || me.name || "",
        corporation_name: existingApplication?.corporation_name || "",
        // The address is picked from the PSGC list now; the server composes
        // the one-line address from these five and stores that. The old
        // free-text value rides along as `_legacy` so an application filed
        // before the picker can still show what is on file while it is
        // being chosen again.
        applicant_address_region_code: existingApplication?.applicant_address_region_code || me.address_region_code || "",
        applicant_address_province_code: existingApplication?.applicant_address_province_code || me.address_province_code || "",
        applicant_address_city_code: existingApplication?.applicant_address_city_code || me.address_city_code || "",
        applicant_address_barangay_code: existingApplication?.applicant_address_barangay_code || me.address_barangay_code || "",
        applicant_address_street: existingApplication?.applicant_address_street || me.address_street || "",
        applicant_address_legacy:
            existingApplication?.applicant_address_barangay_code || me.address_barangay_code
                ? ""
                : existingApplication?.applicant_address || me.address || "",
        corporation_address_region_code: existingApplication?.corporation_address_region_code || "",
        corporation_address_province_code: existingApplication?.corporation_address_province_code || "",
        corporation_address_city_code: existingApplication?.corporation_address_city_code || "",
        corporation_address_barangay_code: existingApplication?.corporation_address_barangay_code || "",
        corporation_address_street: existingApplication?.corporation_address_street || "",
        corporation_address_legacy:
            existingApplication?.corporation_address_barangay_code
                ? ""
                : existingApplication?.corporation_address || "",
        authorized_representative_name: existingApplication?.authorized_representative_name || "",
        authorized_representative_address_region_code: existingApplication?.authorized_representative_address_region_code || "",
        authorized_representative_address_province_code: existingApplication?.authorized_representative_address_province_code || "",
        authorized_representative_address_city_code: existingApplication?.authorized_representative_address_city_code || "",
        authorized_representative_address_barangay_code: existingApplication?.authorized_representative_address_barangay_code || "",
        authorized_representative_address_street: existingApplication?.authorized_representative_address_street || "",
        authorized_representative_address_legacy:
            existingApplication?.authorized_representative_address_barangay_code
                ? ""
                : existingApplication?.authorized_representative_address || "",
        authorized_representative_email: existingApplication?.authorized_representative_email || "",
        authorization_letter: null,
        // The letter already on file when a returned application is edited -
        // not sent back; it says the field is satisfied and names the file.
        authorization_letter_on_file: existingApplication?.authorization_letter_on_file || null,

        // Step 2: Project Details
        project_type: existingApplication?.project_type || "",
        project_nature: existingApplication?.project_nature || "",
        project_location_number: existingApplication?.project_location_number || "",
        project_location_street: existingApplication?.project_location_street || "",
        project_location_barangay: existingApplication?.project_location_barangay || "",
        project_location_municipality: existingApplication?.project_location_municipality || "City of Ilagan",
        project_location_province: existingApplication?.project_location_province || "Isabela",
        lot_area_sqm: existingApplication?.lot_area_sqm || "",
        bldg_improvement_sqm: existingApplication?.bldg_improvement_sqm || "",
        // The parcel's legal Lot No. and Tax Dec. No. - what the certificate
        // and printed application form quote by these exact names. Distinct
        // from project_location_number, which is the street/house number.
        lot_number: existingApplication?.lot_number || "",
        tax_declaration_no: existingApplication?.tax_declaration_no || "",
        right_over_land: existingApplication?.right_over_land || "",
        project_nature_duration: existingApplication?.project_nature_duration || "",
        project_nature_years: existingApplication?.project_nature_years || "",
        project_cost: existingApplication?.project_cost || "",
        existing_land_use: existingApplication?.existing_land_use || "",

        // Step 3: Land Use
        has_written_notice: existingApplication?.has_written_notice || "",
        notice_officer_name: existingApplication?.notice_officer_name || "",
        notice_dates: existingApplication?.notice_dates || "",
        has_similar_application: existingApplication?.has_similar_application || "",
        similar_application_offices: existingApplication?.similar_application_offices || "",
        similar_application_dates: existingApplication?.similar_application_dates || "",
        preferred_release_mode: existingApplication?.preferred_release_mode || "",
        release_address: existingApplication?.release_address || "",
        
        // Step 4: Requirements Upload
        requirement_uploads: {},
        verified_requirements: existingApplication?.verified_requirements || {},
    };

    const { data, setData, post, put, processing, errors, reset } = useForm({
        ...initialFormData,
        ...(restoredDraftMeta?.data || {}),
    });

    // Requirement files are held OUTSIDE Inertia's useForm on purpose.
    // useForm.setData runs lodash cloneDeep over the whole form on every call,
    // and cloneDeep destroys File objects — so any File parked in form state is
    // silently shredded by the next setData and never reaches the server.
    const [requirementFiles, setRequirementFiles] = useState({});

    // The rest of a restored draft: its attached files. Unlike the typed
    // answers above (read synchronously so the welcome board is never shown
    // then un-shown), IndexedDB can only be read asynchronously - so this
    // runs once, right after mount, only when there was a draft to resume.
    useEffect(() => {
        if (!restoredDraftMeta) return;
        let cancelled = false;

        (async () => {
            const { requirementFiles: restoredFiles, authorizationLetter } = await loadDraftFiles(me.id);
            if (cancelled) return;

            if (Object.keys(restoredFiles).length > 0) {
                setRequirementFiles(restoredFiles);
            }
            if (authorizationLetter) {
                setData((current) => ({ ...current, authorization_letter: authorizationLetter }));
            }

            toast({
                title: "Welcome back",
                description: "Your in-progress application was restored from before the page refreshed.",
            });
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // No draft on this browser - but this account may have one saved from
    // closing the tab entirely, or from another device (see
    // ApplicationDraftController). Checked only when the fast, local check
    // above found nothing, so a same-device refresh never waits on this.
    // Fields and step only: an account-tied draft never carries files (see
    // the migration for why), so there is nothing to restore for those -
    // Step 4 will simply ask for them again.
    useEffect(() => {
        if (isEditing || restoredDraftMeta) return;
        let cancelled = false;

        (async () => {
            const draft = await fetchServerDraft();
            if (cancelled || !draft?.data) return;

            setData((current) => ({ ...current, ...draft.data }));
            if (typeof draft.current_step === 'number') setCurrentStep(draft.current_step);
            if (Array.isArray(draft.completed_steps)) setCompletedSteps(draft.completed_steps);
            if (typeof draft.has_representative === 'boolean') setHasRepresentative(draft.has_representative);
            setShowWelcome(false);
            setDraftWasRestored(true);

            toast({
                title: "Welcome back",
                description: "Your in-progress application was restored. Please re-attach any files - those aren't kept between devices.",
            });
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep the draft current from here on: every typed answer, which step,
    // and every attached file. Debounced on the typed side (this would
    // otherwise write to sessionStorage on every keystroke); the files side
    // is already a discrete, infrequent event (attach/remove), so it saves
    // immediately. Both skip while the welcome board is up - nothing worth
    // saving exists yet - and skip entirely in edit mode, which is never
    // what this restores.
    useEffect(() => {
        if (isEditing || !me.id || showWelcome) return;
        const timer = setTimeout(() => {
            // authorization_letter is a File - JSON.stringify turns it into
            // "{}", which would then read back as a truthy non-null value
            // no file was ever chosen. It has its own store (see below);
            // requirement_uploads is unused dead weight (see Step4's own
            // note on where uploads actually live).
            const { authorization_letter, requirement_uploads, ...savableData } = data;
            saveDraftMeta(me.id, { data: savableData, currentStep, completedSteps, hasRepresentative });
            saveServerDraft({ data: savableData, currentStep, completedSteps, hasRepresentative });
        }, 600);

        return () => clearTimeout(timer);
    }, [data, currentStep, completedSteps, hasRepresentative, isEditing, me.id, showWelcome]);

    useEffect(() => {
        if (isEditing || !me.id || showWelcome) return;
        saveDraftFiles(me.id, requirementFiles, data.authorization_letter instanceof File ? data.authorization_letter : null);
    }, [requirementFiles, data.authorization_letter, isEditing, me.id, showWelcome]);

    // Define requirements structure (ALL requirements - main + additional).
    // Mirrors app/Constants/ApplicationRequirements.php.
    const requirements = useMemo(() => {
        // Zoning Certification is a standalone category with its own short
        // document set — nothing else is asked for.
        if (String(data.project_type || "").toUpperCase() === "ZC") {
            return [
                { id: 1, name: "1. Title", required: true, section: "main" },
                { id: 2, name: "2. Tax Declaration", required: true, section: "main" },
                { id: 3, name: "3. VICINITY MAP", required: true, section: "main" },
                { id: 4, name: "4. Latest Tax Receipt", required: true, section: "main" },
                { id: 5, name: "5. Sketch Plan with signature of Geodetic Engr.", required: true, section: "main" },
            ];
        }

        return [
            // Main Requirements
            // Not required at submission time: the applicant has to print this form,
            // get it notarized, then upload it afterwards from My Applications.
            { id: 1, name: "1. Accomplished and notarized APPLICATION FORM", required: false, section: "main", description: "You can submit without this. After submitting, print your application form, have it notarized, then upload it from My Applications." },
            // Right Over Land is a group: the header carries no upload of its own,
            // the three documents under it do.
            { id: 2, name: "2. Right Over Land Documentation", required: true, section: "main", is_group: true, description: "Submit all three documents below." },
            { id: 13, name: "Title", required: true, section: "main", parent_id: 2 },
            { id: 14, name: "Tax Declaration", required: true, section: "main", parent_id: 2 },
            { id: 15, name: "Tax Receipt", required: true, section: "main", parent_id: 2 },
            { id: 3, name: "3. VICINITY MAP", required: true, section: "main" },
            { id: 4, name: "4. SITE DEVELOPMENT PLAN", required: true, section: "main" },
            { id: 5, name: "5. ESTIMATED PROJECT COST / BILL OF MATERIALS", required: true, section: "main" },
            { id: 12, name: "6. Barangay Clearance", required: true, section: "main" },
            // Additional Requirements (all situational)
            { id: 6, name: "Endorsement/recommendation from Department of Agrarian Reform", required: false, section: "additional", description: "Required only for projects situated in tenanted rice and/or corn lands." },
            { id: 7, name: "Description of Industry (Manufacturing Projects)", required: false, section: "additional" },
            { id: 8, name: "Sworn Special Power of Attorney", required: false, section: "additional", description: "Required if the application is filed by an authorized representative." },
            { id: 9, name: "Affidavit of No Objection", required: false, section: "additional" },
            { id: 10, name: "Environmental Compliance Certificate (ECC) / Certificate of Non-Coverage (CNC)", required: false, section: "additional" },
            { id: 11, name: "Certification of road right-of-way from DPWH", required: false, section: "additional", description: "Required if the project is located within a National Road." },
        ];
    }, [data.project_type]);

    // A Temporary Use Permit runs for one year, so its tenure is not a choice.
    // Written into the form as soon as the category is picked, so what is
    // submitted matches what Step 2 shows.
    useEffect(() => {
        if (String(data.project_type || "").toUpperCase() !== "TUP") return;
        if (data.project_nature_duration !== "Temporary" || String(data.project_nature_years) !== "1") {
            setData((current) => ({ ...current, project_nature_duration: "Temporary", project_nature_years: 1 }));
        }
    }, [data.project_type, data.project_nature_duration, data.project_nature_years]);

    // When the project type changes, clear completed steps (except step 1)
    // so the user must go through validation again for the new application type
    useEffect(() => {
        const currentType = String(data.project_type || "").toUpperCase();
        const prevType = String(previousProjectType.current || "").toUpperCase();
        
        // Only reset if the type actually changed and it's not the initial load
        if (prevType && currentType !== prevType) {
            // Clear completed steps except step 1 (applicant info is still valid)
            setCompletedSteps((prev) => prev.filter(step => step === 1));
            
            // If currently on step 3 or 4, move back to step 2
            if (currentStep === 3 || currentStep === 4) {
                setCurrentStep(2);
            }
        }
        
        // Update the ref for next comparison
        previousProjectType.current = data.project_type;
    }, [data.project_type]);

    // A Zoning Certification has no project to describe: the applicant fills in
    // their details and uploads the documents, so steps 2 and 3 drop out.
    const activeSteps = useMemo(
        () =>
            String(data.project_type || "").toUpperCase() === "ZC"
                ? [1, 4]
                : [1, 2, 3, 4],
        [data.project_type]
    );
    const stepPosition = Math.max(1, activeSteps.indexOf(currentStep) + 1);

    // If the category changes to one with fewer steps while standing on a step
    // that no longer exists, fall back to step 2 (or step 1 if step 2 doesn't exist).
    // This ensures a smooth transition when switching between ZC and other types.
    // Also clear completed steps so user must go through validation again.
    useEffect(() => {
        if (!activeSteps.includes(currentStep)) {
            // When switching application types, reset to step 2 if it exists,
            // otherwise go to the first available step
            const targetStep = activeSteps.includes(2) ? 2 : activeSteps[0];
            setCurrentStep(targetStep);
            
            // Clear completed steps - user must validate all steps again
            // Keep only step 1 as completed if it was completed
            setCompletedSteps((prev) => prev.filter(step => step === 1));
        }
    }, [activeSteps, currentStep]);

    // Set hasRepresentative based on existing data
    useEffect(() => {
        if (existingApplication?.authorized_representative_name) {
            setHasRepresentative(true);
        }
    }, [existingApplication]);

    // Handle flash messages
    useEffect(() => {
        if (flash.success) {
            toast({
                title: "Success!",
                description: flash.success,
                variant: "default",
            });
        }
        if (flash.error) {
            toast({
                title: "Error",
                description: flash.error,
                variant: "destructive",
            });
        }
    }, [flash]);

    // Handle data changes
    const handleDataChange = (field, value) => {
        setData(field, value);
        // A field being typed into is being fixed: its mark comes off at once.
        if (stepErrors[field]) setStepErrors((e) => { const next = { ...e }; delete next[field]; return next; });
    };

    // Check if current step should be marked as completed based on validation
    useEffect(() => {
        if (currentStep === 3) {
            // For step 3, check if it's valid and mark as completed
            const step3Errors = validateStep3(data);
            if (step3Errors.length === 0 && !completedSteps.includes(3)) {
                setCompletedSteps([...completedSteps, 3]);
            } else if (step3Errors.length > 0 && completedSteps.includes(3)) {
                // Remove from completed if validation fails
                setCompletedSteps(completedSteps.filter(s => s !== 3));
            }
        }
        if (currentStep === 4) {
            // For step 4, check if at least main requirements are uploaded
            const step4Errors = validateStep4(data, requirements, existingApplication?.existing_documents || {}, requirementFiles);
            if (step4Errors.length === 0 && !completedSteps.includes(4)) {
                setCompletedSteps([...completedSteps, 4]);
            } else if (step4Errors.length > 0 && completedSteps.includes(4)) {
                setCompletedSteps(completedSteps.filter(s => s !== 4));
            }
        }
    }, [data, currentStep, requirementFiles]);

    // Handle representative toggle
    const handleRepresentativeToggle = (checked) => {
        setHasRepresentative(checked);
        if (!checked) {
            setData({
                ...data,
                authorized_representative_name: "",
                authorized_representative_address_province_code: "",
                authorized_representative_address_city_code: "",
                authorized_representative_address_barangay_code: "",
                authorized_representative_address_street: "",
                authorized_representative_email: "",
                authorization_letter: null,
            });
        }
    };

    // The step validators speak in labels ("Applicant Name is required"); the
    // fields show their own error underneath when told which field it is.
    // So each message is matched back to its field and shown there too, and
    // the page scrolls to the first one, instead of a toast alone.
    const FIELD_BY_LABEL = {
        "Applicant Name": "applicant_name",
        "Applicant Address region": "applicant_address_region_code",
        "Applicant Address province": "applicant_address_province_code",
        "Applicant Address municipality": "applicant_address_city_code", "Applicant Address barangay": "applicant_address_barangay_code",
        "Applicant Address street": "applicant_address_street",
        "Corporation Name": "corporation_name", "Corporation Address": "corporation_address",
        "Authorized Representative Name": "authorized_representative_name",
        "Authorized Representative Address region": "authorized_representative_address_region_code",
        "Authorized Representative Address province": "authorized_representative_address_province_code",
        "Authorized Representative Address municipality": "authorized_representative_address_city_code", "Authorized Representative Address barangay": "authorized_representative_address_barangay_code",
        "Authorized Representative Address street": "authorized_representative_address_street",
        "Authorized Representative Email": "authorized_representative_email", "Authorization Letter": "authorization_letter",
        "Project Nature Duration": "project_nature_duration", "Project Nature Years": "project_nature_years", "Project Nature": "project_nature",
        "Project Area (sqm)": "lot_area_sqm", "Project Cost": "project_cost", "Right Over Land": "right_over_land", "Existing Land Use": "existing_land_use",
        "Written Notice to Tenants": "has_written_notice", "Notice Officer Name": "notice_officer_name", "Notice Dates": "notice_dates",
        "Similar Application Filed": "has_similar_application", "Similar Application Offices": "similar_application_offices", "Similar Application Dates": "similar_application_dates",
        "Preferred Release Mode": "preferred_release_mode",
    };
    const fieldErrorsFrom = (messages) => {
        const found = {};
        for (const message of messages) {
            const label = Object.keys(FIELD_BY_LABEL).sort((a, b) => b.length - a.length).find((l) => message.startsWith(l));
            if (label && !found[FIELD_BY_LABEL[label]]) found[FIELD_BY_LABEL[label]] = message;
        }
        return found;
    };
    const scrollToFirstError = (fields) => {
        const first = Object.keys(fields)[0];
        if (!first) return;
        const el = document.querySelector(`[name="${first}"], #${first}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if (typeof el.focus === "function") el.focus({ preventScroll: true });
        }
    };

    /**
     * The address on the applicant's account, in the form's own field names -
     * or null when the account has no picked address to offer.
     */
    const accountAddress = () => {
        if (!me.address_region_code || !me.address_province_code || !me.address_city_code || !me.address_barangay_code) {
            return null;
        }
        return {
            applicant_address_region_code: me.address_region_code,
            applicant_address_province_code: me.address_province_code,
            applicant_address_city_code: me.address_city_code,
            applicant_address_barangay_code: me.address_barangay_code,
            applicant_address_street: me.address_street || "",
        };
    };

    // True while field 3 still reads exactly as the account's address - on a
    // new application it starts that way, and on Next a blank one is refilled
    // from it - so the applicant is told where it came from.
    const addressFromAccount = Boolean(
        !isEditing &&
        me.address_barangay_code &&
        data.applicant_address_barangay_code === me.address_barangay_code &&
        data.applicant_address_city_code === me.address_city_code &&
        (data.applicant_address_street || "") === (me.address_street || ""),
    );

    const applicantAddressIsBlank = (d) =>
        !d.applicant_address_region_code && !d.applicant_address_province_code &&
        !d.applicant_address_city_code && !d.applicant_address_barangay_code &&
        !String(d.applicant_address_street || "").trim();

    // Validate current step. `current` is the data to judge - normally the
    // form's, but Step 1 may have just filled the address in and setData has
    // not landed yet.
    const validateCurrentStep = (current = data) => {
        let validationErrors = [];

        switch (currentStep) {
            case 1:
                validationErrors = validateStep1(current);
                break;
            case 2:
                validationErrors = validateStep2(current);
                break;
            case 3:
                validationErrors = validateStep3(current);
                break;
            case 4:
                validationErrors = validateStep4(current, requirements, existingApplication?.existing_documents || {}, requirementFiles);
                break;
            default:
                break;
        }

        const inline = fieldErrorsFrom(validationErrors);
        setStepErrors(inline);

        if (validationErrors.length > 0) {
            scrollToFirstError(inline);
            toast({
                variant: "destructive",
                title: "A few things to fill in",
                description: (
                    <div>
                        <p className="mb-2">The fields are marked on the form:</p>
                        <ul className="list-disc list-inside">
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                ),
            });
            return false;
        }

        return true;
    };

    // Handle next step
    const handleNext = () => {
        // 3. Address of Applicant left empty: the address on the account is
        // the applicant's own, so it is used, and the applicant is told so
        // they can change it here if this application is for somewhere else.
        let current = data;
        if (currentStep === 1 && applicantAddressIsBlank(data)) {
            const fromAccount = accountAddress();
            if (fromAccount) {
                current = { ...data, ...fromAccount };
                setData((prev) => ({ ...prev, ...fromAccount }));
                toast({
                    title: "Address filled in from your account",
                    description: "You left the Address of Applicant blank, so the address on your account was used. Go back to change it if this application needs a different one.",
                });
            }
        }

        if (!validateCurrentStep(current)) {
            return;
        }

        // Mark current step as completed
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
        }

        // Move to the next step this application actually has
        const next = activeSteps[activeSteps.indexOf(currentStep) + 1];
        if (next === undefined) return;
        setCurrentStep(next);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle previous step
    const handlePrevious = () => {
        if (currentStep === activeSteps[0]) {
            // Go back to the welcome/requirements board instead of nowhere
            setShowWelcome(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        setCurrentStep(activeSteps[activeSteps.indexOf(currentStep) - 1]);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle continuing from the welcome board into the actual form. Picking a
    // category card starts the application in that category; the plain Continue
    // button leaves it unset for staff to decide later.
    const handleContinueFromWelcome = (projectType) => {
        if (projectType) {
            setData("project_type", projectType);
        }
        setShowWelcome(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Discards a restored draft and starts completely fresh - every typed
    // answer, every attached file, the step position, all of it. Only ever
    // offered when a draft was actually restored (see draftWasRestored); a
    // normal new application never needs this. Confirmed through a dialog,
    // not window.confirm - the browser's own prompt looks like a security
    // warning, not part of the app.
    const handleStartNewApplication = () => {
        setIsStartNewConfirmOpen(true);
    };

    const confirmStartNewApplication = () => {
        setIsStartNewConfirmOpen(false);

        clearDraft(me.id);
        clearServerDraft();

        setData({ ...initialFormData });
        setRequirementFiles({});
        setCurrentStep(1);
        setCompletedSteps([]);
        setHasRepresentative(false);
        setStepErrors({});
        setSubmitErrors([]);
        setSubmitErrorKind(null);
        setDraftWasRestored(false);
        setShowWelcome(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Handle direct step navigation
    const handleStepClick = (stepNumber) => {
        // When editing, allow free navigation between all steps
        // When creating new, only allow navigation to current/completed steps
        if (isEditing) {
            setCurrentStep(stepNumber);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Only allow navigation to the current step, a completed one, or the
            // step right after the last completed one. Compared by position, since
            // a Zoning Certification jumps straight from step 1 to step 4.
            const target = activeSteps.indexOf(stepNumber);
            const here = activeSteps.indexOf(currentStep);
            const previous = activeSteps[target - 1];
            if (target <= here || completedSteps.includes(previous)) {
                setCurrentStep(stepNumber);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    };

    // Handle submit
    const handleSubmit = () => {
        if (!validateCurrentStep()) {
            return;
        }
        
        // Mark final step as completed when validation passes
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
        }
        
        setIsConfirmDialogOpen(true);
    };

    // Stops a submission that is stuck retrying for a connection. Nothing was
    // ever sent while in that state (see fetchUntilOnline), so there is
    // nothing to undo - the form and every attached file are exactly as they
    // were, and Submit can be pressed again once the connection is back.
    const handleCancelSubmit = () => {
        submitAbortRef.current?.abort();
        setIsSubmitting(false);
        setConnectionState('idle');
    };

    // Confirm and submit - USING FETCH API TO BYPASS INERTIA
    const confirmSubmit = async ({ declared = false } = {}) => {
        // The dialog deliberately stays open while the request is in flight, so
        // the button can show its spinner. Closing it first left the applicant
        // looking at an unchanged form with no sign anything was happening —
        // which is what led to pressing Submit again.
        setIsSubmitting(true);
        setSubmitErrors([]);
        setSubmitErrorKind(null);
        setConnectionState('idle');
        const abortController = new AbortController();
        submitAbortRef.current = abortController;
        const onConnectionStateChange = (state) => setConnectionState(state === 'recovered' ? 'idle' : state);

        if (isEditing && existingApplication?.id) {
            
            // Create FormData
            const formData = new FormData();
            formData.append('_method', 'PUT');
            appendCsrfField(formData);
            // The applicant certifies the resubmitted form afresh; the
            // server requires it and records when it was made.
            formData.append('declaration', declared ? '1' : '0');
            
            // Add all fields. Objects (verified_requirements) go out as array
            // fields, exactly as the create path sends them - appended whole they
            // arrive as the string "[object Object]" and the server answers
            // "must be an array". Files go out as files.
            Object.keys(data).forEach((key) => {
                if (key === 'requirement_uploads' || key.endsWith('_legacy') || key.endsWith('_preview') || key === 'authorization_letter_on_file') return;
                const value = data[key];
                if (value === null || value === undefined || value === '') return;
                if (value instanceof File) {
                    formData.append(key, value, value.name);
                } else if (typeof value === 'object') {
                    Object.entries(value).forEach(([k, v]) => {
                        formData.append(`${key}[${k}]`, v ? '1' : '0');
                    });
                } else {
                    formData.append(key, value);
                }
            });
            
            // Add file uploads. Read from the parent-owned file state, not the
            // Inertia form — useForm's cloneDeep would have destroyed the Files.
            let fileCount = 0;
            Object.entries(requirementFiles).forEach(([reqId, files]) => {
                if (!Array.isArray(files)) return;
                const requirement = requirements.find((r) => String(r.id) === String(reqId));
                files.forEach((file, index) => {
                    formData.append(`requirement_uploads[${reqId}][${index}]`, file, file.name);
                    fileCount++;
                });
                if (requirement) {
                    formData.append(`requirement_names[${reqId}]`, requirement.name);
                }
            });
            
            for (let pair of formData.entries()) {
            }
            
            
            try {
                const response = await fetchUntilOnline(route('requests.update', existingApplication.id), {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                }, { signal: abortController.signal, onStateChange: onConnectionStateChange });


                // As in create mode below: only the controller's own answer
                // counts. A followed redirect is some other page with a 200,
                // not a confirmation that the resubmission was saved.
                if (response.ok && !response.redirected) {
                    let saved = null;
                    try { saved = await response.json(); } catch (_) { /* not JSON */ }
                    toast({
                        title: "Success!",
                        description: "Application updated and resubmitted for review.",
                    });

                    // Redirect after short delay
                    setTimeout(() => {
                        window.location.href = saved?.redirect || route('my-applications.index');
                    }, 1000);
                } else if (response.redirected) {
                    console.error('Application update was redirected instead of confirmed:', response.url);
                    setSubmitErrors(['The server did not confirm that your application was saved. Check My Applications before resubmitting it.']);
                    setSubmitErrorKind('system');
                    setIsConfirmDialogOpen(false);
                    toast({
                        variant: "destructive",
                        title: "Resubmission not confirmed",
                        description: "Check My Applications before resubmitting.",
                    });
                } else {
                    let errorData = null;
                    try { errorData = await response.json(); } catch (_) { /* not JSON */ }
                    console.warn('Update failed:', errorData);

                    // Every field message, on the form, the way a new
                    // application shows them - "(and 2 more errors)" in a toast
                    // told the applicant nothing they could fix.
                    const fieldErrors = errorData?.errors || {};
                    const messages = Object.values(fieldErrors).flat().filter(Boolean);
                    setSubmitErrors(messages.length ? messages : [errorData?.message || "Failed to update application."]);
                    setSubmitErrorKind(response.status === 422 ? 'form' : 'server');
                    setIsConfirmDialogOpen(false);

                    toast({
                        title: response.status === 422 ? "Please fix the form" : "Error",
                        description: messages.length
                            ? (messages.length > 1 ? `${messages[0]} (+${messages.length - 1} more below)` : messages[0])
                            : (errorData?.message || "Failed to update application."),
                        variant: "destructive",
                    });
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    // fetchUntilOnline only throws for a cancelled submission -
                    // every network failure it retries on its own. Anything
                    // else reaching here is a genuine bug, not a dropped
                    // connection.
                    console.error('Fetch error:', error);
                    toast({
                        title: "Error",
                        description: "Something went wrong. Please try again.",
                        variant: "destructive",
                    });
                }
            } finally {
                setConnectionState('idle');
            }

        } else {
            // CREATE MODE: Submit new application.
            // Build FormData by hand so the File objects reach the server intact —
            // they are held outside useForm precisely because setData's cloneDeep
            // would destroy them.
            const formData = new FormData();
            formData.append('declaration', declared ? '1' : '0');

            Object.keys(data).forEach((key) => {
                if (key === 'requirement_uploads' || key.endsWith('_legacy') || key.endsWith('_preview') || key === 'authorization_letter_on_file') return;
                const value = data[key];
                if (value === null || value === undefined || value === '') return;
                if (value instanceof File) {
                    formData.append(key, value, value.name);
                } else if (typeof value === 'object') {
                    // Send plain objects as real array fields so Laravel's
                    // `array` validation rules still see them as arrays.
                    Object.entries(value).forEach(([k, v]) => {
                        formData.append(`${key}[${k}]`, v ? '1' : '0');
                    });
                } else {
                    formData.append(key, value);
                }
            });

            Object.entries(requirementFiles).forEach(([reqId, files]) => {
                if (!Array.isArray(files)) return;
                const requirement = requirements.find((r) => String(r.id) === String(reqId));
                files.forEach((file, index) => {
                    formData.append(`requirement_uploads[${reqId}][${index}]`, file, file.name);
                });
                if (requirement) {
                    formData.append(`requirement_names[${reqId}]`, requirement.name);
                }
            });

            // Submit via fetch (not router.post) so the real HTTP status and
            // error body are visible - the caller needs to know whether a failure
            // is a form/validation problem (422) or a server problem (500).
            // A POST bigger than the server's post_max_size is discarded before
            // PHP runs, and this host resets the connection rather than
            // answering — the browser then reports only "Failed to fetch" and a
            // completed application is lost with no usable explanation. Checking
            // here turns that into a message naming the file to fix.
            const tooLarge = describeOversizedUpload(requirementFiles, data.authorization_letter, uploadLimits);
            if (tooLarge) {
                setIsSubmitting(false);
                setIsConfirmDialogOpen(false);
                setSubmitErrors([tooLarge]);
                setSubmitErrorKind('form');
                toast({
                    variant: "destructive",
                    title: "Files are too large to send",
                    description: tooLarge,
                });
                return;
            }

            try {
                if (!hasCsrfToken()) {
                    throw new Error('Your session has expired. Please refresh the page and try again.');
                }

                const response = await fetchUntilOnline("/request", {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    },
                }, { signal: abortController.signal, onStateChange: onConnectionStateChange });

                // Filed only when the controller says so: a 201 carrying the
                // application number. fetch() follows redirects on its own, so
                // "ok or redirected" also matched a back()->withErrors() - the
                // form page, served again with a 200 - and announced a success
                // for an application that was never saved.
                if (response.ok && !response.redirected) {
                    let filed = null;
                    try { filed = await response.json(); } catch (_) { /* not JSON */ }
                    // Filed for real: the draft this refresh-recovery kept
                    // would otherwise reappear on the next New Application
                    // visit, offering to "resume" an application already
                    // sitting in My Applications.
                    clearDraft(me.id);
                    clearServerDraft();
                    toast({
                        title: "Application Submitted",
                        description: filed?.application_number
                            ? 'Your application number is ' + filed.application_number + '.'
                            : "Your application has been received.",
                    });
                    setTimeout(() => {
                        window.location.href = filed?.redirect || route('my-applications');
                    }, 800);
                    return;
                }

                // Try to read a structured error body.
                let payload = null;
                try { payload = await response.json(); } catch (_) { /* not JSON */ }

                if (response.redirected) {
                    // Sent somewhere else instead of answered: whatever page
                    // that was, it is not a confirmation that anything was filed.
                    console.error('Application submission was redirected instead of confirmed:', response.url);
                    setSubmitErrors(['The server did not confirm that your application was filed. Check My Applications before submitting it again.']);
                    setSubmitErrorKind('system');
                    toast({
                        variant: "destructive",
                        title: "Submission not confirmed",
                        description: "Check My Applications before submitting again.",
                    });
                } else if (response.status === 422 && payload?.errors?.duplicate) {
                    // Not a validation problem: the server's own duplicate
                    // check (RequestController::store) says this exact
                    // application was already filed - almost certainly by an
                    // earlier attempt that reached the server but lost its
                    // answer on the way back before a retry here resent it.
                    // Nothing was filed twice; there is just nothing left to
                    // fix, so this is told the same way a fresh success is.
                    clearDraft(me.id);
                    clearServerDraft();
                    toast({
                        title: "Application Submitted",
                        description: "Your application has already been received.",
                    });
                    setTimeout(() => {
                        window.location.href = route('my-applications');
                    }, 800);
                    return;
                } else if (response.status === 422) {
                    // Validation failure - a FORM problem. Show every field message.
                    const fieldErrors = payload?.errors || {};
                    const messages = Object.values(fieldErrors).flat().filter(Boolean);
                    console.warn('Application validation failed:', fieldErrors);
                    setSubmitErrors(messages.length ? messages : [payload?.message || 'Some fields need attention.']);
                    setSubmitErrorKind('form');
                    toast({
                        variant: "destructive",
                        title: "Please fix the form",
                        description: messages.length
                            ? (messages.length > 1
                                ? messages[0] + ' (+' + (messages.length - 1) + ' more below)'
                                : messages[0])
                            : (payload?.message || 'Some fields need attention.'),
                    });
                } else if (response.status === 401 || response.status === 419) {
                    // The session went while the form was being filled in.
                    // "System error — HTTP 401 — Unauthenticated" tells an
                    // applicant nothing they can act on, so say what actually
                    // happened and send them somewhere useful.
                    console.warn('Application submission rejected: session expired', response.status);
                    setSubmitErrors([
                        'Your session has expired. Please sign in again — your answers are still on this page, so keep this tab open, sign in from another tab, then press Submit again.',
                    ]);
                    setSubmitErrorKind('system');
                    toast({
                        variant: "destructive",
                        title: "Session expired",
                        description: "Please sign in again to submit your application.",
                    });
                } else {
                    // 500 / anything else - a SYSTEM problem, not the form.
                    const serverMessage = payload?.message || response.statusText || 'Unknown server error';
                    console.error('Application submission server error:', response.status, payload);
                    setSubmitErrors(['HTTP ' + response.status + ' — ' + serverMessage]);
                    setSubmitErrorKind('system');
                    toast({
                        variant: "destructive",
                        title: 'System error (HTTP ' + response.status + ')',
                        description: serverMessage,
                    });
                }
            } catch (error) {
                // fetchUntilOnline only throws for a cancelled submission -
                // every network failure it retries on its own, so nothing
                // here was actually lost to a dropped connection.
                if (error.name !== 'AbortError') {
                    console.error('Application submission request failed:', error);
                    setSubmitErrors([error.message || 'Something went wrong. Please try again.']);
                    setSubmitErrorKind('system');
                    toast({
                        variant: "destructive",
                        title: "Could not submit",
                        description: error.message || 'Something went wrong. Please try again.',
                    });
                }
            } finally {
                setConnectionState('idle');
            }
        }

        // Whatever happened, the request is over: stop the spinner and put the
        // applicant back on the form. On success the page has already been sent
        // to My Applications, so this only matters for the failure paths.
        setIsSubmitting(false);
        setIsConfirmDialogOpen(false);
    };

    if (showWelcome) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl opacity-10 blur-2xl animate-pulse-slow" />
                    <Card className="relative border-none shadow-2xl shadow-blue-200/30 overflow-hidden backdrop-blur-sm bg-white/95">
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                        <CardContent className="p-6 sm:p-8">
                            <WelcomeBoard onContinue={handleContinueFromWelcome} />
                        </CardContent>
                    </Card>
                </div>
                <style>{`
                    @keyframes pulse-slow {
                        0%, 100% { opacity: 0.1; }
                        50% { opacity: 0.2; }
                    }
                    .animate-pulse-slow {
                        animation: pulse-slow 3s ease-in-out infinite;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="relative">
                {/* Animated background particles */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl opacity-10 blur-2xl animate-pulse-slow" />
                
                <Card className="relative border-none shadow-2xl shadow-blue-200/30 overflow-hidden backdrop-blur-sm bg-white/95">
                    {/* Top accent bar */}
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                    
                    <div className="animate-fadeIn">
                        <CardHeader className="pb-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                        <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                                            <FileText className="h-7 w-7 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                            {isEditing ? "Edit Application" : "Submit New Request"}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Fill out the form below to submit your land certification request
                                        </p>
                                    </div>
                                </div>
                                {!isEditing && draftWasRestored && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleStartNewApplication}
                                    >
                                        Apply for New Application
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Clearance category: decides which steps the applicant sees */}
                            <ClearanceTypeSelector
                                value={data.project_type}
                                error={errors.project_type}
                                onChange={(value) => setData("project_type", value)}
                            />

                            {/* Step Indicator with animation */}
                            <div className="animate-slideIn">
                                <StepIndicator
                                    currentStep={currentStep}
                                    completedSteps={completedSteps}
                                    onStepClick={handleStepClick}
                                    isEditing={isEditing}
                                    activeSteps={activeSteps}
                                />
                            </div>

                            {/* Step Content with smooth transitions */}
                            <div className="relative min-h-[400px]">
                                <div className={`transition-all duration-500 ${currentStep === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'}`}>
                                    {currentStep === 1 && (
                                        <Step1ApplicantInfo
                                            data={data}
                                            errors={{ ...stepErrors, ...errors }}
                                            hasRepresentative={hasRepresentative}
                                            onDataChange={handleDataChange}
                                            onRepresentativeToggle={handleRepresentativeToggle}
                                            addressFromAccount={addressFromAccount}
                                        />
                                    )}
                                </div>

                                <div className={`transition-all duration-500 ${currentStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'}`}>
                                    {currentStep === 2 && (
                                        <Step2ProjectDetails
                                            data={data}
                                            errors={{ ...stepErrors, ...errors }}
                                            onDataChange={handleDataChange}
                                        />
                                    )}
                                </div>

                                <div className={`transition-all duration-500 ${currentStep === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'}`}>
                                    {currentStep === 3 && (
                                        <Step3LandUse
                                            data={data}
                                            errors={{ ...stepErrors, ...errors }}
                                            hasRepresentative={hasRepresentative}
                                            onDataChange={handleDataChange}
                                            onToast={toast}
                                        />
                                    )}
                                </div>

                                <div className={`transition-all duration-500 ${currentStep === 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0 pointer-events-none'}`}>
                                    {currentStep === 4 && (
                                        <Step4Requirements
                                            data={data}
                                            errors={{ ...stepErrors, ...errors }}
                                            onDataChange={handleDataChange}
                                            requirements={requirements}
                                            existingDocuments={existingApplication?.existing_documents || {}}
                                            verifiedRequirements={data.verified_requirements || {}}
                                            files={requirementFiles}
                                            onFilesChange={setRequirementFiles}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Real submission error - tells the applicant whether the
                                problem is their form (fixable) or the system (not their fault). */}
                            {submitErrors.length > 0 && (
                                <div
                                    className={`mb-4 rounded-lg border-2 p-4 ${
                                        submitErrorKind === 'system'
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-amber-300 bg-amber-50'
                                    }`}
                                >
                                    <p
                                        className={`text-sm font-semibold mb-2 ${
                                            submitErrorKind === 'system' ? 'text-red-800' : 'text-amber-800'
                                        }`}
                                    >
                                        {submitErrorKind === 'system'
                                            ? 'System error — this is not a problem with your form. Please try again later or contact the CPDO office with the message below.'
                                            : 'Please fix the following before submitting:'}
                                    </p>
                                    <ul
                                        className={`list-disc list-inside space-y-1 text-sm ${
                                            submitErrorKind === 'system' ? 'text-red-700' : 'text-amber-700'
                                        }`}
                                    >
                                        {submitErrors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Navigation with enhanced styling */}
                            <div className="animate-slideUp">
                                <FormNavigation
                                    currentStep={stepPosition}
                                    totalSteps={activeSteps.length}
                                    processing={processing || isSubmitting}
                                    onPrevious={handlePrevious}
                                    onNext={handleNext}
                                    onSubmit={handleSubmit}
                                />
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <ApplicationSummaryModal
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={confirmSubmit}
                processing={processing || isSubmitting}
                data={data}
                isEditing={isEditing}
                requirementFiles={requirementFiles}
                requirements={requirements}
                connectionState={connectionState}
                onCancelSubmit={handleCancelSubmit}
            />

            {/* Confirm before discarding a restored draft */}
            <Dialog open={isStartNewConfirmOpen} onOpenChange={setIsStartNewConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Start a new application?</DialogTitle>
                        <DialogDescription>
                            Your in-progress answers and attached files will be cleared. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsStartNewConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={confirmStartNewApplication}>
                            Start New Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add custom animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 0.1;
                    }
                    50% {
                        opacity: 0.2;
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                .animate-slideIn {
                    animation: slideIn 0.4s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.4s ease-out;
                }
                
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
