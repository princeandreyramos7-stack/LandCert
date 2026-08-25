import React from "react";
import { Head, Link } from "@inertiajs/react";
import html2pdf from 'html2pdf.js';

/* ─── helpers ─────────────────────────────────────── */
const v = (x) =>
    x !== null && x !== undefined && String(x).trim() !== ""
        ? String(x).trim()
        : "";
const nb = "\u00A0";

/* ── checkbox ── */
const Chk = ({ on }) => (
    <span style={{ fontSize: "9pt", lineHeight: 1 }}>{on ? "☑" : "☐"}</span>
);

/* ── underline blank ── */
const Uline = ({ val, w = "80pt", inline = false, pl = "2pt", pr = "2pt" }) => (
    <span
        style={{
            display: inline ? "inline-block" : "inline-block",
            width: w,
            borderBottom: "1px solid #000",
            verticalAlign: "bottom",
            fontSize: "8pt",
            lineHeight: "1.3",
            paddingBottom: "0",
            paddingLeft: pl,
            paddingRight: pr,
        }}
    >
        {v(val) || nb}
    </span>
);

/* ── peso words ── */
function pesoWords(n) {
    if (!n || isNaN(parseFloat(n))) return "";
    const ones = [
        "", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT",
        "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN",
        "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN",
    ];
    const tens = [
        "", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY",
        "EIGHTY", "NINETY",
    ];
    function say(x) {
        if (x < 20) return ones[x];
        if (x < 100)
            return tens[Math.floor(x / 10)] + (x % 10 ? "-" + ones[x % 10] : "");
        if (x < 1000)
            return (
                ones[Math.floor(x / 100)] +
                " HUNDRED" +
                (x % 100 ? " " + say(x % 100) : "")
            );
        if (x < 1e6)
            return (
                say(Math.floor(x / 1000)) +
                " THOUSAND" +
                (x % 1000 ? " " + say(x % 1000) : "")
            );
        if (x < 1e9)
            return (
                say(Math.floor(x / 1e6)) +
                " MILLION" +
                (x % 1e6 ? " " + say(x % 1e6) : "")
            );
        return (
            say(Math.floor(x / 1e9)) +
            " BILLION" +
            (x % 1e9 ? " " + say(x % 1e9) : "")
        );
    }
    const whole = Math.floor(parseFloat(n));
    const cents = Math.round((parseFloat(n) - whole) * 100);
    return (
        say(whole) +
        " PESOS" +
        (cents ? " AND " + say(cents) + "/100" : "")
    );
}

/* ════════════════════════════════════════════════════
   INLINE CSS
   ════════════════════════════════════════════════════ */
const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body { background: #bbb; font-family: Arial, Helvetica, sans-serif; }

/* ── screen wrapper ── */
.pf-page {
    width: 210mm;
    min-height: 297mm;
    background: #fff;
    margin: 6mm auto;
    border: 1px solid #999;
    padding: 7mm 8mm 7mm 8mm;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8pt;
    color: #000;
    line-height: 1.25;
}

/* Remove border when generating PDF or printing */
.pf-page.no-border {
    border: none;
    margin: 0;
}
    font-size: 8pt;
    color: #000;
    line-height: 1.25;
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
    border-bottom: 1px solid #000;
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

/* ── certification text ── */
.cert-text {
    font-size: 6.5pt;
    line-height: 1.55;
    text-align: justify;
}

/* ── print controls ── */
.ctrl {
    width: 210mm;
    margin: 0 auto 4mm;
    display: flex;
    gap: 8px;
    align-items: center;
}
.ctrl-btn {
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    color: #333;
    font-family: Arial, sans-serif;
}
.ctrl-btn:hover {
    background: #f5f5f5;
    border-color: #999;
}
.ctrl-btn.go {
    background: #2563eb;
    color: #fff;
    border-color: #2563eb;
}
.ctrl-btn.go:hover {
    background: #1d4ed8;
}
.ctrl-hint {
    font-size: 11px;
    color: #666;
    font-family: Arial, sans-serif;
    margin-left: 8px;
}

/* ── print ── */
@media print {
    html, body { background: #fff !important; margin: 0; padding: 0; }
    .ctrl { display: none !important; }
    .pf-page {
        margin: 0;
        border: none;
        padding: 0;
        width: 100%;
        min-height: auto;
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
    @page { size: A4 portrait; margin: 8mm; }
}
`;

/* ════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════ */
export default function PrintForm({ application: a, auth }) {
    const costNum = parseFloat(a.project_cost) || 0;
    const costFmt = costNum
        ? "₱" + costNum.toLocaleString("en-PH", { minimumFractionDigits: 2 })
        : "";
    const costWrd = costNum ? pesoWords(costNum) : "";

    const ctrlNo = v(a.control_number) || sprintf("CPD-%03d-0", a.id);
    const appNo  = a.id ? "APP-" + String(a.id).padStart(4, "0") : nb;

    // Determine back route based on user role
    const getBackRoute = () => {
        if (!auth || !auth.user) return route('login');
        
        const userRole = auth.user.user_type || auth.user.role;
        
        if (userRole === 'super_admin') {
            return route('super-admin.requests');
        } else if (userRole === 'admin') {
            return route('admin.requests');
        } else {
            // applicant
            return route('my-applications');
        }
    };

    /* Save form as PDF function */
    const handleSaveForm = () => {
        const filename = `CPDO_Form_${ctrlNo}_${v(a.applicant_name).replace(/\s+/g, '_')}.pdf`;
        
        const element = document.querySelector('.pf-page');
        
        // Remove border for PDF generation
        element.classList.add('no-border');
        
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        // Generate and download PDF
        html2pdf().set(opt).from(element).save().then(() => {
            // Restore border after PDF generation
            element.classList.remove('no-border');
        });
    };

    /* land-use checks */
    const lu = v(a.existing_land_use).toLowerCase();
    const knownLU = [
        "residential", "institutional", "commercial", "industrial",
        "vacant", "agricultural", "tenant", "not tenanted",
    ];
    const isOther = lu && !knownLU.includes(lu);

    /* release mode */
    const rm = v(a.preferred_release_mode).toLowerCase();

    return (
        <>
            <Head title={`Print — ${ctrlNo}`} />
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* ── controls ── */}
            <div className="ctrl">
                <Link href={getBackRoute()} className="ctrl-btn">
                    ← Back
                </Link>
                <button className="ctrl-btn go" onClick={() => window.print()}>
                    🖨 Print Form
                </button>
                <button className="ctrl-btn go" onClick={handleSaveForm}>
                    💾 Download PDF
                </button>
                <span className="ctrl-hint">
                    Print sends to printer. Download PDF saves the file automatically.
                </span>
            </div>

            {/* ═══════════════════════════════════════════
                OFFICIAL FORM
               ═══════════════════════════════════════════ */}
            <div className="pf-page">

                {/* ╔══════════════════════════════════════╗
                    ║  HEADER                              ║
                    ╚══════════════════════════════════════╝ */}

                {/* Full header: 3 columns — LEFT labels | CENTER office+underlines | RIGHT ctrl no */}
                <table style={{ marginBottom: 0, borderCollapse: "collapse" }}>
                    <colgroup>
                        <col style={{ width: "28%" }} />
                        <col style={{ width: "48%" }} />
                        <col style={{ width: "24%" }} />
                    </colgroup>
                    <tbody>
                        <tr>
                            
                            {/* LEFT — labels only, no values, no borders */}
                            <td style={{ border: "none", padding: "2pt 4pt 2pt 2pt", verticalAlign: "top" }}>
                                <div style={{ fontSize: "7.5pt", lineHeight: "2.0" }}>
                                    <div>Application No.:</div>
                                    <div>Date Receipt:</div>
                                    <div>O.R. No.:</div>
                                    <div>Date Issued:</div>
                                    <div>Amount Paid:</div>
                                </div>
                            </td>

                            {/* CENTER — office name top, then 2 underlines + (Office and Address) */}
                            <td style={{ border: "none", padding: "2pt 8pt", verticalAlign: "top", textAlign: "center" }}>
                                {/* Office name */}
                                <div style={{
                                    fontSize: "11pt",
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.03em",
                                    lineHeight: 1,
                                    marginBottom: "8pt",
                                    textAlign: "center",
                                    backgroundColor: "#FFFF00",
                                    padding: "4pt 8pt",
                                    display: "inline-block",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    whiteSpace: "nowrap",
                                }}>
                                    City Planning and Development Office
                                </div>
                                {/* Underline 1 */}
                                <div style={{
                                    borderBottom: "1px solid #000",
                                    marginBottom: "6pt",
                                    minHeight: "13pt",
                                    fontSize: "8pt",
                                }}>
                                    {"\u00A0"}
                                </div>
                                {/* Underline 2 */}
                                <div style={{
                                    borderBottom: "1px solid #000",
                                    marginBottom: "4pt",
                                    minHeight: "13pt",
                                    fontSize: "8pt",
                                }}>
                                    {"\u00A0"}
                                </div>
                                {/* (Office and Address) — no line */}
                                <div style={{
                                    fontSize: "6.5pt",
                                    fontStyle: "italic",
                                    color: "#333",
                                    textAlign: "center",
                                }}>
                                    (Office and Address)
                                </div>
                            </td>

                            {/* RIGHT — control number pinned to top-right corner of the page */}
                            <td style={{ border: "none", padding: "2pt 0 0 0", verticalAlign: "top", textAlign: "right" }}>
                                <div style={{ fontSize: "8pt", fontWeight: "bold" }}>
                                    {ctrlNo}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ── divider between header and title ── */}
                <div style={{ borderTop: "1px solid #000", marginTop: "6pt", marginBottom: 0 }} />

                {/* ── MAIN TITLE ── */}
                <table className="form-table">
                    <tbody>
                        <tr>
                            <td
                                style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    fontSize: "9pt",
                                    textTransform: "uppercase",
                                    padding: "4pt 6pt",
                                    letterSpacing: "0.03em",
                                    borderTop: "none",
                                }}
                            >
                                Application for Locational Clearance / Certificate of Zoning Compliance
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ╔══════════════════════════════════════╗
                    ║  SECTION I — APPLICANT INFORMATION  ║
                    ╚══════════════════════════════════════╝ */}

                <table>
                    <colgroup>
                        <col style={{ width: "50%" }} />
                        <col style={{ width: "50%" }} />
                    </colgroup>
                    <tbody>
                        {/* Row 1 */}
                        <tr>
                            <td className="nb-t" style={{ height: "22pt" }}>
                                <span className="lbl">1. Name of Applicant</span>
                                <span className="val">{v(a.applicant_name) || nb}</span>
                            </td>
                            <td className="nb-t nb-l" style={{ height: "22pt" }}>
                                <span className="lbl">2. Name of Corporation (if applicable)</span>
                                <span className="val">{v(a.corporation_name) || nb}</span>
                            </td>
                        </tr>
                        {/* Row 2 */}
                        <tr>
                            <td style={{ height: "22pt" }}>
                                <span className="lbl">3. Address of Applicant</span>
                                <span className="val">{v(a.applicant_address) || nb}</span>
                            </td>
                            <td className="nb-l" style={{ height: "22pt" }}>
                                <span className="lbl">4. Address of Corporation</span>
                                <span className="val">{v(a.corporation_address) || nb}</span>
                            </td>
                        </tr>
                        {/* Row 3 */}
                        <tr>
                            <td style={{ height: "22pt" }}>
                                <span className="lbl">5. Name of Authorized Representative (if applicable)</span>
                                <span className="val">{v(a.representative_name) || nb}</span>
                            </td>
                            <td className="nb-l" style={{ height: "22pt" }}>
                                <span className="lbl">6. Address of Authorized Representative</span>
                                <span className="val">{v(a.representative_address) || nb}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ╔══════════════════════════════════════╗
                    ║  SECTION II — PROJECT INFORMATION   ║
                    ╚══════════════════════════════════════╝ */}

                {/* 7 & 8 — Project Type + Nature */}
                <table>
                    <colgroup>
                        <col style={{ width: "36%" }} />
                        <col style={{ width: "64%" }} />
                    </colgroup>
                    <tbody>
                        <tr>
                            <td className="nb-t" style={{ height: "22pt" }}>
                                <span className="lbl">7. Project Type</span>
                                <span className="val">{v(a.project_type) || nb}</span>
                            </td>
                            <td className="nb-t nb-l" style={{ height: "22pt" }}>
                                <span className="lbl">8. Project Nature / Description</span>
                                <span className="val">{v(a.project_nature) || nb}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 9 — Project Location (structured row) */}
                <table>
                    <tbody>
                        <tr>
                            <td className="nb-t nb-b" colSpan={12} style={{ paddingBottom: "1pt" }}>
                                <span className="lbl" style={{ marginBottom: 0 }}>
                                    9. Project Location
                                </span>
                            </td>
                        </tr>
                        <tr>
                            {/* No./Blk */}
                            <td
                                className="nb-t nb-l nb-r"
                                style={{ border: "none", width: "5%", fontSize: "6pt", paddingTop: "2pt", paddingRight: "2pt", verticalAlign: "bottom" }}
                            >
                                No./Blk:
                            </td>
                            <td
                                className="nb-t nb-l"
                                style={{ border: "none", borderBottom: "1px solid #000", width: "9%", fontSize: "8pt", verticalAlign: "bottom", paddingBottom: "1pt" }}
                            >
                                {v(a.location_number) || nb}
                            </td>
                            {/* Street */}
                            <td
                                className="nb"
                                style={{ border: "none", width: "4%", fontSize: "6pt", paddingLeft: "5pt", paddingRight: "2pt", verticalAlign: "bottom" }}
                            >
                                Street:
                            </td>
                            <td
                                style={{ border: "none", borderBottom: "1px solid #000", width: "16%", fontSize: "8pt", verticalAlign: "bottom", paddingBottom: "1pt" }}
                            >
                                {v(a.location_street) || nb}
                            </td>
                            {/* Purok */}
                            <td
                                className="nb"
                                style={{ border: "none", width: "4%", fontSize: "6pt", paddingLeft: "5pt", paddingRight: "2pt", verticalAlign: "bottom" }}
                            >
                                Purok:
                            </td>
                            <td
                                style={{ border: "none", borderBottom: "1px solid #000", width: "10%", fontSize: "8pt", verticalAlign: "bottom", paddingBottom: "1pt" }}
                            >
                                {nb}
                            </td>
                            {/* Brgy */}
                            <td
                                className="nb"
                                style={{ border: "none", width: "4%", fontSize: "6pt", paddingLeft: "5pt", paddingRight: "2pt", verticalAlign: "bottom" }}
                            >
                                Brgy.:
                            </td>
                            <td
                                style={{ border: "none", borderBottom: "1px solid #000", width: "17%", fontSize: "8pt", verticalAlign: "bottom", paddingBottom: "1pt" }}
                            >
                                {v(a.location_barangay) || nb}
                            </td>
                            {/* City */}
                            <td
                                className="nb"
                                style={{ border: "none", width: "9%", fontSize: "6pt", paddingLeft: "5pt", paddingRight: "2pt", verticalAlign: "bottom", whiteSpace: "nowrap" }}
                            >
                                City/Mun.:
                            </td>
                            <td
                                style={{ border: "none", borderBottom: "1px solid #000", width: "13%", fontSize: "8pt", verticalAlign: "bottom", paddingBottom: "1pt" }}
                            >
                                {v(a.location_city) || "City of Ilagan"}
                            </td>
                            {/* Province */}
                            <td
                                className="nb"
                                style={{ border: "none", width: "5%", fontSize: "6pt", paddingLeft: "5pt", paddingRight: "2pt", verticalAlign: "bottom" }}
                            >
                                Prov.:
                            </td>
                            <td
                                style={{ border: "none", borderBottom: "1px solid #000", width: "4%", fontSize: "8pt", verticalAlign: "bottom", paddingBottom: "1pt" }}
                            >
                                {v(a.location_province) || "Isabela"}
                            </td>
                        </tr>
                        {/* closing bottom border */}
                        <tr>
                            <td
                                colSpan={12}
                                className="nb-t nb-l nb-r"
                                style={{ border: "none", borderBottom: "1px solid #000", height: "3pt", padding: 0 }}
                            />
                        </tr>
                    </tbody>
                </table>

                {/* 10, 11, 12 — Area / Right / Status */}
                <table>
                    <colgroup>
                        <col style={{ width: "22%" }} />
                        <col style={{ width: "26%" }} />
                        <col style={{ width: "52%" }} />
                    </colgroup>
                    <tbody>
                        <tr>
                            {/* 10 — area */}
                            <td className="nb-t" style={{ height: "26pt", verticalAlign: "top" }}>
                                <span className="lbl">10. Project Area (sq.m.)</span>
                                <span className="val">{v(a.project_area_sqm) || nb}</span>
                            </td>
                            {/* 11 — right over land */}
                            <td className="nb-t nb-l" style={{ height: "26pt", verticalAlign: "top" }}>
                                <span className="lbl">11. Right Over Land</span>
                                <div style={{ marginTop: "3pt" }}>
                                    <span className="opt">
                                        <Chk on={v(a.right_over_land).toLowerCase() === "owner"} />
                                        {" "}Owner
                                    </span>
                                    <span className="opt">
                                        <Chk on={v(a.right_over_land).toLowerCase() === "lessee"} />
                                        {" "}Lessee
                                    </span>
                                </div>
                            </td>
                            {/* 12 — project nature/status */}
                            <td className="nb-t nb-l" style={{ height: "26pt", verticalAlign: "top" }}>
                                <span className="lbl">12. Project Nature / Status</span>
                                <div style={{ marginTop: "3pt" }}>
                                    <span className="opt">
                                        <Chk on={v(a.project_nature_duration).toLowerCase() === "permanent"} />
                                        {" "}Permanent
                                    </span>
                                    <span className="opt">
                                        <Chk on={v(a.project_nature_duration).toLowerCase() === "temporary"} />
                                        {" "}Temporary
                                        {" (Specify Years:\u00A0"}
                                        <Uline val={a.project_nature_years} w="28pt" />
                                        {")"}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 13 — Existing Land Use */}
                <table>
                    <tbody>
                        <tr>
                            <td className="nb-t" style={{ paddingBottom: "4pt" }}>
                                <span className="lbl">13. Existing Land Uses of Project Site</span>
                                {/* Line 1 */}
                                <div style={{ marginTop: "3pt", display: "flex", flexWrap: "nowrap", gap: "0 4pt", alignItems: "center" }}>
                                    {[
                                        ["Residential",   "residential"],
                                        ["Institutional", "institutional"],
                                        ["Commercial",    "commercial"],
                                        ["Industrial",    "industrial"],
                                        ["Vacant",        "vacant"],
                                    ].map(([lbl2, key]) => (
                                        <span key={key} className="opt">
                                            <Chk on={lu === key} /> {lbl2}
                                        </span>
                                    ))}
                                    <span className="opt">
                                        <Chk on={lu === "agricultural"} /> Agricultural
                                        {" (Specify crop:\u00A0"}
                                        <Uline val={lu === "agricultural" ? v(a.existing_land_use_crop) : ""} w="40pt" />
                                        {")"}
                                    </span>
                                </div>
                                {/* Line 2 */}
                                <div style={{ marginTop: "3pt", display: "flex", gap: "0 4pt", alignItems: "center" }}>
                                    <span className="opt">
                                        <Chk on={lu === "tenant"} /> Tenant
                                    </span>
                                    <span className="opt">
                                        <Chk on={lu === "not tenanted"} /> Not Tenanted
                                    </span>
                                    <span className="opt">
                                        <Chk on={isOther} /> Others
                                        {" (Specify:\u00A0"}
                                        <Uline val={isOther ? v(a.existing_land_use) : ""} w="70pt" />
                                        {")"}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 14 — Project Cost */}
                <table>
                    <tbody>
                        <tr>
                            <td className="nb-t" style={{ padding: "3pt 4pt" }}>
                                <span className="lbl">14. Project Cost / Capitalization (in Pesos)</span>
                                <div style={{ marginTop: "2pt", display: "flex", alignItems: "baseline", gap: "6pt" }}>
                                    <span style={{ fontSize: "9pt", fontWeight: 700 }}>
                                        {costFmt || nb}
                                    </span>
                                    {costWrd && (
                                        <span style={{ fontSize: "6.5pt", fontStyle: "italic", color: "#333" }}>
                                            ({costWrd})
                                        </span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ╔════════════════════════════════════════════╗
                    ║  SECTION III — ZONING / COMPLIANCE INFO   ║
                    ╚════════════════════════════════════════════╝ */}

                {/* Q15 */}
                <table>
                    <tbody>
                        <tr>
                            <td className="nb-t" style={{ paddingBottom: "4pt" }}>
                                <p className="q">
                                    15. IS THE PROJECT APPLIED FOR THE SUBJECT OF WRITTEN NOTICE(S) FROM THIS
                                    OFFICE AND/OR ITS ZONING ADMINISTRATOR TO THE EFFECT REQUIRING FOR
                                    PRESENTATION OF LOCATIONAL CLEARANCE / CERTIFICATE OF ZONING COMPLIANCE
                                    (LC/CZC) OR TO APPLY FOR LC/CZC?
                                </p>
                                <div style={{ marginBottom: "4pt" }}>
                                    <span className="opt">
                                        <Chk on={v(a.has_written_notice).toLowerCase() === "yes"} /> Yes
                                    </span>
                                    <span className="opt">
                                        <Chk on={v(a.has_written_notice).toLowerCase() !== "yes"} /> No
                                    </span>
                                </div>
                                <div className="sq">
                                    <span className="sq-lbl">15.a&nbsp;Name of HSRO Officer or Zoning Administrator who issued the notice(s):</span>
                                    <span className="sq-line">{v(a.notice_officer_name) || nb}</span>
                                </div>
                                <div className="sq" style={{ marginTop: "4pt" }}>
                                    <span className="sq-lbl">15.b&nbsp;Date(s) of notice(s):</span>
                                    <span className="sq-line">{v(a.notice_dates) || nb}</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Q16 */}
                <table>
                    <tbody>
                        <tr>
                            <td style={{ paddingBottom: "3pt", paddingTop: "2pt" }}>
                                <div style={{ fontSize: "6.5pt", lineHeight: "1.5" }}>
                                    <span style={{ fontWeight: "bold" }}>16. IS THE PROJECT APPLIED FOR THE SUBJECT OF SIMILAR APPLICATION(S) WITH OTHER OFFICES OF THE COMMISSION AND/OR DEPUTIZED ZONING ADMINISTRATOR?</span>
                                    {" "}
                                    <span className="opt"><Chk on={v(a.has_similar_application).toLowerCase() === "yes"} /> Yes</span>
                                    {" "}
                                    <span className="opt"><Chk on={v(a.has_similar_application).toLowerCase() !== "yes"} /> No</span>
                                    {" "}
                                    <span style={{ fontSize: "6.5pt" }}>If yes, please answer the following:</span>
                                </div>
                                <div style={{ marginTop: "3pt", fontSize: "6.5pt" }}>
                                    16. a) other HSRC office(s) where similar application(s) was/were filed:&nbsp;
                                    <span style={{
                                        display: "inline-block",
                                        width: "160pt",
                                        borderBottom: "1px solid #000",
                                        verticalAlign: "bottom",
                                        fontSize: "7.5pt",
                                    }}>
                                        {v(a.similar_application_offices) || "\u00A0"}
                                    </span>
                                </div>
                                <div style={{ marginTop: "3pt", fontSize: "6.5pt" }}>
                                    16. b) Date(s) filed:&nbsp;
                                    <span style={{
                                        display: "inline-block",
                                        width: "200pt",
                                        borderBottom: "1px solid #000",
                                        verticalAlign: "bottom",
                                        fontSize: "7.5pt",
                                    }}>
                                        {v(a.similar_application_dates) || "\u00A0"}
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Q17 */}
                <table>
                    <tbody>
                        <tr>
                            <td style={{ paddingBottom: "3pt", paddingTop: "2pt" }}>
                                <div style={{ fontSize: "6.5pt", fontWeight: "bold", marginBottom: "3pt" , marginTop: "5px"}}>
                                    17. PREFERRED MODE OF RELEASE OF DECISION
                                </div>
                                <div style={{ fontSize: "7.5pt", display: "flex", gap: "0 8pt", alignItems: "center", flexWrap: "wrap" }}>
                                    <span className="opt">
                                        <Chk on={rm === "pickup" || rm === "pick-up" || rm === "pick_up"} /> pick-up
                                    </span>
                                    <span className="opt">
                                        <Chk on={rm.includes("mail")} /> By mail, address to
                                    </span>
                                    <span className="opt">
                                        <Chk on={rm === "mail_applicant"} /> Applicant
                                    </span>
                                    <span className="opt">
                                        <Chk on={rm === "mail_representative"} /> Authorized Representative
                                    </span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ── 18. SIGNATURES + NOTARIAL — no gap between them ── */}
                <table style={{ marginBottom: "-2pt", marginTop: "5px"}}>
                    <colgroup>
                        <col style={{ width: "50%" }} />
                        <col style={{ width: "50%" }} />
                    </colgroup>
                    <tbody>
                        <tr>
                            <td style={{ padding: "0", border: "none" }}>
                                <div style={{ fontSize: "6.5pt", fontWeight: "bold", marginBottom: "0" }}>
                                    18. SIGNATURE OF APPLICANT
                                </div>
                            </td>
                            <td style={{ padding: "0", border: "none" }}>
                                <div style={{ fontSize: "6.5pt", fontWeight: "bold", marginBottom: "0" }}>
                                    SIGNATURE OF AUTHORIZED REPRESENTATIVE
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ── NOTARIAL — zero margin, directly touching section 18 ── */}
                <div style={{ marginTop: "0", fontSize: "6.5pt", lineHeight: "1", paddingTop: "8pt", paddingBottom: "8pt" }}>
                    {/* Republic + S.S. — standard PH notarial two-column format */}
                    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "0" }}>
                        {/* Left: Republic + underline */}
                        <div style={{ flex: 1, fontSize: "7pt", lineHeight: "1" }}>
                            <div style={{ fontWeight: "bold", marginBottom: "2pt" }}>Republic of the Philippines</div>
                            <div style={{ marginBottom: "0" }}>
                                <span style={{
                                    display: "inline-block",
                                    width: "140pt",
                                    borderBottom: "1px solid #000",
                                    verticalAlign: "bottom",
                                }}>
                                    {"\u00A0"}
                                </span>
                                )S.S
                            </div>
                        </div>
                     
                    </div>
                    
                    {/* Jurat lines — full width */}
                    <div style={{ marginTop: "4pt", width: "100%" }}>
                        {/* Jurat line 1 */}
                        <div style={{ marginBottom: "2pt" }}>
                            SUBSCRIBED AND SWORN TO before me this&nbsp;<Uline w="30pt" pl="8pt" pr="8pt" />&nbsp;day of&nbsp;<Uline w="80pt" pl="8pt" pr="8pt" />&nbsp;&nbsp;20<Uline w="20pt" pl="8pt" pr="8pt" />&nbsp;&nbsp;in the city of Ilagan,
                        </div>
                        {/* Jurat line 2 */}
                        <div style={{ marginBottom: "2pt" }}>
                            Province of Isabela affiant exhibit me his/her Residence Certificate No.&nbsp;<Uline w="80pt" pl="8pt" pr="8pt" />&nbsp;issued
                        </div>
                        {/* Jurat line 3 */}
                        <div>
                            at&nbsp;<Uline w="100pt" pl="8pt" pr="8pt" />&nbsp;&nbsp;on&nbsp;<Uline w="80pt" pl="8pt" pr="8pt" />&nbsp;&nbsp;20<Uline w="24pt" pl="8pt" pr="8pt" />&nbsp;.
                        </div>
                    </div>
                </div>

                {/* Bottom block — Doc/Page/Book/Series left, Notary Public right */}
                <div style={{ marginTop: "60pt", marginBottom: "30pt", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    {/* Left: notarial details */}
                    <div style={{ fontSize: "6.5pt", lineHeight: "2.1" }}>
                        <div>
                            Doc. No.&nbsp;<Uline w="50pt" />&nbsp;&nbsp;&nbsp;&nbsp;Page No.&nbsp;<Uline w="50pt" />
                        </div>
                        <div>
                            Book No.&nbsp;<Uline w="50pt" />&nbsp;&nbsp;&nbsp;&nbsp;Series of&nbsp;<Uline w="50pt" />
                        </div>
                    </div>
                    {/* Right: Notary Public */}
                    <div style={{ textAlign: "center", minWidth: "140pt" }}>
                        <div style={{
                            borderTop: "1.5px solid #000",
                            paddingTop: "3pt",
                            fontSize: "8pt",
                            fontWeight: "bold",
                            textAlign: "center",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                        }}>
                            Notary Public
                        </div>
                    </div>
                </div>

            </div>{/* end .pf-page */}
        </>
    );
}

/* tiny helper used for default control number */
function sprintf(fmt, n) {
    return fmt.replace("%03d", String(n).padStart(3, "0"));
}
