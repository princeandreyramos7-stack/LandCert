import{j as t}from"./app-C6IK9EMy.js";function i(){return t.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
            `}})}export{i as P};
