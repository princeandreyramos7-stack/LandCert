import React from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * The verification mark printed on every issued sheet: a QR that opens the
 * public /verify/{code} page, with the address and the code spelled out next
 * to it for anyone whose phone will not read the picture.
 *
 * Drawn from `application.verification` (ApplicationDocuments::verification).
 * Nothing is printed until the certificate record exists - that is the point
 * at which the office records the payment and actually issues the document -
 * so a proof printed earlier is simply unmarked, not marked with a dead code.
 *
 * `caption` places the text under the QR ("below", the certificate's roomy
 * footer) or to its left ("beside", the clearance, which is already a full
 * page and has no height to spare).
 *
 * Plain black on white, no rounding, no gradient: html2canvas (Download PDF)
 * and the office's laser printer both reproduce it faithfully that way.
 */
export default function VerificationQr({ verification, size = 58, caption = 'below', style = {} }) {
    if (!verification?.url) {
        return null;
    }

    const hostAndPath = verification.url.replace(/^https?:\/\//, '');
    const beside = caption === 'beside';

    const text = (
        <div
            style={{
                textAlign: 'right',
                whiteSpace: 'nowrap',
                marginTop: beside ? 0 : '2pt',
                marginRight: beside ? '4pt' : 0,
            }}
        >
            <div style={{ fontWeight: 'bold', letterSpacing: '0.04em' }}>SCAN TO VERIFY</div>
            <div>{hostAndPath}</div>
            <div style={{ fontFamily: "'Courier New', monospace", letterSpacing: '0.08em' }}>
                {verification.code}
            </div>
        </div>
    );

    const qr = (
        <QRCodeSVG
            value={verification.url}
            size={size}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            includeMargin={false}
            style={{ display: 'block', width: `${size}pt`, height: `${size}pt`, flexShrink: 0 }}
        />
    );

    return (
        <div
            className="verification-qr"
            style={{
                display: 'flex',
                flexDirection: beside ? 'row' : 'column',
                alignItems: beside ? 'flex-end' : 'flex-end',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '6pt',
                lineHeight: 1.3,
                color: '#000',
                ...style,
            }}
        >
            {beside ? <>{text}{qr}</> : <>{qr}{text}</>}
        </div>
    );
}
