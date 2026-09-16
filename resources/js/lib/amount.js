/**
 * Peso amount fields: what the officer types versus what is stored.
 *
 * The stored value is a plain number string ("12500.5"); the field shows it
 * with thousands separators ("12,500.5") and strips them back off on every
 * keystroke so the state never carries formatting.
 */

/** "12500.5" -> "12,500.5"; empty and null stay empty. */
export function formatAmountForDisplay(rawValue) {
    if (rawValue === null || rawValue === undefined || rawValue === "") return "";
    const raw = String(rawValue);
    const [integerPart, ...decimalParts] = raw.split(".");
    const hasDecimalPoint = raw.includes(".");
    const groupedInteger = integerPart === "" ? "" : Number(integerPart).toLocaleString("en-US");
    return hasDecimalPoint ? `${groupedInteger}.${decimalParts.join("")}` : groupedInteger;
}

/** "12,500.505" -> "12500.50": digits and one decimal point, two places. */
export function parseAmountInput(displayValue) {
    let cleaned = String(displayValue).replace(/[^\d.]/g, "");
    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
        const integerPart = cleaned.slice(0, firstDot);
        const decimalPart = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
        cleaned = `${integerPart}.${decimalPart}`;
    }
    return cleaned;
}
