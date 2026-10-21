import { createLucideIcon } from "lucide-react";

/*
 * Lucide's Receipt with a peso sign where its dollar sign was. Lucide has a
 * PhilippinePeso glyph but no peso receipt; this keeps the same outline,
 * stroke and props (className, size, strokeWidth) as every other icon.
 */
const PesoReceipt = createLucideIcon("PesoReceipt", [
    ["path", { d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z", key: "receipt" }],
    ["path", { d: "M10 18V6h3a3.5 3.5 0 0 1 0 7h-3", key: "peso-p" }],
    ["path", { d: "M8 8.5h8.5", key: "peso-bar-1" }],
    ["path", { d: "M8 11.5h8.5", key: "peso-bar-2" }],
]);

export default PesoReceipt;
