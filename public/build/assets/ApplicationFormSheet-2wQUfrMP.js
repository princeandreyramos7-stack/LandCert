import{j as t}from"./app-CeiNOjmH.js";const S="CPD-001-0",s=e=>e!=null&&String(e).trim()!==""?String(e).trim():"",r=" ",i=({on:e})=>t.jsx("span",{style:{fontSize:"9pt",lineHeight:1},children:e?"☑":"☐"}),l=({val:e,w:a="80pt",inline:p=!1,pl:o="2pt",pr:c="2pt"})=>t.jsx("span",{style:{display:"inline-block",width:a,borderBottom:"1px solid #000",verticalAlign:"bottom",fontSize:"8pt",lineHeight:"1.4",paddingBottom:"3pt",paddingLeft:o,paddingRight:c},children:s(e)||r});function E(e){if(!e||isNaN(parseFloat(e)))return"";const a=["","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN","ELEVEN","TWELVE","THIRTEEN","FOURTEEN","FIFTEEN","SIXTEEN","SEVENTEEN","EIGHTEEN","NINETEEN"],p=["","","TWENTY","THIRTY","FORTY","FIFTY","SIXTY","SEVENTY","EIGHTY","NINETY"];function o(n){return n<20?a[n]:n<100?p[Math.floor(n/10)]+(n%10?"-"+a[n%10]:""):n<1e3?a[Math.floor(n/100)]+" HUNDRED"+(n%100?" "+o(n%100):""):n<1e6?o(Math.floor(n/1e3))+" THOUSAND"+(n%1e3?" "+o(n%1e3):""):n<1e9?o(Math.floor(n/1e6))+" MILLION"+(n%1e6?" "+o(n%1e6):""):o(Math.floor(n/1e9))+" BILLION"+(n%1e9?" "+o(n%1e9):"")}const c=Math.floor(parseFloat(e)),m=Math.round((parseFloat(e)-c)*100);return o(c)+" PESOS"+(m?" AND "+o(m)+"/100":"")}function I(e,a){return e.replace("%03d",String(a).padStart(3,"0"))}const A=`
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

/* ── row rule ──
   The paper form rules a line under each numbered group: 1-2, 3-4, 5-6, 7-8,
   11-12, then 13, 14, 15, 16, 17 and 18 one to a row. 9 and 10 are not listed
   here because they are stacked blocks that already close with their own rule.

   Applied to the group's last <tr> rather than to every cell, so a group that
   spans several cells still gets one unbroken line across the sheet. */
.pf-page tr.pf-rule > td {
    border-bottom: 1px solid #000 !important;
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
.pf-page .lbl {
    display: block;
    font-size: 7pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #222;
    margin-bottom: 2pt;
}
/* ── cell value ── */
.pf-page .val {
    display: block;
    font-size: 8pt;
    font-weight: normal;
    min-height: 11pt;
}

/* ── section bar (grey header) ── */
.pf-page .sec-bar {
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
.pf-page .q {
    font-size: 6.5pt;
    font-weight: bold;
    line-height: 1.45;
    margin-bottom: 3pt;
}

/* ── sub-question line ── */
.pf-page .sq {
    display: flex;
    align-items: flex-end;
    gap: 4pt;
    margin-top: 3pt;
    font-size: 6.5pt;
}
.pf-page .sq-lbl { white-space: nowrap; }
.pf-page .sq-line {
    flex: 1;
    border-bottom: 1px solid #000;
    font-size: 7.5pt;
    padding-bottom: 0;
    min-width: 30pt;
    line-height: 1.3;
}

/* ── page number footer ── */
.pf-page .pf-pageno {
    text-align: right;
    font-size: 7pt;
    font-weight: bold;
    margin-top: 8pt;
}

/* ── certification text ── */
.pf-page .cert-text {
    font-size: 6.5pt;
    line-height: 1.55;
    text-align: justify;
}


/* As a picture inside another document: no border, shadow or gap between
   the two sheets, and each only as tall as its content. */
.pf-page.sheet--compact {
    min-height: 0;
    margin: 0 auto;
    border: none;
    box-shadow: none;
}
`;function R({application:e,compact:a=!1,wrap:p=o=>o}){const o=parseFloat(e.project_cost)||0,c=o?"₱"+o.toLocaleString("en-PH",{minimumFractionDigits:2}):"",m=o?E(o):"";s(e.application_number)||I("TPZ-%s-%04d",new Date().toISOString().slice(5,7)+"-"+new Date().toISOString().slice(2,4),e.id),s(e.decision_number)||""+new Date().toISOString().slice(5,7)+new Date().toISOString().slice(2,4);const n=S,g=s(e.project_nature),x=g.toLowerCase().replace(/\.$/,""),j=x==="new const"||x==="new construction",f=x==="improvement",b=!!g&&!j&&!f,d=s(e.existing_land_use).toLowerCase(),y=d&&!["residential","institutional","commercial","industrial","vacant","agricultural","tenant","not tenanted"].includes(d),h=s(e.preferred_release_mode).toLowerCase(),N=a?"pf-page sheet--compact":"pf-page",v=t.jsxs("div",{className:N,children:[t.jsxs("table",{style:{marginBottom:0,borderCollapse:"collapse"},children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"28%"}}),t.jsx("col",{style:{width:"48%"}}),t.jsx("col",{style:{width:"24%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{children:[t.jsx("td",{style:{border:"none",padding:"2pt 4pt 2pt 2pt",verticalAlign:"top"},children:t.jsxs("div",{style:{fontSize:"7.5pt",lineHeight:"2.0"},children:[t.jsx("div",{children:"Application No.:"}),t.jsx("div",{children:"Date Receipt:"}),t.jsx("div",{children:"O.R. No.:"}),t.jsx("div",{children:"Date Issued:"}),t.jsx("div",{children:"Amount Paid:"})]})}),t.jsxs("td",{style:{border:"none",padding:"2pt 8pt",verticalAlign:"top",textAlign:"center"},children:[t.jsx("div",{style:{fontSize:"11pt",fontWeight:"bold",textTransform:"uppercase",letterSpacing:"0.03em",lineHeight:1,marginBottom:"8pt",textAlign:"center",backgroundColor:"#FFFF00",padding:"4pt 8pt",display:"inline-block",minWidth:"100%",width:"auto",boxSizing:"border-box",whiteSpace:"nowrap"},children:"City Planning and Development Office"}),t.jsx("div",{style:{borderBottom:"1px solid #000",marginBottom:"6pt",minHeight:"13pt",fontSize:"8pt"},children:" "}),t.jsx("div",{style:{borderBottom:"1px solid #000",marginBottom:"4pt",minHeight:"13pt",fontSize:"8pt"},children:" "}),t.jsx("div",{style:{fontSize:"6.5pt",fontStyle:"italic",color:"#333",textAlign:"center"},children:"(Office and Address)"})]}),t.jsx("td",{style:{border:"none",padding:"2pt 0 0 0",verticalAlign:"top",textAlign:"right"},children:t.jsx("div",{style:{fontSize:"8pt",fontWeight:"bold"},children:n})})]})})]}),t.jsx("div",{style:{borderTop:"1px solid #000",marginTop:"6pt",marginBottom:0}}),t.jsx("table",{className:"form-table",children:t.jsx("tbody",{children:t.jsx("tr",{className:"pf-rule",children:t.jsx("td",{style:{textAlign:"center",fontWeight:"bold",fontSize:"9pt",textTransform:"uppercase",padding:"4pt 6pt",letterSpacing:"0.03em",borderTop:"none"},children:"Application for Locational Clearance / Certificate of Zoning Compliance"})})})}),t.jsxs("table",{children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"50%"}}),t.jsx("col",{style:{width:"50%"}})]}),t.jsxs("tbody",{children:[t.jsxs("tr",{className:"pf-rule",children:[t.jsxs("td",{className:"nb-t",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"1. Name of Applicant"}),t.jsx("span",{className:"val",children:s(e.applicant_name)||r})]}),t.jsxs("td",{className:"nb-t nb-l",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"2. Name of Corporation (if applicable)"}),t.jsx("span",{className:"val",children:s(e.corporation_name)||r})]})]}),t.jsxs("tr",{className:"pf-rule",children:[t.jsxs("td",{style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"3. Address of Applicant"}),t.jsx("span",{className:"val",children:s(e.applicant_address)||r})]}),t.jsxs("td",{className:"nb-l",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"4. Address of Corporation"}),t.jsx("span",{className:"val",children:s(e.corporation_address)||r})]})]}),t.jsxs("tr",{className:"pf-rule",children:[t.jsxs("td",{style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"5. Name of Authorized Representative (if applicable)"}),t.jsx("span",{className:"val",children:s(e.representative_name)||r})]}),t.jsxs("td",{className:"nb-l",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"6. Address of Authorized Representative"}),t.jsx("span",{className:"val",children:s(e.representative_address)||r})]})]})]})]}),t.jsxs("table",{children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"36%"}}),t.jsx("col",{style:{width:"64%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{className:"pf-rule",children:[t.jsxs("td",{className:"nb-t",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"7. Project Type"}),t.jsx("span",{className:"val",children:s(e.project_type)||r})]}),t.jsxs("td",{className:"nb-t nb-l",style:{height:"22pt"},children:[t.jsx("span",{className:"lbl",children:"8. Project Nature"}),t.jsxs("div",{style:{marginTop:"3pt"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:j})," ","New Const."]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:f})," ","Improvement"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:b})," ","Others:"," ",t.jsx(l,{val:b?e.project_nature:"",w:"60pt"})]})]})]})]})})]}),t.jsx("table",{children:t.jsxs("tbody",{children:[t.jsx("tr",{children:t.jsx("td",{className:"nb-t nb-b",colSpan:12,style:{paddingBottom:"1pt"},children:t.jsx("span",{className:"lbl",style:{marginBottom:0},children:"9. Project Location"})})}),t.jsxs("tr",{children:[t.jsx("td",{className:"nb-t nb-l nb-r",style:{border:"none",width:"5%",fontSize:"6pt",paddingTop:"2pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"No./Blk:"}),t.jsx("td",{className:"nb-t nb-l",style:{border:"none",borderBottom:"1px solid #000",width:"9%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:s(e.location_number)||r}),t.jsx("td",{className:"nb",style:{border:"none",width:"4%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Street:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"16%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:s(e.location_street)||r}),t.jsx("td",{className:"nb",style:{border:"none",width:"4%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Purok:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"10%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:r}),t.jsx("td",{className:"nb",style:{border:"none",width:"4%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Brgy.:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"17%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:s(e.location_barangay)||r}),t.jsx("td",{className:"nb",style:{border:"none",width:"9%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom",whiteSpace:"nowrap"},children:"City/Mun.:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"13%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:s(e.location_city)||"City of Ilagan"}),t.jsx("td",{className:"nb",style:{border:"none",width:"5%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Prov.:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"4%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:s(e.location_province)||"Isabela"})]}),t.jsx("tr",{children:t.jsx("td",{colSpan:12,className:"nb-t nb-l nb-r",style:{border:"none",borderBottom:"1px solid #000",height:"3pt",padding:0}})})]})}),t.jsx("table",{children:t.jsxs("tbody",{children:[t.jsx("tr",{children:t.jsx("td",{className:"nb-t nb-b",colSpan:4,style:{paddingBottom:"1pt"},children:t.jsx("span",{className:"lbl",style:{marginBottom:0},children:"10. Project Area (in square meters)"})})}),t.jsxs("tr",{children:[t.jsx("td",{className:"nb-t nb-l nb-r",style:{border:"none",width:"5%",fontSize:"6pt",paddingTop:"2pt",paddingRight:"2pt",verticalAlign:"bottom"},children:"Lot:"}),t.jsx("td",{className:"nb-t nb-l",style:{border:"none",borderBottom:"1px solid #000",width:"38%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:s(e.lot_area_sqm)||r}),t.jsx("td",{className:"nb",style:{border:"none",width:"14%",fontSize:"6pt",paddingLeft:"5pt",paddingRight:"2pt",verticalAlign:"bottom",whiteSpace:"nowrap"},children:"Bldg. Improvement:"}),t.jsx("td",{style:{border:"none",borderBottom:"1px solid #000",width:"43%",fontSize:"8pt",verticalAlign:"bottom",paddingBottom:"3pt"},children:s(e.bldg_improvement_sqm)||r})]}),t.jsx("tr",{children:t.jsx("td",{colSpan:4,className:"nb-t nb-l nb-r",style:{border:"none",borderBottom:"1px solid #000",height:"3pt",padding:0}})})]})}),t.jsxs("table",{children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"33%"}}),t.jsx("col",{style:{width:"67%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{className:"pf-rule",children:[t.jsxs("td",{className:"nb-t",style:{height:"26pt",verticalAlign:"top"},children:[t.jsx("span",{className:"lbl",children:"11. Right Over Land"}),t.jsxs("div",{style:{marginTop:"3pt"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:s(e.right_over_land).toLowerCase()==="owner"})," ","Owner"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:s(e.right_over_land).toLowerCase()==="lessee"})," ","Lessee"]})]})]}),t.jsxs("td",{className:"nb-t nb-l",style:{height:"26pt",verticalAlign:"top"},children:[t.jsx("span",{className:"lbl",children:"12. Project Tenure"}),t.jsxs("div",{style:{marginTop:"3pt"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:s(e.project_nature_duration).toLowerCase()==="permanent"})," ","Permanent"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:s(e.project_nature_duration).toLowerCase()==="temporary"})," ","Temporary"," (Specify Years: ",t.jsx(l,{val:e.project_nature_years,w:"28pt"}),")"]})]})]})]})})]}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{className:"pf-rule",children:t.jsxs("td",{className:"nb-t",style:{paddingBottom:"4pt"},children:[t.jsx("span",{className:"lbl",children:"13. Existing Land Uses of Project Site"}),t.jsxs("div",{style:{marginTop:"3pt",display:"flex",flexWrap:"nowrap",gap:"0 4pt",alignItems:"center"},children:[[["Residential","residential"],["Institutional","institutional"],["Commercial","commercial"],["Industrial","industrial"],["Vacant","vacant"]].map(([T,u])=>t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:d===u})," ",T]},u)),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:d==="agricultural"})," Agricultural"," (Specify crop: ",t.jsx(l,{val:d==="agricultural"?s(e.existing_land_use_crop):"",w:"40pt"}),")"]})]}),t.jsxs("div",{style:{marginTop:"3pt",display:"flex",gap:"0 4pt",alignItems:"center"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:d==="tenant"})," Tenant"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:d==="not tenanted"})," Not Tenanted"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:y})," Others"," (Specify: ",t.jsx(l,{val:y?s(e.existing_land_use):"",w:"70pt"}),")"]})]})]})})})}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{className:"pf-rule",children:t.jsxs("td",{className:"nb-t",style:{padding:"3pt 4pt"},children:[t.jsx("span",{className:"lbl",children:"14. Project Cost / Capitalization (in pesos, write in words and figure)"}),t.jsxs("div",{style:{marginTop:"2pt",display:"flex",alignItems:"baseline",gap:"6pt"},children:[t.jsx("span",{style:{fontSize:"9pt",fontWeight:700},children:c||r}),m&&t.jsxs("span",{style:{fontSize:"6.5pt",fontStyle:"italic",color:"#333"},children:["(",m,")"]})]})]})})})}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{className:"pf-rule",children:t.jsxs("td",{className:"nb-t",style:{paddingBottom:"4pt"},children:[t.jsx("p",{className:"q",children:"15. IS THE PROJECT APPLIED FOR THE SUBJECT OF WRITTEN NOTICE(S) FROM THIS OFFICE AND/OR ITS ZONING ADMINISTRATOR TO THE EFFECT REQUIRING FOR PRESENTATION OF LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE (LC/CZC) OR TO APPLY FOR LC/CZC?"}),t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:s(e.has_written_notice).toLowerCase()==="yes"})," Yes"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:s(e.has_written_notice).toLowerCase()!=="yes"})," No"]})]}),t.jsxs("div",{className:"sq",children:[t.jsx("span",{className:"sq-lbl",children:"15.a Name of HSRO Officer or Zoning Administrator who issued the notice(s):"}),t.jsx("span",{className:"sq-line",children:s(e.notice_officer_name)||r})]}),t.jsxs("div",{className:"sq",style:{marginTop:"4pt"},children:[t.jsx("span",{className:"sq-lbl",children:"15.b Date(s) of notice(s):"}),t.jsx("span",{className:"sq-line",children:s(e.notice_dates)||r})]})]})})})}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{className:"pf-rule",children:t.jsxs("td",{style:{paddingBottom:"3pt",paddingTop:"2pt"},children:[t.jsxs("div",{style:{fontSize:"6.5pt",lineHeight:"1.5"},children:[t.jsx("span",{style:{fontWeight:"bold"},children:"16. IS THE PROJECT APPLIED FOR THE SUBJECT OF SIMILAR APPLICATION(S) WITH OTHER OFFICES OF THE COMMISSION AND/OR DEPUTIZED ZONING ADMINISTRATOR?"})," ",t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:s(e.has_similar_application).toLowerCase()==="yes"})," Yes"]})," ",t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:s(e.has_similar_application).toLowerCase()!=="yes"})," No"]})," ",t.jsx("span",{style:{fontSize:"6.5pt"},children:"If yes, please answer the following:"})]}),t.jsxs("div",{style:{marginTop:"3pt",fontSize:"6.5pt"},children:["16. a) other HSRC office(s) where similar application(s) was/were filed: ",t.jsx("span",{style:{display:"inline-block",width:"160pt",borderBottom:"1px solid #000",verticalAlign:"bottom",fontSize:"7.5pt"},children:s(e.similar_application_offices)||" "})]}),t.jsxs("div",{style:{marginTop:"3pt",fontSize:"6.5pt"},children:["16. b) Date(s) filed: ",t.jsx("span",{style:{display:"inline-block",width:"200pt",borderBottom:"1px solid #000",verticalAlign:"bottom",fontSize:"7.5pt"},children:s(e.similar_application_dates)||" "})]})]})})})}),t.jsx("table",{children:t.jsx("tbody",{children:t.jsx("tr",{className:"pf-rule",children:t.jsxs("td",{style:{paddingBottom:"3pt",paddingTop:"2pt"},children:[t.jsx("div",{style:{fontSize:"6.5pt",fontWeight:"bold",marginBottom:"3pt",marginTop:"5px"},children:"17. PREFERRED MODE OF RELEASE OF DECISION"}),t.jsxs("div",{style:{fontSize:"7.5pt",display:"flex",gap:"0 8pt",alignItems:"center",flexWrap:"wrap"},children:[t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:h==="pickup"||h==="pick-up"||h==="pick_up"})," pick-up"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:h.includes("mail")})," By mail, address to"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:h==="mail_applicant"})," Applicant"]}),t.jsxs("span",{className:"opt",children:[t.jsx(i,{on:h==="mail_representative"})," Authorized Representative"]})]})]})})})}),t.jsxs("table",{style:{marginBottom:"-2pt",marginTop:"5px"},children:[t.jsxs("colgroup",{children:[t.jsx("col",{style:{width:"50%"}}),t.jsx("col",{style:{width:"50%"}})]}),t.jsx("tbody",{children:t.jsxs("tr",{className:"pf-rule",children:[t.jsx("td",{style:{padding:"0",border:"none"},children:t.jsx("div",{style:{fontSize:"6.5pt",fontWeight:"bold",marginBottom:"0"},children:"18. SIGNATURE OF APPLICANT"})}),t.jsx("td",{style:{padding:"0",border:"none"},children:t.jsx("div",{style:{fontSize:"6.5pt",fontWeight:"bold",marginBottom:"0"},children:"SIGNATURE OF AUTHORIZED REPRESENTATIVE"})})]})})]}),t.jsxs("div",{style:{marginTop:"0",fontSize:"6.5pt",lineHeight:"1",paddingTop:"8pt",paddingBottom:"8pt"},children:[t.jsx("div",{style:{display:"flex",alignItems:"flex-start",marginBottom:"0"},children:t.jsxs("div",{style:{flex:1,fontSize:"7pt",lineHeight:"1"},children:[t.jsx("div",{style:{fontWeight:"bold",marginBottom:"2pt"},children:"Republic of the Philippines"}),t.jsxs("div",{style:{marginBottom:"0"},children:[t.jsx("span",{style:{display:"inline-block",width:"140pt",borderBottom:"1px solid #000",verticalAlign:"bottom"},children:" "}),")S.S"]})]})}),t.jsxs("div",{style:{marginTop:"4pt",width:"100%"},children:[t.jsxs("div",{style:{marginBottom:"2pt"},children:["SUBSCRIBED AND SWORN TO before me this ",t.jsx(l,{w:"30pt",pl:"8pt",pr:"8pt"})," day of ",t.jsx(l,{w:"80pt",pl:"8pt",pr:"8pt"}),"  20",t.jsx(l,{w:"20pt",pl:"8pt",pr:"8pt"}),"  in the city of Ilagan,"]}),t.jsxs("div",{style:{marginBottom:"2pt"},children:["Province of Isabela affiant exhibit me his/her Residence Certificate No. ",t.jsx(l,{w:"80pt",pl:"8pt",pr:"8pt"})," issued"]}),t.jsxs("div",{children:["at ",t.jsx(l,{w:"100pt",pl:"8pt",pr:"8pt"}),"  on ",t.jsx(l,{w:"80pt",pl:"8pt",pr:"8pt"}),"  20",t.jsx(l,{w:"24pt",pl:"8pt",pr:"8pt"})," ."]})]})]}),t.jsxs("div",{style:{marginTop:"60pt",marginBottom:"30pt",display:"flex",justifyContent:"space-between",alignItems:"flex-end"},children:[t.jsxs("div",{style:{fontSize:"6.5pt",lineHeight:"2.1"},children:[t.jsxs("div",{children:["Doc. No. ",t.jsx(l,{w:"50pt"}),"    Page No. ",t.jsx(l,{w:"50pt"})]}),t.jsxs("div",{children:["Book No. ",t.jsx(l,{w:"50pt"}),"    Series of ",t.jsx(l,{w:"50pt"})]})]}),t.jsx("div",{style:{textAlign:"center",minWidth:"140pt"},children:t.jsx("div",{style:{borderTop:"1.5px solid #000",paddingTop:"3pt",fontSize:"8pt",fontWeight:"bold",textAlign:"center",textTransform:"uppercase",letterSpacing:"0.06em"},children:"Notary Public"})})]}),t.jsx("div",{className:"pf-pageno",children:"1/1"})]}),w=t.jsxs("div",{className:N,style:{pageBreakBefore:"always",padding:"40pt 60pt"},children:[t.jsxs("div",{style:{marginBottom:"20pt"},children:[t.jsx("div",{style:{fontSize:"9pt",marginBottom:"15pt",color:"#555",textAlign:"left"},children:"ANNEX B of HLURB memorandum Circular No. 03 series of 1998"}),t.jsxs("div",{style:{fontSize:"11pt",fontWeight:"bold",textTransform:"uppercase",textAlign:"center"},children:["APPLICATION REQUIREMENTS FOR LOCATIONAL CLEARANCE/",t.jsx("br",{}),"CERTIFICATE OF ZONING COMPLIANCE"]})]}),t.jsxs("div",{style:{fontSize:"9pt",lineHeight:"1.6",textAlign:"justify"},children:[t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"1."})," Duly accomplished and notarized ",t.jsx("strong",{children:"APPLICATION FORM"})]}),t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"2."})," Any of the following requirements relative to ",t.jsx("strong",{children:"RIGHT OVER LAND"}),t.jsxs("div",{style:{marginLeft:"20pt",marginTop:"6pt"},children:[t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"a."})," Photocopy of the Cert. of Title in case registered in the name of the applicant & latest Tax declaration."]}),t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"b."})," In the absence of any existing certification of title, in the name of the applicant, submit (1) certified true copy of the latest tax declaration and (2) pro forma affidavit (Annex C) to the effect that:",t.jsxs("div",{style:{marginLeft:"20pt",marginTop:"3pt",fontSize:"8.5pt"},children:[t.jsx("div",{children:"- the applicant is the owner of the property subject of the application."}),t.jsx("div",{children:"- The reason why the property is not yet titled"}),t.jsxs("div",{children:["- That the property is situated within alienable and ",t.jsx("em",{children:"disposable land outside land reserved for the public domain"})]}),t.jsx("div",{children:"- That the property is free for liens and encumbrance or stating the liens & encumbrances of the property."}),t.jsx("div",{children:"- That the property is/are not tenanted (in case the property is planted to rise and corn)"})]})]}),t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"c."})," In case the property is not registered in the name of the applicant, submit duly accomplished Deed of sale or deed of donation; or contract of lease or authorization to used land, which ever is applicable plus the photo copy of the owner's certificate of title in the absence of title, the tax declaration and pro-forma affidavit as describe in item b."]})]})]}),t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"3."})," ",t.jsx("strong",{children:"VICINITY MAP"})," showing the existing land uses within the prescribed radius from the lot boundary of the project site.",t.jsxs("div",{style:{marginLeft:"20pt",marginTop:"6pt"},children:[t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"a."})," For projects of local significance, the vicinity should cover a minimum of 100 meters radius, and the map need not to be drawn to scale provided the relative distance of existing land uses to the project site lot boundaries are shown."]}),t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"b."})," For project of national significant, the vicinity should cover a minimum of one (1) kilometer radius and be drawn to scale."]})]})]}),t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"4."})," ",t.jsx("strong",{children:"SITE DEVELOPMENT PLAN"})," showing the project site, lot area boundaries & dimension of proposed improvements within the project site: the plan need not to be drawn to scale for the projects of local significance."]}),t.jsxs("div",{style:{marginBottom:"12pt"},children:[t.jsx("strong",{children:"5."})," ",t.jsx("strong",{children:"ESTIMATED PROJECT COST /BILL OF MATERIALS"})]}),t.jsx("div",{style:{marginTop:"18pt",marginBottom:"10pt",fontWeight:"bold",textDecoration:"underline"},children:"Additional requirements:"}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"1."})," For all projects to be situated in Tenanted Rice and/or Corn lands: Endorsement/recommendation from the Department of Agrarian Reform for the conversion into other uses."]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"2."})," For manufacturing projects ",t.jsx("strong",{children:"DESCRIPTION OF INDUSTRY"})," citing among others are as follows:",t.jsxs("div",{style:{marginLeft:"20pt",marginTop:"4pt",fontSize:"8.5pt"},children:[t.jsx("div",{children:"2.1 Type and volume of raw materials used"}),t.jsx("div",{children:"2.2 Products manufactured or stored"}),t.jsx("div",{children:"2.3 Average daily output/capacity per day/week/month"}),t.jsx("div",{children:"2.4 Industrial waste & plans for pollution control"}),t.jsx("div",{children:"2.5 Description of manufacturing processes"})]})]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"3."})," Description filled by authorized representative, ",t.jsx("strong",{children:"SWORN SPECIAL POWER OF ATTORNEY"})," for the Representative: to file/follow-up application."]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"4."})," ",t.jsx("strong",{children:"AFFIDAVIT OF NO OBJECTION"})]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"5."})," ",t.jsx("strong",{children:"ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC)/CERTIFICATE OF NON-COVERAGE(CNC)"})]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"6."})," Certification of road right-of-way from DPWH (if the project is located within the National Road)"]}),t.jsxs("div",{style:{marginBottom:"10pt"},children:[t.jsx("strong",{children:"7."})," ",t.jsx("strong",{children:"Barangay clearance"})]})]}),t.jsx("div",{className:"pf-pageno",children:"2/2"})]});return t.jsxs(t.Fragment,{children:[t.jsx("style",{dangerouslySetInnerHTML:{__html:A}}),p(v,"form"),p(w,"checklist")]})}export{R as A,S as F};
