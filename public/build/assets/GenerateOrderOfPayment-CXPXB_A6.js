import{r as b,m as h,j as e,H as g}from"./app-DEKcKxDl.js";import{A as P}from"./AdminLayout-CN15n_Ul.js";import{S as O}from"./SuperAdminLayout-B6N7pIat.js";import{A as j}from"./ApplicantLayout-COlecro6.js";import{h as x}from"./html2pdf-0ol_Cq3d.js";import{O as A}from"./OrderOfPaymentSheet-DFysft53.js";import{D as L}from"./DocumentActionBar-CvEyFFXA.js";import{F as _,s as w}from"./FitToWidth-Fh7kcFeV.js";import"./admin-sidebar-DqtwREwh.js";import"./breadcrumb-DA-_D_Af.js";import"./input-CZU_mRAT.js";import"./SealWatermark-CkufvNu-.js";import"./layout-dashboard-pMBitixo.js";import"./file-text-DBaLC4ij.js";import"./users-vJMOIuMv.js";import"./award-CxGY5SqV.js";import"./activity-DbI6yQzr.js";import"./HeaderSlot-DB2f7iGe.js";import"./toaster-BTG6rvN4.js";import"./NotificationBell-BPLRyXrK.js";import"./bell-DslJ0zBj.js";import"./super-admin-sidebar-B5yXo_c3.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-BBSoo8b_.js";import"./refresh-cw-BiPGihE4.js";import"./circle-check-7XUnS30H.js";import"./circle-x-BwGe-ulU.js";import"./download-C4Dz1k1t.js";import"./trash-2-Cx8bEzjY.js";import"./app-sidebar-DXYj5IGA.js";import"./signerName-BRhPV7Ta.js";import"./ESignatureImage-BDY_RQKp.js";import"./printer-B-eZNlm9.js";function ie({application:t,payment:m,reviewer:s,zoningAdministrator:p,paymentAmount:d=null}){const n=b.useRef(null),r=h().props.auth?.user?.user_type,l=r==="super_admin"?O:r==="admin"?P:j,u=r==="super_admin"?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Order of Payment"}]:r==="admin"?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Order of Payment"}]:[{label:"My Applications",href:"/my-applications"},{label:"Order of Payment"}],f=()=>{const o=n.current.innerHTML,a=document.body.innerHTML;document.body.innerHTML=o,window.print(),document.body.innerHTML=a,window.location.reload()},c=()=>{const o=n.current,a=`OrderOfPayment_${t.application_number||"Payment"}.pdf`,y={margin:[15,10,10,10],filename:a,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1},jsPDF:{unit:"mm",format:"letter",orientation:"portrait",compress:!0},pagebreak:{mode:"avoid-all"}},i=w(o);x().set(y).from(o).save().then(i,i)};return e.jsxs(l,{title:"Order of Payment",breadcrumbs:u,children:[e.jsx(g,{title:`Order of Payment - ${t.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
            `}}),e.jsx(L,{eyebrow:"Payment",title:"Order of Payment",subtitle:`Application No: ${t.application_number}`,printLabel:"Print",onPrint:f,onDownload:c}),e.jsx(_,{children:e.jsx(A,{ref:n,application:t,payment:m,paymentAmount:d,reviewer:s,zoningAdministrator:p})})]})}export{ie as default};
