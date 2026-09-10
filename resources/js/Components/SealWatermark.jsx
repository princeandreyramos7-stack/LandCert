/**
 * The City of Ilagan seal, faint and centred behind a page's content.
 *
 * Render it as the first child of the container it should sit in, and give that
 * container `relative isolate`. Both parts matter:
 *
 *  - `isolate` makes the container a stacking context, so the seal's negative
 *    z-index paints *above* that container's own background instead of
 *    disappearing behind it.
 *  - `-z-10`, not `z-0`. Within a stacking context a positioned element with
 *    z-index 0 paints above non-positioned siblings, so `z-0` would put the
 *    seal over the page's tables and cards rather than under them.
 *
 * A page that paints its own opaque background (see the applications list)
 * covers a watermark placed in the layout, so it renders its own inside that
 * background instead.
 */
export default function SealWatermark({ className = "" }) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden ${className}`}
        >
            <img
                src="/images/ilagan1logo.png"
                alt=""
                className="w-[min(60%,34rem)] max-w-none select-none opacity-[0.05]"
            />
        </div>
    );
}
