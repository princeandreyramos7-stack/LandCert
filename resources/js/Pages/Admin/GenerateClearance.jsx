import React, { useRef } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Download, Printer, FileText } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import html2pdf from 'html2pdf.js';

/**
 * One signature slot: the e-signature image sits ON the ruled line, with the
 * printed name and title underneath. Falls back to an empty gap (same height,
 * so the layout never shifts) when the signer has no signature on file.
 */
function SignatureLine({ signatureUrl, name, title }) {
    return (
        <div style={{ marginTop: '10pt' }}>
            <div style={{ height: '38pt', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                {signatureUrl && (
                    <img
                        src={signatureUrl}
                        alt=""
                        crossOrigin="anonymous"
                        style={{ maxHeight: '38pt', maxWidth: '85%', objectFit: 'contain', marginBottom: '-4pt' }}
                    />
                )}
            </div>
            <div style={{ borderTop: '1.5px solid #000', paddingTop: '3pt', textAlign: 'center' }}>
                <strong>{name}</strong><br />
                {title}
            </div>
        </div>
    );
}

export default function GenerateCertificate({ application, payment, reviewer, zoningAdministrator, auth }) {
    const certificateRef = useRef(null);

    // This page is rendered for both admins and super admins — follow the viewer.
    const pageAuth = usePage().props.auth ?? auth;
    const isSuperAdmin = pageAuth?.user?.user_type === 'super_admin';
    const Layout = isSuperAdmin ? SuperAdminLayout : AdminLayout;
    const routePrefix = isSuperAdmin ? 'super-admin' : 'admin';

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const element = certificateRef.current;
        const filename = `Clearance_${application.application_number || 'Certificate'}.pdf`;
        
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait'
            },
            pagebreak: { mode: 'avoid-all' }
        };
        
        html2pdf().set(opt).from(element).save();
    };

    return (
        <Layout
            title="Generate Clearance"
            breadcrumbs={[
                { label: "Dashboard", href: `/${routePrefix}/dashboard` },
                { label: "Certificates", href: `/${routePrefix}/certificates` }
            ]}
        >
            <Head title={`Certificate - ${application.application_number}`} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .certificate-page {
                    width: 100%;
                    max-width: 8.5in;
                    min-height: 11in;
                    margin: 0 auto;
                    background: white;
                    position: relative;
                    font-family: 'Times New Roman', serif;
                    padding: 0.5in 0.75in;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                /* Government-style header: small white area at the top,
                   smoothly fading into light blue toward the right/bottom. */
                .certificate-header {
                    width: 100%;
                    background: linear-gradient(
                        180deg,
                        #ffffff 0%,
                        #eefdfd 8%,
                        #d9f9fa 25%,
                        #bff5f6 55%,
                        #a8eff1 100%
                    );

                    border-bottom: 3px solid #2222ff;

                    padding: 8pt 0 10pt 0;

                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    position: relative;
                }

                /* Print colors exactly */
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }

                /* Hide browser print headers/footers */
                @page {
                    size: A4;
                    margin: 0;
                }

                @media print {
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}} />

            {/* Page header with action buttons */}
            <div className="relative overflow-hidden rounded-2xl text-white mb-6 no-print"
                style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                <div className="relative z-10 flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#d4a017]/20 border border-[#d4a017]/30 rounded-xl">
                            <FileText className="h-7 w-7 text-[#d4a017]"/>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">Clearance</p>
                            </div>
                            <h1 className="text-xl font-black text-white">Zoning Clearance</h1>
                            <p className="text-blue-200/70 text-sm">Application No: {application.application_number}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            onClick={handlePrint}
                            className="bg-[#d4a017] hover:bg-[#b8910f] text-white"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Clearance
                        </Button>
                        <Button 
                            onClick={handleDownload}
                            className="bg-white hover:bg-gray-100 text-[#0d1f5c] border-white"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Clearance Print Area */}
            <div className="clearance-print-area">
                <div ref={certificateRef} className="certificate-page" style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                <div className="certificate-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Left Logo + Government Text */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15pt', flex: 1 }}>
        {/* Left Logo */}
        <div
            style={{
                width: '80pt',
                height: '80pt',
                flexShrink: 0
            }}
        >
            <img
                src="/images/ilagan1logo.jpg"
                alt="Ilagan Logo"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    mixBlendMode: 'multiply'
                }}
            />
        </div>

        {/* Government Text */}
        <div style={{ textAlign: 'left' }}>
            <div
                style={{
                    fontSize: '10pt',
                    marginBottom: '2pt',
                    color: '#000080'
                }}
            >
                Republic of the Philippines
            </div>

            <div
                style={{
                    fontSize: '12pt',
                    fontWeight: 'bold',
                    color: '#000080'
                }}
            >
                CITY OF ILAGAN
            </div>

            <div
                style={{
                    fontSize: '10pt',
                    color: '#000080'
                }}
            >
                Province of Isabela
            </div>

            <div
                style={{
                    fontSize: '11pt',
                    fontWeight: 'bold',
                    marginTop: '3pt',
                    color: '#000080'
                }}
            >
                CITY PLANNING &amp; DEVELOPMENT OFFICE
            </div>
        </div>
    </div>

    {/* CPD Number */}
    <div
        style={{
            position: 'absolute',
            top: '0',
            right: '100pt',
            textAlign: 'center'
        }}
    >
        <div
            style={{
                fontSize: '10pt',
                fontWeight: 'bold'
            }}
        >
            CPD-001-0
        </div>
    </div>

    {/* Right Logo */}
    <div
        style={{
            width: '80pt',
            height: '80pt',
            flexShrink: 0
        }}
    >
        <img
            src="/images/Ilagan Logo2.png"
            alt="CPDO Logo"
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            }}
        />
    </div>
</div>
                
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

                {/* Application and Decision Info - Outside table */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4pt', fontSize: '9pt' }}>
                    <div>
                        <div style={{ marginBottom: '4pt' }}>
                            <strong>Application No.: </strong>
                            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '150pt', paddingBottom: '2pt' }}>
                                {application.application_number || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <strong>Date Received: </strong>
                            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '150pt', paddingBottom: '2pt' }}>
                                {application.created_at ? new Date(application.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div style={{ marginRight: '60px', marginTop: '10px' }}>
                        <div style={{ marginBottom: '' }}>
                            <strong>Decision No.: </strong>
                            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '150pt', textAlign: 'left' }}>
                                {application.decision_number || 'N/A'}
                            </span>
                        </div>
                        <div style={{marginRight: '5px'}}>
                            <strong>Date Issued: </strong>
                            <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '150pt', paddingBottom: '2pt', textAlign: 'left' }}>
                                {application.updated_at ? new Date(application.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

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
                                    {application.status === 'approved' ? 'CZC Granted with Conditions' : 'DENIED'}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20pt', marginBottom: '25pt', fontSize: '9pt' }}>
                    <div style={{ width: '45%' }}>
                        <div style={{ marginBottom: '6pt' }}>Prepared &amp; Evaluated by:</div>
                        <SignatureLine
                            signatureUrl={reviewer?.signature_url}
                            name={reviewer?.name || 'MARY JANE M. BULAUAN'}
                            title={<>Zoning Officer IV</>}
                        />
                    </div>

                    <div style={{ width: '45%' }}>
                        <div style={{ marginBottom: '6pt', visibility: 'hidden' }}>Placeholder</div>
                        <SignatureLine
                            signatureUrl={zoningAdministrator?.signature_url}
                            name={zoningAdministrator?.name || 'ENGR. CRISANTA D. CONCEPCION, EnP'}
                            title={<>City Planning &amp; Dev't. Coordinator/<br />Zoning Administrator</>}
                        />
                    </div>
                </div>

                {/* Payment Details - Below signatures on the left */}
                <div style={{ fontSize: '9pt', marginTop: '15pt' }}>
                    <div><strong>O.R. No.:</strong> {payment?.receipt_number || 'N/A'}</div>
                    <div><strong>Date Issued:</strong> {payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : application.updated_at ? new Date(application.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</div>
                    <div><strong>Amount Paid:</strong> ₱{payment?.amount ? Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}</div>
                </div>
                </div>
            </div>
        </Layout>
    );
}
