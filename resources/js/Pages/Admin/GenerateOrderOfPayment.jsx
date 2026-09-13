import React, { useRef } from "react";
import { Head, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import SuperAdminLayout from "@/Layouts/SuperAdminLayout";
import ApplicantLayout from "@/Layouts/ApplicantLayout";
import html2pdf from 'html2pdf.js';
import OrderOfPaymentSheet from "@/Components/OrderOfPaymentSheet";
import DocumentActionBar from "@/Components/DocumentActionBar";
import FitToWidth, { suspendFit } from "@/Components/FitToWidth";

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

    return (
        <Layout
            title="Order of Payment"
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Order of Payment - ${application.application_number}`} />

            {/* Page rules only — the slip itself, and its styles, live in
                OrderOfPaymentSheet so the applicant report can show the same
                document. */}
            <style dangerouslySetInnerHTML={{ __html: `
                /* Hide browser print headers/footers */
                @page {
                    size: A4;
                    margin: 0;
                }

                body {
                    margin: 0;
                    padding: 0;
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
                <OrderOfPaymentSheet
                    ref={paymentRef}
                    application={application}
                    payment={payment}
                    paymentAmount={paymentAmount}
                    reviewer={reviewer}
                    zoningAdministrator={zoningAdministrator}
                />
            </FitToWidth>
        </Layout>
    );
}
