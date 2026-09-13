import React, { forwardRef } from "react";
import OfficialLetterhead from "@/Components/OfficialLetterhead";
import ESignatureImage from "@/Components/ESignatureImage";
import TupClearanceLetter from "@/Components/TupClearanceLetter";
import { zoningAdministratorName } from "@/lib/signerName";

/**
 * The clearance itself — the decision sheet, or the Temporary Use Permit
 * letter — without the page around it.
 *
 * Lifted out of the Generate Clearance page so the applicant report can show
 * the same document. Nothing is kept on file for it: it is drawn from the
 * application each time, so it is drawn here, once, for both.
 */

// An approved application does not sit at 'approved' for long — it moves
// straight on through payment and the certificate lifecycle, and it is only
// printed once it is well past that point.
const GRANTED_STATUSES = [
    'approved',
    'payment_confirmed',
    'certificate_preparing',
    'certificate_ready',
    'released',
    'completed',
];

/** "September 1, 2026", or a blank rule when the date is not set yet. */
function formatLongDate(value) {
    return value
        ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'N/A';
}

/**
 * One signature slot: the e-signature image sits ON the ruled line, with the
 * printed name and title underneath. Falls back to an empty gap (same height,
 * so the layout never shifts) when the signer has no signature on file.
 *
 * A signature the system applied carries a small "digitally signed" caption —
 * enough to tell an online-issued copy from a wet-signed one without changing
 * how the document reads. An empty slot is left plain: that is a document
 * still waiting for a hand signature.
 */
function SignatureLine({ signatureUrl, name, title }) {
    return (
        <div style={{ marginTop: '10pt' }}>
            <div style={{ position: 'relative', height: '38pt', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <ESignatureImage src={signatureUrl} />
            </div>
            <div style={{ borderTop: '1.5px solid #000', paddingTop: '3pt', textAlign: 'center' }}>
                <strong>{name}</strong><br />
                {title}
                {signatureUrl && (
                    <div
                        style={{
                            fontSize: '5.5pt',
                            color: '#777',
                            marginTop: '1pt',
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            letterSpacing: '0.04em',
                        }}
                    >
                        digitally signed
                    </div>
                )}
            </div>
        </div>
    );
}

/** True when the decision is released as the Temporary Use Permit letter. */
export function isTemporaryUsePermit(projectType) {
    return String(projectType || '').toUpperCase() === 'TUP';
}

/* A4 sheet, matching the paper the office prints on. The compact form drops
   the fixed height and shadow for use as a picture inside another document. */
const SHEET_CSS = `
.clearance-sheet {
    width: 100%;
    max-width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: white;
    position: relative;
    font-family: 'Times New Roman', serif;
    padding: 10mm 16mm;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.clearance-sheet.sheet--compact {
    width: 210mm;
    min-height: 0;
    box-shadow: none;
}

/* One printed sheet: the fixed A4 height is only for the screen preview, and
   the content is kept inside a single page. */
@media print {
    .clearance-sheet.print-document {
        padding: 8mm 14mm !important;
        min-height: 0 !important;
        height: auto !important;
    }
}
`;

const ClearanceSheet = forwardRef(function ClearanceSheet(
    { application: given, payment, reviewer, zoningAdministrator, compact = false, className = "" },
    ref
) {
    const application = given || {};
    const sheetClass = `clearance-sheet${compact ? " sheet--compact" : ""} ${className}`.trim();

    if (isTemporaryUsePermit(application.project_type)) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: SHEET_CSS }} />
                <TupClearanceLetter
                    application={application}
                    payment={payment}
                    zoningAdministrator={zoningAdministrator}
                    innerRef={ref}
                    className={sheetClass}
                />
            </>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: SHEET_CSS }} />
            <div ref={ref} className={sheetClass} style={{ fontSize: '10pt', lineHeight: '1.4' }}>
            <OfficialLetterhead code="CPD-001-0" />
            
            {/* Title with Yellow Highlight - Dynamic based on project type */}
            <div style={{ 
                textAlign: 'center',
                marginBottom: '10pt',
                fontSize: '10pt',
                fontWeight: 'bold',
                lineHeight: 1
            }}>
                <div style={{ display: 'inline-block', background: '#FFFF00', padding: '4pt 8pt' }}>
                    DECISION ON ZONING
                </div>
                <br />
                <div style={{ display: 'inline-block', background: '#FFFF00', padding: '4pt 8pt' }}>
                    {application.project_type === 'SUP' ? 'SPECIAL USE PERMIT' : 
                     application.project_type === 'CZC' ? 'CERTIFICATE OF ZONING COMPLIANCE' :
                     application.project_type === 'TUP' ? 'TEMPORARY USE PERMIT' :
                     'SPECIAL USE PERMIT'}
                </div>
            </div>

            {/* Application and Decision Info — a fixed grid so each label and
                its ruled field lines up with the one across from it. */}
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: '6pt', fontSize: '9pt' }}>
                <colgroup>
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '36%' }} />
                    <col style={{ width: '13%' }} />
                    <col style={{ width: '37%' }} />
                </colgroup>
                <tbody>
                    <tr>
                        <td style={{ padding: '0 4pt 4pt 0', whiteSpace: 'nowrap' }}><strong>Application No.:</strong></td>
                        <td style={{ padding: '0 12pt 4pt 0' }}>
                            <span style={{ display: 'block', borderBottom: '1px solid #000', paddingBottom: '2pt' }}>
                                {application.application_number || 'N/A'}
                            </span>
                        </td>
                        <td style={{ padding: '0 4pt 4pt 0', whiteSpace: 'nowrap' }}><strong>Decision No.:</strong></td>
                        <td style={{ padding: '0 0 4pt 0' }}>
                            <span style={{ display: 'block', borderBottom: '1px solid #000', paddingBottom: '2pt' }}>
                                {application.decision_number || 'N/A'}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0 4pt 0 0', whiteSpace: 'nowrap' }}><strong>Date Received:</strong></td>
                        <td style={{ padding: '0 12pt 0 0' }}>
                            <span style={{ display: 'block', borderBottom: '1px solid #000', paddingBottom: '2pt' }}>
                                {formatLongDate(application.created_at)}
                            </span>
                        </td>
                        <td style={{ padding: '0 4pt 0 0', whiteSpace: 'nowrap' }}><strong>Date Issued:</strong></td>
                        <td style={{ padding: 0 }}>
                            <span style={{ display: 'block', borderBottom: '1px solid #000', paddingBottom: '2pt' }}>
                                {formatLongDate(application.updated_at)}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Application Details Table - 2 columns */}
            <table style={{ width: '100%', border: '2px solid #000', borderCollapse: 'collapse', marginBottom: '10pt', fontSize: '9pt' }}>
                <tbody>
                    {/* Row 1: APPLICANT | NAME OF CORPORATION */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8pt', width: '50%', textAlign: 'center', verticalAlign: 'top' }}>
                            <strong>APPLICANT</strong>
                            <div style={{ marginTop: '8pt', fontSize: '10pt' }}>{application.applicant_name || 'N/A'}</div>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8pt', width: '50%', textAlign: 'center', verticalAlign: 'top' }}>
                            <strong>NAME OF CORPORATION</strong>
                            <div style={{ marginTop: '8pt', fontSize: '10pt' }}>{application.corporation_name || 'N/A'}</div>
                        </td>
                    </tr>
                    {/* Row 2: ADDRESS | ADDRESS */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', verticalAlign: 'top' }}>
                            <strong>ADDRESS</strong>
                            <div style={{ marginTop: '8pt', fontSize: '10pt' }}>{application.applicant_address || 'N/A'}</div>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', verticalAlign: 'top' }}>
                            <strong>ADDRESS</strong>
                            <div style={{ marginTop: '8pt', fontSize: '10pt' }}>{application.corporation_address || 'N/A'}</div>
                        </td>
                    </tr>
                    {/* Row 3: TYPE OF PROJECT | AREA AND LOCATION */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', verticalAlign: 'top' }}>
                            <strong>TYPE OF PROJECT</strong>
                            <div style={{ marginTop: '8pt', fontSize: '10pt' }}>{application.project_type || 'N/A'}</div>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', verticalAlign: 'top' }}>
                            <strong>AREA AND LOCATION</strong>
                            <div style={{ marginTop: '8pt', fontSize: '10pt' }}>
                                {application.project_location_barangay}, {application.project_location_municipality || 'CITY OF ILAGAN, ISABELA'}
                            </div>
                        </td>
                    </tr>
                    {/* Row 4: DECISION GRANTED | RIGHT OVER LAND */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', verticalAlign: 'top' }}>
                            <strong>DECISION GRANTED</strong>
                            <div style={{ marginTop: '8pt', fontSize: '10pt', fontWeight: 'bold' }}>
                                {GRANTED_STATUSES.includes(String(application.status || '').toLowerCase())
                                    ? `${(application.project_type || 'LC').toUpperCase()} GRANTED with conditions`
                                    : 'DENIED'}
                            </div>
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8pt', textAlign: 'center', verticalAlign: 'top' }}>
                            <strong>RIGHT OVER LAND</strong>
                            <div style={{ marginTop: '8pt', fontSize: '10pt' }}>{application.right_over_land || 'OWNER'}</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Conditions Section */}
            <div style={{ marginBottom: '10pt', fontSize: '8pt', lineHeight: '1.4', textAlign: 'justify' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6pt' }}>Conditions:</div>
                <div style={{ marginLeft: '15pt' }}>
                    /x/ All conditions stipulated herein form part of this decision and are subject to monitoring<br />
                    /x/ Non-compliance therewith shall be a cause for cancellation or legal action.<br />
                    /x/ The applicable requirements of gov't. agencies and applicable provision of existing laws shall be complied with.<br />
                    /x/ No activity and/or activity applied shall be conducted within the project site.<br />
                    /x/ No major expansion, alteration and/or improvement shall be introduced without prior clearance from this office.<br />
                    /x/ This decision shall not be construed as a certification of City Gov't. of Ilagan as to the ownership or parcel of land subject of this decision.<br />
                    /x/ Any misrepresentation, False statement or allegations materials as to the issuance of this decision shall be sufficient cause of its revocation.
                </div>

                <div style={{ fontWeight: 'bold', marginTop: '10pt', marginBottom: '6pt' }}>Additional Conditions:</div>
                <div style={{ marginLeft: '15pt' }}>
                    /x/ Provision as to setback yard requirements, bulk easement, area height and other restrictions strictly conform with the provision of the National Building Code and other related laws.<br />
                    /x/ This decision shall be considered automatically revoked if project is not commenced within one (1) year from the date of issue of this decision.<br />
                    /x/ For other conditions please see the reverse side.
                </div>
            </div>

            {/* Signatures Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '14pt', marginBottom: '8pt', fontSize: '9pt' }}>
                <div style={{ width: '45%' }}>
                    <div style={{ marginBottom: '6pt' }}>Prepared &amp; Evaluated by:</div>
                    <SignatureLine
                        signatureUrl={reviewer?.signature_url}
                        name={reviewer?.name || 'MARY JANE M. BULAUAN'}
                        title={<>Zoning Officer IV</>}
                    />
                </div>

                {/* The Zoning Administrator approves after the officer has
                    evaluated, so their block sits lower on the page. There is no
                    caption above it — the title under the name says who signed. */}
                <div style={{ width: '45%', marginTop: '40pt' }}>
                    <SignatureLine
                        signatureUrl={zoningAdministrator?.signature_url}
                        name={zoningAdministratorName(zoningAdministrator?.name)}
                        title={<>City Planning &amp; Dev't. Coordinator/<br />Zoning Administrator</>}
                    />
                </div>
            </div>

            {/* Payment Details - Below signatures on the left */}
            <div style={{ fontSize: '9pt', marginTop: '10pt', marginBottom: '16pt' }}>
                <div><strong>O.R. No.:</strong> {payment?.receipt_number || 'N/A'}</div>
                <div><strong>Date Issued:</strong> {payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : application.updated_at ? new Date(application.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                <div><strong>Amount Paid:</strong> ₱{payment?.amount ? Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</div>
            </div>
            </div>
        </>
    );
});

export default ClearanceSheet;
