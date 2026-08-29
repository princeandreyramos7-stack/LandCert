import React, { useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, Download, Printer, FileText } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import html2pdf from 'html2pdf.js';

export default function GenerateClearance({ application, payment, reviewer }) {
    const certificateRef = useRef(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const element = certificateRef.current;
        const filename = `Certificate_${application.application_number || 'Certificate'}.pdf`;
        
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
        <AdminLayout 
            title="Generate Certificate" 
            breadcrumbs={[
                { label: "Dashboard", href: "/admin/dashboard" }, 
                { label: "Certificates", href: "/admin/certificates" }
            ]}
        >
            <Head title={`Certificate - ${application.application_number}`} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .certificate-print-area, .certificate-print-area * {
                        visibility: visible;
                    }
                    .certificate-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .certificate-header {
                        background: linear-gradient(
                            180deg,
                            #ffffff 0%,
                            #eefdfd 8%,
                            #d9f9fa 25%,
                            #bff5f6 55%,
                            #a8eff1 100%
                        ) !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }

                .certificate-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    font-family: 'Times New Roman', serif;
                    padding: 10mm 15mm;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

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
                    padding: 10pt 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    color-adjust: exact;
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
                                <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">Certificate</p>
                            </div>
                            <h1 className="text-xl font-black text-white">Zoning Certificate</h1>
                            <p className="text-blue-200/70 text-sm">Application No: {application.application_number}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            onClick={handlePrint}
                            className="bg-[#d4a017] hover:bg-[#b8910f] text-white"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Certificate
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

            {/* Certificate Print Area */}
            <div className="certificate-print-area">
                <div ref={certificateRef} className="certificate-page" style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                <div className="certificate-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15pt', flex: 1 }}>
                        <div style={{ width: '80pt', height: '80pt', flexShrink: 0 }}>
                            <img src="/images/ilagan1logo.jpg" alt="Ilagan Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }} />
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ fontSize: '10pt', marginBottom: '2pt', color: '#000080' }}>Republic of the Philippines</div>
                            <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#000080' }}>CITY OF ILAGAN</div>
                            <div style={{ fontSize: '10pt', color: '#000080' }}>Province of Isabela</div>
                            <div style={{ fontSize: '11pt', fontWeight: 'bold', marginTop: '3pt', color: '#000080' }}>CITY PLANNING & DEVELOPMENT OFFICE</div>
                        </div>
                    </div>
                    <div style={{ position: 'absolute', top: '0', right: '100pt', textAlign: 'center' }}>
                        <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>CPD-001-0</div>
                    </div>
                    <div style={{ width: '80pt', height: '80pt', flexShrink: 0 }}>
                        <img src="/images/Ilagan Logo2.png" alt="CPDO Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                </div>

                {/* Title with Yellow Highlight */}
                <div style={{ 
                    textAlign: 'center',
                    marginBottom: '15pt',
                    fontSize: '11pt',
                    fontWeight: 'bold'
                }}>
                    <div style={{ display: 'inline-block', background: '#FFFF00', padding: '4pt 8pt' }}>
                        LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE
                    </div>
                </div>

                {/* Application Details Section */}
                <div style={{ marginBottom: '15pt', fontSize: '9pt' }}>
                    <div style={{ marginBottom: '8pt' }}>
                        <strong>Application No.:</strong> {application.application_number || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '8pt' }}>
                        <strong>Date Receipt:</strong> {application.created_at ? new Date(application.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div style={{ marginBottom: '8pt' }}>
                        <strong>O.R. No.:</strong> {payment?.reference_number || 'N/A'}
                    </div>
                    <div style={{ marginBottom: '8pt' }}>
                        <strong>Date Issued:</strong> {application.updated_at ? new Date(application.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                    <div style={{ marginBottom: '8pt' }}>
                        <strong>Amount Paid:</strong> ₱{payment?.amount ? Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                </div>

                {/* Clearance Body */}
                <div style={{ fontSize: '10pt', lineHeight: '1.8', textAlign: 'justify', marginBottom: '20pt' }}>
                    <p style={{ textIndent: '40pt', marginBottom: '12pt' }}>
                        This is to certify that the application for <strong>Locational Clearance / Certificate of Zoning Compliance</strong> filed by <strong>{application.applicant_name || 'N/A'}</strong>
                        {application.corporation_name && ` representing ${application.corporation_name}`}, with address at <strong>{application.applicant_address || 'N/A'}</strong>,
                        for the proposed <strong>{application.project_type || 'project'}</strong> to be located at <strong>{application.project_location_barangay}, {application.project_location_municipality || 'City of Ilagan, Isabela'}</strong>,
                        has been evaluated and found to be in conformity with the Comprehensive Zoning Ordinance and the Comprehensive Land Use Plan of the City of Ilagan.
                    </p>

                    <p style={{ textIndent: '40pt', marginBottom: '12pt' }}>
                        <strong>THIS CLEARANCE IS HEREBY GRANTED</strong> subject to the following conditions:
                    </p>

                    <div style={{ marginLeft: '30pt', marginBottom: '12pt' }}>
                        <div style={{ marginBottom: '6pt' }}>1. Compliance with all applicable national and local building codes, laws, and regulations;</div>
                        <div style={{ marginBottom: '6pt' }}>2. Securing necessary permits from concerned government agencies;</div>
                        <div style={{ marginBottom: '6pt' }}>3. Implementation of proper environmental protection and safety measures;</div>
                        <div style={{ marginBottom: '6pt' }}>4. No deviation from the approved plans without prior clearance from this office;</div>
                        <div style={{ marginBottom: '6pt' }}>5. This clearance shall be valid for one (1) year from date of issuance;</div>
                        <div style={{ marginBottom: '6pt' }}>6. This clearance does not constitute certification of land ownership or title.</div>
                    </div>

                    <p style={{ textIndent: '40pt', marginBottom: '12pt' }}>
                        Non-compliance with any of the above conditions shall be sufficient ground for the revocation of this clearance.
                    </p>

                    {application.project_nature && (
                        <p style={{ textIndent: '40pt', marginBottom: '12pt' }}>
                            <strong>Project Nature/Description:</strong> {application.project_nature}
                        </p>
                    )}

                    <p style={{ textIndent: '40pt', marginTop: '20pt' }}>
                        Issued this <strong>{application.updated_at ? new Date(application.updated_at).toLocaleDateString('en-US', { day: 'numeric' }) : '__'}</strong> day of <strong>{application.updated_at ? new Date(application.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '__________, 20__'}</strong> at the City Planning and Development Office, City of Ilagan, Province of Isabela.
                    </p>
                </div>

                {/* Signatures Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40pt', fontSize: '9pt' }}>
                    <div style={{ width: '45%' }}>
                        <div style={{ marginBottom: '6pt' }}>Prepared and Evaluated by:</div>
                        <div style={{ marginTop: '35pt', borderTop: '1.5px solid #000', paddingTop: '3pt', textAlign: 'center' }}>
                            <strong>{reviewer?.name || 'N/A'}</strong><br />
                            Zoning Officer IV
                        </div>
                    </div>
                    
                    <div style={{ width: '45%' }}>
                        <div style={{ marginBottom: '6pt' }}>Approved by:</div>
                        <div style={{ marginTop: '35pt', borderTop: '1.5px solid #000', paddingTop: '3pt', textAlign: 'center' }}>
                            <strong>ENGR. CRISANTA D. CONCEPCION, EnP</strong><br />
                            OIC- City Planning & Dev't. Coordinator/<br />
                            Zoning Administrator
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div style={{ 
                    position: 'absolute', 
                    bottom: '0.5in', 
                    left: '0.75in', 
                    right: '0.75in',
                    fontSize: '8pt',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    color: '#666',
                    paddingTop: '15pt',
                    borderTop: '1px solid #ccc'
                }}>
                    <strong>NOTE:</strong> This clearance is issued for zoning purposes only and does not authorize construction or operation without proper building permits and other required licenses.
                </div>
                </div>
            </div>
        </AdminLayout>
    );
}
