import{r as b,m as g,j as e,H as h}from"./app-CfgFndxA.js";import{A as P}from"./AdminLayout-Dlxrky2j.js";import{S as O}from"./SuperAdminLayout-BakEUj8U.js";import{A as j}from"./ApplicantLayout-SSGqkyO8.js";import{h as x}from"./html2pdf-u53rgdL4.js";import{O as A}from"./OrderOfPaymentSheet-DLxNvBDN.js";import{D as L}from"./DocumentActionBar-DO3sMOfK.js";import{F as _,s as w}from"./FitToWidth-dOtxqEjG.js";import"./admin-sidebar-Cfjc7tf5.js";import"./breadcrumb-BQd6mEMm.js";import"./input-B-fya-ir.js";import"./SealWatermark-iCyNoMHv.js";import"./layout-dashboard-BL3gRYQB.js";import"./file-text-Dz_48Sok.js";import"./users-BOY2g4lU.js";import"./award-C-ZoqX82.js";import"./activity-DOrvCCVN.js";import"./HeaderSlot-BtNuICYC.js";import"./toaster-iipLjWgZ.js";import"./NotificationBell-BuKZI7QB.js";import"./bell-DIqpUaqn.js";import"./super-admin-sidebar-CRlN8VoK.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-D7STgcB4.js";import"./refresh-cw-szjkm36N.js";import"./circle-check-DfyHTowp.js";import"./circle-x-Dv3IHtyT.js";import"./download-Bx4SZrgR.js";import"./trash-2-DwagwjLZ.js";import"./app-sidebar-C-xVweLF.js";import"./signerName-BRhPV7Ta.js";import"./ESignatureImage-COET-U6d.js";import"./printer-DVCOlH_a.js";function ie({application:r,payment:m,reviewer:s,zoningAdministrator:p,paymentAmount:d=null}){const n=b.useRef(null),t=g().props.auth?.user?.user_type,l=t==="super_admin"?O:t==="admin"?P:j,u=t==="super_admin"?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Order of Payment"}]:t==="admin"?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Order of Payment"}]:[{label:"My Applications",href:"/my-applications"},{label:"Order of Payment"}],f=()=>{const o=n.current.innerHTML,a=document.body.innerHTML;document.body.innerHTML=o,window.print(),document.body.innerHTML=a,window.location.reload()},c=()=>{const o=n.current,a=`OrderOfPayment_${r.application_number||"Payment"}.pdf`,y={margin:[20,10,10,10],filename:a,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1,backgroundColor:"#ffffff",removeContainer:!0},jsPDF:{unit:"mm",format:"letter",orientation:"portrait",compress:!0},pagebreak:{mode:"avoid-all"}},i=w(o);x().set(y).from(o).save().then(i,i)};return e.jsxs(l,{title:"Order of Payment",breadcrumbs:u,children:[e.jsx(h,{title:`Order of Payment - ${r.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
