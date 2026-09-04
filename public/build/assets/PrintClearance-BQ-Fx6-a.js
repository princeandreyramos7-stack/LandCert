import{r,j as e,H as p}from"./app-C6IK9EMy.js";import{h as m}from"./html2pdf-B7wKzCjQ.js";import{z as g}from"./signerName-BRhPV7Ta.js";import{T as h}from"./TupClearanceLetter-DFDAiBL-.js";import{P as f}from"./printer-RMnNzItw.js";import{D as x}from"./download-BPePJ-Rk.js";import"./OfficialLetterhead-US81tQ13.js";import"./ESignatureImage-CvAGa_kX.js";function A({application:t,payment:n,reviewer:o}){const i=r.useRef(null),a=String(t.project_type||"").toUpperCase()==="TUP";r.useEffect(()=>{},[]);const s=()=>{window.print()},d=()=>{const l=i.current,c={margin:0,filename:`Clearance_${t.application_number||"Clearance"}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"avoid-all"}};m().set(c).from(l).save()};return e.jsxs(e.Fragment,{children:[e.jsx(p,{title:`Clearance - ${t.application_number}`}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
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
            `}}),e.jsxs("div",{className:"print-container",children:[e.jsxs("div",{className:"action-buttons no-print",children:[e.jsxs("button",{onClick:s,className:"btn-print",children:[e.jsx(f,{size:16}),"Print Clearance"]}),e.jsxs("button",{onClick:d,className:"btn-download",children:[e.jsx(x,{size:16}),"Download PDF"]})]}),e.jsx("div",{className:"clearance-print-area",children:a?e.jsx(h,{application:t,payment:n,zoningAdministrator:null,innerRef:i}):e.jsxs("div",{ref:i,className:"clearance-page",style:{fontSize:"10pt",lineHeight:"1.4"},children:[e.jsx("div",{className:"clearance-header-bg",style:{padding:"10pt 0",marginBottom:"10pt",borderBottom:"3px solid #2222ff"},children:e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"15pt",flex:1},children:[e.jsx("div",{style:{width:"80pt",height:"80pt",flexShrink:0},children:e.jsx("img",{src:"/images/ilagan1logo.jpg",alt:"Ilagan Logo",style:{width:"100%",height:"100%",objectFit:"contain"}})}),e.jsxs("div",{style:{textAlign:"left"},children:[e.jsx("div",{style:{fontSize:"10pt",marginBottom:"2pt"},children:"Republic of the Philippines"}),e.jsx("div",{style:{fontSize:"12pt",fontWeight:"bold"},children:"CITY OF ILAGAN"}),e.jsx("div",{style:{fontSize:"10pt"},children:"Province of Isabela"}),e.jsx("div",{style:{fontSize:"11pt",fontWeight:"bold",marginTop:"3pt"},children:"CITY PLANNING AND DEVELOPMENT OFFICE"})]})]}),e.jsx("div",{style:{position:"absolute",top:"0",right:"100pt",textAlign:"center"},children:e.jsx("div",{style:{fontSize:"10pt",fontWeight:"bold"},children:"CPD-001-0"})}),e.jsx("div",{style:{width:"80pt",height:"80pt",flexShrink:0},children:e.jsx("img",{src:"/images/Ilagan Logo2.png",alt:"CPDO Logo",style:{width:"100%",height:"100%",objectFit:"contain"}})})]})}),e.jsx("div",{style:{textAlign:"center",marginBottom:"15pt",fontSize:"11pt",fontWeight:"bold"},children:e.jsx("div",{style:{display:"inline-block",background:"#FFFF00",padding:"4pt 8pt"},children:"LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE"})}),e.jsxs("div",{style:{marginBottom:"15pt",fontSize:"9pt"},children:[e.jsxs("div",{style:{marginBottom:"8pt"},children:[e.jsx("strong",{children:"Application No.:"})," ",t.application_number||"N/A"]}),e.jsxs("div",{style:{marginBottom:"8pt"},children:[e.jsx("strong",{children:"Date Receipt:"})," ",t.created_at?new Date(t.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"N/A"]}),e.jsxs("div",{style:{marginBottom:"8pt"},children:[e.jsx("strong",{children:"O.R. No.:"})," ",n?.reference_number||"N/A"]}),e.jsxs("div",{style:{marginBottom:"8pt"},children:[e.jsx("strong",{children:"Date Issued:"})," ",t.updated_at?new Date(t.updated_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"N/A"]}),e.jsxs("div",{style:{marginBottom:"8pt"},children:[e.jsx("strong",{children:"Amount Paid:"})," ₱",n?.amount?Number(n.amount).toLocaleString("en-PH",{minimumFractionDigits:2}):"0.00"]})]}),e.jsxs("div",{style:{fontSize:"10pt",lineHeight:"1.8",textAlign:"justify",marginBottom:"20pt"},children:[e.jsxs("p",{style:{textIndent:"40pt",marginBottom:"12pt"},children:["This is to certify that the application for ",e.jsx("strong",{children:"Locational Clearance / Certificate of Zoning Compliance"})," filed by ",e.jsx("strong",{children:t.applicant_name||"N/A"}),t.corporation_name&&` representing ${t.corporation_name}`,", with address at ",e.jsx("strong",{children:t.applicant_address||"N/A"}),", for the proposed ",e.jsx("strong",{children:t.project_type||"project"})," to be located at ",e.jsxs("strong",{children:[t.project_location_barangay,", ",t.project_location_municipality||"City of Ilagan, Isabela"]}),", has been evaluated and found to be in conformity with the Comprehensive Zoning Ordinance and the Comprehensive Land Use Plan of the City of Ilagan."]}),e.jsxs("p",{style:{textIndent:"40pt",marginBottom:"12pt"},children:[e.jsx("strong",{children:"THIS CLEARANCE IS HEREBY GRANTED"})," subject to the following conditions:"]}),e.jsxs("div",{style:{marginLeft:"30pt",marginBottom:"12pt"},children:[e.jsx("div",{style:{marginBottom:"6pt"},children:"1. Compliance with all applicable national and local building codes, laws, and regulations;"}),e.jsx("div",{style:{marginBottom:"6pt"},children:"2. Securing necessary permits from concerned government agencies;"}),e.jsx("div",{style:{marginBottom:"6pt"},children:"3. Implementation of proper environmental protection and safety measures;"}),e.jsx("div",{style:{marginBottom:"6pt"},children:"4. No deviation from the approved plans without prior clearance from this office;"}),e.jsx("div",{style:{marginBottom:"6pt"},children:"5. This clearance shall be valid for one (1) year from date of issuance;"}),e.jsx("div",{style:{marginBottom:"6pt"},children:"6. This clearance does not constitute certification of land ownership or title."})]}),e.jsx("p",{style:{textIndent:"40pt",marginBottom:"12pt"},children:"Non-compliance with any of the above conditions shall be sufficient ground for the revocation of this clearance."}),t.project_nature&&e.jsxs("p",{style:{textIndent:"40pt",marginBottom:"12pt"},children:[e.jsx("strong",{children:"Project Classification/Description:"})," ",t.project_nature]}),e.jsxs("p",{style:{textIndent:"40pt",marginTop:"20pt"},children:["Issued this ",e.jsx("strong",{children:t.updated_at?new Date(t.updated_at).toLocaleDateString("en-US",{day:"numeric"}):"__"})," day of ",e.jsx("strong",{children:t.updated_at?new Date(t.updated_at).toLocaleDateString("en-US",{month:"long",year:"numeric"}):"__________, 20__"})," at the City Planning and Development Office, City of Ilagan, Province of Isabela."]})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:"30pt",fontSize:"9pt"},children:[e.jsxs("div",{style:{width:"45%"},children:[e.jsx("div",{style:{marginBottom:"6pt"},children:"Prepared and Evaluated by:"}),e.jsxs("div",{style:{marginTop:"35pt",paddingTop:"3pt",textAlign:"center"},children:[e.jsx("strong",{children:o?.name||"N/A"}),e.jsx("br",{}),"Zoning Officer IV"]})]}),e.jsxs("div",{style:{width:"45%"},children:[e.jsx("div",{style:{marginBottom:"6pt"},children:"Approved by:"}),e.jsxs("div",{style:{marginTop:"35pt",paddingTop:"3pt",textAlign:"center"},children:[e.jsx("strong",{children:g()}),e.jsx("br",{}),"OIC- City Planning & Dev't. Coordinator/",e.jsx("br",{}),"Zoning Administrator"]})]})]})]})})]})]})}export{A as default};
