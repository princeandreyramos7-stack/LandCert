import{r as b,m as g,j as e,H as h}from"./app-C8pzHYm5.js";import{A as P}from"./AdminLayout-CeBPdntY.js";import{S as O}from"./SuperAdminLayout-DADh302G.js";import{A as j}from"./ApplicantLayout-Cms-uoXl.js";import{D as x,h as A}from"./DocumentActionBar-BYsgPhw2.js";import{O as L}from"./OrderOfPaymentSheet-BAfBWL9v.js";import{F as _,s as w}from"./FitToWidth-D2ktj6Cb.js";import"./admin-sidebar-xMf7Ctcv.js";import"./breadcrumb-ZbxXQDVF.js";import"./input-DUvp6fWh.js";import"./SealWatermark-DB5635Vv.js";import"./layout-dashboard-lY_JuNGm.js";import"./file-text-BkcYMhSn.js";import"./users-CaTY9U69.js";import"./award-BROG9jZn.js";import"./activity-FQEu5FJk.js";import"./NotificationBell-Cr2SAu1w.js";import"./toaster-BlQzPuOQ.js";import"./super-admin-sidebar-wiVv8Jz2.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-DGn2Q6BS.js";import"./refresh-cw-BoTbN63E.js";import"./circle-check-Dg0aMANa.js";import"./circle-x-Zsc7WEPo.js";import"./download-D-ja5Mop.js";import"./trash-2-kXVqlTxW.js";import"./printer-Bb2MsL3x.js";import"./signerName-CaOQasYm.js";function re({application:r,payment:m,reviewer:s,zoningAdministrator:p,paymentAmount:d=null}){const o=b.useRef(null),t=g().props.auth?.user?.user_type,l=t==="super_admin"?O:t==="admin"?P:j,u=t==="super_admin"?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Order of Payment"}]:t==="admin"?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Order of Payment"}]:[{label:"My Applications",href:"/my-applications"},{label:"Order of Payment"}],f=()=>{const n=o.current.innerHTML,a=document.body.innerHTML;document.body.innerHTML=n,window.print(),document.body.innerHTML=a,window.location.reload()},c=()=>{const n=o.current,a=`OrderOfPayment_${r.application_number||"Payment"}.pdf`,y={margin:[20,10,10,10],filename:a,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1,backgroundColor:"#ffffff",removeContainer:!0},jsPDF:{unit:"mm",format:"letter",orientation:"portrait",compress:!0},pagebreak:{mode:"avoid-all"}},i=w(n);A().set(y).from(n).save().then(i,i)};return e.jsxs(l,{title:"Order of Payment",breadcrumbs:u,children:[e.jsx(h,{title:`Order of Payment - ${r.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
            `}}),e.jsx(x,{eyebrow:"Payment",title:"Order of Payment",subtitle:`Application No: ${r.application_number}`,printLabel:"Print",onPrint:f,onDownload:c}),e.jsx(_,{children:e.jsx(L,{ref:o,application:r,payment:m,paymentAmount:d,reviewer:s,zoningAdministrator:p})})]})}export{re as default};
