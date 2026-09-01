import React, { useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import html2pdf from 'html2pdf.js';
import PrintDocumentStyles from "@/Components/PrintDocumentStyles";
import OfficialLetterhead from "@/Components/OfficialLetterhead";
import ESignatureImage from "@/Components/ESignatureImage";
import { zoningAdministratorName } from "@/lib/signerName";
import DocumentActionBar from "@/Components/DocumentActionBar";

/* ── Zoning Ordinance constants ────────────────────────────────────────────
   Fixed references printed on every Zoning Certification. */
const ORDINANCE_ARTICLE = '5';
const ORDINANCE_SECTION = '12.6';
const SP_RESOLUTION_NO = '160';
const SP_RESOLUTION_DATE = 'March 05, 2019';

/**
 * A blank to be filled by hand, or the value when we have one.
 *
 * The blank sits on the sentence's own baseline, so the comma or period that
 * follows it lines up with the value instead of floating above the rule.
 *
 * It deliberately does NOT set its own line-height: html2canvas (the engine
 * behind Download PDF) then places the text by the paragraph's line box while
 * drawing the border by the span's shorter one, and the rule comes out struck
 * through the value. Inheriting the line-height keeps the two in agreement.
 */
function Fill({ value, width = '150pt', bold = false }) {
    return (
        <span
            style={{
                display: 'inline-block',
                minWidth: width,
                borderBottom: '1px solid #000',
                textAlign: 'center',
                fontWeight: bold ? 'bold' : 'normal',
                padding: '0 4pt',
                verticalAlign: 'baseline',
            }}
        >
            {value || ' '}
        </span>
    );
}

/**
 * One signature slot: the e-signature image sits ON the ruled line, with the
 * printed name and title underneath. Falls back to an empty gap (same height,
 * so the layout never shifts) when the signer has no signature on file.
 */
function SignatureBlock({ signatureUrl, name, title }) {
    return (
        <div style={{ textAlign: 'center', width: '260pt' }}>
            <div style={{ position: 'relative', height: '36pt', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <ESignatureImage src={signatureUrl} maxHeight="36pt" marginBottom="-2pt" />
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '10pt' }}>{name}</div>
            <div style={{ fontSize: '10pt' }}>{title}</div>
        </div>
    );
}


/** Payment footer. `order` differs between the two official templates. */
function PaymentFooter({ payment, order }) {
    const amount = payment?.amount
        ? `₱${Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
        : '';
    const date = payment?.payment_date
        ? new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '';

    const rows = {
        amountFirst: [
            ['Amount Paid  :', amount],
            ['O.R. No.       :', payment?.receipt_number || ''],
            ['Date            :', date],
        ],
        orFirst: [
            ['O.R. No.  :', payment?.receipt_number || ''],
            ['Date       :', date],
            ['Amount  :', amount],
        ],
    }[order];

    return (
        // The roomy line-height is what keeps the ruled blanks clear of the
        // values in the downloaded PDF — see the note on <Fill>.
        <div style={{ marginTop: '40pt', fontSize: '10pt', lineHeight: 2 }}>
            {rows.map(([label, value]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '6pt' }}>
                    <span style={{ width: '90pt' }}>{label}</span>
                    <Fill value={value} width="160pt" />
                </div>
            ))}
        </div>
    );
}

/* ── Template A — CZC ──────────────────────────────────────────────────────
   "ZONING CERTIFICATION" */
function ZoningCertification({ application, payment, zoningAdministrator, issuedOn }) {
    const area = application.lot_area_sqm
        ? Number(application.lot_area_sqm).toLocaleString('en-PH')
        : '';

    return (
        <>
            <div style={{ textAlign: 'center', margin: '26pt 0 20pt' }}>
                <span style={{ background: '#FFFF00', padding: '3pt 10pt', fontWeight: 'bold', fontSize: '12pt' }}>
                    ZONING CERTIFICATION
                </span>
            </div>

            <p style={{ textAlign: 'justify', lineHeight: '1.8', margin: '0 0 14pt 0' }}>
                This is to certify that parcel of land, lot <Fill value={application.lot_number} width="190pt" />, under Tax Dec.
            </p>

            <p style={{ textAlign: 'justify', lineHeight: '1.8', margin: 0 }}>
                No. <Fill value={application.tax_declaration_no} width="180pt" />, registered under name of <Fill value={application.applicant_name} width="240pt" /> with an
            </p>

            <p style={{ textAlign: 'justify', lineHeight: '1.8', margin: 0 }}>
                area of <Fill value={area} width="90pt" /> sq.m. located at brgy. <Fill value={application.project_location_barangay} width="190pt" />, City of Ilagan, Isabela, was
            </p>

            <p style={{ textAlign: 'justify', lineHeight: '1.8', margin: 0 }}>
                verified to fall within the <Fill value={application.zone_classification} width="160pt" /> <strong>ZONE</strong> as per article {ORDINANCE_ARTICLE}, section <Fill value={ORDINANCE_SECTION} width="70pt" /> of the
            </p>

            <p style={{ textAlign: 'justify', lineHeight: '1.8', margin: 0 }}>
                Comprehensive Land Use Plan and the Zoning Ordinance of City of Ilagan, Isabela approved by
            </p>

            <p style={{ textAlign: 'justify', lineHeight: '1.8', margin: 0 }}>
                the Sangguniang Panlalawigan of Isabela through SP Resolution No. <Fill value={SP_RESOLUTION_NO} width="60pt" /> dated <Fill value={SP_RESOLUTION_DATE} width="150pt" />.
            </p>

            <p style={{ textAlign: 'justify', lineHeight: '1.8', marginTop: '18pt' }}>
                This certification is issued to <Fill value={application.applicant_name} width="270pt" />, for whatever
            </p>

            <p style={{ textAlign: 'justify', lineHeight: '1.8', margin: 0 }}>
                purpose it may serve.
            </p>

            <p style={{ lineHeight: '1.8', marginTop: '18pt' }}>
                City of Ilagan, Isabela <Fill value={issuedOn} width="240pt" />.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '52pt' }}>
                <div style={{ textAlign: 'center', width: '280pt' }}>
                    <div style={{ position: 'relative', height: '36pt', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <ESignatureImage src={zoningAdministrator?.signature_url} maxHeight="36pt" marginBottom="-2pt" />
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '10pt' }}>{zoningAdministratorName(zoningAdministrator?.name)}</div>
                    <div style={{ fontSize: '10pt' }}>City Planning &amp; Development Coordinator/</div>
                    <div style={{ fontSize: '10pt' }}>Zoning Administrator</div>
                </div>
            </div>

            <div style={{ marginTop: '40pt', fontSize: '10pt', lineHeight: 1.6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '4pt' }}>
                    <span style={{ width: '80pt' }}>O.R. No.  :</span>
                    <Fill value={payment?.receipt_number || ''} width="160pt" />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '4pt' }}>
                    <span style={{ width: '80pt' }}>Date       :</span>
                    <Fill value={payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''} width="160pt" />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <span style={{ width: '80pt' }}>Amount  :</span>
                    <Fill value={payment?.amount ? `₱${Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : ''} width="160pt" />
                </div>
            </div>
        </>
    );
}

/* ── Template B — SUP / TUP ────────────────────────────────────────────────
   "CERTIFICATION" (existing road abutting the lot) */
function RoadCertification({ application, payment, zoningAdministrator, issuedOn }) {
    return (
        <>
            <div style={{ textAlign: 'center', margin: '30pt 0 22pt' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13pt', letterSpacing: '3pt' }}>
                    CERTIFICATION
                </span>
            </div>

            <p style={{ fontWeight: 'bold', margin: '0 0 14pt' }}>TO WHOM IT MAY CONCERN:</p>

            <p style={{ textAlign: 'justify', textIndent: '40pt', lineHeight: '2', margin: 0 }}>
                This is to certify that as per certification issued by the City Assessor’s Office, there is
                an <strong>existing road</strong> abutting Title no. <Fill value={application.lot_number} width="140pt" />,
                under Tax Dec. No. <Fill value={application.tax_declaration_no} width="180pt" /> registered under the
                name of <Fill value={application.applicant_name} width="220pt" /> located at
                brgy. <Fill value={application.project_location_barangay} width="180pt" />, City of Ilagan, Isabela.
            </p>

            <p style={{ textAlign: 'justify', textIndent: '40pt', lineHeight: '2', marginTop: '18pt' }}>
                This certification is issued upon the request of interested party for whatever purpose it may serve.
            </p>

            <p style={{ lineHeight: '2', marginTop: '18pt', textIndent: '40pt' }}>
                Given this <Fill value={issuedOn} width="200pt" /> at the City of Ilagan, Isabela.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '52pt' }}>
                <SignatureBlock
                    signatureUrl={zoningAdministrator?.signature_url}
                    name={zoningAdministratorName(zoningAdministrator?.name)}
                    title={<>City Planning &amp; Development Coordinator/<br />Zoning Administrator</>}
                />
            </div>

            <PaymentFooter payment={payment} order="amountFirst" />
        </>
    );
}

export default function GenerateCertificate({ application, payment, reviewer, zoningAdministrator }) {
    const certificateRef = useRef(null);

    // This page is rendered for both admins and super admins — follow the viewer.
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.user_type === 'super_admin';
    const Layout = isSuperAdmin ? SuperAdminLayout : AdminLayout;
    const routePrefix = isSuperAdmin ? 'super-admin' : 'admin';

    // CZC gets the Zoning Certification; SUP and TUP get the road Certification.
    const projectType = String(application.project_type || '').trim().toUpperCase();
    const isCZC = projectType === 'CZC';

    // The certificate carries the date it was issued.
    const issuedOn = new Date().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });

    const handlePrint = () => window.print();

    const handleDownload = () => {
        const element = certificateRef.current;
        const filename = `${isCZC ? 'ZoningCertification' : 'Certification'}_${application.application_number || 'document'}.pdf`;

        // On screen the sheet is a full A4 box. Captured at that height it fills
        // the PDF page exactly, and the rounding spills a sliver onto a second,
        // blank page — so the height is released for the capture and restored
        // afterwards. The certificate is one page.
        const restore = () => { element.style.minHeight = ''; };
        element.style.minHeight = '0';

        html2pdf().set({
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'avoid-all' },
        }).from(element).save().then(restore, restore);
    };

    const TemplateBody = isCZC ? ZoningCertification : RoadCertification;

    return (
        <Layout
            title="Generate Certificate"
            breadcrumbs={[
                { label: "Dashboard", href: `/${routePrefix}/dashboard` },
                { label: "Certificates", href: `/${routePrefix}/certificates` },
            ]}
        >
            <Head title={`Certificate — ${application.application_number}`} />

            <PrintDocumentStyles />

            <style dangerouslySetInnerHTML={{ __html: `
                .certificate-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    font-family: 'Times New Roman', serif;
                    font-size: 11pt;
                    color: #000;
                    padding: 10mm 15mm;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

            `}} />

            {/* ── Actions (never printed). Title No. / Tax Declaration No. / Zone
                 Classification are set on the View Application page, Step 2. ── */}
            <DocumentActionBar
                eyebrow="Certificate"
                title={isCZC ? 'Zoning Certification' : 'Certification'}
                subtitle={`Application No: ${application.application_number}`}
                printLabel="Print Certificate"
                onPrint={handlePrint}
                onDownload={handleDownload}
            />

            {/* ── The document itself ── */}
            <div className="certificate-print-area print-document-area">
                <div ref={certificateRef} className="certificate-page print-document">
                    <OfficialLetterhead />
                    <TemplateBody
                        application={application}
                        payment={payment}
                        reviewer={reviewer}
                        zoningAdministrator={zoningAdministrator}
                        issuedOn={issuedOn}
                    />
                </div>
            </div>
        </Layout>
    );
}
