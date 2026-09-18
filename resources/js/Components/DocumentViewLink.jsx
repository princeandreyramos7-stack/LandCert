import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    RotateCcw,
    RotateCw,
    ZoomIn,
    ZoomOut,
    Maximize2,
    ExternalLink,
    Download,
} from "lucide-react";
import { Switch } from "@/Components/ui/switch";

/**
 * A requirement document, opened in the app rather than in a browser tab, so
 * a scan that came in sideways can be turned upright.
 *
 * Scans are photographed as often as they are scanned, and a landscape photo
 * of a title arrives rotated a quarter turn either way - previously the only
 * remedy was to tilt one's head or save the file and open it in something
 * else. Here the officer turns the picture in 90-degree steps (four presses
 * bring it back), zooms, and drags to pan when zoomed in.
 *
 * A PDF is shown in the browser's own viewer, which has its own rotate and
 * zoom; the rotate buttons are hidden for one rather than pretending to work.
 */

const ROTATE_STEP = 90;
const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

const isPdf = (name = "", url = "") => /\.pdf(\?|$)/i.test(String(name)) || /\.pdf(\?|$)/i.test(String(url));

/** The orientation, in the words someone turning a photograph would use. */
const ANGLE_LABEL = { 0: "upright", 90: "turned right", 180: "upside down", 270: "turned left" };

function ViewerToolbarButton({ onClick, title, disabled, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            disabled={disabled}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#0d1f5c] disabled:cursor-not-allowed disabled:opacity-40"
        >
            {children}
        </button>
    );
}

/**
 * @param verified  Whether the requirement this document belongs to is
 *                  verified. Only meaningful alongside onVerify.
 * @param onVerify  Called with the new state when the officer marks the
 *                  requirement verified (or undoes it) from in here. Left
 *                  out where verifying is not this viewer's business - the
 *                  applicant's own copies, and the Administrator's read-only
 *                  view - and then no such control is shown.
 */
export function DocumentViewerModal({ doc, isOpen, onClose, verified = false, onVerify = null }) {
    const url = doc ? `/requirements/${doc.id}/view` : null;
    const name = doc?.original_filename || doc?.name || "Document";
    const pdf = isPdf(name, url);

    const [angle, setAngle] = useState(0);
    const [zoomIndex, setZoomIndex] = useState(2); // 1x
    const [natural, setNatural] = useState(null); // { w, h }
    const [box, setBox] = useState({ w: 0, h: 0 });
    const boxRef = useRef(null);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    /** The picture's own size, once the browser knows it. */
    const readNatural = useCallback((node) => {
        if (node?.naturalWidth) setNatural({ w: node.naturalWidth, h: node.naturalHeight });
    }, []);

    /**
     * Each document opens the way it was filed - turning one is not a setting
     * that outlives it.
     *
     * The size is read here as well as from onLoad: a picture the browser
     * already holds is complete before React attaches the handler and that
     * event never comes. Both live in one effect so the reset cannot run
     * after the read and undo it.
     */
    useEffect(() => {
        if (!isOpen) return;
        setAngle(0);
        setZoomIndex(2);
        if (imgRef.current?.complete && imgRef.current.naturalWidth) {
            readNatural(imgRef.current);
        } else {
            setNatural(null);
        }
    }, [isOpen, doc?.id, readNatural]);

    /**
     * The picture is fitted to the pane it is shown in - and a quarter turn
     * swaps which side of the pane constrains it, so the pane is measured.
     *
     * Measured from a callback ref rather than an effect: the dialog mounts
     * its contents a beat after it opens, so an effect keyed on `isOpen` ran
     * while the pane did not exist yet, measured nothing, and never looked
     * again - which left every picture unfitted.
     */
    const attachPane = useCallback((node) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        boxRef.current = node;
        if (!node) return;
        const measure = () => setBox({ w: node.clientWidth, h: node.clientHeight });
        measure();
        observerRef.current = new ResizeObserver(measure);
        observerRef.current.observe(node);
    }, []);

    useEffect(() => () => observerRef.current?.disconnect(), []);

    const turn = useCallback((by) => setAngle((a) => (a + by + 360) % 360), []);

    // The keys someone would try: arrows or brackets to turn, +/- to zoom.
    useEffect(() => {
        if (!isOpen || pdf) return;
        const onKey = (e) => {
            if (e.key === "]" || e.key === "ArrowRight") { turn(ROTATE_STEP); e.preventDefault(); }
            else if (e.key === "[" || e.key === "ArrowLeft") { turn(-ROTATE_STEP); e.preventDefault(); }
            else if (e.key === "+" || e.key === "=") { setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1)); }
            else if (e.key === "-") { setZoomIndex((i) => Math.max(0, i - 1)); }
            else if (e.key === "0") { setAngle(0); setZoomIndex(2); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, pdf, turn]);

    const zoom = ZOOM_STEPS[zoomIndex];
    const quarterTurned = angle === 90 || angle === 270;

    /**
     * The size to draw the picture at, and the room its rotated self takes.
     *
     * A quarter turn swaps which side of the pane constrains it, so the fit
     * is measured against the swapped side. A rotated element still occupies
     * its unrotated box in the layout, so the wrapper is given the footprint
     * the turned picture actually covers - otherwise the pane centres and
     * scrolls by the wrong shape.
     */
    const PANE_PADDING = 32;
    const layout = (() => {
        if (!natural || !box.w || !box.h) return null;
        const availW = (quarterTurned ? box.h : box.w) - PANE_PADDING;
        const availH = (quarterTurned ? box.w : box.h) - PANE_PADDING;
        const scale = Math.min(availW / natural.w, availH / natural.h, 1);
        const w = Math.max(1, Math.round(natural.w * scale));
        const h = Math.max(1, Math.round(natural.h * scale));
        return { w, h, footW: quarterTurned ? h : w, footH: quarterTurned ? w : h };
    })();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* `landscape` is the dialog's own full-height form: it sizes the
                box and wraps the children in a full-height div, which is what
                lets the picture pane below take all the room that is left.
                Padding and width from the base class cannot be overridden from
                out here, so nothing tries to. */}
            <DialogContent landscape className="bg-white sm:rounded-2xl">
              <div className="flex h-full flex-col">
                <DialogHeader className="shrink-0 space-y-0 border-b border-gray-100 pb-3 pr-8 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                            <DialogTitle className="truncate text-sm font-semibold text-gray-900">{name}</DialogTitle>
                            <p className="mt-0.5 text-xs text-gray-400">
                                {pdf
                                    ? "PDF — use the viewer's own controls to rotate or zoom"
                                    : `${ANGLE_LABEL[angle]} · ${Math.round(zoom * 100)}%`}
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                            {/* Verifying is why the officer opened this at all,
                                so it is offered here rather than only back in
                                the checklist behind the modal - as the same
                                switch that column carries, so the two read as
                                one control rather than two ways to decide. */}
                            {onVerify && (
                                <>
                                    <label className="inline-flex cursor-pointer select-none items-center gap-2">
                                        <span className={`text-xs font-semibold ${verified ? "text-blue-700" : "text-gray-600"}`}>
                                            {verified ? "Verified" : "Mark as verified"}
                                        </span>
                                        <Switch
                                            checked={verified}
                                            onCheckedChange={onVerify}
                                            aria-label="Mark as verified"
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </label>
                                    <span className="mx-1 h-5 w-px bg-gray-200" />
                                </>
                            )}
                            {!pdf && (
                                <>
                                    <ViewerToolbarButton onClick={() => turn(-ROTATE_STEP)} title="Rotate left (←)">
                                        <RotateCcw className="h-4 w-4" />
                                    </ViewerToolbarButton>
                                    <ViewerToolbarButton onClick={() => turn(ROTATE_STEP)} title="Rotate right (→)">
                                        <RotateCw className="h-4 w-4" />
                                    </ViewerToolbarButton>
                                    <span className="mx-1 h-5 w-px bg-gray-200" />
                                    <ViewerToolbarButton onClick={() => setZoomIndex((i) => Math.max(0, i - 1))} disabled={zoomIndex === 0} title="Zoom out (−)">
                                        <ZoomOut className="h-4 w-4" />
                                    </ViewerToolbarButton>
                                    <ViewerToolbarButton onClick={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))} disabled={zoomIndex === ZOOM_STEPS.length - 1} title="Zoom in (+)">
                                        <ZoomIn className="h-4 w-4" />
                                    </ViewerToolbarButton>
                                    <ViewerToolbarButton onClick={() => { setAngle(0); setZoomIndex(2); }} title="Reset (0)">
                                        <Maximize2 className="h-4 w-4" />
                                    </ViewerToolbarButton>
                                    <span className="mx-1 h-5 w-px bg-gray-200" />
                                </>
                            )}
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Open in a new tab"
                                aria-label="Open in a new tab"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#0d1f5c]"
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                            <a
                                href={url}
                                download={name}
                                title="Download"
                                aria-label="Download"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-[#0d1f5c]"
                            >
                                <Download className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </DialogHeader>

                <div ref={attachPane} className="relative mt-3 min-h-0 flex-1 overflow-auto rounded-lg bg-gray-100">
                    {!doc ? null : pdf ? (
                        <iframe src={url} title={name} className="h-full w-full border-0 bg-white" />
                    ) : (
                        <div className="flex min-h-full min-w-full items-center justify-center p-4">
                            {/* The wrapper holds the room the turned picture
                                covers; the picture itself is centred in it and
                                rotated about its own middle. */}
                            <div
                                className="relative shrink-0"
                                style={layout ? { width: `${layout.footW}px`, height: `${layout.footH}px` } : undefined}
                            >
                                <img
                                    ref={imgRef}
                                    src={url}
                                    alt={name}
                                    onLoad={(e) => readNatural(e.target)}
                                    draggable={false}
                                    style={{
                                        // maxWidth is released deliberately: the
                                        // stylesheet caps every image at its
                                        // container's width, and a quarter-turned
                                        // picture is wider than the box that
                                        // holds it - which squashed it square.
                                        ...(layout
                                            ? { width: `${layout.w}px`, height: `${layout.h}px`, maxWidth: "none", maxHeight: "none", position: "absolute", left: "50%", top: "50%" }
                                            : { maxWidth: "100%", maxHeight: "100%" }),
                                        transform: layout
                                            ? `translate(-50%, -50%) rotate(${angle}deg) scale(${zoom})`
                                            : `rotate(${angle}deg) scale(${zoom})`,
                                        transformOrigin: "center",
                                        transition: "transform 150ms ease, width 150ms ease, height 150ms ease",
                                    }}
                                    className="select-none bg-white shadow-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>
              </div>
            </DialogContent>
        </Dialog>
    );
}

/**
 * The "View" control on a requirement document. Looks like whatever the page
 * around it wants (className / children); opens the document in the viewer
 * above instead of a browser tab.
 */
export function DocumentViewLink({ doc, className = "", title, children, verified = false, onVerify = null }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} title={title || doc?.original_filename} className={className}>
                {children}
            </button>
            <DocumentViewerModal
                doc={doc}
                isOpen={open}
                onClose={() => setOpen(false)}
                verified={verified}
                onVerify={onVerify}
            />
        </>
    );
}
