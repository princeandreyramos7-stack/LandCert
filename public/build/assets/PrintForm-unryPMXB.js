import{j as e,H as w}from"./app-Bvq_zTsi.js";import{P as y,D as k,h as A}from"./DocumentActionBar-s7QP2P2O.js";import{A as x}from"./AdminLayout-BQax22kH.js";import{S as v}from"./SuperAdminLayout-M88meLjS.js";import{A as F}from"./ApplicantLayout-B-vZKB8t.js";import{F as j}from"./FitToWidth-DASKFTmP.js";import{F as S,A as P}from"./ApplicationFormSheet-D0ROJwoO.js";import"./file-text-CoURJ2zH.js";import"./printer-D7q_DUsr.js";import"./download-DZCmHYtt.js";import"./admin-sidebar-IsGswX0y.js";import"./breadcrumb-xddmphfo.js";import"./input-NRt3zUf2.js";import"./SealWatermark-CPT3KBRE.js";import"./layout-dashboard-C_E6VJsZ.js";import"./users-WJhRe31R.js";import"./award-aLvuBBjG.js";import"./activity-DvNcJjlp.js";import"./NotificationBell-2x2x8TT5.js";import"./toaster-DgSX8_pa.js";import"./super-admin-sidebar-gqMITOqG.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-DbY58JzI.js";import"./refresh-cw-JlnrBq0B.js";import"./circle-check-BCbZxr3A.js";import"./circle-x-vQmsWeBt.js";import"./trash-2-B5_sVtbg.js";const m=t=>t!=null&&String(t).trim()!==""?String(t).trim():"",_=`
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
