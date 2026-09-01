import React from "react";

/**
 * The official CPDO letterhead.
 *
 * The Application Form, the Zoning Clearance and the Zoning Certification all
 * open with this exact block, so the three printed documents lead with one
 * header instead of three near-copies. Everything is inline styles — the
 * letterhead has to look the same inside the form (Arial, 8pt) as it does
 * inside the certificates (Times New Roman, 10-11pt), so it sets its own type
 * and colours rather than inheriting the host document's.
 *
 * `code` is the small control number a form carries in the top-right corner
 * (the clearance's "CPD-001-0"); omit it and the corner stays empty.
 */
export default function OfficialLetterhead({ code = null }) {
    return (
        <div
            className="certificate-header"
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                padding: '8pt 0',
                fontFamily: "'Times New Roman', serif",
                color: '#000080',
                background: 'linear-gradient(180deg,#ffffff 0%,#eefdfd 8%,#d9f9fa 25%,#bff5f6 55%,#a8eff1 100%)',
                borderBottom: '3px solid #2222ff',
                // The gradient and the blue rule are part of the seal — they
                // must survive the printer's "ignore backgrounds" default.
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14pt', flex: 1 }}>
                <div style={{ width: '74pt', height: '74pt', flexShrink: 0 }}>
                    <img
                        src="/images/ilagan1logo.jpg"
                        alt="City of Ilagan"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'darken' }}
                    />
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                    <div style={{ fontSize: '10pt' }}>Republic of the Philippines</div>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>CITY OF ILAGAN</div>
                    <div style={{ fontSize: '10pt' }}>Province of Isabela</div>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', marginTop: '2pt' }}>
                        CITY PLANNING &amp; DEVELOPMENT OFFICE
                    </div>
                </div>
            </div>

            {code && (
                <div style={{ position: 'absolute', top: 0, right: '100pt', textAlign: 'center' }}>
                    <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#000' }}>{code}</div>
                </div>
            )}

            <div style={{ width: '74pt', height: '74pt', flexShrink: 0 }}>
                <img
                    src="/images/Ilagan Logo2.png"
                    alt="City of Ilagan 2030"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'darken' }}
                />
            </div>
        </div>
    );
}
