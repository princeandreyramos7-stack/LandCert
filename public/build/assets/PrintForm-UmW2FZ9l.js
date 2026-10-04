import{r as c,j as e,H as k}from"./app-CYV28Roq.js";import{P as x,D as A,h as v}from"./DocumentActionBar-BJY9rUTg.js";import{A as S}from"./AdminLayout-D_pe2YMI.js";import{S as F}from"./SuperAdminLayout-DUesF2z6.js";import{A as j}from"./ApplicantLayout-DGFUyyjo.js";import{F as P}from"./FitToWidth-KiSv8WzN.js";import{F as _,A as T}from"./ApplicationFormSheet-BEoNLaVs.js";import"./file-text-C5OkIXJZ.js";import"./printer-DYWlHENs.js";import"./download-8pfcIbkj.js";import"./admin-sidebar-BMy0x7Y9.js";import"./breadcrumb-3CyksGaO.js";import"./input-CcBaYu2x.js";import"./layout-dashboard-BLE3S7ui.js";import"./users-B7OCcAMb.js";import"./award-DIsish-h.js";import"./activity-BKWkBnkE.js";import"./PageSkeleton-CwpD16Ly.js";import"./bell-BoVIyQYC.js";import"./toaster-CWK-lzf1.js";import"./SealWatermark-CL3cBEk7.js";import"./icon-button-HrvR1Qt_.js";import"./super-admin-sidebar-h6X4bFrE.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-DSJGfPU9.js";import"./refresh-cw-BPUBEp97.js";import"./circle-check-XmEXE8Vr.js";import"./circle-x-Vfb1DK4a.js";import"./rotate-ccw-DiWsCB6l.js";import"./trash-2-QwsP-lxI.js";import"./shield-alert-COzlcjWd.js";import"./eye-off-B9n_YD-4.js";import"./eye-zbH36wJm.js";import"./scroll-text-CnVpLkvs.js";const u=t=>t!=null&&String(t).trim()!==""?String(t).trim():"",D=`
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
`;function ct({application:t,auth:r}){const h=u(t.application_number)||`TPZ-${t.id}`,n=_,s=r?.user?r.user.user_type||r.user.role:null,p=s==="super_admin",m=s==="admin",f=p?F:m?S:j,b=p?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Reviewed Applications",href:"/super-admin/requests"},{label:"Print Form"}]:m?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Print Form"}]:[],d=()=>{const o=`CPDO_Form_${n}_${u(t.applicant_name).replace(/\s+/g,"_")}.pdf`,i=document.createElement("div");i.style.cssText="background: white; padding: 0; margin: 0;",document.querySelectorAll(".pf-page").forEach((w,y)=>{const a=w.cloneNode(!0);a.classList.remove("no-border"),a.style.cssText=`
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${y===0?"always":"auto"};
                page-break-inside: avoid;
            `,i.appendChild(a)});const g={margin:0,filename:o,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};v().set(g).from(i).save()},l=c.useRef(!1);return c.useEffect(()=>{if(l.current||typeof window>"u"||!new URLSearchParams(window.location.search).has("download"))return;l.current=!0;const o=setTimeout(d,600);return()=>clearTimeout(o)},[]),e.jsxs(f,{title:"Print Application Form",breadcrumbs:b,children:[e.jsx(k,{title:`Print — ${n}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:D}}),e.jsx(x,{}),e.jsx(A,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${h}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:d}),e.jsx("div",{className:"form-print-area print-document-area",children:e.jsx(P,{children:e.jsx(T,{application:t})})})]})}export{ct as default};
