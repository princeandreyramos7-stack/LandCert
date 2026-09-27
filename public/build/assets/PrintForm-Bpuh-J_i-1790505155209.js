import{r as c,j as e,H as k}from"./app-B3gwJUUA-1790505155209.js";import{P as x,D as A,h as v}from"./DocumentActionBar-g1-749Z_-1790505155209.js";import{A as S}from"./AdminLayout-BzX0Iuyt-1790505155209.js";import{S as F}from"./SuperAdminLayout-Bv1kpikk-1790505155209.js";import{A as j}from"./ApplicantLayout-FjYPH7hl-1790505155209.js";import{F as P}from"./FitToWidth-CFeFxIAA-1790505155209.js";import{F as _,A as T}from"./ApplicationFormSheet-C8nqcBm1-1790505155209.js";import"./file-text-BqwcmQKZ-1790505155209.js";import"./printer-BPJGIkWV-1790505155209.js";import"./download-BIJslPQF-1790505155209.js";import"./admin-sidebar-DEZpmrYb-1790505155209.js";import"./breadcrumb-DMfKdCK8-1790505155209.js";import"./input-HkkD7ggn-1790505155209.js";import"./layout-dashboard-Bc3eqYVW-1790505155209.js";import"./users-o43Nyzj4-1790505155209.js";import"./award-BFutzmKN-1790505155209.js";import"./activity-BYhFzYR5-1790505155209.js";import"./PageSkeleton-BBvXwtKK-1790505155209.js";import"./toaster-CwicLufe-1790505155209.js";import"./SealWatermark-OBITcJ-7-1790505155209.js";import"./icon-button-By_Dt0zv-1790505155209.js";import"./super-admin-sidebar-Cg44XO23-1790505155209.js";import"./csrf-C8Ok7rTe-1790505155209.js";import"./folder-open-DOGey3fS-1790505155209.js";import"./refresh-cw-EEiXZzi8-1790505155209.js";import"./circle-check-D-H4qDZd-1790505155209.js";import"./circle-x-DKIJFL5h-1790505155209.js";import"./rotate-ccw-9l1jz3UL-1790505155209.js";import"./trash-2-DvQxjIg8-1790505155209.js";import"./shield-alert-ax1rcEsi-1790505155209.js";import"./eye-off-KaS4VJuy-1790505155209.js";import"./eye-CUp8YkMp-1790505155209.js";const u=t=>t!=null&&String(t).trim()!==""?String(t).trim():"",D=`
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
`;function dt({application:t,auth:r}){const h=u(t.application_number)||`TPZ-${t.id}`,n=_,s=r?.user?r.user.user_type||r.user.role:null,p=s==="super_admin",m=s==="admin",f=p?F:m?S:j,b=p?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Reviewed Applications",href:"/super-admin/requests"},{label:"Print Form"}]:m?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Print Form"}]:[],d=()=>{const o=`CPDO_Form_${n}_${u(t.applicant_name).replace(/\s+/g,"_")}.pdf`,i=document.createElement("div");i.style.cssText="background: white; padding: 0; margin: 0;",document.querySelectorAll(".pf-page").forEach((w,y)=>{const a=w.cloneNode(!0);a.classList.remove("no-border"),a.style.cssText=`
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${y===0?"always":"auto"};
                page-break-inside: avoid;
            `,i.appendChild(a)});const g={margin:0,filename:o,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};v().set(g).from(i).save()},l=c.useRef(!1);return c.useEffect(()=>{if(l.current||typeof window>"u"||!new URLSearchParams(window.location.search).has("download"))return;l.current=!0;const o=setTimeout(d,600);return()=>clearTimeout(o)},[]),e.jsxs(f,{title:"Print Application Form",breadcrumbs:b,children:[e.jsx(k,{title:`Print — ${n}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:D}}),e.jsx(x,{}),e.jsx(A,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${h}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:d}),e.jsx("div",{className:"form-print-area print-document-area",children:e.jsx(P,{children:e.jsx(T,{application:t})})})]})}export{dt as default};
