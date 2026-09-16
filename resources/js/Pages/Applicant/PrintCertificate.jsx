import React, { useRef } from "react";
import { Head } from "@inertiajs/react";
import html2pdf from "html2pdf.js";
import PrintDocumentStyles from "@/Components/PrintDocumentStyles";
import FitToWidth, { suspendFit } from "@/Components/FitToWidth";
import DocumentActionBar from "@/Components/DocumentActionBar";
import CertificateSheet, { isZoningCertification } from "@/Components/CertificateSheet";

/**
 * The applicant's copy of their Zoning Certification.
 *
 * The very sheet the office issued (CertificateSheet), signed by the Zoning
 * Administrator with her e-signature and dated as the office issued it, so the
 * download is the document rather than a redrawing of it.
 */
export default function PrintCertificate({ application, payment, zoningAdministrator, issuedOn }) {
    const sheetRef = useRef(null);
    const isZC = isZoningCertification(application.project_type);
    const title = isZC ? "Zoning Certification" : "Certification";

    const handleDownload = () => {
        const element = sheetRef.current;
        if (!element) return;

        const resumeFit = suspendFit(element);
        const restore = () => { element.style.minHeight = ""; resumeFit(); };
        element.style.minHeight = "0";

        html2pdf()
            .set({
                margin: 0,
                filename: `${isZC ? "ZoningCertification" : "Certification"}_${application.application_number || application.id}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: "avoid-all" },
            })
            .from(element)
            .save()
            .then(restore, restore);
    };

    return (
        <div className="min-h-screen bg-[#f5f7ff] px-4 py-6 sm:px-6">
            <Head title={`${title} - ${application.application_number || ""}`} />
            <PrintDocumentStyles />

            <div className="mx-auto max-w-5xl">
                <DocumentActionBar
                    eyebrow="Your document"
                    title={title}
                    subtitle={`Application No: ${application.application_number || "—"}`}
                    printLabel="Print Certificate"
                    onPrint={() => window.print()}
                    onDownload={handleDownload}
                />

                <div className="certificate-print-area print-document-area">
                    <FitToWidth>
                        <CertificateSheet
                            ref={sheetRef}
                            className="print-document"
                            application={application}
                            payment={payment}
                            zoningAdministrator={zoningAdministrator}
                            issuedOn={issuedOn || undefined}
                        />
                    </FitToWidth>
                </div>
            </div>
        </div>
    );
}
