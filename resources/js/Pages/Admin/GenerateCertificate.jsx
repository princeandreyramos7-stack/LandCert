import React, { useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Download, Printer } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import html2pdf from 'html2pdf.js';

/* ── Zoning Ordinance constants ────────────────────────────────────────────
   Fixed references printed on every Zoning Certification. */
const ORDINANCE_ARTICLE = '5';
const ORDINANCE_SECTION = '12.6';
const SP_RESOLUTION_NO = '160';
const SP_RESOLUTION_DATE = 'March 05, 2019';

/** A blank to be filled by hand, or the value when we have one. */
function Fill({ value, width = '150pt', bold = false }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                minWidth: width,
                borderBottom: '1px solid #000',
                textAlign: 'center',
                fontWeight: bold ? 'bold' : 'normal',
                padding: '0 4pt',
                lineHeight: '1.2',
                verticalAlign: 'bottom',
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
            <div style={{ height: '36pt', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                {signatureUrl && (
                    <img
                        src={signatureUrl}
                        alt=""
                        crossOrigin="anonymous"
                        style={{ maxHeight: '36pt', maxWidth: '85%', objectFit: 'contain', marginBottom: '-2pt' }}
                    />
                )}
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '10pt' }}>{name}</div>
            <div style={{ fontSize: '10pt' }}>{title}</div>
        </div>
    );
}

/** Official letterhead shared by both certification templates. */
function Letterhead() {
    return (
        <div className="certificate-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14pt', flex: 1 }}>
                <div style={{ width: '74pt', height: '74pt', flexShrink: 0 }}>
                    <img
                        src="/images/ilagan1logo.jpg"
                        alt="City of Ilagan"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                    />
                </div>
                <div style={{ textAlign: 'left', color: '#000080' }}>
                    <div style={{ fontSize: '10pt' }}>Republic of the Philippines</div>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>CITY OF ILAGAN</div>
                    <div style={{ fontSize: '10pt' }}>Province of Isabela</div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', marginTop: '2pt' }}>
                        CITY PLANNING &amp; DEVELOPMENT OFFICE
                    </div>
                </div>
            </div>
            <div style={{ width: '74pt', height: '74pt', flexShrink: 0 }}>
                <img
                    src="/images/Ilagan Logo2.png"
                    alt="City of Ilagan 2030"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </div>
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
        <div style={{ marginTop: '40pt', fontSize: '10pt' }}>
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

            <p style={{ textAlign: 'justify', textIndent: '40pt', lineHeight: '2', margin: 0 }}>
                This is to certify that parcel of land, lot <Fill value={application.lot_number} width="190pt" />,
                under Tax Dec. No. <Fill value={application.tax_declaration_no} width="190pt" />, registered under
                name of <Fill value={application.applicant_name} width="230pt" /> with an area
                of <Fill value={area} width="80pt" /> sq.m. located at brgy. <Fill value={application.project_location_barangay} width="170pt" />,
                City of Ilagan, Isabela, was verified to fall within
                the <Fill value={application.zone_classification} width="150pt" /> <strong>ZONE</strong> as
                per article {ORDINANCE_ARTICLE}, section <Fill value={ORDINANCE_SECTION} width="70pt" /> of the
                Comprehensive Land Use Plan and the Zoning Ordinance of City of Ilagan, Isabela approved by the
                Sangguniang Panlalawigan of Isabela through SP Resolution No. <Fill value={SP_RESOLUTION_NO} width="60pt" /> dated <Fill value={SP_RESOLUTION_DATE} width="150pt" />.
            </p>

            <p style={{ textAlign: 'justify', textIndent: '40pt', lineHeight: '2', marginTop: '18pt' }}>
                This certification is issued to <Fill value={application.applicant_name} width="250pt" />, for
                whatever purpose it may serve.
            </p>

            <p style={{ lineHeight: '2', marginTop: '18pt' }}>
                City of Ilagan, Isabela <Fill value={issuedOn} width="220pt" />.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '46pt' }}>
                <SignatureBlock
                    signatureUrl={zoningAdministrator?.signature_url}
                    name={zoningAdministrator?.name || 'Engr. CRISANTA D. CONCEPCION, EnP'}
                    title={<>City Planning &amp; Development Coordinator/<br />Zoning Administrator</>}
                />
            </div>

            <PaymentFooter payment={payment} order="orFirst" />
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
                an <strong>existing road</strong> abutting lot no. <Fill value={application.lot_number} width="140pt" />,
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
                    name={zoningAdministrator?.name || 'Engr. CRISANTA D. CONCEPCION, EnP'}
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

        html2pdf().set({
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'avoid-all' },
        }).from(element).save();
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

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * { visibility: hidden; }
                    .certificate-print-area, .certificate-print-area * { visibility: visible; }
                    .certificate-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .certificate-header {
                        background: linear-gradient(180deg,#ffffff 0%,#eefdfd 8%,#d9f9fa 25%,#bff5f6 55%,#a8eff1 100%) !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page { size: A4; margin: 10mm; }
                }

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

                .certificate-header {
                    width: 100%;
                    background: linear-gradient(180deg,#ffffff 0%,#eefdfd 8%,#d9f9fa 25%,#bff5f6 55%,#a8eff1 100%);
                    border-bottom: 3px solid #2222ff;
                    padding: 8pt 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
            `}} />

            {/* ── Actions (never printed). Lot No. / Tax Declaration No. / Zone
                 Classification are set on the View Application page, Step 2. ── */}
            <div className="no-print max-w-4xl mx-auto mb-6 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                        {isCZC
                            ? 'Zoning Certification (CZC)'
                            : `Certification — existing road${projectType ? ` (${projectType})` : ''}`}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" /> Print
                        </Button>
                        <Button onClick={handleDownload} className="gap-2 bg-[#0d1f5c] hover:bg-[#0d1f5c]/90">
                            <Download className="h-4 w-4" /> Download PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── The document itself ── */}
            <div className="certificate-print-area">
                <div ref={certificateRef} className="certificate-page">
                    <Letterhead />
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
