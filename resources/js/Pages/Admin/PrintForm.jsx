import React from "react";
import { Head } from "@inertiajs/react";
import html2pdf from 'html2pdf.js';
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import DocumentActionBar from "@/Components/DocumentActionBar";
import FitToWidth from "@/Components/FitToWidth";
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

/* ── print ── */
@media print {
    html, body { 
        background: #fff !important; 
        margin: 0 !important; 
        padding: 0 !important; 
        overflow: visible !important;
    }
    
    /* Hide sidebar, header, and controls when printing */
    aside,
    header,
    .no-print,
    [data-sidebar],
    [data-sidebar-provider],
    button {
        display: none !important;
    }
    
    /* Make the main content area full width */
    main,
    [data-sidebar-inset] {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
    }
    
    /* Show form pages */
    .pf-page {
        display: block !important;
        visibility: visible !important;
        margin: 0 !important;
        border: none !important;
        padding: 7mm 8mm !important;
        width: 100% !important;
        min-height: auto !important;
        box-shadow: none !important;
        position: static !important;
        background: white !important;
        page-break-inside: avoid !important;
    }
    
    .pf-page:first-child {
        page-break-after: always !important;
    }
    
    .pf-page:last-child {
        page-break-after: avoid !important;
    }
    
    /* Make sure form content is visible */
    .pf-page * {
        visibility: visible !important;
    }
    
    /* Force background colors to print - especially yellow */
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }
    
    /* Ensure yellow background stays yellow */
    [style*="background"][style*="yellow"],
    [style*="backgroundColor"][style*="FFFF00"],
    [style*="backgroundColor"][style*="yellow"] {
        background-color: #FFFF00 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    @page { 
        size: A4 portrait; 
        margin: 0;
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
            <FitToWidth>
                <ApplicationFormSheet application={a} />
            </FitToWidth>
        </Layout>
    );
}
