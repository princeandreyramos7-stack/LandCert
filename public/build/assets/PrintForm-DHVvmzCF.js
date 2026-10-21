import{r as c,j as e,H as A}from"./app-CGjS896P.js";import{P as k,D as v,h as x}from"./DocumentActionBar-BmaqyQry.js";import{A as S}from"./AdminLayout-Ba-14Nwd.js";import{S as F}from"./SuperAdminLayout-DEK2A_Cn.js";import{A as j}from"./ApplicantLayout-V6bUmNYn.js";import{F as P}from"./FitToWidth-BulLGozl.js";import{F as _,A as T}from"./ApplicationFormSheet-DhCaUQEU.js";import"./file-text-Bz1vtD6g.js";import"./printer-D3hHMG_A.js";import"./download-o2jvRPOP.js";import"./admin-sidebar-DGpFgOnm.js";import"./SealWatermark-BELUndVK.js";import"./input-BceJsVFd.js";import"./users-BU5pkbcz.js";import"./award-CVvnGhtE.js";import"./activity-Dldl5AKH.js";import"./message-square-Bt5Mwmh-.js";import"./PageSkeleton-Bqpa8v8l.js";import"./bell-Y4TIHkzl.js";import"./toaster-Dwf4YqNs.js";import"./icon-button-CDwNHqvp.js";import"./super-admin-sidebar-D8CE7oOe.js";import"./csrf-C8Ok7rTe.js";import"./folder-open--KqtJspS.js";import"./refresh-cw-DcprsaF3.js";import"./circle-check-Cyrcjb7I.js";import"./circle-x-xXm7gcce.js";import"./calendar-clock-CAZIQy-k.js";import"./rotate-ccw-C545x8xD.js";import"./trash-2-C-6QGhxv.js";import"./shield-alert-Doxr47eV.js";import"./eye-off-DyrkdtY3.js";import"./eye-Be2KPe4L.js";import"./scroll-text-DiWToHsC.js";import"./bell-ring-DSH9mobn.js";const u=t=>t!=null&&String(t).trim()!==""?String(t).trim():"",L=`
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
            `,i.appendChild(a)});const g={margin:0,filename:o,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};x().set(g).from(i).save()},l=c.useRef(!1);return c.useEffect(()=>{if(l.current||typeof window>"u"||!new URLSearchParams(window.location.search).has("download"))return;l.current=!0;const o=setTimeout(d,600);return()=>clearTimeout(o)},[]),e.jsxs(f,{title:"Print Application Form",breadcrumbs:b,children:[e.jsx(A,{title:`Print — ${n}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:L}}),e.jsx(k,{}),e.jsx(v,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${h}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:d,downloadLabel:"Save Application Form"}),e.jsx("div",{className:"form-print-area print-document-area",children:e.jsx(P,{children:e.jsx(T,{application:t})})})]})}export{ut as default};
