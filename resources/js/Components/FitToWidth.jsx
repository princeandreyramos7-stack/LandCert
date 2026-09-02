import React from "react";

/**
 * Scales a fixed-width document down to whatever screen width is available.
 *
 * The printable documents (Application Form, Zoning Clearance, Zoning
 * Certification) are laid out at a rigid 210mm so they print at true A4 size.
 * That is wider than a phone, so on screen they used to run off the right edge.
 *
 * This wrapper does not reflow anything — it applies a visual zoom to the whole
 * sheet. Every internal measurement stays in mm/pt, so print output is
 * unchanged. It only ever shrinks: on a wide monitor the sheet shows at its
 * true size rather than being blown up past what the printer will produce.
 *
 * Because CSS transforms do not affect layout, the wrapper is also given the
 * scaled box size — otherwise the page keeps reserving the sheet's full
 * unscaled height and leaves a tall gap underneath it.
 */

/* Printing and PDF capture both need the sheet at its true size. The width and
   height are written inline by the effect below, so overriding them needs
   !important. */
const FIT_CSS = `
.fit-viewport {
    margin: 0 auto;
    overflow: hidden;
}

.fit-scaler {
    width: max-content;
    transform: scale(var(--fit-scale, 1));
    transform-origin: top left;
}

.fit-viewport.fit-suspended {
    width: auto !important;
    height: auto !important;
    overflow: visible !important;
}

.fit-viewport.fit-suspended .fit-scaler {
    transform: none !important;
}

@media print {
    .fit-viewport {
        width: auto !important;
        height: auto !important;
        margin: 0 !important;
        overflow: visible !important;
    }

    .fit-scaler {
        width: auto !important;
        transform: none !important;
    }
}
`;

/**
 * Turns the zoom off around a node so a PDF capture sees the sheet at full
 * size. html2canvas walks computed styles, so a scaled ancestor would otherwise
 * end up baked into the saved file.
 *
 * Returns the function that puts the zoom back — call it whether the capture
 * succeeded or failed.
 */
export function suspendFit(node) {
    const viewport = node?.closest?.(".fit-viewport");
    if (!viewport) return () => {};

    viewport.classList.add("fit-suspended");
    return () => viewport.classList.remove("fit-suspended");
}

export default function FitToWidth({ children }) {
    const viewportRef = React.useRef(null);
    const scalerRef = React.useRef(null);

    React.useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const scaler = scalerRef.current;
        if (!viewport || !scaler) return;

        let lastScale = null;

        const fit = () => {
            // Measured on the parent, not the viewport: the viewport is what
            // this effect resizes, so reading it would feed back on itself.
            const available = viewport.parentElement?.clientWidth ?? 0;
            const naturalWidth = scaler.offsetWidth;
            const naturalHeight = scaler.offsetHeight;
            if (!available || !naturalWidth) return;

            const scale = Math.min(1, available / naturalWidth);
            if (scale === lastScale) return;
            lastScale = scale;

            viewport.style.setProperty("--fit-scale", String(scale));
            viewport.style.width = `${naturalWidth * scale}px`;
            viewport.style.height = `${naturalHeight * scale}px`;
        };

        fit();

        const observer = new ResizeObserver(fit);
        if (viewport.parentElement) observer.observe(viewport.parentElement);
        observer.observe(scaler);

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: FIT_CSS }} />
            <div ref={viewportRef} className="fit-viewport">
                <div ref={scalerRef} className="fit-scaler">
                    {children}
                </div>
            </div>
        </>
    );
}
