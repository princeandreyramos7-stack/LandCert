import{j as e,H as w}from"./app-BGYOupkF.js";import{P as y,D as k,h as A}from"./DocumentActionBar-B_gxmGCD.js";import{A as x}from"./AdminLayout-BQ_3LF0F.js";import{S as v}from"./SuperAdminLayout-ABJAMG7x.js";import{A as F}from"./ApplicantLayout-CvC2yaGS.js";import{F as j}from"./FitToWidth-C9dFu7Sx.js";import{F as S,A as P}from"./ApplicationFormSheet-Dgjp1Y8a.js";import"./file-text-BUhK3AM5.js";import"./printer-BZoUgf7L.js";import"./download-DtSjP93s.js";import"./admin-sidebar-CwQjn1bo.js";import"./breadcrumb-9suDRps6.js";import"./input-D1Sn3-c-.js";import"./SealWatermark-QkH7QPE3.js";import"./layout-dashboard-hImeUuRK.js";import"./users-wbEn4tCz.js";import"./award-CLYENBfx.js";import"./activity-C1dt4B2T.js";import"./NotificationBell-BA2KIRbd.js";import"./toaster-Des_75wz.js";import"./super-admin-sidebar-CUU5UWQs.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-BPB0-WKr.js";import"./refresh-cw-DxtNDkPl.js";import"./circle-check-CYk8sxR9.js";import"./circle-x-Bzdu-790.js";import"./trash-2-oW2l7OGy.js";const m=t=>t!=null&&String(t).trim()!==""?String(t).trim():"",_=`
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
`;function ot({application:t,auth:r}){const l=m(t.application_number)||`TPZ-${t.id}`,a=S,n=r?.user?r.user.user_type||r.user.role:null,s=n==="super_admin",p=n==="admin",d=s?v:p?x:F,c=s?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Reviewed Applications",href:"/super-admin/requests"},{label:"Print Form"}]:p?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Print Form"}]:[],h=()=>{const u=`CPDO_Form_${a}_${m(t.applicant_name).replace(/\s+/g,"_")}.pdf`,o=document.createElement("div");o.style.cssText="background: white; padding: 0; margin: 0;",document.querySelectorAll(".pf-page").forEach((g,f)=>{const i=g.cloneNode(!0);i.classList.remove("no-border"),i.style.cssText=`
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${f===0?"always":"auto"};
                page-break-inside: avoid;
            `,o.appendChild(i)});const b={margin:0,filename:u,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};A().set(b).from(o).save()};return e.jsxs(d,{title:"Print Application Form",breadcrumbs:c,children:[e.jsx(w,{title:`Print — ${a}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:_}}),e.jsx(y,{}),e.jsx(k,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${l}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:h}),e.jsx("div",{className:"form-print-area print-document-area",children:e.jsx(j,{children:e.jsx(P,{application:t})})})]})}export{ot as default};
