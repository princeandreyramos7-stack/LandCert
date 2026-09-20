import React, { useRef } from "react";
import { Head, router } from "@inertiajs/react";
import html2pdf from "html2pdf.js";
import PrintDocumentStyles from "@/Components/PrintDocumentStyles";
import FitToWidth, { suspendFit } from "@/Components/FitToWidth";
import DocumentActionBar from "@/Components/DocumentActionBar";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import SealWatermark from "@/Components/SealWatermark";
import CertificateSheet, { isZoningCertification } from "@/Components/CertificateSheet";
import { Button } from "@/Components/ui/button";
import { ArrowLeft } from "lucide-react";

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
        <>
            <Head title={`${title} - ${application.application_number || ""}`} />
            <ApplicantLayout title={title}>
                <PrintDocumentStyles />

                <div className="relative isolate mx-auto max-w-5xl">
                    <SealWatermark follow />
                    
                    {/* Back Button */}
                    <div className="mb-4 print:hidden">
                        <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-gray-100"
                            onClick={() => router.visit(route('my-applications.show', application.id))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Application Details
                        </Button>
                    </div>
                    
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
            </ApplicantLayout>
        </>
    );
}
