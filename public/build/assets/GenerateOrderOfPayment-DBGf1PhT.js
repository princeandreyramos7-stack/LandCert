import{r as b,m as g,j as e,H as h}from"./app-BdSpxtFv.js";import{A as P}from"./AdminLayout-D9wVobT7.js";import{S as O}from"./SuperAdminLayout-DNX_pWf0.js";import{A as j}from"./ApplicantLayout-dIQf6_Uf.js";import{D as x,h as A}from"./DocumentActionBar-CLh-_s5P.js";import{O as L}from"./OrderOfPaymentSheet-BNzNNMJu.js";import{F as _,s as w}from"./FitToWidth-CPf5gW2r.js";import"./admin-sidebar-TSNO5xnq.js";import"./breadcrumb-Egk8hiVb.js";import"./input-l-P_HHoO.js";import"./SealWatermark-jGQNY20b.js";import"./layout-dashboard-C3rYeKJ1.js";import"./file-text-CQUBDiDV.js";import"./users-Bx1w9Ixp.js";import"./award-ilM6j5Bb.js";import"./activity-CGt4q-RQ.js";import"./HeaderSlot-YArjhWE0.js";import"./toaster--1DXQi91.js";import"./NotificationBell-BnKO6I17.js";import"./bell-ByHkvp1-.js";import"./super-admin-sidebar-DRmBq0aq.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-2t-z6L4U.js";import"./refresh-cw-DadW2sqV.js";import"./circle-check-DRXBwkA9.js";import"./circle-x-CNzu0Np1.js";import"./download-TJA6-_n6.js";import"./trash-2-C-mzsOyJ.js";import"./app-sidebar-DK1V8OMj.js";import"./printer-Dz52FyMl.js";import"./signerName-B_Y8NXuk.js";function ne({application:r,payment:m,reviewer:s,zoningAdministrator:p,paymentAmount:d=null}){const n=b.useRef(null),t=g().props.auth?.user?.user_type,l=t==="super_admin"?O:t==="admin"?P:j,u=t==="super_admin"?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Order of Payment"}]:t==="admin"?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Order of Payment"}]:[{label:"My Applications",href:"/my-applications"},{label:"Order of Payment"}],f=()=>{const o=n.current.innerHTML,a=document.body.innerHTML;document.body.innerHTML=o,window.print(),document.body.innerHTML=a,window.location.reload()},c=()=>{const o=n.current,a=`OrderOfPayment_${r.application_number||"Payment"}.pdf`,y={margin:[20,10,10,10],filename:a,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1,backgroundColor:"#ffffff",removeContainer:!0},jsPDF:{unit:"mm",format:"letter",orientation:"portrait",compress:!0},pagebreak:{mode:"avoid-all"}},i=w(o);A().set(y).from(o).save().then(i,i)};return e.jsxs(l,{title:"Order of Payment",breadcrumbs:u,children:[e.jsx(h,{title:`Order of Payment - ${r.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
            `}}),e.jsx(x,{eyebrow:"Payment",title:"Order of Payment",subtitle:`Application No: ${r.application_number}`,printLabel:"Print",onPrint:f,onDownload:c}),e.jsx(_,{children:e.jsx(L,{ref:n,application:r,payment:m,paymentAmount:d,reviewer:s,zoningAdministrator:p})})]})}export{ne as default};
