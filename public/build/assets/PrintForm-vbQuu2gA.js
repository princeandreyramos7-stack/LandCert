import{r as c,j as t,H as k}from"./app-DR08DPd3.js";import{P as x,D as A,h as v}from"./DocumentActionBar-C6kNQmVi.js";import{A as S}from"./AdminLayout-hnY1JDBo.js";import{S as F}from"./SuperAdminLayout-OyhjP7h-.js";import{A as j}from"./ApplicantLayout-DsV5CzL_.js";import{F as P}from"./FitToWidth-BBrnrK5c.js";import{F as _,A as T}from"./ApplicationFormSheet-D2ZmvWwp.js";import"./file-text-CKI7hBT6.js";import"./printer-BfV3hblo.js";import"./download-CFB-lMJG.js";import"./admin-sidebar-Bp0Cy1dw.js";import"./breadcrumb-BHaxjI5x.js";import"./input-DNv8uhLT.js";import"./SealWatermark-Dtoxby1t.js";import"./layout-dashboard-BauUJCvz.js";import"./users-KR7V9CSv.js";import"./award-C0Qn4l1i.js";import"./activity-VewUT5qu.js";import"./NotificationBell-qRA4oA_v.js";import"./toaster-DrKbrkdc.js";import"./super-admin-sidebar-CjkBrXn0.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-BtYcdO5E.js";import"./refresh-cw-BZQLPkVE.js";import"./circle-check-C9XGhbi4.js";import"./circle-x-HsIL9gvD.js";import"./trash-2-CLxcZZ4t.js";const u=e=>e!=null&&String(e).trim()!==""?String(e).trim():"",D=`
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { 
    background: transparent; 
    font-family: Arial, Helvetica, sans-serif;
}

/* ── print ──
   The chrome is taken out of the layout by PrintDocumentStyles (the same
   rules the clearance and certification print with). The page's own rules
   used to hide the sidebar and header but leave their boxes in the layout:
   the sheets were laid out in the narrow column beside the sidebar's gap,
   the printer shrank the too-wide page to fit, and what was left over ran
   onto a third, blank sheet. */
@media print {
    .pf-page {
        display: block !important;
        width: 100% !important;
        min-height: 0 !important;
        margin: 0 !important;
        border: none !important;
        box-shadow: none !important;
        padding: 7mm 8mm !important;
        background: #fff !important;
        break-inside: avoid;
        page-break-inside: avoid;
    }

    /* The form, then the requirements checklist: two sheets. */
    .pf-page + .pf-page {
        break-before: page;
        page-break-before: always;
    }

    /* The yellow highlights print as shown. */
    .pf-page,
    .pf-page * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
`;function ie({application:e,auth:r}){const h=u(e.application_number)||`TPZ-${e.id}`,n=_,s=r?.user?r.user.user_type||r.user.role:null,p=s==="super_admin",m=s==="admin",f=p?F:m?S:j,b=p?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Reviewed Applications",href:"/super-admin/requests"},{label:"Print Form"}]:m?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Print Form"}]:[],d=()=>{const o=`CPDO_Form_${n}_${u(e.applicant_name).replace(/\s+/g,"_")}.pdf`,a=document.createElement("div");a.style.cssText="background: white; padding: 0; margin: 0;",document.querySelectorAll(".pf-page").forEach((w,y)=>{const i=w.cloneNode(!0);i.classList.remove("no-border"),i.style.cssText=`
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${y===0?"always":"auto"};
                page-break-inside: avoid;
            `,a.appendChild(i)});const g={margin:0,filename:o,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};v().set(g).from(a).save()},l=c.useRef(!1);return c.useEffect(()=>{if(l.current||typeof window>"u"||!new URLSearchParams(window.location.search).has("download"))return;l.current=!0;const o=setTimeout(d,600);return()=>clearTimeout(o)},[]),t.jsxs(f,{title:"Print Application Form",breadcrumbs:b,children:[t.jsx(k,{title:`Print — ${n}`}),t.jsx("style",{dangerouslySetInnerHTML:{__html:D}}),t.jsx(x,{}),t.jsx(A,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${h}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:d}),t.jsx("div",{className:"form-print-area print-document-area",children:t.jsx(P,{children:t.jsx(T,{application:e})})})]})}export{ie as default};
