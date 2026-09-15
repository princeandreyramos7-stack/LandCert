import{r as b,m as g,j as e,H as h}from"./app-BWrngswQ.js";import{A as P}from"./AdminLayout-CfUpYAS3.js";import{S as O}from"./SuperAdminLayout-CeRZ_YAT.js";import{A as j}from"./ApplicantLayout-fDS8RrKm.js";import{h as x}from"./html2pdf-ByGQBP6A.js";import{O as A}from"./OrderOfPaymentSheet-BVAAjnhq.js";import{D as L}from"./DocumentActionBar-aH9QEsaO.js";import{F as _,s as w}from"./FitToWidth-BY_MstJV.js";import"./admin-sidebar-k6A1DasI.js";import"./breadcrumb-DY20Bvm7.js";import"./input-DHB3JwyZ.js";import"./SealWatermark-CUFp29aL.js";import"./layout-dashboard-pP9rrCgu.js";import"./file-text-444Vc9RE.js";import"./users-BYtGQe6A.js";import"./award-_bciKY04.js";import"./activity-Cor_2wEr.js";import"./HeaderSlot-BZR1DHse.js";import"./toaster-BG0c-Gas.js";import"./NotificationBell-55UdyNsi.js";import"./bell-CU-qQHwr.js";import"./super-admin-sidebar-CgaAgPs1.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-D07tIN6q.js";import"./refresh-cw-CubFrG_U.js";import"./circle-check-CTiW2klO.js";import"./circle-x-DJLFjf9P.js";import"./download-CVcg6qtd.js";import"./trash-2-BZz7DgLd.js";import"./app-sidebar-XqUuQ9UX.js";import"./signerName-BRhPV7Ta.js";import"./ESignatureImage-BUXBr2TM.js";import"./printer-BCpm1Hyu.js";function ie({application:r,payment:m,reviewer:s,zoningAdministrator:p,paymentAmount:d=null}){const n=b.useRef(null),t=g().props.auth?.user?.user_type,l=t==="super_admin"?O:t==="admin"?P:j,u=t==="super_admin"?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Order of Payment"}]:t==="admin"?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Order of Payment"}]:[{label:"My Applications",href:"/my-applications"},{label:"Order of Payment"}],f=()=>{const o=n.current.innerHTML,a=document.body.innerHTML;document.body.innerHTML=o,window.print(),document.body.innerHTML=a,window.location.reload()},c=()=>{const o=n.current,a=`OrderOfPayment_${r.application_number||"Payment"}.pdf`,y={margin:[20,10,10,10],filename:a,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1,backgroundColor:"#ffffff",removeContainer:!0},jsPDF:{unit:"mm",format:"letter",orientation:"portrait",compress:!0},pagebreak:{mode:"avoid-all"}},i=w(o);x().set(y).from(o).save().then(i,i)};return e.jsxs(l,{title:"Order of Payment",breadcrumbs:u,children:[e.jsx(h,{title:`Order of Payment - ${r.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
