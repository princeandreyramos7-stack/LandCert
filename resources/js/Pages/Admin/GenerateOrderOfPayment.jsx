import React, { useRef } from "react";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Printer, Download, FileText } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import html2pdf from 'html2pdf.js';

export default function GenerateOrderOfPayment({ application, payment, reviewer }) {
    const paymentRef = useRef(null);

    const handlePrint = () => {
        const printContents = paymentRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const handleDownload = () => {
        const element = paymentRef.current;
        const filename = `OrderOfPayment_${application.application_number || 'Payment'}.pdf`;
        
        const opt = {
            margin: [10, 10, 10, 10],
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
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: 'avoid-all' }
        };
        
        html2pdf().set(opt).from(element).save();
    };

    // Get project type display text
    const getProjectTypeDisplay = () => {
        const projectType = application.project_type;
        if (projectType === 'SUP') return 'SUP';
        if (projectType === 'CZC') return 'CZC';
        if (projectType === 'TUP') return 'TUP';
        return projectType || 'N/A';
    };

    return (
        <AdminLayout 
            title="Generate Order of Payment" 
            breadcrumbs={[
                { label: "Dashboard", href: "/admin/dashboard" }, 
                { label: "Applications", href: "/admin/requests" },
                { label: "Order of Payment" }
            ]}
        >
            <Head title={`Order of Payment - ${application.application_number}`} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .payment-page {
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

                /* Hide browser print headers/footers */
                @page {
                    size: A4;
                    margin: 0;
                }
                
                body {
                    margin: 0;
                    padding: 0;
                }

                .underline-fill {
                    border-bottom: 1px solid #000;
                    display: inline-block;
                    min-width: 200pt;
                    padding-bottom: 2pt;
                }
            `}} />

            {/* Page header with action buttons */}
            <div className="relative overflow-hidden rounded-2xl text-white mb-6"
                style={{ background: "linear-gradient(135deg,#0d1f5c 0%,#1a3a8f 60%,#112068 100%)" }}>
                <div className="relative z-10 flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#d4a017]/20 border border-[#d4a017]/30 rounded-xl">
                            <FileText className="h-7 w-7 text-[#d4a017]"/>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1 h-4 rounded-full bg-[#d4a017]"/>
                                <p className="text-[#d4a017] text-xs font-black tracking-widest uppercase">Payment</p>
                            </div>
                            <h1 className="text-xl font-black text-white">Order of Payment</h1>
                            <p className="text-blue-200/70 text-sm">Application No: {application.application_number}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 no-print">
                        <Button 
                            onClick={handlePrint}
                            className="bg-[#d4a017] hover:bg-[#b8910f] text-white"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
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

            {/* Order of Payment Page */}
            <div ref={paymentRef} className="payment-page" style={{ 
                fontSize: '9pt',
                lineHeight: '1.4',
                pageBreakAfter: 'always',
                pageBreakInside: 'avoid'
            }}>
                {/* Header with CPD Number */}
                <div style={{ position: 'relative', marginBottom: '15pt' }}>
                    {/* CPD Number - Top Right */}
                    <div style={{ position: 'absolute', top: '0', right: '0', fontSize: '11pt', fontWeight: 'bold' }}>
                        CPD-002-0
                    </div>

                    {/* Centered Header Text */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11pt', marginBottom: '2pt' }}>Republic of the Philippines</div>
                        <div style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt' }}>CITY OF ILAGAN</div>
                        <div style={{ fontSize: '11pt', marginBottom: '2pt' }}>Province of Isabela</div>
                        <div style={{ fontSize: '11pt', fontWeight: 'bold', marginBottom: '15pt' }}>CITY PLANNING AND DEVELOPMENT OFFICE</div>
                        
                        {/* Title with Yellow Background */}
                        <div style={{ fontSize: '13pt', fontWeight: 'bold', marginTop: '10pt', display: 'inline-block', background: '#FFFF00', padding: '4pt 8pt' }}>
                            ORDER OF PAYMENT
                        </div>
                    </div>
                </div>

                {/* Divider Line */}
                <div style={{ borderTop: '2px solid #000', marginBottom: '15pt' }} />

                {/* Recipient */}
                <div style={{ fontSize: '11pt', marginBottom: '15pt', fontWeight: 'bold' }}>
                    TO CTO Cashier Special Collecting Officer
                </div>

                {/* Body Content */}
                <div style={{ fontSize: '11pt', lineHeight: '1.8' }}>
                    <div style={{ marginBottom: '2pt' }}>
                        <span>Please receive from </span>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '400pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {application.applicant_name || 'N/A'}
                        </span>
                        <span> of</span>
                    </div>

                    <div style={{ marginBottom: '8pt', textAlign: 'center' }}>
                        <span>(Name of Applicant)</span>
                    </div>

                    <div style={{ marginBottom: '2pt' }}>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '450pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {application.corporation_name || application.applicant_address || 'N/A'}
                        </span>
                        <span> the sum of</span>
                    </div>

                    <div style={{ marginBottom: '8pt', textAlign: 'center' }}>
                        <span>(Name of Firm)</span>
                    </div>

                    <div style={{ marginBottom: '15pt' }}>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '500pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {payment?.amount ? 
                                `Seven thousand two hundred Pesos (₱ ${Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })})` : 
                                'Seven thousand two hundred Pesos (₱ 7,200.00)'
                            }
                        </span>
                    </div>

                    <div style={{ marginBottom: '8pt' }}>
                        <span>as payment for </span>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '350pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {getProjectTypeDisplay()}
                        </span>
                        <span> fee(s) of</span>
                    </div>

                    <div style={{ marginBottom: '2pt' }}>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '400pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {application.project_nature || 'N/A'}
                        </span>
                        <span> located at</span>
                    </div>

                    <div style={{ marginBottom: '8pt', textAlign: 'center' }}>
                        <span>(Name and nature of Project)</span>
                    </div>

                    <div style={{ marginBottom: '30pt' }}>
                        <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '500pt', fontWeight: 'bold', textAlign: 'center' }}>
                            {application.project_location_barangay ? 
                                `${application.project_location_barangay}, ${application.project_location_municipality || 'Ilagan'}` : 
                                'N/A'
                            }
                        </span>
                    </div>
                </div>

                {/* Divider Line */}
                <div style={{ borderTop: '2px solid #000', marginBottom: '15pt' }} />

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
                    <div style={{ width: '48%' }}>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Prepared by: {reviewer?.name ? reviewer.name.toUpperCase() : 'MARYJANE P. BULAUAN'}</span>
                        </div>
                        <div style={{ marginLeft: '70pt', marginTop: '3pt' }}>
                            Zoning Officer IV
                        </div>
                    </div>

                    <div style={{ width: '48%', textAlign: 'right' }}>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Approved: Engr. CRISANTA D. CONCEPCION, EnP</span>
                        </div>
                        <div style={{ marginTop: '3pt' }}>
                            OIC- CPDC/Zoning Administrator
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
