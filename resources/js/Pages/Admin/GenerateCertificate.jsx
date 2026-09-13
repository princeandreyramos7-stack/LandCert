import React, { useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import html2pdf from 'html2pdf.js';
import PrintDocumentStyles from "@/Components/PrintDocumentStyles";
import FitToWidth, { suspendFit } from "@/Components/FitToWidth";
import DocumentActionBar from "@/Components/DocumentActionBar";
import CertificateSheet, { isZoningCertification, certificateIssuedOn } from "@/Components/CertificateSheet";

export default function GenerateCertificate({ application, payment, reviewer, zoningAdministrator }) {
    const certificateRef = useRef(null);

    // This page is rendered for both admins and super admins — follow the viewer.
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.user_type === 'super_admin';
    const Layout = isSuperAdmin ? SuperAdminLayout : AdminLayout;
    const routePrefix = isSuperAdmin ? 'super-admin' : 'admin';

    // CZC gets the Zoning Certification; SUP and TUP get the road Certification.
    const isCZC = isZoningCertification(application.project_type);

    // The certificate carries the date it was issued.
    const issuedOn = certificateIssuedOn();

    const handlePrint = () => window.print();

    const handleDownload = () => {
        const element = certificateRef.current;
        const filename = `${isCZC ? 'ZoningCertification' : 'Certification'}_${application.application_number || 'document'}.pdf`;

        // On screen the sheet is a full A4 box. Captured at that height it fills
        // the PDF page exactly, and the rounding spills a sliver onto a second,
        // blank page — so the height is released for the capture and restored
        // afterwards. The certificate is one page.
        // html2canvas reads computed styles, so the on-screen fit-to-width zoom
        // would otherwise be baked into the saved PDF.
        const resumeFit = suspendFit(element);
        const restore = () => { element.style.minHeight = ''; resumeFit(); };
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

            {/* ── The document itself — the sheet lives in CertificateSheet so
                 the applicant report can show the same one. ── */}
            <div className="certificate-print-area print-document-area">
                <FitToWidth>
                    <CertificateSheet
                        ref={certificateRef}
                        className="print-document"
                        application={application}
                        payment={payment}
                        zoningAdministrator={zoningAdministrator}
                        issuedOn={issuedOn}
                    />
                </FitToWidth>
            </div>
        </Layout>
    );
}
