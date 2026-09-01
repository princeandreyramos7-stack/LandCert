import React from "react";
import OfficialLetterhead from "@/Components/OfficialLetterhead";
import ESignatureImage from "@/Components/ESignatureImage";
import { zoningAdministratorName } from "@/lib/signerName";

/**
 * The Temporary Use Permit decision is not the tabular clearance the other
 * categories get — the office issues it as a letter to the applicant, granting
 * the permit for one year subject to eight standing conditions.
 */
export default function TupClearanceLetter({ application, payment, zoningAdministrator, innerRef }) {
    const formatDate = (value) =>
        value
            ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })
            : '____________';

    const issued = application.updated_at ? new Date(application.updated_at) : new Date();
    const expiry = new Date(issued);
    expiry.setFullYear(expiry.getFullYear() + 1);

    // "Mr. Dela Cruz:" — the salutation uses the surname alone.
    const surname = String(application.applicant_name || '')
        .trim()
        .split(/\s+/)
        .filter((part) => !/^(jr\.?|sr\.?|i{1,3}|iv|v)$/i.test(part))
        .pop() || 'Sir/Madam';

    const project = application.project_nature || 'project';
    const location = [
        application.project_location_street,
        application.project_location_barangay,
        application.project_location_municipality || 'City of Ilagan',
        'Isabela',
    ].filter(Boolean).join(', ');

    const conditions = [
        'All conditions stipulated herein form part of this decision and are subject to monitoring.',
        'Non-compliance therewith shall be a cause for cancellation or legal actions.',
        "The applicable requirements of gov't. agencies and applicable provisions of existing laws shall be complied with.",
        'No activity other than that applied for shall be conducted within the project site.',
        'No major expansions, alterations and/or improvement shall be introduced without prior clearance from this office.',
        'This decision shall not be construed as a certification of HSRC to the ownership by the applicant of the parcel of land subject to this decision.',
        'Any misrepresentation, false statement or allegations materials to the issuance of this decision shall be a sufficient cause for its revocation.',
        'Additional Conditions:',
    ];

    return (
        <div
            ref={innerRef}
            className="certificate-page print-document"
            style={{ fontSize: '10pt', lineHeight: 1.35 }}
        >
            <OfficialLetterhead code="CPD-003-0" />

            <div style={{ marginTop: '14pt' }}>{formatDate(issued)}</div>

            <div style={{ marginTop: '12pt', fontWeight: 'bold' }}>
                {(application.applicant_name || 'N/A').toUpperCase()}
            </div>
            <div>{application.applicant_address || 'N/A'}</div>

            <div style={{ marginTop: '12pt' }}>Dear {surname}:</div>

            <p style={{ marginTop: '10pt', textAlign: 'justify', textIndent: '36pt' }}>
                This has reference to your application for Locational Clearance of your{' '}
                <strong>{project.toUpperCase()}</strong> project located at {location}.
            </p>

            <p style={{ marginTop: '8pt', textAlign: 'justify', textIndent: '36pt' }}>
                Relative thereto, this office interpose no objection to the operation of the subject{' '}
                <strong>{project.toUpperCase()}</strong> project wherein no violation had been committed.
                In view thereof, we are granting you <strong>Temporary Use Permit (TUP)</strong> valid for
                a period of one (1) year unless sooner revoked by this office on valid grounds. This TUP
                shall be subject to the following conditions which have to be strictly complied.
            </p>

            <ol style={{ marginTop: '10pt', paddingLeft: '52pt', textAlign: 'justify' }}>
                {conditions.slice(0, 7).map((condition, index) => (
                    <li key={condition} style={{ marginBottom: '4pt' }}>{condition}</li>
                ))}
                <li style={{ marginBottom: '4pt' }}>
                    Additional Conditions:
                    <div style={{ paddingLeft: '14pt', marginTop: '2pt' }}>
                        <div style={{ marginBottom: '3pt' }}>
                            a. Provision as to setback, yard requirement, bulk, easement, are height and other
                            restrictions shall strictly comply with the requirements of the National Building
                            Code and other related laws.
                        </div>
                        <div style={{ marginBottom: '3pt' }}>
                            b. This decision shall be considered automatically revoked if project is not
                            commenced within one (1) year from date of issue of this decision.
                        </div>
                        <div>c. For other conditions, please see the reverse side.</div>
                    </div>
                </li>
            </ol>

            <p style={{ marginTop: '10pt' }}>Please be guided accordingly.</p>

            <div style={{ marginTop: '16pt' }}>
                <div>Very truly yours,</div>
                <div style={{ position: 'relative', marginTop: '28pt', height: '34pt', display: 'flex', alignItems: 'flex-end', width: '240pt' }}>
                    <ESignatureImage
                        src={zoningAdministrator?.signature_url}
                        maxWidth="200pt"
                        marginBottom="-6pt"
                    />
                </div>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {zoningAdministratorName(zoningAdministrator?.name)}
                </div>
                <div>City Planning &amp; Dev&apos;t. Coordinator/</div>
                <div>Zoning Administrator</div>
            </div>

            {/* Receipt details on the left, decision details on the right */}
            <div
                style={{
                    marginTop: '22pt',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '9.5pt',
                }}
            >
                <div>
                    <div>O.R. No.&nbsp;&nbsp;: {payment?.receipt_number || '____________'}</div>
                    <div>Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {formatDate(payment?.payment_date)}</div>
                    <div>
                        Amount&nbsp;&nbsp;:{' '}
                        {payment?.amount
                            ? Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })
                            : '____________'}
                    </div>
                </div>
                <div style={{ marginRight: '40pt' }}>
                    <div>Application No.&nbsp;: {application.application_number || 'N/A'}</div>
                    <div>Decision No.&nbsp;&nbsp;&nbsp;&nbsp;: {application.decision_number || 'N/A'}</div>
                    <div>Date Issued&nbsp;&nbsp;&nbsp;&nbsp;: {formatDate(issued)}</div>
                    <div>Expiry Date&nbsp;&nbsp;&nbsp;&nbsp;: {formatDate(expiry)}</div>
                </div>
            </div>
        </div>
    );
}

