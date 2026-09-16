import{r as c,j as e}from"./app-BdSpxtFv.js";import{z as g,E as x}from"./signerName-B_Y8NXuk.js";function f(a){const i=Math.round(Number(a)||0);if(i<=0)return"";const s=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],r=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],d=t=>{let o="";return t>=100&&(o+=s[Math.floor(t/100)]+" Hundred",t%=100,t&&(o+=" ")),t>=20?(o+=r[Math.floor(t/10)],t%=10,t&&(o+="-"+s[t])):t>0&&(o+=s[t]),o},h=[""," Thousand"," Million"," Billion"];let l="",p=0,n=i;for(;n>0;){const t=n%1e3;t&&(l=d(t)+h[p]+(l?" "+l:"")),n=Math.floor(n/1e3),p++}return`${l} Pesos`}function m({label:a,signatureUrl:i,name:s,title:r}){return e.jsxs("div",{children:[e.jsx("div",{style:{position:"relative",height:"30pt",display:"flex",alignItems:"flex-end",justifyContent:"center",width:"240pt"},children:e.jsx(x,{src:i,maxHeight:"30pt",maxWidth:"150pt",marginBottom:"-3pt"})}),e.jsxs("div",{style:{fontWeight:"bold"},children:[a,": ",s]}),e.jsx("div",{style:{marginTop:"3pt"},children:r})]})}const y=`
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
`,b=c.forwardRef(function({application:i,payment:s,reviewer:r,zoningAdministrator:d,paymentAmount:h=null,compact:l=!1},p){const n=s?.amount??h??i?.payment_amount??null,t=n!==null&&n!==""?`${f(n)} (₱ ${Number(n).toLocaleString("en-PH",{minimumFractionDigits:2})})`:"____________________________ (₱ __________)",o=i?.project_type||"N/A";return e.jsxs(e.Fragment,{children:[e.jsx("style",{dangerouslySetInnerHTML:{__html:y}}),e.jsxs("div",{ref:p,className:`payment-page${l?" payment-page--compact":""}`,style:{fontSize:"9pt",lineHeight:"1.4",pageBreakAfter:l?void 0:"always",pageBreakInside:"avoid"},children:[e.jsxs("div",{style:{position:"relative",marginBottom:"12pt",paddingTop:"15pt"},children:[e.jsx("div",{style:{position:"absolute",top:"0",right:"0",fontSize:"11pt",fontWeight:"bold",whiteSpace:"nowrap"},children:"CPD-002-0"}),e.jsxs("div",{style:{textAlign:"center"},children:[e.jsx("div",{style:{fontSize:"11pt",marginBottom:"1pt"},children:"Republic of the Philippines"}),e.jsx("div",{style:{fontSize:"12pt",fontWeight:"bold",marginBottom:"1pt"},children:"CITY OF ILAGAN"}),e.jsx("div",{style:{fontSize:"11pt",marginBottom:"1pt"},children:"Province of Isabela"}),e.jsx("div",{style:{fontSize:"11pt",fontWeight:"bold",marginBottom:"12pt"},children:"CITY PLANNING AND DEVELOPMENT OFFICE"}),e.jsx("div",{style:{fontSize:"13pt",fontWeight:"bold",marginTop:"8pt",display:"inline-block",backgroundColor:"#FFFF00",padding:"4pt 12pt"},children:"ORDER OF PAYMENT"})]})]}),e.jsx("div",{style:{borderTop:"2px solid #000",marginBottom:"12pt"}}),e.jsx("div",{style:{fontSize:"11pt",marginBottom:"12pt",fontWeight:"bold"},children:"TO CTO Cashier Special Collecting Officer"}),e.jsxs("div",{style:{fontSize:"11pt",lineHeight:"1.6"},children:[e.jsxs("div",{style:{marginBottom:"2pt"},children:[e.jsx("span",{children:"Please receive from "}),e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"400pt",fontWeight:"bold",textAlign:"center"},children:i?.applicant_name||"N/A"}),e.jsx("span",{children:" of"})]}),e.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:e.jsx("span",{children:"(Name of Applicant)"})}),e.jsxs("div",{style:{marginBottom:"2pt"},children:[e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"450pt",fontWeight:"bold",textAlign:"center"},children:i?.corporation_name||i?.applicant_address||"N/A"}),e.jsx("span",{children:" the sum of"})]}),e.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:e.jsx("span",{children:"(Name of Firm)"})}),e.jsx("div",{style:{marginBottom:"12pt"},children:e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"500pt",fontWeight:"bold",textAlign:"center"},children:t})}),e.jsxs("div",{style:{marginBottom:"6pt"},children:[e.jsx("span",{children:"as payment for "}),e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"350pt",fontWeight:"bold",textAlign:"center"},children:o}),e.jsx("span",{children:" fee(s) of"})]}),e.jsxs("div",{style:{marginBottom:"2pt"},children:[e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"400pt",fontWeight:"bold",textAlign:"center"},children:i?.project_nature||"N/A"}),e.jsx("span",{children:" located at"})]}),e.jsx("div",{style:{marginBottom:"6pt",textAlign:"center",fontSize:"9pt"},children:e.jsx("span",{children:"(Name and nature of Project)"})}),e.jsx("div",{style:{marginBottom:"20pt"},children:e.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"500pt",fontWeight:"bold",textAlign:"center"},children:i?.project_location_barangay?`${i.project_location_barangay}, ${i.project_location_municipality||"Ilagan"}`:"N/A"})})]}),e.jsx("div",{style:{borderTop:"2px solid #000",marginBottom:"12pt"}}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:"10pt"},children:[e.jsx("div",{style:{width:"48%"},children:e.jsx(m,{label:"Prepared by",signatureUrl:r?.signature_url,name:(r?.name||"MARY JANE P. BULAUAN").toUpperCase(),title:"Zoning Officer IV"})}),e.jsx("div",{style:{width:"48%"},children:e.jsx(m,{label:"Approved",signatureUrl:d?.signature_url,name:g(d?.name),title:"OIC- CPDC/Zoning Administrator"})})]})]})]})});export{b as O};
