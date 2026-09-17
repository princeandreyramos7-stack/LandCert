import React from "react";
import { Head } from "@inertiajs/react";
import html2pdf from 'html2pdf.js';
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import DocumentActionBar from "@/Components/DocumentActionBar";
import FitToWidth from "@/Components/FitToWidth";
import PrintDocumentStyles from "@/Components/PrintDocumentStyles";
import ApplicationFormSheet, { FORM_CONTROL_NO } from "@/Components/ApplicationFormSheet";

/* ─── helpers ─────────────────────────────────────── */
const v = (x) =>
    x !== null && x !== undefined && String(x).trim() !== ""
        ? String(x).trim()
        : "";

/* ════════════════════════════════════════════════════
   PAGE CSS — the sheets carry their own styles in
   ApplicationFormSheet; this is the page around them
   and what happens to it when printing.
   ════════════════════════════════════════════════════ */
const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { 
    background: transparent; 
    font-family: Arial, Helvetica, sans-serif;
}

/* ── print ──
   The chrome is taken out of the layout by PrintDocumentStyles (the same
   rules the clearance and certification print with). The page's own rules
   used to hide the sidebar and header but leave their boxes in the layout:
   the sheets were laid out in the narrow column beside the sidebar's gap,
   the printer shrank the too-wide page to fit, and what was left over ran
   onto a third, blank sheet. */
@media print {
    .pf-page {
        display: block !important;
        width: 100% !important;
        min-height: 0 !important;
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
        padding: 7mm 8mm !important;
        background: #fff !important;
        break-inside: avoid;
        page-break-inside: avoid;
    }

    /* The form, then the requirements checklist: two sheets. */
    .pf-page + .pf-page {
        break-before: page;
        page-break-before: always;
    }

    /* The yellow highlights print as shown. */
    .pf-page,
    .pf-page * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
`;

/* ════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════ */
export default function PrintForm({ application: a, auth }) {
    const appNo = v(a.application_number) || `TPZ-${a.id}`;

    // Fixed control number for all applications
    const ctrlNo = FORM_CONTROL_NO;

    // This page is rendered for applicants, admins and super admins alike, so the
    // chrome around it has to follow the viewer — an applicant must never see the
    // zoning-officer sidebar or its admin-only nav.
    const userRole = auth?.user ? (auth.user.user_type || auth.user.role) : null;
    const isSuperAdmin = userRole === 'super_admin';
    const isAdmin = userRole === 'admin';

    const Layout = isSuperAdmin ? SuperAdminLayout : isAdmin ? AdminLayout : ApplicantLayout;

    const layoutBreadcrumbs = isSuperAdmin
        ? [
            { label: "Dashboard", href: "/super-admin/dashboard" },
            { label: "Applications", href: "/super-admin/requests" },
            { label: "Print Form" },
        ]
        : isAdmin
        ? [
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Applications", href: "/admin/requests" },
            { label: "Print Form" },
        ]
        : [];

    // Determine back route based on user role
    const getBackRoute = () => {
        if (!userRole) return route('login');

        if (isSuperAdmin) {
            return route('super-admin.requests');
        } else if (isAdmin) {
            return route('admin.requests');
        } else {
            // applicant
            return route('my-applications');
        }
    };

    /* Save form as PDF function */
    const handleSaveForm = () => {
        const filename = `CPDO_Form_${ctrlNo}_${v(a.applicant_name).replace(/\s+/g, '_')}.pdf`;
        
        // Create wrapper div for all content
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'background: white; padding: 0; margin: 0;';
        
        // Get all form pages
        const pages = document.querySelectorAll('.pf-page');
        
        // Clone and append each page. The clones are never clamped to a full
        // 297mm sheet: at exactly the page height the rounding spills a sliver
        // onto an extra blank sheet. Each clone is as tall as its content and
        // the explicit break after the first one starts the second — two pages,
        // the form and the requirements checklist.
        pages.forEach((page, index) => {
            const clone = page.cloneNode(true);
            clone.classList.remove('no-border');
            clone.style.cssText = `
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${index === 0 ? 'always' : 'auto'};
                page-break-inside: avoid;
            `;
            wrapper.appendChild(clone);
        });
        
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                logging: false,
                windowWidth: 794, // A4 width in pixels at 96dpi
                windowHeight: 1123 // A4 height in pixels at 96dpi
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            },
            pagebreak: { mode: 'css' }
        };
        
        // Generate PDF
        html2pdf().set(opt).from(wrapper).save();
    };


    return (
        <Layout
            title="Print Application Form"
            breadcrumbs={layoutBreadcrumbs}
        >
            <Head title={`Print — ${ctrlNo}`} />
            <style dangerouslySetInnerHTML={{ __html: CSS }} />
            <PrintDocumentStyles />

            {/* ── controls ── */}
            <DocumentActionBar
                eyebrow="Form"
                title="Application Form"
                subtitle={`Application No: ${appNo}`}
                printLabel="Print Form"
                onPrint={() => window.print()}
                onDownload={handleSaveForm}
            />

            {/* ═══════════════════════════════════════════
                OFFICIAL FORM — drawn by ApplicationFormSheet,
                which the applicant report shares.
               ═══════════════════════════════════════════ */}
            <div className="form-print-area print-document-area">
                <FitToWidth>
                    <ApplicationFormSheet application={a} />
                </FitToWidth>
            </div>
        </Layout>
    );
}
