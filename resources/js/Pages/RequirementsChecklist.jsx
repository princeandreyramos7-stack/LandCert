import React from "react";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { ArrowLeft, FileText, Download, Printer } from "lucide-react";

export default function RequirementsChecklist() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title="Requirements Checklist - CPDO LC" />
            
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 0; padding: 20px; }
                }
                
                .checklist-page {
                    max-width: 8.5in;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    font-family: 'Times New Roman', serif;
                    line-height: 1.6;
                }
                
                .checklist-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .checklist-title {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-transform: uppercase;
                }
                
                .requirement-item {
                    margin-bottom: 15px;
                    text-align: justify;
                }
                
                .requirement-number {
                    font-weight: bold;
                    margin-right: 8px;
                }
                
                .sub-item {
                    margin-left: 30px;
                    margin-top: 5px;
                }
                
                .sub-sub-item {
                    margin-left: 50px;
                    margin-top: 3px;
                }
                
                .section-title {
                    font-weight: bold;
                    text-decoration: underline;
                    margin-top: 20px;
                    margin-bottom: 10px;
                }
            `}} />

            <div className="min-h-screen bg-gray-50 py-8 no-print">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="mb-6 flex items-center justify-between">
                        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                        <div className="flex gap-2">
                            <Button onClick={handlePrint} className="flex items-center gap-2">
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="checklist-page">
                <div className="checklist-header">
                    <div style={{ fontSize: '11px', marginBottom: '20px' }}>
                        ANNEX B of HLURB memorandum Circular No. 03 series of 1998
                    </div>
                    <div className="checklist-title">
                        APPLICATION REQUIREMENTS FOR LOCATIONAL CLEARANCE/<br />
                        CERTIFICATE OF ZONING COMPLIANCE
                    </div>
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">1.</span>
                    Duly accomplished and notarized <strong>APPLICATION FORM</strong>
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">2.</span>
                    Any of the following requirements relative to <strong>RIGHT OVER LAND</strong>
                    
                    <div className="sub-item">
                        <span className="requirement-number">a.</span>
                        Photocopy of the Cert. of Title in case registered in the name of the applicant & latest Tax declaration.
                    </div>
                    
                    <div className="sub-item">
                        <span className="requirement-number">b.</span>
                        In the absence of any existing certification of title, in the name of the applicant, submit (1) certified true copy of the latest tax declaration and (2) pro forma affidavit (Annex C) to the effect that:
                        
                        <div className="sub-sub-item">- the applicant is the owner of the property subject of the application.</div>
                        <div className="sub-sub-item">- The reason why the property is not yet titled</div>
                        <div className="sub-sub-item">- That the property is situated within alienable and <em>disposable land outside land reserved for the public domain</em></div>
                        <div className="sub-sub-item">- That the property is free for liens and encumbrance or stating the liens & encumbrances of the property.</div>
                        <div className="sub-sub-item">- That the property is/are not tenanted (in case the property is planted to rise and corn)</div>
                    </div>
                    
                    <div className="sub-item">
                        <span className="requirement-number">c.</span>
                        In case the property is not registered in the name of the applicant, submit duly accomplished Deed of sale or deed of donation; or contract of lease or authorization to used land, which ever is applicable plus the photo copy of the owner's certificate of title in the absence of title, the tax declaration and pro-forma affidavit as describe in item b.
                    </div>
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">3.</span>
                    <strong>VICINITY MAP</strong> showing the existing land uses within the prescribed radius from the lot boundary of the project site.
                    
                    <div className="sub-item">
                        <span className="requirement-number">a.</span>
                        For projects of local significance, the vicinity should cover a minimum of 100 meters radius, and the map need not to be drawn to scale provided the relative distance of existing land uses to the project site lot boundaries are shown.
                    </div>
                    
                    <div className="sub-item">
                        <span className="requirement-number">b.</span>
                        For project of national significant, the vicinity should cover a minimum of one (1) kilometer radius and be drawn to scale.
                    </div>
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">4.</span>
                    <strong>SITE DEVELOPMENT PLAN</strong> showing the project site, lot area boundaries & dimension of proposed improvements within the project site: the plan need not to be drawn to scale for the projects of local significance.
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">5.</span>
                    <strong>ESTIMATED PROJECT COST /BILL OF MATERIALS</strong>
                </div>

                <div className="section-title">Additional requirements:</div>

                <div className="requirement-item">
                    <span className="requirement-number">1.</span>
                    For all projects to be situated in Tenanted Rice and/or Corn lands: Endorsement/recommendation from the Department of Agrarian Reform for the conversion into other uses.
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">2.</span>
                    For manufacturing projects <strong>DESCRIPTION OF INDUSTRY</strong> citing among others are as follows:
                    
                    <div className="sub-item">2.1 Type and volume of raw materials used</div>
                    <div className="sub-item">2.2 Products manufactured or stored</div>
                    <div className="sub-item">2.3 Average daily output/capacity per day/week/month</div>
                    <div className="sub-item">2.4 Industrial waste & plans for pollution control</div>
                    <div className="sub-item">2.5 Description of manufacturing processes</div>
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">3.</span>
                    Description filled by authorized representative, <strong>SWORN SPECIAL POWER OF ATTORNEY</strong> for the Representative: to file/follow-up application.
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">4.</span>
                    <strong>AFFIDAVIT OF NO OBJECTION</strong>
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">5.</span>
                    <strong>ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC)/CERTIFICATE OF NON-COVERAGE(CNC)</strong>
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">6.</span>
                    Certification of road right-of-way from DPWH (if the project is located within the National Road)
                </div>

                <div className="requirement-item">
                    <span className="requirement-number">7.</span>
                    <strong>Barangay clearance</strong>
                </div>
            </div>
        </>
    );
}
