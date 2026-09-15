import{r as b,m as g,j as e,H as h}from"./app-iwCOqb80.js";import{A as P}from"./AdminLayout-tl4Ls3ny.js";import{S as O}from"./SuperAdminLayout-CryCj1D1.js";import{A as j}from"./ApplicantLayout-WHgs1IfB.js";import{h as x}from"./html2pdf-0hfLfF9t.js";import{O as A}from"./OrderOfPaymentSheet-6-3NPJmH.js";import{D as L}from"./DocumentActionBar-B86FvPbo.js";import{F as _,s as w}from"./FitToWidth-uL2GBfoK.js";import"./admin-sidebar-DIbbfW2d.js";import"./breadcrumb-Z6Dw_vWh.js";import"./input-icDK0CAm.js";import"./SealWatermark-DjHakpFG.js";import"./layout-dashboard-BMQoRo_N.js";import"./file-text-CS8y3ceI.js";import"./users-9R4VbOmO.js";import"./award-D2AysH13.js";import"./activity-DRJPFLYG.js";import"./HeaderSlot-ChywkxT4.js";import"./toaster-BBdmg7iX.js";import"./NotificationBell-DOJbANfG.js";import"./bell-CXtHw0mC.js";import"./super-admin-sidebar-BtZVHePI.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-DKsmPWyv.js";import"./refresh-cw-B1ssJ82s.js";import"./circle-check-BLdUh4AQ.js";import"./circle-x-IjjKnO4s.js";import"./download-CZJHJjvb.js";import"./trash-2-BzIftUuj.js";import"./app-sidebar-BGH5yj58.js";import"./signerName-BRhPV7Ta.js";import"./ESignatureImage-DAsNkdyv.js";import"./printer-cL8b6P0G.js";function ie({application:r,payment:m,reviewer:s,zoningAdministrator:p,paymentAmount:d=null}){const n=b.useRef(null),t=g().props.auth?.user?.user_type,l=t==="super_admin"?O:t==="admin"?P:j,u=t==="super_admin"?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Order of Payment"}]:t==="admin"?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Order of Payment"}]:[{label:"My Applications",href:"/my-applications"},{label:"Order of Payment"}],f=()=>{const o=n.current.innerHTML,a=document.body.innerHTML;document.body.innerHTML=o,window.print(),document.body.innerHTML=a,window.location.reload()},c=()=>{const o=n.current,a=`OrderOfPayment_${r.application_number||"Payment"}.pdf`,y={margin:[20,10,10,10],filename:a,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1,backgroundColor:"#ffffff",removeContainer:!0},jsPDF:{unit:"mm",format:"letter",orientation:"portrait",compress:!0},pagebreak:{mode:"avoid-all"}},i=w(o);x().set(y).from(o).save().then(i,i)};return e.jsxs(l,{title:"Order of Payment",breadcrumbs:u,children:[e.jsx(h,{title:`Order of Payment - ${r.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
                /* Hide browser print headers/footers */
                @page {
                    size: letter;
                    margin: 0.5in 0.5in 0.5in 0.5in;
                }

                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    
                    /* Ensure content fits on one page */
                    .payment-page {
                        page-break-inside: avoid;
                        page-break-after: avoid;
                    }
                }

                body {
                    margin: 0;
                    padding: 0;
                }
            `}}),e.jsx(L,{eyebrow:"Payment",title:"Order of Payment",subtitle:`Application No: ${r.application_number}`,printLabel:"Print",onPrint:f,onDownload:c}),e.jsx(_,{children:e.jsx(A,{ref:n,application:r,payment:m,paymentAmount:d,reviewer:s,zoningAdministrator:p})})]})}export{ie as default};
