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
    // A path that 404s used to hide only the image, leaving the "Electronic
    // Signature · Verified" watermark on its own. On a certificate that is worse
    // than showing nothing: it asserts the document was signed electronically
    // when no signature rendered at all. A slot that cannot show the ink shows
    // no verification either, and reverts to a blank line for a wet signature.
    const [failed, setFailed] = React.useState(false);

    React.useEffect(() => {
        setFailed(false);
    }, [src]);

    if (!src || failed) {
        return null;
    }

    // Normalize the signature path
    // Handle both relative paths (/images/...) and full URLs
    const getSignaturePath = (path) => {
        if (!path) return null;
        
        // If it's already a full URL, return as is
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        
        // If it starts with /storage/, prepend APP_URL
        if (path.startsWith('/storage/')) {
            return path;
        }
        
        // If it's a relative path starting with /images/, use it as is
        if (path.startsWith('/images/')) {
            return path;
        }
        
        // If it's just a filename or relative path, prepend /images/
        if (!path.startsWith('/')) {
            return `/images/${path}`;
        }
        
        return path;
    };

    const signaturePath = getSignaturePath(src);

    if (!signaturePath) {
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
                src={signaturePath}
                alt=""
                crossOrigin="anonymous"
                onError={() => {
                    console.warn('Signature image failed to load:', signaturePath);
                    setFailed(true);
                }}
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
