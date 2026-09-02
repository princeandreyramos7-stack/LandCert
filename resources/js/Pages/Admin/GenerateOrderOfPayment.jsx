import React, { useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import html2pdf from 'html2pdf.js';
import { zoningAdministratorName } from "@/lib/signerName";
import ESignatureImage from "@/Components/ESignatureImage";
import DocumentActionBar from "@/Components/DocumentActionBar";
import FitToWidth, { suspendFit } from "@/Components/FitToWidth";

/** Whole-peso amount to English words, e.g. 7200 -> "Seven Thousand Two Hundred Pesos". */
function pesoInWords(value) {
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
 * Signature slot for the Order of Payment: the e-signature image sits just above
 * the printed name. Keeps a fixed-height gap when there is no signature on file,
 * so the layout never shifts.
 */
function SigLine({ label, signatureUrl, name, title }) {
    return (
        <div>
            <div style={{ position: 'relative', height: '26pt', display: 'flex', alignItems: 'flex-end', width: '190pt' }}>
                <ESignatureImage src={signatureUrl} maxHeight="26pt" maxWidth="150pt" marginBottom="-3pt" />
            </div>
            <div style={{ fontWeight: 'bold' }}>
                {label}: {name}
            </div>
            <div style={{ marginTop: '3pt' }}>{title}</div>
        </div>
    );
}

export default function GenerateOrderOfPayment({ application, payment, reviewer, zoningAdministrator, paymentAmount = null }) {
    const paymentRef = useRef(null);

    // This page is opened by admins, super admins and applicants — follow the viewer.
    const userType = usePage().props.auth?.user?.user_type;
    const Layout = userType === 'super_admin' ? SuperAdminLayout
        : userType === 'admin' ? AdminLayout
        : ApplicantLayout;
    const breadcrumbs = userType === 'super_admin'
        ? [{ label: "Dashboard", href: "/super-admin/dashboard" }, { label: "Applications", href: "/super-admin/requests" }, { label: "Order of Payment" }]
        : userType === 'admin'
        ? [{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Applications", href: "/admin/requests" }, { label: "Order of Payment" }]
        : [{ label: "My Applications", href: "/my-applications" }, { label: "Order of Payment" }];

    // Fee to charge: an actual payment record wins, otherwise the amount the
    // Zoning Officer set at review time.
    const feeAmount = payment?.amount ?? paymentAmount ?? application?.payment_amount ?? null;
    const feeDisplay = feeAmount !== null && feeAmount !== ""
        ? `${pesoInWords(feeAmount)} (₱ ${Number(feeAmount).toLocaleString("en-PH", { minimumFractionDigits: 2 })})`
        : "____________________________ (₱ __________)";

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
        
        // html2canvas reads computed styles, so the on-screen fit-to-width zoom
        // would otherwise be baked into the saved PDF.
        const resumeFit = suspendFit(element);
        html2pdf().set(opt).from(element).save().then(resumeFit, resumeFit);
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
        <Layout
            title="Order of Payment"
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Order of Payment - ${application.application_number}`} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .payment-page {
                    /* A fixed sheet, like the other printable documents. At a
                       fluid width the pt-sized fields and the absolutely
                       positioned CPD number collided on narrow screens;
                       FitToWidth scales the whole sheet down instead. */
                    width: 8.5in;
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

            {/* Was a hand-rolled copy of this bar, which never picked up the
                responsive layout the shared one has. */}
            <DocumentActionBar
                eyebrow="Payment"
                title="Order of Payment"
                subtitle={`Application No: ${application.application_number}`}
                printLabel="Print"
                onPrint={handlePrint}
                onDownload={handleDownload}
            />

            {/* Order of Payment Page */}
            <FitToWidth>
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
                            {feeDisplay}
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
                        <SigLine
                            label="Prepared by"
                            signatureUrl={reviewer?.signature_url}
                            name={(reviewer?.name || 'MARY JANE P. BULAUAN').toUpperCase()}
                            title="Zoning Officer IV"
                        />
                    </div>

                    <div style={{ width: '48%' }}>
                        <SigLine
                            label="Approved"
                            signatureUrl={zoningAdministrator?.signature_url}
                            name={zoningAdministratorName(zoningAdministrator?.name)}
                            title="OIC- CPDC/Zoning Administrator"
                        />
                    </div>
                </div>
            </div>
            </FitToWidth>
        </Layout>
    );
}
