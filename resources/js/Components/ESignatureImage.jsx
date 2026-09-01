import React from "react";

/**
 * An e-signature with its verification watermark behind it.
 *
 * The signature images have transparent backgrounds, so "ELECTRONIC SIGNATURE ·
 * VERIFIED" sits underneath the ink and stays legible without obscuring it —
 * enough that someone holding the paper can see the copy was issued by the
 * system rather than signed by hand.
 *
 * Renders nothing at all when the signer has no signature on file: that slot is
 * a document still waiting for a wet signature, and it must not be marked as
 * verified.
 */
export default function ESignatureImage({ src, maxHeight = '38pt', maxWidth = '85%', marginBottom = '-4pt' }) {
    if (!src) {
        return null;
    }

    return (
        <>
            <span
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '6pt',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    color: 'rgba(34, 34, 255, 0.42)',
                    pointerEvents: 'none',
                    // The watermark is the verification mark, so it has to survive
                    // the printer's "ignore background colours" default.
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                }}
            >
                Electronic Signature · Verified
            </span>
            <img
                src={src}
                alt=""
                crossOrigin="anonymous"
                style={{
                    position: 'relative',
                    maxHeight,
                    maxWidth,
                    objectFit: 'contain',
                    marginBottom,
                }}
            />
        </>
    );
}
