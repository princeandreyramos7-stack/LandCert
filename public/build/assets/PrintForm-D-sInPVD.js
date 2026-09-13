import{j as i,H as y}from"./app-D_AByAPm.js";import{h as w}from"./html2pdf-CvJ2FenG.js";import{A as F}from"./AdminLayout-BaorIUqL.js";import{S as k}from"./SuperAdminLayout-CPJ5Zt88.js";import{A as v}from"./ApplicantLayout-Cfz7oBzU.js";import{D as A}from"./DocumentActionBar-DzM36aMT.js";import{F as x}from"./FitToWidth-vUXQmhh0.js";import{F as j,A as S}from"./ApplicationFormSheet-C8qC7edb.js";import"./admin-sidebar-DwZRsQGd.js";import"./breadcrumb-MfQcWQ6q.js";import"./SealWatermark-oALY7jDQ.js";import"./user-BEOycub5.js";import"./layout-dashboard-DPj9cGWV.js";import"./file-text-DpZ2C1Nf.js";import"./users-EF-wyzEO.js";import"./award-CXV5RbIg.js";import"./activity-BfSbbxoT.js";import"./HeaderSlot-IE-2gpJe.js";import"./toaster-Djd7ttde.js";import"./NotificationBell-_OGmMpS1.js";import"./bell-DkJVhz5s.js";import"./super-admin-sidebar-DtVWeaAM.js";import"./applicantSidebar-CKBsI8gv.js";import"./folder-open-CkZEzrYb.js";import"./printer-BCjeoxpP.js";import"./download-DF_LP_To.js";const s=t=>t!=null&&String(t).trim()!==""?String(t).trim():"",_=`
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { 
    background: transparent; 
    font-family: Arial, Helvetica, sans-serif;
}

/* ── print ── */
@media print {
    html, body { 
        background: #fff !important; 
        margin: 0 !important; 
        padding: 0 !important; 
        overflow: visible !important;
    }
    
    /* Hide sidebar, header, and controls when printing */
    aside,
    header,
    .no-print,
    [data-sidebar],
    [data-sidebar-provider],
    button {
        display: none !important;
    }
    
    /* Make the main content area full width */
    main,
    [data-sidebar-inset] {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
    }
    
    /* Show form pages */
    .pf-page {
        display: block !important;
        visibility: visible !important;
        margin: 0 !important;
        border: none !important;
        padding: 7mm 8mm !important;
        width: 100% !important;
        min-height: auto !important;
        box-shadow: none !important;
        position: static !important;
        background: white !important;
        page-break-inside: avoid !important;
    }
    
    .pf-page:first-child {
        page-break-after: always !important;
    }
    
    .pf-page:last-child {
        page-break-after: avoid !important;
    }
    
    /* Make sure form content is visible */
    .pf-page * {
        visibility: visible !important;
    }
    
    /* Force background colors to print - especially yellow */
    * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }
    
    /* Ensure yellow background stays yellow */
    [style*="background"][style*="yellow"],
    [style*="backgroundColor"][style*="FFFF00"],
    [style*="backgroundColor"][style*="yellow"] {
        background-color: #FFFF00 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    @page { 
        size: A4 portrait; 
        margin: 0;
    }
}
`;function it({application:t,auth:o}){const l=s(t.application_number)||`TPZ-${t.id}`,e=j,n=o?.user?o.user.user_type||o.user.role:null,p=n==="super_admin",m=n==="admin",d=p?k:m?F:v,c=p?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Print Form"}]:m?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Print Form"}]:[],u=()=>{const b=`CPDO_Form_${e}_${s(t.applicant_name).replace(/\s+/g,"_")}.pdf`,r=document.createElement("div");r.style.cssText="background: white; padding: 0; margin: 0;",document.querySelectorAll(".pf-page").forEach((f,h)=>{const a=f.cloneNode(!0);a.classList.remove("no-border"),a.style.cssText=`
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${h===0?"always":"auto"};
                page-break-inside: avoid;
            `,r.appendChild(a)});const g={margin:0,filename:b,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};w().set(g).from(r).save()};return i.jsxs(d,{title:"Print Application Form",breadcrumbs:c,children:[i.jsx(y,{title:`Print — ${e}`}),i.jsx("style",{dangerouslySetInnerHTML:{__html:_}}),i.jsx(A,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${l}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:u}),i.jsx(x,{children:i.jsx(S,{application:t})})]})}export{it as default};
