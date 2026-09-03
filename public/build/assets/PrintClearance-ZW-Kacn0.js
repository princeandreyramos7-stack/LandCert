import{r,j as t,H as p}from"./app-CW4zZ6W-.js";import"./button-B25xraxH.js";import{h as m}from"./html2pdf-CUwsrNMD.js";import{z as g}from"./signerName-BRhPV7Ta.js";import{T as h}from"./TupClearanceLetter-BB5IXWIK.js";import{P as f}from"./printer-Cn1gn6q7.js";import{D as x}from"./download-C6kOPrXS.js";import"./index-RuO93evc.js";import"./loader-circle-BGLySMPb.js";import"./createLucideIcon-Do4IYUGr.js";import"./OfficialLetterhead-swktufob.js";import"./ESignatureImage-BttM-Qbk.js";function D({application:e,payment:n,reviewer:o}){const i=r.useRef(null),a=String(e.project_type||"").toUpperCase()==="TUP";r.useEffect(()=>{},[]);const s=()=>{window.print()},d=()=>{const l=i.current,c={margin:0,filename:`Clearance_${e.application_number||"Clearance"}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"avoid-all"}};m().set(c).from(l).save()};return t.jsxs(t.Fragment,{children:[t.jsx(p,{title:`Clearance - ${e.application_number}`}),t.jsx("style",{dangerouslySetInnerHTML:{__html:`
                body {
                    margin: 0;
                    padding: 0;
                    background: #f5f5f5;
                }

                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .clearance-print-area, .clearance-print-area * {
                        visibility: visible;
                    }
                    .clearance-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .clearance-header-bg {
                        background: linear-gradient(
                            180deg,
                            #ffffff 0%,
                            #eefdfd 8%,
                            #d9f9fa 25%,
                            #bff5f6 55%,
                            #a8eff1 100%
                        ) !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }

                .print-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .clearance-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    font-family: 'Times New Roman', serif;
                    padding: 10mm 15mm;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .clearance-header-bg {
                    background: linear-gradient(
                        180deg,
                        #ffffff 0%,
                        #eefdfd 8%,
                        #d9f9fa 25%,
                        #bff5f6 55%,
                        #a8eff1 100%
                    );
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    color-adjust: exact;
                }

                .action-buttons {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .action-buttons button {
                    margin: 0 10px;
                    padding: 10px 20px;
                    font-size: 14px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-print {
                    background: #d4a017;
                    color: white;
                }

                .btn-print:hover {
                    background: #b8910f;
                }

                .btn-download {
                    background: white;
                    color: #0d1f5c;
                    border: 1px solid #0d1f5c;
                }

                .btn-download:hover {
                    background: #f5f5f5;
                }
            `}}),t.jsxs("div",{className:"print-container",children:[t.jsxs("div",{className:"action-buttons no-print",children:[t.jsxs("button",{onClick:s,className:"btn-print",children:[t.jsx(f,{size:16}),"Print Clearance"]}),t.jsxs("button",{onClick:d,className:"btn-download",children:[t.jsx(x,{size:16}),"Download PDF"]})]}),t.jsx("div",{className:"clearance-print-area",children:a?t.jsx(h,{application:e,payment:n,zoningAdministrator:null,innerRef:i}):t.jsxs("div",{ref:i,className:"clearance-page",style:{fontSize:"10pt",lineHeight:"1.4"},children:[t.jsx("div",{className:"clearance-header-bg",style:{padding:"10pt 0",marginBottom:"10pt",borderBottom:"3px solid #2222ff"},children:t.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative"},children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"15pt",flex:1},children:[t.jsx("div",{style:{width:"80pt",height:"80pt",flexShrink:0},children:t.jsx("img",{src:"/images/ilagan1logo.jpg",alt:"Ilagan Logo",style:{width:"100%",height:"100%",objectFit:"contain"}})}),t.jsxs("div",{style:{textAlign:"left"},children:[t.jsx("div",{style:{fontSize:"10pt",marginBottom:"2pt"},children:"Republic of the Philippines"}),t.jsx("div",{style:{fontSize:"12pt",fontWeight:"bold"},children:"CITY OF ILAGAN"}),t.jsx("div",{style:{fontSize:"10pt"},children:"Province of Isabela"}),t.jsx("div",{style:{fontSize:"11pt",fontWeight:"bold",marginTop:"3pt"},children:"CITY PLANNING AND DEVELOPMENT OFFICE"})]})]}),t.jsx("div",{style:{position:"absolute",top:"0",right:"100pt",textAlign:"center"},children:t.jsx("div",{style:{fontSize:"10pt",fontWeight:"bold"},children:"CPD-001-0"})}),t.jsx("div",{style:{width:"80pt",height:"80pt",flexShrink:0},children:t.jsx("img",{src:"/images/Ilagan Logo2.png",alt:"CPDO Logo",style:{width:"100%",height:"100%",objectFit:"contain"}})})]})}),t.jsx("div",{style:{textAlign:"center",marginBottom:"15pt",fontSize:"11pt",fontWeight:"bold"},children:t.jsx("div",{style:{display:"inline-block",background:"#FFFF00",padding:"4pt 8pt"},children:"LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE"})}),t.jsxs("div",{style:{marginBottom:"15pt",fontSize:"9pt"},children:[t.jsxs("div",{style:{marginBottom:"8pt"},children:[t.jsx("strong",{children:"Application No.:"})," ",e.application_number||"N/A"]}),t.jsxs("div",{style:{marginBottom:"8pt"},children:[t.jsx("strong",{children:"Date Receipt:"})," ",e.created_at?new Date(e.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"N/A"]}),t.jsxs("div",{style:{marginBottom:"8pt"},children:[t.jsx("strong",{children:"O.R. No.:"})," ",n?.reference_number||"N/A"]}),t.jsxs("div",{style:{marginBottom:"8pt"},children:[t.jsx("strong",{children:"Date Issued:"})," ",e.updated_at?new Date(e.updated_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"N/A"]}),t.jsxs("div",{style:{marginBottom:"8pt"},children:[t.jsx("strong",{children:"Amount Paid:"})," ₱",n?.amount?Number(n.amount).toLocaleString("en-PH",{minimumFractionDigits:2}):"0.00"]})]}),t.jsxs("div",{style:{fontSize:"10pt",lineHeight:"1.8",textAlign:"justify",marginBottom:"20pt"},children:[t.jsxs("p",{style:{textIndent:"40pt",marginBottom:"12pt"},children:["This is to certify that the application for ",t.jsx("strong",{children:"Locational Clearance / Certificate of Zoning Compliance"})," filed by ",t.jsx("strong",{children:e.applicant_name||"N/A"}),e.corporation_name&&` representing ${e.corporation_name}`,", with address at ",t.jsx("strong",{children:e.applicant_address||"N/A"}),", for the proposed ",t.jsx("strong",{children:e.project_type||"project"})," to be located at ",t.jsxs("strong",{children:[e.project_location_barangay,", ",e.project_location_municipality||"City of Ilagan, Isabela"]}),", has been evaluated and found to be in conformity with the Comprehensive Zoning Ordinance and the Comprehensive Land Use Plan of the City of Ilagan."]}),t.jsxs("p",{style:{textIndent:"40pt",marginBottom:"12pt"},children:[t.jsx("strong",{children:"THIS CLEARANCE IS HEREBY GRANTED"})," subject to the following conditions:"]}),t.jsxs("div",{style:{marginLeft:"30pt",marginBottom:"12pt"},children:[t.jsx("div",{style:{marginBottom:"6pt"},children:"1. Compliance with all applicable national and local building codes, laws, and regulations;"}),t.jsx("div",{style:{marginBottom:"6pt"},children:"2. Securing necessary permits from concerned government agencies;"}),t.jsx("div",{style:{marginBottom:"6pt"},children:"3. Implementation of proper environmental protection and safety measures;"}),t.jsx("div",{style:{marginBottom:"6pt"},children:"4. No deviation from the approved plans without prior clearance from this office;"}),t.jsx("div",{style:{marginBottom:"6pt"},children:"5. This clearance shall be valid for one (1) year from date of issuance;"}),t.jsx("div",{style:{marginBottom:"6pt"},children:"6. This clearance does not constitute certification of land ownership or title."})]}),t.jsx("p",{style:{textIndent:"40pt",marginBottom:"12pt"},children:"Non-compliance with any of the above conditions shall be sufficient ground for the revocation of this clearance."}),e.project_nature&&t.jsxs("p",{style:{textIndent:"40pt",marginBottom:"12pt"},children:[t.jsx("strong",{children:"Project Classification/Description:"})," ",e.project_nature]}),t.jsxs("p",{style:{textIndent:"40pt",marginTop:"20pt"},children:["Issued this ",t.jsx("strong",{children:e.updated_at?new Date(e.updated_at).toLocaleDateString("en-US",{day:"numeric"}):"__"})," day of ",t.jsx("strong",{children:e.updated_at?new Date(e.updated_at).toLocaleDateString("en-US",{month:"long",year:"numeric"}):"__________, 20__"})," at the City Planning and Development Office, City of Ilagan, Province of Isabela."]})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:"30pt",fontSize:"9pt"},children:[t.jsxs("div",{style:{width:"45%"},children:[t.jsx("div",{style:{marginBottom:"6pt"},children:"Prepared and Evaluated by:"}),t.jsxs("div",{style:{marginTop:"35pt",paddingTop:"3pt",textAlign:"center"},children:[t.jsx("strong",{children:o?.name||"N/A"}),t.jsx("br",{}),"Zoning Officer IV"]})]}),t.jsxs("div",{style:{width:"45%"},children:[t.jsx("div",{style:{marginBottom:"6pt"},children:"Approved by:"}),t.jsxs("div",{style:{marginTop:"35pt",paddingTop:"3pt",textAlign:"center"},children:[t.jsx("strong",{children:g()}),t.jsx("br",{}),"OIC- City Planning & Dev't. Coordinator/",t.jsx("br",{}),"Zoning Administrator"]})]})]})]})})]})]})}export{D as default};
