import{r as b,m as g,j as e,H as h}from"./app-BMImq7iP.js";import{A as P}from"./AdminLayout-zs8Mk1Rj.js";import{S as O}from"./SuperAdminLayout-CbcwEmUb.js";import{A as j}from"./ApplicantLayout-C7ifC417.js";import{h as x}from"./html2pdf-DSxrX2fy.js";import{O as A}from"./OrderOfPaymentSheet-DqqqwECB.js";import{D as L}from"./DocumentActionBar-Bg6VsUEd.js";import{F as _,s as w}from"./FitToWidth-BUf1TzTa.js";import"./admin-sidebar-Cwqxqc2u.js";import"./breadcrumb-BBy4JLru.js";import"./input-Bce-67PN.js";import"./SealWatermark-dQsad13d.js";import"./layout-dashboard-DDZN-DAQ.js";import"./file-text-BRGQA73M.js";import"./users-B2dQC4oX.js";import"./award-3S14DFJl.js";import"./activity-CDuASlwo.js";import"./HeaderSlot-zB9Ht1Bh.js";import"./toaster-jh2HYmbI.js";import"./NotificationBell-mi5hQnwr.js";import"./bell-DD5GsFg0.js";import"./super-admin-sidebar-BZ6uTHR9.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-BPzSEZr4.js";import"./refresh-cw-IT0HCkiG.js";import"./circle-check-BCokAz3Z.js";import"./circle-x-jFHj4u_l.js";import"./download-LUayz9ug.js";import"./trash-2-BEFZejHq.js";import"./app-sidebar-BTdY4cV7.js";import"./signerName-BRhPV7Ta.js";import"./ESignatureImage-BcU1nv21.js";import"./printer-ea9m-Ovh.js";function ie({application:r,payment:m,reviewer:s,zoningAdministrator:p,paymentAmount:d=null}){const n=b.useRef(null),t=g().props.auth?.user?.user_type,l=t==="super_admin"?O:t==="admin"?P:j,u=t==="super_admin"?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Order of Payment"}]:t==="admin"?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Order of Payment"}]:[{label:"My Applications",href:"/my-applications"},{label:"Order of Payment"}],f=()=>{const o=n.current.innerHTML,a=document.body.innerHTML;document.body.innerHTML=o,window.print(),document.body.innerHTML=a,window.location.reload()},c=()=>{const o=n.current,a=`OrderOfPayment_${r.application_number||"Payment"}.pdf`,y={margin:[20,10,10,10],filename:a,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1,backgroundColor:"#ffffff",removeContainer:!0},jsPDF:{unit:"mm",format:"letter",orientation:"portrait",compress:!0},pagebreak:{mode:"avoid-all"}},i=w(o);x().set(y).from(o).save().then(i,i)};return e.jsxs(l,{title:"Order of Payment",breadcrumbs:u,children:[e.jsx(h,{title:`Order of Payment - ${r.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
