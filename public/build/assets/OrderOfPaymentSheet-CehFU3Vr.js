import{r as x,j as e}from"./app-DWXtLS_Z.js";import{p as m,z as y,a as f,D as j}from"./signerName-Cj2QQuF7.js";import{O as _,E as u}from"./ESignatureImage-DG_diWbl.js";function b(d){const i=Math.round(Number(d)||0);if(i<=0)return"";const o=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],s=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],a=t=>{let n="";return t>=100&&(n+=o[Math.floor(t/100)]+" Hundred",t%=100,t&&(n+=" ")),t>=20?(n+=s[Math.floor(t/10)],t%=10,t&&(n+="-"+o[t])):t>0&&(n+=o[t]),n},h=[""," Thousand"," Million"," Billion"];let r="",p=0,l=i;for(;l>0;){const t=l%1e3;t&&(r=a(t)+h[p]+(r?" "+r:"")),l=Math.floor(l/1e3),p++}return`${r} Pesos`}function c({label:d,signatureUrl:i,name:o,title:s}){return e.jsxs("div",{children:[e.jsx("div",{style:{position:"relative",height:"30pt",display:"flex",alignItems:"flex-end",justifyContent:"center",width:"240pt"},children:e.jsx(u,{src:i,maxHeight:"30pt",maxWidth:"150pt",marginBottom:"-3pt"})}),e.jsxs("div",{style:{fontWeight:"bold"},children:[d,": ",o]}),e.jsx("div",{style:{marginTop:"3pt"},children:s})]})}const v=`
.payment-page {
    width: 8.5in;
    min-height: 11in;
    margin: 0 auto;
    background: white;
    position: relative;
    font-family: 'Times New Roman', serif;
    padding: 0.75in 0.75in 0.5in 0.75in;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* The slip only fills the top of a letter sheet. Where it is shown as a
   picture rather than printed, the blank lower half is just blank. */
.payment-page.payment-page--compact {
    min-height: 0;
    max-height: fit-content;
    padding-bottom: 0.4in;
    box-shadow: none;
}

.underline-fill {
    border-bottom: 1px solid #000;
    display: inline-block;
    min-width: 200pt;
    padding-bottom: 2pt;
}

@media print {
    .payment-page {
        box-shadow: none;
        page-break-after: avoid;
        page-break-inside: avoid;
        min-height: 0;
        max-height: 10.5in;
    }

    /* Printed inside the page margin, the sheet keeps its own inner margins
       only (see PrintDocumentStyles). */
    .payment-page.print-document {
        /* 0.5in page margin + 0.25in here = the 0.75in the screen sheet has,
           so the ruled fields keep the width they were sized for. */
        padding: 0.25in !important;
        min-height: 0 !important;
        height: auto !important;
    }

    @page {
        size: letter;
        margin: 0.5in;
    }
}
`,B=x.forwardRef(function({application:i,payment:o,reviewer:s,zoningAdministrator:a,paymentAmount:h=null,compact:r=!1,className:p=""},l){const t=o?.amount??h??i?.payment_amount??null,n=t!==null&&t!==""?`${b(t)} (₱ ${Number(t).toLocaleString("en-PH",{minimumFractionDigits:2})})`:"____________________________ (₱ __________)",g=i?.project_type||"N/A";return e.jsxs(e.Fragment,{children:[e.jsx("style",{dangerouslySetInnerHTML:{__html:v}}),e.jsxs("div",{ref:l,className:`payment-page${r?" payment-page--compact":""} ${p}`.trim(),style:{fontSize:"9pt",lineHeight:"1.4",pageBreakAfter:r?void 0:"always",pageBreakInside:"avoid"},children:[e.jsx(_,{code:"CPD-002-0"}),e.jsx("div",{style:{textAlign:"center",margin:"18pt 0 14pt"},children:e.jsx("span",{style:{fontSize:"13pt",fontWeight:"bold",display:"inline-block",backgroundColor:"#FFFF00",padding:"4pt 12pt",WebkitPrintColorAdjust:"exact",printColorAdjust:"exact"},children:"ORDER OF PAYMENT"})}),e.jsx("div",{style:{fontSize:"11pt",marginBottom:"12pt",fontWeight:"bold"},children:"TO CTO Cashier Special Collecting Officer"}),e.jsxs("div",{style:{fontSize:"11pt",lineHeight:"1.6"},children:[e.jsxs("div",{style:{marginBottom:"2pt"},children:[e.jsx("span",{children:"Please receive from "}),e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"400pt",fontWeight:"bold",textAlign:"center"},children:i?.applicant_name||"N/A"}),e.jsx("span",{children:" of"})]}),e.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:e.jsx("span",{children:"(Name of Applicant)"})}),e.jsxs("div",{style:{marginBottom:"2pt"},children:[e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"450pt",fontWeight:"bold",textAlign:"center"},children:i?.corporation_name||i?.applicant_address||"N/A"}),e.jsx("span",{children:" the sum of"})]}),e.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:e.jsx("span",{children:"(Name of Firm)"})}),e.jsx("div",{style:{marginBottom:"12pt"},children:e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"500pt",fontWeight:"bold",textAlign:"center"},children:n})}),e.jsxs("div",{style:{marginBottom:"6pt"},children:[e.jsx("span",{children:"as payment for "}),e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"350pt",fontWeight:"bold",textAlign:"center"},children:g}),e.jsx("span",{children:" fee(s) of"})]}),e.jsxs("div",{style:{marginBottom:"2pt"},children:[e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"400pt",fontWeight:"bold",textAlign:"center"},children:i?.project_nature||"N/A"}),e.jsx("span",{children:" located at"})]}),e.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:e.jsx("span",{children:"(Name and nature of Project)"})}),e.jsx("div",{style:{marginBottom:"20pt"},children:e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"500pt",fontWeight:"bold",textAlign:"center"},children:i?.project_location_barangay?`${i.project_location_barangay}, ${i.project_location_municipality||"Ilagan"}`:"N/A"})})]}),e.jsx("div",{style:{borderTop:"2px solid #000",marginBottom:"12pt"}}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10pt"},children:[e.jsx("div",{style:{width:"48%"},children:e.jsx(c,{label:"Prepared by",signatureUrl:s?.signature_url,name:(s?.name||"MARY JANE P. BULAUAN").toUpperCase(),title:m(s,f).join(" / ")})}),e.jsx("div",{style:{width:"48%"},children:e.jsx(c,{label:"Approved",signatureUrl:a?.signature_url,name:y(a?.name),title:m(a,j).join(" / ")})})]})]})]})});export{B as O};
