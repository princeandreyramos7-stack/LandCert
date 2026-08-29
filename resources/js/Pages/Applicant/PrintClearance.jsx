import React, { useRef, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Download, Printer } from "lucide-react";
import html2pdf from 'html2pdf.js';

export default function PrintClearance({ application, payment, reviewer }) {
    const clearanceRef = useRef(null);

    useEffect(() => {
        // Auto-print when page loads (optional)
        // window.print();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const element = clearanceRef.current;
        const filename = `Clearance_${application.application_number || 'Clearance'}.pdf`;
        
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
        <>
            <Head title={`Clearance - ${application.application_number}`} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                body {
                    margin: 0;
                    padding: 0;
                    background: #f5f5f5;
                }

                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .clearance-print-area, .clearance-print-area * {
                        visibility: visible;
                    }
                    .clearance-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .clearance-header-bg {
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

                .print-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .clearance-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    font-family: 'Times New Roman', serif;
                    padding: 10mm 15mm;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .clearance-header-bg {
                    background: linear-gradient(
                        180deg,
                        #ffffff 0%,
                        #eefdfd 8%,
                        #d9f9fa 25%,
                        #bff5f6 55%,
                        #a8eff1 100%
                    );
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    color-adjust: exact;
                }

                .action-buttons {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .action-buttons button {
                    margin: 0 10px;
                    padding: 10px 20px;
                    font-size: 14px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-print {
                    background: #d4a017;
                    color: white;
                }

                .btn-print:hover {
                    background: #b8910f;
                }

                .btn-download {
                    background: white;
                    color: #0d1f5c;
                    border: 1px solid #0d1f5c;
                }

                .btn-download:hover {
                    background: #f5f5f5;
                }
            `}} />

            <div className="print-container">
                <div className="action-buttons no-print">
                    <button onClick={handlePrint} className="btn-print">
                        <Printer size={16} />
                        Print Clearance
                    </button>
                    <button onClick={handleDownload} className="btn-download">
                        <Download size={16} />
                        Download PDF
                    </button>
                </div>

                <div className="clearance-print-area">
                    <div ref={clearanceRef} className="clearance-page" style={{ fontSize: '10pt', lineHeight: '1.4' }}>
                        <div className="clearance-header-bg" style={{ padding: '10pt 0', marginBottom: '10pt', borderBottom: '3px solid #2222ff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15pt', flex: 1 }}>
                                    <div style={{ width: '80pt', height: '80pt', flexShrink: 0 }}>
                                        <img src="/images/ilagan1logo.jpg" alt="Ilagan Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '10pt', marginBottom: '2pt' }}>Republic of the Philippines</div>
                                        <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>CITY OF ILAGAN</div>
                                        <div style={{ fontSize: '10pt' }}>Province of Isabela</div>
                                        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginTop: '3pt' }}>CITY PLANNING AND DEVELOPMENT OFFICE</div>
                                    </div>
                                </div>
                                <div style={{ position: 'absolute', top: '0', right: '100pt', textAlign: 'center' }}>
                                    <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>CPD-001-0</div>
                                </div>
                                <div style={{ width: '80pt', height: '80pt', flexShrink: 0 }}>
                                    <img src="/images/Ilagan Logo2.png" alt="CPDO Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '15pt', fontSize: '11pt', fontWeight: 'bold' }}>
                            <div style={{ display: 'inline-block', background: '#FFFF00', padding: '4pt 8pt' }}>
                                LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE
                            </div>
                        </div>

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

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30pt', fontSize: '9pt' }}>
                            <div style={{ width: '45%' }}>
                                <div style={{ marginBottom: '6pt' }}>Prepared and Evaluated by:</div>
                                <div style={{ marginTop: '35pt', paddingTop: '3pt', textAlign: 'center' }}>
                                    <strong>{reviewer?.name || 'N/A'}</strong><br />
                                    Zoning Officer IV
                                </div>
                            </div>
                            
                            <div style={{ width: '45%' }}>
                                <div style={{ marginBottom: '6pt' }}>Approved by:</div>
                                <div style={{ marginTop: '35pt', paddingTop: '3pt', textAlign: 'center' }}>
                                    <strong>ENGR. CRISANTA D. CONCEPCION, EnP</strong><br />
                                    OIC- City Planning & Dev't. Coordinator/<br />
                                    Zoning Administrator
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
