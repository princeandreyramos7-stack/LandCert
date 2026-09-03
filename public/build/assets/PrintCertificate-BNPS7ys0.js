import{r,j as t,H as c}from"./app-CSIzXdBB.js";import"./button-D7_MNik0.js";import{h as p}from"./html2pdf-B10gqc3I.js";import{z as h}from"./signerName-BRhPV7Ta.js";import{P as g}from"./printer-CDesc4SM.js";import{D as x}from"./download-BgpE6k2O.js";import"./index-DgcmCvE9.js";import"./loader-circle-DMbIjWW_.js";import"./createLucideIcon-CFGxvSe1.js";function w({application:e,payment:i,reviewer:o}){const n=r.useRef(null);r.useEffect(()=>{},[]);const s=()=>{window.print()},d=()=>{const l=n.current,a={margin:0,filename:`Certificate_${e.application_number||"Certificate"}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,letterRendering:!0,logging:!1},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"},pagebreak:{mode:"avoid-all"}};p().set(a).from(l).save()};return t.jsxs(t.Fragment,{children:[t.jsx(c,{title:`Certificate - ${e.application_number}`}),t.jsx("style",{dangerouslySetInnerHTML:{__html:`
                body {
                    margin: 0;
                    padding: 0;
                    background: #f5f5f5;
                }

                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .certificate-print-area, .certificate-print-area * {
                        visibility: visible;
                    }
                    .certificate-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .certificate-header {
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

                .certificate-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    font-family: 'Times New Roman', serif;
                    padding: 10mm 15mm;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .certificate-header {
                    width: 100%;
                    background: linear-gradient(
                        180deg,
                        #ffffff 0%,
                        #eefdfd 8%,
                        #d9f9fa 25%,
                        #bff5f6 55%,
                        #a8eff1 100%
                    );
                    border-bottom: 3px solid #2222ff;
                    padding: 10pt 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
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
            `}}),t.jsxs("div",{className:"print-container",children:[t.jsxs("div",{className:"action-buttons no-print",children:[t.jsxs("button",{onClick:s,className:"btn-print",children:[t.jsx(g,{size:16}),"Print Certificate"]}),t.jsxs("button",{onClick:d,className:"btn-download",children:[t.jsx(x,{size:16}),"Download PDF"]})]}),t.jsx("div",{className:"certificate-print-area",children:t.jsxs("div",{ref:n,className:"certificate-page",style:{fontSize:"10pt",lineHeight:"1.4"},children:[t.jsxs("div",{className:"certificate-header",children:[t.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"15pt",flex:1},children:[t.jsx("div",{style:{width:"80pt",height:"80pt",flexShrink:0},children:t.jsx("img",{src:"/images/ilagan1logo.jpg",alt:"Ilagan Logo",style:{width:"100%",height:"100%",objectFit:"contain",mixBlendMode:"multiply"}})}),t.jsxs("div",{style:{textAlign:"left"},children:[t.jsx("div",{style:{fontSize:"10pt",marginBottom:"2pt",color:"#000080"},children:"Republic of the Philippines"}),t.jsx("div",{style:{fontSize:"12pt",fontWeight:"bold",color:"#000080"},children:"CITY OF ILAGAN"}),t.jsx("div",{style:{fontSize:"10pt",color:"#000080"},children:"Province of Isabela"}),t.jsx("div",{style:{fontSize:"11pt",fontWeight:"bold",marginTop:"3pt",color:"#000080"},children:"CITY PLANNING & DEVELOPMENT OFFICE"})]})]}),t.jsx("div",{style:{position:"absolute",top:"0",right:"100pt",textAlign:"center"},children:t.jsx("div",{style:{fontSize:"10pt",fontWeight:"bold"},children:"CPD-001-0"})}),t.jsx("div",{style:{width:"80pt",height:"80pt",flexShrink:0},children:t.jsx("img",{src:"/images/Ilagan Logo2.png",alt:"CPDO Logo",style:{width:"100%",height:"100%",objectFit:"contain"}})})]}),t.jsxs("div",{style:{textAlign:"center",marginTop:"10pt",marginBottom:"10pt",fontSize:"10pt",fontWeight:"bold"},children:[t.jsx("div",{style:{display:"inline-block",background:"#FFFF00",padding:"4pt 8pt"},children:"DECISION ON ZONING"}),t.jsx("br",{}),t.jsx("div",{style:{display:"inline-block",background:"#FFFF00",padding:"4pt 8pt",marginTop:"2pt"},children:e.project_type==="SUP"?"SPECIAL USE PERMIT":e.project_type==="CZC"?"CERTIFICATE OF ZONING COMPLIANCE":e.project_type==="TUP"?"TEMPORARY USE PERMIT":"SPECIAL USE PERMIT"})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"8pt",fontSize:"9pt"},children:[t.jsxs("div",{children:[t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"Application No.: "}),t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"150pt",paddingBottom:"2pt"},children:e.application_number||"N/A"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"Date Received: "}),t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"150pt",paddingBottom:"2pt"},children:e.created_at?new Date(e.created_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"N/A"})]})]}),t.jsxs("div",{style:{marginRight:"60px",marginTop:"10px"},children:[t.jsxs("div",{style:{marginBottom:"4pt"},children:[t.jsx("strong",{children:"Decision No.: "}),t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"150pt"},children:e.decision_number||"N/A"})]}),t.jsxs("div",{children:[t.jsx("strong",{children:"Date Issued: "}),t.jsx("span",{style:{borderBottom:"1px solid #000",display:"inline-block",minWidth:"150pt",paddingBottom:"2pt"},children:e.updated_at?new Date(e.updated_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"N/A"})]})]})]}),t.jsx("table",{style:{width:"100%",border:"2px solid #000",borderCollapse:"collapse",marginBottom:"10pt",fontSize:"9pt"},children:t.jsxs("tbody",{children:[t.jsxs("tr",{children:[t.jsxs("td",{style:{border:"1px solid #000",padding:"8pt",width:"50%",textAlign:"center",verticalAlign:"top"},children:[t.jsx("strong",{children:"APPLICANT"}),t.jsx("div",{style:{marginTop:"8pt",fontSize:"10pt"},children:e.applicant_name||"N/A"})]}),t.jsxs("td",{style:{border:"1px solid #000",padding:"8pt",width:"50%",textAlign:"center",verticalAlign:"top"},children:[t.jsx("strong",{children:"NAME OF CORPORATION"}),t.jsx("div",{style:{marginTop:"8pt",fontSize:"10pt"},children:e.corporation_name||"N/A"})]})]}),t.jsxs("tr",{children:[t.jsxs("td",{style:{border:"1px solid #000",padding:"8pt",textAlign:"center",verticalAlign:"top"},children:[t.jsx("strong",{children:"ADDRESS"}),t.jsx("div",{style:{marginTop:"8pt",fontSize:"10pt"},children:e.applicant_address||"N/A"})]}),t.jsxs("td",{style:{border:"1px solid #000",padding:"8pt",textAlign:"center",verticalAlign:"top"},children:[t.jsx("strong",{children:"ADDRESS"}),t.jsx("div",{style:{marginTop:"8pt",fontSize:"10pt"},children:e.corporation_address||"N/A"})]})]}),t.jsxs("tr",{children:[t.jsxs("td",{style:{border:"1px solid #000",padding:"8pt",textAlign:"center",verticalAlign:"top"},children:[t.jsx("strong",{children:"TYPE OF PROJECT"}),t.jsx("div",{style:{marginTop:"8pt",fontSize:"10pt"},children:e.project_type||"N/A"})]}),t.jsxs("td",{style:{border:"1px solid #000",padding:"8pt",textAlign:"center",verticalAlign:"top"},children:[t.jsx("strong",{children:"AREA AND LOCATION"}),t.jsxs("div",{style:{marginTop:"8pt",fontSize:"10pt"},children:[e.project_location_barangay,", ",e.project_location_municipality||"CITY OF ILAGAN, ISABELA"]})]})]}),t.jsxs("tr",{children:[t.jsxs("td",{style:{border:"1px solid #000",padding:"8pt",textAlign:"center",verticalAlign:"top"},children:[t.jsx("strong",{children:"DECISION GRANTED"}),t.jsx("div",{style:{marginTop:"8pt",fontSize:"10pt",fontWeight:"bold"},children:e.status==="approved"?"CZC Granted with Conditions":"DENIED"})]}),t.jsxs("td",{style:{border:"1px solid #000",padding:"8pt",textAlign:"center",verticalAlign:"top"},children:[t.jsx("strong",{children:"RIGHT OVER LAND"}),t.jsx("div",{style:{marginTop:"8pt",fontSize:"10pt"},children:e.right_over_land||"OWNER"})]})]})]})}),t.jsxs("div",{style:{marginBottom:"10pt",fontSize:"8pt",lineHeight:"1.4",textAlign:"justify"},children:[t.jsx("div",{style:{fontWeight:"bold",marginBottom:"6pt"},children:"Conditions:"}),t.jsxs("div",{style:{marginLeft:"15pt"},children:["/x/ All conditions stipulated herein form part of this decision and are subject to monitoring",t.jsx("br",{}),"/x/ Non-compliance therewith shall be a cause for cancellation or legal action.",t.jsx("br",{}),"/x/ The applicable requirements of gov't. agencies and applicable provision of existing laws shall be complied with.",t.jsx("br",{}),"/x/ No activity and/or activity applied shall be conducted within the project site.",t.jsx("br",{}),"/x/ No major expansion, alteration and/or improvement shall be introduced without prior clearance from this office.",t.jsx("br",{}),"/x/ This decision shall not be construed as a certification of City Gov't. of Ilagan as to the ownership or parcel of land subject of this decision.",t.jsx("br",{}),"/x/ Any misrepresentation, False statement or allegations materials as to the issuance of this decision shall be sufficient cause of its revocation."]}),t.jsx("div",{style:{fontWeight:"bold",marginTop:"10pt",marginBottom:"6pt"},children:"Additional Conditions:"}),t.jsxs("div",{style:{marginLeft:"15pt"},children:["/x/ Provision as to setback yard requirements, bulk easement, area height and other restrictions strictly conform with the provision of the National Building Code and other related laws.",t.jsx("br",{}),"/x/ This decision shall be considered automatically revoked if project is not commenced within one (1) year from the date of issue of this decision.",t.jsx("br",{}),"/x/ For other conditions please see the reverse side."]})]}),t.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:"15pt",marginBottom:"15pt",fontSize:"9pt"},children:[t.jsxs("div",{style:{width:"45%"},children:[t.jsx("div",{style:{marginBottom:"6pt"},children:"Prepared & Evaluated by:"}),t.jsxs("div",{style:{marginTop:"35pt",paddingTop:"3pt",textAlign:"center"},children:[t.jsx("strong",{children:o?.name||"MARY JANE M. BULAUAN"}),t.jsx("br",{}),"Zoning Officer IV"]})]}),t.jsxs("div",{style:{width:"45%"},children:[t.jsx("div",{style:{marginBottom:"6pt",visibility:"hidden"},children:"Placeholder"}),t.jsxs("div",{style:{marginTop:"35pt",paddingTop:"3pt",textAlign:"center"},children:[t.jsx("strong",{children:h()}),t.jsx("br",{}),"City Planning & Dev't. Coordinator/",t.jsx("br",{}),"Zoning Administrator"]})]})]}),t.jsxs("div",{style:{fontSize:"9pt",marginTop:"10pt"},children:[t.jsxs("div",{children:[t.jsx("strong",{children:"O.R. No.:"})," ",i?.reference_number||"N/A"]}),t.jsxs("div",{children:[t.jsx("strong",{children:"Date Issued:"})," ",i?.payment_date?new Date(i.payment_date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):e.updated_at?new Date(e.updated_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}):"N/A"]}),t.jsxs("div",{children:[t.jsx("strong",{children:"Amount Paid:"})," ₱",i?.amount?Number(i.amount).toLocaleString("en-PH",{minimumFractionDigits:2}):"0.00"]})]})]})})]})]})}export{w as default};
