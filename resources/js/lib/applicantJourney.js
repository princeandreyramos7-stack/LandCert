/**
 * Where an application stands, in the applicant's own terms.
 *
 * The office thinks in statuses; the applicant wants to know three things:
 * how far along it is, whether they have to do something, and what. This maps
 * the derived status (plus the few flags the list carries) to the stage on a
 * five-step track, a plain-language headline and note, and the one action
 * that matters now.
 *
 * Route names here are the applicant's routes (routes/web.php).
 */

export const STAGES = ["Submitted", "Verification", "Approval", "Payment", "Certificate"];

const lower = (v) => String(v ?? "").toLowerCase();

const LIFECYCLE = ["payment_confirmed", "certificate_preparing", "certificate_ready", "released"];

/**
 * @param app  A row from the My Applications / dashboard queries.
 * @returns {{
 *   stage: number,            // 0..4 index into STAGES; 5 = all done
 *   failed: boolean,          // denied
 *   needsAction: boolean,     // the applicant has to do something
 *   tone: string,             // "sky" | "amber" | "violet" | "emerald" | "rose" | "orange"
 *   label: string,            // short status for a badge
 *   headline: string,         // one line on the card
 *   note: string,             // what happens / what to do
 *   action: {label: string, route: string, newTab?: boolean} | null
 * }}
 */
export function journeyOf(app) {
    const status = lower(app.status);
    const requestStatus = lower(app.request_status);
    const released = Boolean(app.released_to_applicant_at);
    const notarized = app.has_notarized_form === undefined ? true : Boolean(Number(app.has_notarized_form));

    if (status === "rejected") {
        return {
            stage: 2, failed: true, needsAction: true, tone: "rose",
            label: "Denied",
            headline: "The office did not approve this application",
            note: "Open the details to read the reason. If it can be corrected, edit the application and send it again.",
            action: { label: "Edit & resubmit", route: "requests.edit" },
        };
    }

    if (status === "in_applicant" || status === "returned" || requestStatus === "returned") {
        return {
            stage: 1, failed: false, needsAction: true, tone: "orange",
            label: "Returned to you",
            headline: "The office sent this back for corrections",
            note: "Read the officer's remarks in the details, fix what was asked, and resubmit.",
            action: { label: "Fix & resubmit", route: "requests.edit" },
        };
    }

    if (["pending", "for_verification", "in_applicant"].includes(status) || (!status && !LIFECYCLE.includes(requestStatus))) {
        if (!notarized) {
            return {
                stage: 1, failed: false, needsAction: true, tone: "amber",
                label: "Form needed",
                headline: "Upload your notarized application form",
                note: "Print the form, have it notarized, and upload the scan. Verification starts once it is in.",
                action: { label: "Upload notarized form", route: "my-applications.show" },
            };
        }
        return {
            stage: 1, failed: false, needsAction: false, tone: "sky",
            label: "Under verification",
            headline: "The zoning officer is checking your documents",
            note: "Nothing to do for now. You will be notified if anything is missing or when it moves to approval.",
            action: { label: "View details", route: "my-applications.show" },
        };
    }

    if (["reviewed", "pending_superadmin_approval", "under review"].includes(status)) {
        return {
            stage: 2, failed: false, needsAction: false, tone: "amber",
            label: "Awaiting approval",
            headline: "Verified — waiting for the Zoning Administrator's decision",
            note: "Your documents passed verification. The fee is set once the administrator approves.",
            action: { label: "View details", route: "my-applications.show" },
        };
    }

    if (["approved", "for_payment", "pending_payment"].includes(status)) {
        return {
            stage: 3, failed: false, needsAction: true, tone: "violet",
            label: "Approved — pay the fee",
            headline: "Approved! Pay the fee to get your certificate",
            note: "Print the Order of Payment, pay at the City Treasurer's Office, then upload the official receipt here.",
            action: { label: "Upload receipt", route: "receipt.upload.page" },
            secondary: { label: "Order of Payment", route: "my-applications.order-of-payment" },
        };
    }

    if (status === "payment_confirmed" || status === "certificate_preparing") {
        return {
            stage: 4, failed: false, needsAction: false, tone: "emerald",
            label: "Payment received",
            headline: "Paid — your certificate is being prepared",
            note: "The office is preparing and signing your document. You will be notified when it is ready.",
            action: { label: "View details", route: "my-applications.show" },
        };
    }

    if (status === "certificate_ready" || status === "released") {
        if (released) {
            const isZc = lower(app.project_type) === "zc";
            return {
                stage: 5, failed: false, needsAction: true, tone: "emerald",
                label: "Ready to download",
                headline: isZc ? "Your Zoning Certification is ready" : "Your clearance is ready",
                note: "Download and print it. Keep a copy for your records.",
                action: { label: isZc ? "Download certificate" : "Download clearance", route: isZc ? "print-certificate" : "print-clearance", newTab: true },
            };
        }
        return {
            stage: 4, failed: false, needsAction: false, tone: "emerald",
            label: "Certificate ready",
            headline: "Your document is signed and ready for release",
            note: "The office will release it shortly; it appears here for download once released.",
            action: { label: "View details", route: "my-applications.show" },
        };
    }

    return {
        stage: 1, failed: false, needsAction: false, tone: "sky",
        label: status ? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Submitted",
        headline: "Your application is with the office",
        note: "Open the details for the latest.",
        action: { label: "View details", route: "my-applications.show" },
    };
}

export const TONES = {
    sky:     { badge: "bg-sky-50 text-sky-700 ring-sky-200",         bar: "bg-sky-500",     soft: "bg-sky-50",     text: "text-sky-700" },
    amber:   { badge: "bg-amber-50 text-amber-800 ring-amber-200",   bar: "bg-amber-500",   soft: "bg-amber-50",   text: "text-amber-800" },
    violet:  { badge: "bg-violet-50 text-violet-700 ring-violet-200", bar: "bg-violet-500", soft: "bg-violet-50",  text: "text-violet-700" },
    emerald: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", bar: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700" },
    rose:    { badge: "bg-rose-50 text-rose-700 ring-rose-200",      bar: "bg-rose-500",    soft: "bg-rose-50",    text: "text-rose-700" },
    orange:  { badge: "bg-orange-50 text-orange-700 ring-orange-200", bar: "bg-orange-500", soft: "bg-orange-50",  text: "text-orange-700" },
};

/** The three buckets the applicant's overview counts. */
export function bucketOf(app) {
    const j = journeyOf(app);
    if (j.stage >= 5) return "done";
    if (j.needsAction) return "action";
    return "progress";
}
