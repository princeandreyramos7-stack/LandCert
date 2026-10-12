import{r as c,j as e,H as k}from"./app-DwXb5CvP.js";import{P as x,D as A,h as v}from"./DocumentActionBar-DR3-dG-t.js";import{A as S}from"./AdminLayout-CR30VMXX.js";import{S as F}from"./SuperAdminLayout-zc50GUvg.js";import{A as j}from"./ApplicantLayout-OYAkDtX_.js";import{F as P}from"./FitToWidth-CZx8We8V.js";import{F as _,A as T}from"./ApplicationFormSheet-CE73jkDl.js";import"./file-text-BsUhUVPG.js";import"./printer-DND44xw4.js";import"./download-DTu4B3HF.js";import"./admin-sidebar-Cad2hffb.js";import"./SealWatermark-DWRLjKG4.js";import"./input-BSw32khw.js";import"./users-BOxl9swU.js";import"./award-BhuPgTZ-.js";import"./activity-DwLRzwDC.js";import"./message-square-DpjhnI-4.js";import"./PageSkeleton-3BM_bB8f.js";import"./bell-CHWNUCye.js";import"./toaster-CYTb8rwe.js";import"./icon-button-BuCT1LhJ.js";import"./super-admin-sidebar-Czctcinr.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-BMYBrbtM.js";import"./refresh-cw-Cgv15EZb.js";import"./circle-check-ClOn8aCl.js";import"./circle-x-CqGUYycr.js";import"./calendar-clock-DfOVYI2-.js";import"./rotate-ccw-Be-CQxa5.js";import"./trash-2-DJpH4WD8.js";import"./shield-alert-BesVhQT_.js";import"./eye-off-Dm7ONFT4.js";import"./eye-D9rMRb0k.js";import"./scroll-text-CjUrT9H8.js";import"./bell-ring-Bv9RpvQP.js";const u=t=>t!=null&&String(t).trim()!==""?String(t).trim():"",D=`
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
`;function ut({application:t,auth:r}){const h=u(t.application_number)||`TPZ-${t.id}`,n=_,s=r?.user?r.user.user_type||r.user.role:null,p=s==="super_admin",m=s==="admin",f=p?F:m?S:j,b=p?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Reviewed Applications",href:"/super-admin/requests"},{label:"Print Form"}]:m?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Print Form"}]:[],d=()=>{const o=`CPDO_Form_${n}_${u(t.applicant_name).replace(/\s+/g,"_")}.pdf`,i=document.createElement("div");i.style.cssText="background: white; padding: 0; margin: 0;",document.querySelectorAll(".pf-page").forEach((w,y)=>{const a=w.cloneNode(!0);a.classList.remove("no-border"),a.style.cssText=`
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${y===0?"always":"auto"};
                page-break-inside: avoid;
            `,i.appendChild(a)});const g={margin:0,filename:o,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};v().set(g).from(i).save()},l=c.useRef(!1);return c.useEffect(()=>{if(l.current||typeof window>"u"||!new URLSearchParams(window.location.search).has("download"))return;l.current=!0;const o=setTimeout(d,600);return()=>clearTimeout(o)},[]),e.jsxs(f,{title:"Print Application Form",breadcrumbs:b,children:[e.jsx(k,{title:`Print — ${n}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:D}}),e.jsx(x,{}),e.jsx(A,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${h}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:d}),e.jsx("div",{className:"form-print-area print-document-area",children:e.jsx(P,{children:e.jsx(T,{application:t})})})]})}export{ut as default};
