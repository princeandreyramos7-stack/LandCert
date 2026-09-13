import React, { useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import html2pdf from 'html2pdf.js';
import PrintDocumentStyles from "@/Components/PrintDocumentStyles";
import FitToWidth, { suspendFit } from "@/Components/FitToWidth";
import DocumentActionBar from "@/Components/DocumentActionBar";
import ClearanceSheet, { isTemporaryUsePermit } from "@/Components/ClearanceSheet";

export default function GenerateCertificate({ application, payment, reviewer, zoningAdministrator, auth }) {
    const certificateRef = useRef(null);

    // A Temporary Use Permit is released as a letter to the applicant, not as
    // the tabular decision sheet the other categories use.
    const isTup = isTemporaryUsePermit(application.project_type);

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

        // On screen the sheet is a full A4 box. Captured at that height it fills
        // the PDF page exactly, and the rounding spills a sliver onto a second,
        // blank page — so the height is released for the capture and restored
        // afterwards. The clearance is one page.
        // html2canvas reads computed styles, so the on-screen fit-to-width zoom
        // would otherwise be baked into the saved PDF.
        const resumeFit = suspendFit(element);
        const restore = () => { element.style.minHeight = ''; resumeFit(); };
        element.style.minHeight = '0';

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
        
        html2pdf().set(opt).from(element).save().then(restore, restore);
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
            
            <PrintDocumentStyles />

            {/* Page header with action buttons */}
            <DocumentActionBar
                eyebrow="Clearance"
                title={isTup ? "Temporary Use Permit" : "Zoning Clearance"}
                subtitle={`Application No: ${application.application_number}`}
                printLabel={isTup ? "Print Permit" : "Print Clearance"}
                onPrint={handlePrint}
                onDownload={handleDownload}
            />

            {/* Clearance Print Area — the sheet lives in ClearanceSheet so the
                applicant report can show the same one. */}
            <div className="clearance-print-area print-document-area">
                <FitToWidth>
                    <ClearanceSheet
                        ref={certificateRef}
                        className="print-document"
                        application={application}
                        payment={payment}
                        reviewer={reviewer}
                        zoningAdministrator={zoningAdministrator}
                    />
                </FitToWidth>
            </div>
        </Layout>
    );
}
