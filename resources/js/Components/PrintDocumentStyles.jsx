import React from "react";

/**
 * Print rules shared by the official documents (Zoning Clearance, Zoning
 * Certification).
 *
 * Two things make a one-page document come out of the printer as two sheets:
 *
 *  1. Hiding the admin chrome with `visibility: hidden` leaves its boxes in the
 *     layout, and the browser counts sheets from the full rendered height — so
 *     the chrome silently pushes a blank second sheet. Here the chrome is taken
 *     out of the layout with `display: none`, keeping only the ancestors of the
 *     document (matched with `:has()`) so the document itself survives.
 *  2. The on-screen sheet is a full A4 box (210 x 297mm with its own padding).
 *     Printed inside a page margin it no longer fits, so its fixed height is
 *     released and `@page` supplies the margin instead.
 *
 * Mark the wrapper `print-document-area` and the sheet itself `print-document`.
 * Anything marked `no-print` never reaches the printer.
 */
export default function PrintDocumentStyles() {
    return (
        <style
            dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    /* Everything that is neither the document nor one of its
                       ancestors leaves the layout entirely. */
                    body *:not(:has(.print-document-area)):not(.print-document-area):not(.print-document-area *) {
                        display: none !important;
                    }

                    /* The ancestors collapse to bare blocks so they add no
                       height, width or background of their own. */
                    body :has(.print-document-area) {
                        display: block !important;
                        position: static !important;
                        width: auto !important;
                        min-width: 0 !important;
                        max-width: none !important;
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: 0 !important;
                        background: none !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                    }

                    /* Fallback for engines without :has() — the chrome is at
                       least made invisible. */
                    body * { visibility: hidden; }
                    .print-document-area,
                    .print-document-area * { visibility: visible; }

                    .no-print,
                    .no-print * { display: none !important; }

                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        min-height: 0 !important;
                        background: #fff !important;
                    }

                    /* One sheet: the document keeps its own inner margins and
                       is only ever as tall as its content. */
                    .print-document {
                        width: 100% !important;
                        max-width: none !important;
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    /* Letterhead gradients, the yellow title highlights and the
                       e-signatures must print as shown. */
                    .print-document,
                    .print-document * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    @page { size: A4; margin: 0; }
                }
            `,
            }}
        />
    );
}
