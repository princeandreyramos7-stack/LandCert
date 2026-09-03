import{j as t,H as R}from"./app-zauPhvBK.js";import{h as F}from"./html2pdf-CWNhaQiP.js";import{A as L}from"./AdminLayout-B3cQ6CwI.js";import{S as _}from"./SuperAdminLayout-C68eymzN.js";import{A as z}from"./ApplicantLayout-DP7vaVaS.js";import{D as P,F as D}from"./DocumentActionBar-BT3bhdYe.js";import"./admin-sidebar-CD5g9lb2.js";import"./breadcrumb-CRY438Vy.js";import"./index-BXxox41d.js";import"./user-CaihF1XR.js";import"./layout-dashboard-CdB56Op7.js";import"./file-text-DLt_T1vY.js";import"./users-BgNXTHtJ.js";import"./award-CPtGRAUI.js";import"./activity-L3L6o0yZ.js";import"./HeaderSlot-BP32KbRD.js";import"./toaster-BK1SCyjE.js";import"./use-toast-BbTDUAE8.js";import"./NotificationBell-BfoAa4Kt.js";import"./bell-BdTCCwjh.js";import"./super-admin-sidebar-BrhztfGy.js";import"./app-sidebar-CyTm0596.js";import"./printer-DF5oan3a.js";import"./download-Dt709POp.js";const i=e=>e!=null&&String(e).trim()!==""?String(e).trim():"",o=" ",s=({on:e})=>t.jsx("span",{style:{fontSize:"9pt",lineHeight:1},children:e?"☑":"☐"}),r=({val:e,w:a="80pt",inline:d=!1,pl:l="2pt",pr:p="2pt"})=>t.jsx("span",{style:{display:"inline-block",width:a,borderBottom:"1px solid #000",verticalAlign:"bottom",fontSize:"8pt",lineHeight:"1.4",paddingBottom:"3pt",paddingLeft:l,paddingRight:p},children:i(e)||o});function k(e){if(!e||isNaN(parseFloat(e)))return"";const a=["","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN","ELEVEN","TWELVE","THIRTEEN","FOURTEEN","FIFTEEN","SIXTEEN","SEVENTEEN","EIGHTEEN","NINETEEN"],d=["","","TWENTY","THIRTY","FORTY","FIFTY","SIXTY","SEVENTY","EIGHTY","NINETY"];function l(n){return n<20?a[n]:n<100?d[Math.floor(n/10)]+(n%10?"-"+a[n%10]:""):n<1e3?a[Math.floor(n/100)]+" HUNDRED"+(n%100?" "+l(n%100):""):n<1e6?l(Math.floor(n/1e3))+" THOUSAND"+(n%1e3?" "+l(n%1e3):""):n<1e9?l(Math.floor(n/1e6))+" MILLION"+(n%1e6?" "+l(n%1e6):""):l(Math.floor(n/1e9))+" BILLION"+(n%1e9?" "+l(n%1e9):"")}const p=Math.floor(parseFloat(e)),g=Math.round((parseFloat(e)-p)*100);return l(p)+" PESOS"+(g?" AND "+l(g)+"/100":"")}const H=`
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { 
    background: transparent; 
    font-family: Arial, Helvetica, sans-serif;
}

/* ── screen wrapper ── */
.pf-page {
    width: 210mm;
    min-height: 297mm;
    background: #fff;
    margin: 8px auto;
    border: 1px solid #e5e7eb;
    padding: 7mm 8mm 7mm 8mm;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8pt;
    color: #000;
    line-height: 1.25;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

/* Remove border when generating PDF or printing */
.pf-page.no-border {
    border: none;
    margin: 0;
}

/* ── all tables ── */
.pf-page table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}
/* Default: td has bottom border only — no vertical lines */
.pf-page td {
    border: none;
    padding: 2pt 4pt;
    vertical-align: top;
    word-break: break-word;
}

/* border helpers */
.nb   { border: none !important; }
.nb-t { border-top: none !important; }
.nb-b { border-bottom: none !important; }
.nb-l { border-left: none !important; }
.nb-r { border-right: none !important; }
.bt   { border-top: 1px solid #000 !important; }
.bl   { border-left: 1px solid #000 !important; }
.bb   { border-bottom: 1px solid #000 !important; }
.br   { border-right: 1px solid #000 !important; }

/* ── cell label ── */
.lbl {
    display: block;
    font-size: 7pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #222;
    margin-bottom: 2pt;
}
/* ── cell value ── */
.val {
    display: block;
    font-size: 8pt;
    font-weight: normal;
    min-height: 11pt;
}

/* ── section bar (grey header) ── */
.sec-bar {
    width: 100%;
    background: #d0d0d0;
    border: 1px solid #000;
    border-top: none;
    padding: 2pt 5pt;
    font-size: 7.5pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

/* ── checkbox option text ── */
.opt { font-size: 7.5pt; margin-right: 12pt; white-space: nowrap; }

/* ── question text ── */
.q {
    font-size: 6.5pt;
    font-weight: bold;
    line-height: 1.45;
    margin-bottom: 3pt;
}

/* ── sub-question line ── */
.sq {
    display: flex;
    align-items: flex-end;
    gap: 4pt;
    margin-top: 3pt;
    font-size: 6.5pt;
}
.sq-lbl { white-space: nowrap; }
.sq-line {
    flex: 1;
    border-bottom: 1px solid #000;
    font-size: 7.5pt;
    padding-bottom: 0;
    min-width: 30pt;
    line-height: 1.3;
}

/* ── page number footer ── */
.pf-pageno {
    text-align: right;
    font-size: 7pt;
    font-weight: bold;
    margin-top: 8pt;
}

/* ── certification text ── */
.cert-text {
    font-size: 6.5pt;
    line-height: 1.55;
    text-align: justify;
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
`;function gt({application:e,auth:a}){const d=parseFloat(e.project_cost)||0,l=d?"₱"+d.toLocaleString("en-PH",{minimumFractionDigits:2}):"",p=d?k(d):"",g=i(e.application_number)||M("TPZ-%s-%04d",new Date().toISOString().slice(5,7)+"-"+new Date().toISOString().slice(2,4),e.id);i(e.decision_number)||""+new Date().toISOString().slice(5,7)+new Date().toISOString().slice(2,4);const n="CPD-001-0",f=a?.user?a.user.user_type||a.user.role:null,y=f==="super_admin",u=f==="admin",A=y?_:u?L:z,E=y?[{label:"Dashboard",href:"/super-admin/dashboard"},{label:"Applications",href:"/super-admin/requests"},{label:"Print Form"}]:u?[{label:"Dashboard",href:"/admin/dashboard"},{label:"Applications",href:"/admin/requests"},{label:"Print Form"}]:[],I=()=>{const j=`CPDO_Form_${n}_${i(e.applicant_name).replace(/\s+/g,"_")}.pdf`,m=document.createElement("div");m.style.cssText="background: white; padding: 0; margin: 0;",document.querySelectorAll(".pf-page").forEach((C,B)=>{const b=C.cloneNode(!0);b.classList.remove("no-border"),b.style.cssText=`
                margin: 0;
                padding: 7mm 8mm;
                border: none;
                background: white;
                width: 210mm;
                min-height: auto;
                page-break-after: ${B===0?"always":"auto"};
                page-break-inside: avoid;
            `,m.appendChild(b)});const O={margin:0,filename:j,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,logging:!1,windowWidth:794,windowHeight:1123},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"css"}};F().set(O).from(m).save()},N=i(e.project_nature),x=N.toLowerCase().replace(/\.$/,""),v=x==="new const"||x==="new construction",w=x==="improvement",T=!!N&&!v&&!w,c=i(e.existing_land_use).toLowerCase(),S=c&&!["residential","institutional","commercial","industrial","vacant","agricultural","tenant","not tenanted"].includes(c),h=i(e.preferred_release_mode).toLowerCase();return t.jsxs(A,{title:"Print Application Form",breadcrumbs:E,children:[t.jsx(R,{title:`Print — ${n}`}),t.jsx("style",{dangerouslySetInnerHTML:{__html:H}}),t.jsx(P,{eyebrow:"Form",title:"Application Form",subtitle:`Application No: ${g}`,printLabel:"Print Form",onPrint:()=>window.print(),onDownload:I}),t.jsxs(D,{children:[t.jsxs("div",{className:"pf-page",children:[t.jsxs("table",{style:{marginBottom:0,borderCollapse:"collapse"},children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"28%"}}),t.jsx("col",{style:{width:"48%"}}),t.jsx("col",{style:{width:"24%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{style:{border:"none",padding:"2pt 4pt 2pt 2pt",verticalAlign:"top"},children:t.jsxs("div",{style:{fontSize:"7.5pt",lineHeight:"2.0"},children:[t.jsx("div",{children:"Application No.:"}),t.jsx("div",{children:"Date Receipt:"}),t.jsx("div",{children:"O.R. No.:"}),t.jsx("div",{children:"Date Issued:"}),t.jsx("div",{children:"Amount Paid:"})]})}),t.jsxs("td",{style:{border:"none",padding:"2pt 8pt",verticalAlign:"top",textAlign:"center"},children:[t.jsx("div",{style:{fontSize:"11pt",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"0.03em",lineHeight:1,marginBottom:"8pt",textAlign:"center",backgroundColor:"#FFFF00",padding:"4pt 8pt",display:"inline-block",minWidth:"100%",width:"auto",boxSizing:"border-box",whiteSpace:"nowrap"},children:"City Planning and Development Office"}),t.jsx("div",{style:{borderBottom:"1px solid #000",marginBottom:"6pt",minHeight:"13pt",fontSize:"8pt"},children:" "}),t.jsx("div",{style:{borderBottom:"1px solid #000",marginBottom:"4pt",minHeight:"13pt",fontSize:"8pt"},children:" "}),t.jsx("div",{style:{fontSize:"6.5pt",fontStyle:"italic",color:"#333",textAlign:"center"},children:"(Office and Address)"})]}),t.jsx("td",{style:{border:"none",padding:"2pt 0 0 0",verticalAlign:"top",textAlign:"right"},children:t.jsx("div",{style:{fontSize:"8pt",fontWeight:"bold"},children:n})})]})})]}),t.jsx("div",{style:{borderTop:"1px solid #000",marginTop:"6pt",marginBottom:0}}),t.jsx("table",{className:"form-table",children:t.jsx("tbody",{children:t.jsx("tr",{children:t.jsx("td",{style:{textAlign:"center",fontWeight:"bold",fontSize:"9pt",textTransform:"uppercase",padding:"4pt 6pt",letterSpacing:"0.03em",borderTop:"none"},children:"Application for Locational Clearance / Certificate of Zoning Compliance"})})})}),t.jsxs("table",{children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"50%"}}),t.jsx("col",{style:{width:"50%"}})]}),t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsxs("td",{className:"nb-t",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"1. Name of Applicant"}),t.jsx("span",{className:"val",children:i(e.applicant_name)||o})]}),t.jsxs("td",{className:"nb-t nb-l",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"2. Name of Corporation (if applicable)"}),t.jsx("span",{className:"val",children:i(e.corporation_name)||o})]})]}),t.jsxs("tr",{children:[t.jsxs("td",{style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"3. Address of Applicant"}),t.jsx("span",{className:"val",children:i(e.applicant_address)||o})]}),t.jsxs("td",{className:"nb-l",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"4. Address of Corporation"}),t.jsx("span",{className:"val",children:i(e.corporation_address)||o})]})]}),t.jsxs("tr",{children:[t.jsxs("td",{style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"5. Name of Authorized Representative (if applicable)"}),t.jsx("span",{className:"val",children:i(e.representative_name)||o})]}),t.jsxs("td",{className:"nb-l",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"6. Address of Authorized Representative"}),t.jsx("span",{className:"val",children:i(e.representative_address)||o})]})]})]})]}),t.jsxs("table",{children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"36%"}}),t.jsx("col",{style:{width:"64%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsxs("td",{className:"nb-t",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"7. Project Type"}),t.jsx("span",{className:"val",children:i(e.project_type)||o})]}),t.jsxs("td",{className:"nb-t nb-l",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"8. Project Nature"}),t.jsxs("div",{style:{marginTop:"3pt"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:v})," ","New Const."]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:w})," ","Improvement"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:T})," ","Others:"," ",t.jsx(r,{val:T?e.project_nature:"",w:"60pt"})]})]})]})]})})]}),t.jsx("table",{children:t.jsxs("tbody",{children:[t.jsx("tr",{children:t.jsx("td",{className:"nb-t nb-b",colSpan:12,style:{paddingBottom:"1pt"},children:t.jsx("span",{className:"lbl",style:{marginBottom:0},children:"9. Project Location"})})}),t.jsxs("tr",{children:[t.jsx("td",{className:"nb-t nb-l nb-r",style:{border:"none",width:"5%",fontSize:"6pt",paddingTop:"2pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"No./Blk:"}),t.jsx("td",{className:"nb-t nb-l",style:{border:"none",borderBottom:"1px solid #000",width:"9%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:i(e.location_number)||o}),t.jsx("td",{className:"nb",style:{border:"none",width:"4%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Street:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"16%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:i(e.location_street)||o}),t.jsx("td",{className:"nb",style:{border:"none",width:"4%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Purok:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"10%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:o}),t.jsx("td",{className:"nb",style:{border:"none",width:"4%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Brgy.:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"17%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:i(e.location_barangay)||o}),t.jsx("td",{className:"nb",style:{border:"none",width:"9%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom",whiteSpace:"nowrap"},children:"City/Mun.:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"13%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:i(e.location_city)||"City of Ilagan"}),t.jsx("td",{className:"nb",style:{border:"none",width:"5%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Prov.:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"4%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:i(e.location_province)||"Isabela"})]}),t.jsx("tr",{children:t.jsx("td",{colSpan:12,className:"nb-t nb-l nb-r",style:{border:"none",borderBottom:"1px solid #000",height:"3pt",padding:0}})})]})}),t.jsx("table",{children:t.jsxs("tbody",{children:[t.jsx("tr",{children:t.jsx("td",{className:"nb-t nb-b",colSpan:4,style:{paddingBottom:"1pt"},children:t.jsx("span",{className:"lbl",style:{marginBottom:0},children:"10. Project Area (in square meters)"})})}),t.jsxs("tr",{children:[t.jsx("td",{className:"nb-t nb-l nb-r",style:{border:"none",width:"5%",fontSize:"6pt",paddingTop:"2pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Lot:"}),t.jsx("td",{className:"nb-t nb-l",style:{border:"none",borderBottom:"1px solid #000",width:"38%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:i(e.lot_area_sqm)||o}),t.jsx("td",{className:"nb",style:{border:"none",width:"14%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom",whiteSpace:"nowrap"},children:"Bldg. Improvement:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"43%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:i(e.bldg_improvement_sqm)||o})]}),t.jsx("tr",{children:t.jsx("td",{colSpan:4,className:"nb-t nb-l nb-r",style:{border:"none",borderBottom:"1px solid #000",height:"3pt",padding:0}})})]})}),t.jsxs("table",{children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"33%"}}),t.jsx("col",{style:{width:"67%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsxs("td",{className:"nb-t",style:{height:"26pt",verticalAlign:"top"},children:[t.jsx("span",{className:"lbl",children:"11. Right Over Land"}),t.jsxs("div",{style:{marginTop:"3pt"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:i(e.right_over_land).toLowerCase()==="owner"})," ","Owner"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:i(e.right_over_land).toLowerCase()==="lessee"})," ","Lessee"]})]})]}),t.jsxs("td",{className:"nb-t nb-l",style:{height:"26pt",verticalAlign:"top"},children:[t.jsx("span",{className:"lbl",children:"12. Project Tenure"}),t.jsxs("div",{style:{marginTop:"3pt"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:i(e.project_nature_duration).toLowerCase()==="permanent"})," ","Permanent"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:i(e.project_nature_duration).toLowerCase()==="temporary"})," ","Temporary"," (Specify Years: ",t.jsx(r,{val:e.project_nature_years,w:"28pt"}),")"]})]})]})]})})]}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{children:t.jsxs("td",{className:"nb-t",style:{paddingBottom:"4pt"},children:[t.jsx("span",{className:"lbl",children:"13. Existing Land Uses of Project Site"}),t.jsxs("div",{style:{marginTop:"3pt",display:"flex",flexWrap:"nowrap",gap:"0 4pt",alignItems:"center"},children:[[["Residential","residential"],["Institutional","institutional"],["Commercial","commercial"],["Industrial","industrial"],["Vacant","vacant"]].map(([j,m])=>t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:c===m})," ",j]},m)),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:c==="agricultural"})," Agricultural"," (Specify crop: ",t.jsx(r,{val:c==="agricultural"?i(e.existing_land_use_crop):"",w:"40pt"}),")"]})]}),t.jsxs("div",{style:{marginTop:"3pt",display:"flex",gap:"0 4pt",alignItems:"center"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:c==="tenant"})," Tenant"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:c==="not tenanted"})," Not Tenanted"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:S})," Others"," (Specify: ",t.jsx(r,{val:S?i(e.existing_land_use):"",w:"70pt"}),")"]})]})]})})})}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{children:t.jsxs("td",{className:"nb-t",style:{padding:"3pt 4pt"},children:[t.jsx("span",{className:"lbl",children:"14. Project Cost / Capitalization (in pesos, write in words and figure)"}),t.jsxs("div",{style:{marginTop:"2pt",display:"flex",alignItems:"baseline",gap:"6pt"},children:[t.jsx("span",{style:{fontSize:"9pt",fontWeight:700},children:l||o}),p&&t.jsxs("span",{style:{fontSize:"6.5pt",fontStyle:"italic",color:"#333"},children:["(",p,")"]})]})]})})})}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{children:t.jsxs("td",{className:"nb-t",style:{paddingBottom:"4pt"},children:[t.jsx("p",{className:"q",children:"15. IS THE PROJECT APPLIED FOR THE SUBJECT OF WRITTEN NOTICE(S) FROM THIS OFFICE AND/OR ITS ZONING ADMINISTRATOR TO THE EFFECT REQUIRING FOR PRESENTATION OF LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE (LC/CZC) OR TO APPLY FOR LC/CZC?"}),t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:i(e.has_written_notice).toLowerCase()==="yes"})," Yes"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:i(e.has_written_notice).toLowerCase()!=="yes"})," No"]})]}),t.jsxs("div",{className:"sq",children:[t.jsx("span",{className:"sq-lbl",children:"15.a Name of HSRO Officer or Zoning Administrator who issued the notice(s):"}),t.jsx("span",{className:"sq-line",children:i(e.notice_officer_name)||o})]}),t.jsxs("div",{className:"sq",style:{marginTop:"4pt"},children:[t.jsx("span",{className:"sq-lbl",children:"15.b Date(s) of notice(s):"}),t.jsx("span",{className:"sq-line",children:i(e.notice_dates)||o})]})]})})})}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{children:t.jsxs("td",{style:{paddingBottom:"3pt",paddingTop:"2pt"},children:[t.jsxs("div",{style:{fontSize:"6.5pt",lineHeight:"1.5"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"16. IS THE PROJECT APPLIED FOR THE SUBJECT OF SIMILAR APPLICATION(S) WITH OTHER OFFICES OF THE COMMISSION AND/OR DEPUTIZED ZONING ADMINISTRATOR?"})," ",t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:i(e.has_similar_application).toLowerCase()==="yes"})," Yes"]})," ",t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:i(e.has_similar_application).toLowerCase()!=="yes"})," No"]})," ",t.jsx("span",{style:{fontSize:"6.5pt"},children:"If yes, please answer the following:"})]}),t.jsxs("div",{style:{marginTop:"3pt",fontSize:"6.5pt"},children:["16. a) other HSRC office(s) where similar application(s) was/were filed: ",t.jsx("span",{style:{display:"inline-block",width:"160pt",borderBottom:"1px solid #000",verticalAlign:"bottom",fontSize:"7.5pt"},children:i(e.similar_application_offices)||" "})]}),t.jsxs("div",{style:{marginTop:"3pt",fontSize:"6.5pt"},children:["16. b) Date(s) filed: ",t.jsx("span",{style:{display:"inline-block",width:"200pt",borderBottom:"1px solid #000",verticalAlign:"bottom",fontSize:"7.5pt"},children:i(e.similar_application_dates)||" "})]})]})})})}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{children:t.jsxs("td",{style:{paddingBottom:"3pt",paddingTop:"2pt"},children:[t.jsx("div",{style:{fontSize:"6.5pt",fontWeight:"bold",marginBottom:"3pt",marginTop:"5px"},children:"17. PREFERRED MODE OF RELEASE OF DECISION"}),t.jsxs("div",{style:{fontSize:"7.5pt",display:"flex",gap:"0 8pt",alignItems:"center",flexWrap:"wrap"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:h==="pickup"||h==="pick-up"||h==="pick_up"})," pick-up"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:h.includes("mail")})," By mail, address to"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:h==="mail_applicant"})," Applicant"]}),t.jsxs("span",{className:"opt",children:[t.jsx(s,{on:h==="mail_representative"})," Authorized Representative"]})]})]})})})}),t.jsxs("table",{style:{marginBottom:"-2pt",marginTop:"5px"},children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"50%"}}),t.jsx("col",{style:{width:"50%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{style:{padding:"0",border:"none"},children:t.jsx("div",{style:{fontSize:"6.5pt",fontWeight:"bold",marginBottom:"0"},children:"18. SIGNATURE OF APPLICANT"})}),t.jsx("td",{style:{padding:"0",border:"none"},children:t.jsx("div",{style:{fontSize:"6.5pt",fontWeight:"bold",marginBottom:"0"},children:"SIGNATURE OF AUTHORIZED REPRESENTATIVE"})})]})})]}),t.jsxs("div",{style:{marginTop:"0",fontSize:"6.5pt",lineHeight:"1",paddingTop:"8pt",paddingBottom:"8pt"},children:[t.jsx("div",{style:{display:"flex",alignItems:"flex-start",marginBottom:"0"},children:t.jsxs("div",{style:{flex:1,fontSize:"7pt",lineHeight:"1"},children:[t.jsx("div",{style:{fontWeight:"bold",marginBottom:"2pt"},children:"Republic of the Philippines"}),t.jsxs("div",{style:{marginBottom:"0"},children:[t.jsx("span",{style:{display:"inline-block",width:"140pt",borderBottom:"1px solid #000",verticalAlign:"bottom"},children:" "}),")S.S"]})]})}),t.jsxs("div",{style:{marginTop:"4pt",width:"100%"},children:[t.jsxs("div",{style:{marginBottom:"2pt"},children:["SUBSCRIBED AND SWORN TO before me this ",t.jsx(r,{w:"30pt",pl:"8pt",pr:"8pt"})," day of ",t.jsx(r,{w:"80pt",pl:"8pt",pr:"8pt"}),"  20",t.jsx(r,{w:"20pt",pl:"8pt",pr:"8pt"}),"  in the city of Ilagan,"]}),t.jsxs("div",{style:{marginBottom:"2pt"},children:["Province of Isabela affiant exhibit me his/her Residence Certificate No. ",t.jsx(r,{w:"80pt",pl:"8pt",pr:"8pt"})," issued"]}),t.jsxs("div",{children:["at ",t.jsx(r,{w:"100pt",pl:"8pt",pr:"8pt"}),"  on ",t.jsx(r,{w:"80pt",pl:"8pt",pr:"8pt"}),"  20",t.jsx(r,{w:"24pt",pl:"8pt",pr:"8pt"})," ."]})]})]}),t.jsxs("div",{style:{marginTop:"60pt",marginBottom:"30pt",display:"flex",justifyContent:"space-between",alignItems:"flex-end"},children:[t.jsxs("div",{style:{fontSize:"6.5pt",lineHeight:"2.1"},children:[t.jsxs("div",{children:["Doc. No. ",t.jsx(r,{w:"50pt"}),"    Page No. ",t.jsx(r,{w:"50pt"})]}),t.jsxs("div",{children:["Book No. ",t.jsx(r,{w:"50pt"}),"    Series of ",t.jsx(r,{w:"50pt"})]})]}),t.jsx("div",{style:{textAlign:"center",minWidth:"140pt"},children:t.jsx("div",{style:{borderTop:"1.5px solid #000",paddingTop:"3pt",fontSize:"8pt",fontWeight:"bold",textAlign:"center",textTransform:"uppercase",letterSpacing:"0.06em"},children:"Notary Public"})})]}),t.jsx("div",{className:"pf-pageno",children:"1/1"})]}),t.jsxs("div",{className:"pf-page",style:{pageBreakBefore:"always",padding:"40pt 60pt"},children:[t.jsxs("div",{style:{marginBottom:"20pt"},children:[t.jsx("div",{style:{fontSize:"9pt",marginBottom:"15pt",color:"#555",textAlign:"left"},children:"ANNEX B of HLURB memorandum Circular No. 03 series of 1998"}),t.jsxs("div",{style:{fontSize:"11pt",fontWeight:"bold",textTransform:"uppercase",textAlign:"center"},children:["APPLICATION REQUIREMENTS FOR LOCATIONAL CLEARANCE/",t.jsx("br",{}),"CERTIFICATE OF ZONING COMPLIANCE"]})]}),t.jsxs("div",{style:{fontSize:"9pt",lineHeight:"1.6",textAlign:"justify"},children:[t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"1."})," Duly accomplished and notarized ",t.jsx("strong",{children:"APPLICATION FORM"})]}),t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"2."})," Any of the following requirements relative to ",t.jsx("strong",{children:"RIGHT OVER LAND"}),t.jsxs("div",{style:{marginLeft:"20pt",marginTop:"6pt"},children:[t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"a."})," Photocopy of the Cert. of Title in case registered in the name of the applicant & latest Tax declaration."]}),t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"b."})," In the absence of any existing certification of title, in the name of the applicant, submit (1) certified true copy of the latest tax declaration and (2) pro forma affidavit (Annex C) to the effect that:",t.jsxs("div",{style:{marginLeft:"20pt",marginTop:"3pt",fontSize:"8.5pt"},children:[t.jsx("div",{children:"- the applicant is the owner of the property subject of the application."}),t.jsx("div",{children:"- The reason why the property is not yet titled"}),t.jsxs("div",{children:["- That the property is situated within alienable and ",t.jsx("em",{children:"disposable land outside land reserved for the public domain"})]}),t.jsx("div",{children:"- That the property is free for liens and encumbrance or stating the liens & encumbrances of the property."}),t.jsx("div",{children:"- That the property is/are not tenanted (in case the property is planted to rise and corn)"})]})]}),t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"c."})," In case the property is not registered in the name of the applicant, submit duly accomplished Deed of sale or deed of donation; or contract of lease or authorization to used land, which ever is applicable plus the photo copy of the owner's certificate of title in the absence of title, the tax declaration and pro-forma affidavit as describe in item b."]})]})]}),t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"3."})," ",t.jsx("strong",{children:"VICINITY MAP"})," showing the existing land uses within the prescribed radius from the lot boundary of the project site.",t.jsxs("div",{style:{marginLeft:"20pt",marginTop:"6pt"},children:[t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"a."})," For projects of local significance, the vicinity should cover a minimum of 100 meters radius, and the map need not to be drawn to scale provided the relative distance of existing land uses to the project site lot boundaries are shown."]}),t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"b."})," For project of national significant, the vicinity should cover a minimum of one (1) kilometer radius and be drawn to scale."]})]})]}),t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"4."})," ",t.jsx("strong",{children:"SITE DEVELOPMENT PLAN"})," showing the project site, lot area boundaries & dimension of proposed improvements within the project site: the plan need not to be drawn to scale for the projects of local significance."]}),t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"5."})," ",t.jsx("strong",{children:"ESTIMATED PROJECT COST /BILL OF MATERIALS"})]}),t.jsx("div",{style:{marginTop:"18pt",marginBottom:"10pt",fontWeight:"bold",textDecoration:"underline"},children:"Additional requirements:"}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"1."})," For all projects to be situated in Tenanted Rice and/or Corn lands: Endorsement/recommendation from the Department of Agrarian Reform for the conversion into other uses."]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"2."})," For manufacturing projects ",t.jsx("strong",{children:"DESCRIPTION OF INDUSTRY"})," citing among others are as follows:",t.jsxs("div",{style:{marginLeft:"20pt",marginTop:"4pt",fontSize:"8.5pt"},children:[t.jsx("div",{children:"2.1 Type and volume of raw materials used"}),t.jsx("div",{children:"2.2 Products manufactured or stored"}),t.jsx("div",{children:"2.3 Average daily output/capacity per day/week/month"}),t.jsx("div",{children:"2.4 Industrial waste & plans for pollution control"}),t.jsx("div",{children:"2.5 Description of manufacturing processes"})]})]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"3."})," Description filled by authorized representative, ",t.jsx("strong",{children:"SWORN SPECIAL POWER OF ATTORNEY"})," for the Representative: to file/follow-up application."]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"4."})," ",t.jsx("strong",{children:"AFFIDAVIT OF NO OBJECTION"})]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"5."})," ",t.jsx("strong",{children:"ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC)/CERTIFICATE OF NON-COVERAGE(CNC)"})]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"6."})," Certification of road right-of-way from DPWH (if the project is located within the National Road)"]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"7."})," ",t.jsx("strong",{children:"Barangay clearance"})]})]}),t.jsx("div",{className:"pf-pageno",children:"2/2"})]})]})]})}function M(e,a){return e.replace("%03d",String(a).padStart(3,"0"))}export{gt as default};
