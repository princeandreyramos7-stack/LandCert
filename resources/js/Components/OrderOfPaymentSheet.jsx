import React, { forwardRef } from "react";
import { zoningAdministratorName, positionLines, DEFAULT_OFFICER_POSITION, DEFAULT_ADMINISTRATOR_POSITION } from "@/lib/signerName";
import ESignatureImage from "@/Components/ESignatureImage";
import OfficialLetterhead from "@/Components/OfficialLetterhead";

/**
 * The Order of Payment slip itself — the sheet, without the page around it.
 *
 * Lifted out of the Generate Order of Payment page so the applicant report can
 * show the same slip in its panel. Nothing is kept on file for this document:
 * it is drawn from the application each time, so the only way to show a
 * picture of it anywhere else is to draw it again from the same markup. One
 * copy here, both places render it, and they cannot drift apart.
 */

/** Whole-peso amount to English words, e.g. 7200 -> "Seven Thousand Two Hundred Pesos". */
export function pesoInWords(value) {
    const amount = Math.round(Number(value) || 0);
    if (amount <= 0) return "";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const under1000 = (n) => {
        let s = "";
        if (n >= 100) { s += ones[Math.floor(n / 100)] + " Hundred"; n %= 100; if (n) s += " "; }
        if (n >= 20) { s += tens[Math.floor(n / 10)]; n %= 10; if (n) s += "-" + ones[n]; }
        else if (n > 0) { s += ones[n]; }
        return s;
    };

    const scales = ["", " Thousand", " Million", " Billion"];
    let words = "";
    let group = 0;
    let n = amount;
    while (n > 0) {
        const chunk = n % 1000;
        if (chunk) words = under1000(chunk) + scales[group] + (words ? " " + words : "");
        n = Math.floor(n / 1000);
        group++;
    }
    return `${words} Pesos`;
}

/**
 * Signature slot: the e-signature image sits just above the printed name.
 * Keeps a fixed-height gap when there is no signature on file, so the layout
 * never shifts.
 */
function SigLine({ label, signatureUrl, name, title }) {
    return (
        <div>
            {/* The ink is centred over its verification mark and over the name
                below it, rather than sitting at the left edge of the block. */}
            <div style={{ position: 'relative', height: '30pt', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '240pt' }}>
                <ESignatureImage src={signatureUrl} maxHeight="30pt" maxWidth="150pt" marginBottom="-3pt" />
            </div>
            <div style={{ fontWeight: 'bold' }}>
                {label}: {name}
            </div>
            <div style={{ marginTop: '3pt' }}>{title}</div>
        </div>
    );
}

/* A fixed sheet, like the other printable documents. At a fluid width the
   pt-sized fields and the absolutely positioned CPD number collided on narrow
   screens; FitToWidth scales the whole sheet down instead. */
const SHEET_CSS = `
.payment-page {
    width: 8.5in;
    min-height: 11in;
    margin: 0 auto;
    background: white;
    position: relative;
    font-family: 'Times New Roman', serif;
    padding: 0.75in 0.75in 0.5in 0.75in;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* The slip only fills the top of a letter sheet. Where it is shown as a
   picture rather than printed, the blank lower half is just blank. */
.payment-page.payment-page--compact {
    min-height: 0;
    max-height: fit-content;
    padding-bottom: 0.4in;
    box-shadow: none;
}

.underline-fill {
    border-bottom: 1px solid #000;
    display: inline-block;
    min-width: 200pt;
    padding-bottom: 2pt;
}

@media print {
    .payment-page {
        box-shadow: none;
        page-break-after: avoid;
        page-break-inside: avoid;
        min-height: 0;
        max-height: 10.5in;
    }

    /* Printed inside the page margin, the sheet keeps its own inner margins
       only (see PrintDocumentStyles). */
    .payment-page.print-document {
        /* 0.5in page margin + 0.25in here = the 0.75in the screen sheet has,
           so the ruled fields keep the width they were sized for. */
        padding: 0.25in !important;
        min-height: 0 !important;
        height: auto !important;
    }

    @page {
        size: letter;
        margin: 0.5in;
    }
}
`;

/**
 * @param application  applicant_name, corporation_name, applicant_address,
 *                     project_type, project_nature, project_location_barangay,
 *                     project_location_municipality, payment_amount
 * @param payment      the recorded payment, if any (its amount wins)
 * @param paymentAmount fallback fee when there is no payment yet
 * @param reviewer     { name, signature_url } of the Zoning Officer who reviewed it
 * @param zoningAdministrator { name, signature_url }
 * @param compact      drop the letter-height minimum (for previews)
 */
const OrderOfPaymentSheet = forwardRef(function OrderOfPaymentSheet(
    { application, payment, reviewer, zoningAdministrator, paymentAmount = null, compact = false, className = "" },
    ref
) {
    // Fee to charge: an actual payment record wins, otherwise the amount the
    // Zoning Officer set at review time.
    const feeAmount = payment?.amount ?? paymentAmount ?? application?.payment_amount ?? null;
    const feeDisplay = feeAmount !== null && feeAmount !== ""
        ? `${pesoInWords(feeAmount)} (₱ ${Number(feeAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })})`
        : "____________________________ (₱ __________)";

    const projectType = application?.project_type || 'N/A';

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: SHEET_CSS }} />

            <div
                ref={ref}
                className={`payment-page${compact ? " payment-page--compact" : ""} ${className}`.trim()}
                style={{
                    fontSize: '9pt',
                    lineHeight: '1.4',
                    pageBreakAfter: compact ? undefined : 'always',
                    pageBreakInside: 'avoid',
                }}
            >
                {/* The same letterhead as the clearance and the certification -
                    seal, office, blue rule - with the form code at its corner. */}
                <OfficialLetterhead code="CPD-002-0" />

                {/* Title with Yellow Background */}
                <div style={{ textAlign: 'center', margin: '18pt 0 14pt' }}>
                    <span style={{
                        fontSize: '13pt',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        backgroundColor: '#FFFF00',
                        padding: '4pt 12pt',
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                    }}>
                        ORDER OF PAYMENT
                    </span>
                </div>

                {/* Recipient */}
                <div style={{ fontSize: '11pt', marginBottom: '12pt', fontWeight: 'bold' }}>
                    TO CTO Cashier Special Collecting Officer
                </div>

                {/* Body Content */}
                <div style={{ fontSize: '11pt', lineHeight: '1.6' }}>
                    <div style={{ marginBottom: '2pt' }}>
                        <span>Please receive from </span>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '400pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {application?.applicant_name || 'N/A'}
                        </span>
                        <span> of</span>
                    </div>

                    <div style={{ marginBottom: '6pt', textAlign: 'center', fontSize: '9pt' }}>
                        <span>(Name of Applicant)</span>
                    </div>

                    <div style={{ marginBottom: '2pt' }}>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '450pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {application?.corporation_name || application?.applicant_address || 'N/A'}
                        </span>
                        <span> the sum of</span>
                    </div>

                    <div style={{ marginBottom: '6pt', textAlign: 'center', fontSize: '9pt' }}>
                        <span>(Name of Firm)</span>
                    </div>

                    <div style={{ marginBottom: '12pt' }}>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '500pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {feeDisplay}
                        </span>
                    </div>

                    <div style={{ marginBottom: '6pt' }}>
                        <span>as payment for </span>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '350pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {projectType}
                        </span>
                        <span> fee(s) of</span>
                    </div>

                    <div style={{ marginBottom: '2pt' }}>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '400pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {application?.project_nature || 'N/A'}
                        </span>
                        <span> located at</span>
                    </div>

                    <div style={{ marginBottom: '6pt', textAlign: 'center', fontSize: '9pt' }}>
                        <span>(Name and nature of Project)</span>
                    </div>

                    <div style={{ marginBottom: '20pt' }}>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '500pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {application?.project_location_barangay
                                ? `${application.project_location_barangay}, ${application.project_location_municipality || 'Ilagan'}`
                                : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Divider Line */}
                <div style={{ borderTop: '2px solid #000', marginBottom: '12pt' }} />

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
                    <div style={{ width: '48%' }}>
                        <SigLine
                            label="Prepared by"
                            signatureUrl={reviewer?.signature_url}
                            name={(reviewer?.name || 'MARY JANE P. BULAUAN').toUpperCase()}
                            title={positionLines(reviewer, DEFAULT_OFFICER_POSITION).join(' / ')}
                        />
                    </div>

                    <div style={{ width: '48%' }}>
                        <SigLine
                            label="Approved"
                            signatureUrl={zoningAdministrator?.signature_url}
                            name={zoningAdministratorName(zoningAdministrator?.name)}
                            title={positionLines(zoningAdministrator, DEFAULT_ADMINISTRATOR_POSITION).join(' / ')}
                        />
                    </div>
                </div>
            </div>
        </>
    );
});

export default OrderOfPaymentSheet;
