import{r as c,j as t}from"./app-BWrngswQ.js";import{z as g}from"./signerName-BRhPV7Ta.js";import{E as x}from"./ESignatureImage-BUXBr2TM.js";function f(a){const i=Math.round(Number(a)||0);if(i<=0)return"";const s=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],r=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],d=e=>{let o="";return e>=100&&(o+=s[Math.floor(e/100)]+" Hundred",e%=100,e&&(o+=" ")),e>=20?(o+=r[Math.floor(e/10)],e%=10,e&&(o+="-"+s[e])):e>0&&(o+=s[e]),o},h=[""," Thousand"," Million"," Billion"];let l="",p=0,n=i;for(;n>0;){const e=n%1e3;e&&(l=d(e)+h[p]+(l?" "+l:"")),n=Math.floor(n/1e3),p++}return`${l} Pesos`}function m({label:a,signatureUrl:i,name:s,title:r}){return t.jsxs("div",{children:[t.jsx("div",{style:{position:"relative",height:"30pt",display:"flex",alignItems:"flex-end",justifyContent:"center",width:"240pt"},children:t.jsx(x,{src:i,maxHeight:"30pt",maxWidth:"150pt",marginBottom:"-3pt"})}),t.jsxs("div",{style:{fontWeight:"bold"},children:[a,": ",s]}),t.jsx("div",{style:{marginTop:"3pt"},children:r})]})}const y=`
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
    
    @page {
        size: letter;
        margin: 0.5in;
    }
}
`,u=c.forwardRef(function({application:i,payment:s,reviewer:r,zoningAdministrator:d,paymentAmount:h=null,compact:l=!1},p){const n=s?.amount??h??i?.payment_amount??null,e=n!==null&&n!==""?`${f(n)} (₱ ${Number(n).toLocaleString("en-PH",{minimumFractionDigits:2})})`:"____________________________ (₱ __________)",o=i?.project_type||"N/A";return t.jsxs(t.Fragment,{children:[t.jsx("style",{dangerouslySetInnerHTML:{__html:y}}),t.jsxs("div",{ref:p,className:`payment-page${l?" payment-page--compact":""}`,style:{fontSize:"9pt",lineHeight:"1.4",pageBreakAfter:l?void 0:"always",pageBreakInside:"avoid"},children:[t.jsxs("div",{style:{position:"relative",marginBottom:"12pt",paddingTop:"15pt"},children:[t.jsx("div",{style:{position:"absolute",top:"0",right:"0",fontSize:"11pt",fontWeight:"bold",whiteSpace:"nowrap"},children:"CPD-002-0"}),t.jsxs("div",{style:{textAlign:"center"},children:[t.jsx("div",{style:{fontSize:"11pt",marginBottom:"1pt"},children:"Republic of the Philippines"}),t.jsx("div",{style:{fontSize:"12pt",fontWeight:"bold",marginBottom:"1pt"},children:"CITY OF ILAGAN"}),t.jsx("div",{style:{fontSize:"11pt",marginBottom:"1pt"},children:"Province of Isabela"}),t.jsx("div",{style:{fontSize:"11pt",fontWeight:"bold",marginBottom:"12pt"},children:"CITY PLANNING AND DEVELOPMENT OFFICE"}),t.jsx("div",{style:{fontSize:"13pt",fontWeight:"bold",marginTop:"8pt",display:"inline-block",backgroundColor:"#FFFF00",padding:"4pt 12pt"},children:"ORDER OF PAYMENT"})]})]}),t.jsx("div",{style:{borderTop:"2px solid #000",marginBottom:"12pt"}}),t.jsx("div",{style:{fontSize:"11pt",marginBottom:"12pt",fontWeight:"bold"},children:"TO CTO Cashier Special Collecting Officer"}),t.jsxs("div",{style:{fontSize:"11pt",lineHeight:"1.6"},children:[t.jsxs("div",{style:{marginBottom:"2pt"},children:[t.jsx("span",{children:"Please receive from "}),t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"400pt",fontWeight:"bold",textAlign:"center"},children:i?.applicant_name||"N/A"}),t.jsx("span",{children:" of"})]}),t.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:t.jsx("span",{children:"(Name of Applicant)"})}),t.jsxs("div",{style:{marginBottom:"2pt"},children:[t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"450pt",fontWeight:"bold",textAlign:"center"},children:i?.corporation_name||i?.applicant_address||"N/A"}),t.jsx("span",{children:" the sum of"})]}),t.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:t.jsx("span",{children:"(Name of Firm)"})}),t.jsx("div",{style:{marginBottom:"12pt"},children:t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"500pt",fontWeight:"bold",textAlign:"center"},children:e})}),t.jsxs("div",{style:{marginBottom:"6pt"},children:[t.jsx("span",{children:"as payment for "}),t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"350pt",fontWeight:"bold",textAlign:"center"},children:o}),t.jsx("span",{children:" fee(s) of"})]}),t.jsxs("div",{style:{marginBottom:"2pt"},children:[t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"400pt",fontWeight:"bold",textAlign:"center"},children:i?.project_nature||"N/A"}),t.jsx("span",{children:" located at"})]}),t.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:t.jsx("span",{children:"(Name and nature of Project)"})}),t.jsx("div",{style:{marginBottom:"20pt"},children:t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"500pt",fontWeight:"bold",textAlign:"center"},children:i?.project_location_barangay?`${i.project_location_barangay}, ${i.project_location_municipality||"Ilagan"}`:"N/A"})})]}),t.jsx("div",{style:{borderTop:"2px solid #000",marginBottom:"12pt"}}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10pt"},children:[t.jsx("div",{style:{width:"48%"},children:t.jsx(m,{label:"Prepared by",signatureUrl:r?.signature_url,name:(r?.name||"MARY JANE P. BULAUAN").toUpperCase(),title:"Zoning Officer IV"})}),t.jsx("div",{style:{width:"48%"},children:t.jsx(m,{label:"Approved",signatureUrl:d?.signature_url,name:g(d?.name),title:"OIC- CPDC/Zoning Administrator"})})]})]})]})});export{u as O};
