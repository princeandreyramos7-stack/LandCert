import{j as e,H as w}from"./app-LoA3782S.js";import{P as y,D as k,h as A}from"./DocumentActionBar-BOruycAF.js";import{A as x}from"./AdminLayout-BcTw7C2g.js";import{S as F}from"./SuperAdminLayout-CnpEG5kK.js";import{A as j}from"./ApplicantLayout-t4-8q53A.js";import{F as v}from"./FitToWidth-B1UHWQ-n.js";import{F as S,A as P}from"./ApplicationFormSheet-wyXPuSc5.js";import"./file-text-DGCxo3uZ.js";import"./printer-0b0-8cix.js";import"./download-D9tb7q0-.js";import"./admin-sidebar-CUJrgzBi.js";import"./breadcrumb-BmWGE0pp.js";import"./input-Ck9uHVUo.js";import"./SealWatermark-BLHoyWu9.js";import"./layout-dashboard-C7ueOw-b.js";import"./users-CfH5c2JF.js";import"./award-DBHK09Fq.js";import"./activity-DWwdxnQa.js";import"./NotificationBell-CQBYa1RC.js";import"./toaster-BZtLLDp0.js";import"./super-admin-sidebar-0fY7jFCN.js";import"./csrf-C8Ok7rTe.js";import"./folder-open-LxcqKJRn.js";import"./refresh-cw-so14g6lb.js";import"./circle-check-D03d9Qiw.js";import"./circle-x-IAX-ZGqF.js";import"./trash-2-cmOfuTOb.js";const m=t=>t!=null&&String(t).trim()!==""?String(t).trim():"",_=`
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
`;function ot({application:t,auth:r}){const l=m(t.application_number)||`TPZ-${t.id}`,a=S,n=r?.user?r.user.user_type||r.user.role:null,s=n==="super_admin",p=n==="admin",d=s?F:p?x:j,c=s?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Print Form"}]:p?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Print Form"}]:[],h=()=>{const u=`CPDO_Form_${a}_${m(t.applicant_name).replace(/\s+/g,"_")}.pdf`,o=document.createElement("div");o.style.cssText="background: white; padding: 0; margin: 0;",document.querySelectorAll(".pf-page").forEach((g,f)=>{const i=g.cloneNode(!0);i.classList.remove("no-border"),i.style.cssText=`
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${f===0?"always":"auto"};
                page-break-inside: avoid;
            `,o.appendChild(i)});const b={margin:0,filename:u,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};A().set(b).from(o).save()};return e.jsxs(d,{title:"Print Application Form",breadcrumbs:c,children:[e.jsx(w,{title:`Print — ${a}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:_}}),e.jsx(y,{}),e.jsx(k,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${l}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:h}),e.jsx("div",{className:"form-print-area print-document-area",children:e.jsx(v,{children:e.jsx(P,{application:t})})})]})}export{ot as default};
