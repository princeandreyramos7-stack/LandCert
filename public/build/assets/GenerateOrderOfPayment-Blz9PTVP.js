import{r as b,m as g,j as e,H as h}from"./app-Dke9ALPw.js";import{A as P}from"./AdminLayout-B3x4vr0I.js";import{S as O}from"./SuperAdminLayout-DpSdKV8P.js";import{A as j}from"./ApplicantLayout-CyBq4rLT.js";import{h as x}from"./html2pdf-NrOlkPnQ.js";import{O as A}from"./OrderOfPaymentSheet-CQ7gTF27.js";import{D as L}from"./DocumentActionBar-6HF2cc0o.js";import{F as _,s as w}from"./FitToWidth-CtdQTuuz.js";import"./admin-sidebar-CTvncG71.js";import"./breadcrumb-DCqu1yF7.js";import"./input-CpfaNO2Q.js";import"./SealWatermark-TvPrmmki.js";import"./layout-dashboard-Mjhf5F2P.js";import"./file-text-DIS1isiB.js";import"./users-BvVUhfww.js";import"./award-CNCHN5Uq.js";import"./activity-Bupc7Cjy.js";import"./HeaderSlot-C4FZjbMe.js";import"./toaster-CFS22IDC.js";import"./NotificationBell-Ctik3ORO.js";import"./bell-X6mwgL8Y.js";import"./super-admin-sidebar-DjgA8OKy.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-T_Il07x0.js";import"./refresh-cw-DLpGJGYQ.js";import"./circle-check-Crapsut3.js";import"./circle-x-mEVhBYfH.js";import"./download-CxRlCdf2.js";import"./trash-2-DnwT5qL2.js";import"./app-sidebar-967VPUFP.js";import"./signerName-BRhPV7Ta.js";import"./ESignatureImage-BhSYXaTD.js";import"./printer-XS06e_1Y.js";function ie({application:r,payment:m,reviewer:s,zoningAdministrator:p,paymentAmount:d=null}){const n=b.useRef(null),t=g().props.auth?.user?.user_type,l=t==="super_admin"?O:t==="admin"?P:j,u=t==="super_admin"?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Order of Payment"}]:t==="admin"?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Order of Payment"}]:[{label:"My Applications",href:"/my-applications"},{label:"Order of Payment"}],f=()=>{const o=n.current.innerHTML,a=document.body.innerHTML;document.body.innerHTML=o,window.print(),document.body.innerHTML=a,window.location.reload()},c=()=>{const o=n.current,a=`OrderOfPayment_${r.application_number||"Payment"}.pdf`,y={margin:[20,10,10,10],filename:a,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1,backgroundColor:"#ffffff",removeContainer:!0},jsPDF:{unit:"mm",format:"letter",orientation:"portrait",compress:!0},pagebreak:{mode:"avoid-all"}},i=w(o);x().set(y).from(o).save().then(i,i)};return e.jsxs(l,{title:"Order of Payment",breadcrumbs:u,children:[e.jsx(h,{title:`Order of Payment - ${r.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
