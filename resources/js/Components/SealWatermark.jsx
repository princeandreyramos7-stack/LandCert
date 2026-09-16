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
 *
 * `viewport` keeps the seal at the centre of the screen at all times - the
 * staff layouts use it so the dashboard's tabs, which differ in height, all
 * show the seal in exactly the same place.
 *
 * `follow` is for a container much taller than the screen, such as an
 * application's full record: centred once, the seal would sit somewhere in
 * the middle of a long page and be scrolled past. Following, it starts at
 * the top of the container and then keeps to the middle of the screen as the
 * page scrolls, stopping at the container's end.
 */
export default function SealWatermark({ className = "", follow = false, viewport = false }) {
    const seal = (
        <img
            src="/images/ilagan1logo.png"
            alt=""
            className="w-[min(60%,34rem)] max-w-none select-none opacity-[0.08]"
        />
    );

    // Always at the middle of the screen: the same spot on a short page, a
    // long one, and every tab of the dashboard, however far it is scrolled.
    // The container starts under the 3.5rem top bar, so the seal's resting
    // place is padded down to where the sticky offset will hold it, and the
    // two positions coincide - it never jumps when scrolling begins.
    if (viewport) {
        return (
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 -z-10 pt-[max(0px,calc(50vh-17rem-3.5rem))] ${className}`}
            >
                <div className="sticky top-[max(1rem,calc(50vh-17rem))] flex justify-center">{seal}</div>
            </div>
        );
    }

    if (follow) {
        return (
            // No overflow-hidden here: an ancestor that clips is what a sticky
            // element sticks to, and this box never scrolls. The seal keeps to
            // the page's own scrolling instead.
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
            >
                <div className="sticky top-[max(1rem,calc(50vh-17rem))] flex justify-center">{seal}</div>
            </div>
        );
    }

    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden ${className}`}
        >
            {seal}
        </div>
    );
}
