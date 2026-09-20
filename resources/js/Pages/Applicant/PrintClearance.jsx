import React, { useRef } from "react";
import { Head, router } from "@inertiajs/react";
import html2pdf from "html2pdf.js";
import PrintDocumentStyles from "@/Components/PrintDocumentStyles";
import FitToWidth, { suspendFit } from "@/Components/FitToWidth";
import DocumentActionBar from "@/Components/DocumentActionBar";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import SealWatermark from "@/Components/SealWatermark";
import ClearanceSheet, { isTemporaryUsePermit } from "@/Components/ClearanceSheet";
import { Button } from "@/Components/ui/button";
import { ArrowLeft } from "lucide-react";

/**
 * The applicant's copy of their Zoning Clearance or Temporary Use Permit.
 *
 * The very sheet the office issued (ClearanceSheet), with the same signers -
 * the reviewing officer and the Zoning Administrator, e-signatures included -
 * so what the applicant downloads is the document, not a redrawing of it.
 * Standalone: no sidebar, just the actions and the sheet.
 */
export default function PrintClearance({ application, payment, reviewer, zoningAdministrator }) {
    const sheetRef = useRef(null);
    const isTup = isTemporaryUsePermit(application.project_type);
    const title = isTup ? "Temporary Use Permit" : "Zoning Clearance";

    const handleDownload = () => {
        const element = sheetRef.current;
        if (!element) return;

        // Same capture as the office's page: release the A4 box height so the
        // page does not spill onto a blank second sheet, and suspend the
        // on-screen zoom so it is not baked into the PDF.
        const resumeFit = suspendFit(element);
        const restore = () => { element.style.minHeight = ""; resumeFit(); };
        element.style.minHeight = "0";

        html2pdf()
            .set({
                margin: 0,
                filename: `${isTup ? "Permit" : "Clearance"}_${application.application_number || application.id}.pdf`,
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
                        printLabel={isTup ? "Print Permit" : "Print Clearance"}
                        onPrint={() => window.print()}
                        onDownload={handleDownload}
                    />

                    <div className="clearance-print-area print-document-area">
                        <FitToWidth>
                            <ClearanceSheet
                                ref={sheetRef}
                                className="print-document"
                                application={application}
                                payment={payment}
                                reviewer={reviewer}
                                zoningAdministrator={zoningAdministrator}
                            />
                        </FitToWidth>
                    </div>
                </div>
            </ApplicantLayout>
        </>
    );
}
