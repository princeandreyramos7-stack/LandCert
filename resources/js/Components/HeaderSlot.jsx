import React, { createContext, useContext } from "react";

/**
 * Lets a widget that a page declares deep in its body render up in the layout's
 * top bar instead.
 *
 * Each layout mounts an empty node beside the role badge and publishes it here;
 * a component that calls `useHeaderSlot()` portals itself into that node. Pages
 * therefore keep declaring the widget where it logically belongs, while it
 * shows up in the top-right corner. A page rendered without a layout gets
 * `null` back and the widget simply renders in place.
 */
const HeaderSlotContext = createContext(null);

/** The DOM node to portal into, or null when there is no top bar. */
export function useHeaderSlot() {
    return useContext(HeaderSlotContext);
}

/** Wraps a layout's children; `slot` is the top-bar node (a ref callback state). */
export function HeaderSlotProvider({ slot, children }) {
    return (
        <HeaderSlotContext.Provider value={slot}>
            {children}
        </HeaderSlotContext.Provider>
    );
}
