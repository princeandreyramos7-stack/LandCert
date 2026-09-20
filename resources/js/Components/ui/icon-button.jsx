import React from "react";
import { Link } from "@inertiajs/react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * A button that is only an icon, and therefore says what it is.
 *
 * An icon on its own is a guess: the office learns what the tray means by
 * clicking it and finding out. Every icon-only control in the system goes
 * through here so the label is impossible to forget - `label` becomes both
 * the tooltip a mouse sees and the accessible name a screen reader or a
 * keyboard user gets, and neither can be added without the other.
 *
 * `hint` is for the second line: what the action will do, or why it is
 * unavailable. A disabled control still shows its tooltip, because "why can
 * I not press this" is exactly the moment the explanation is wanted - so the
 * trigger wraps a span when disabled, which still receives pointer events.
 */

const TONES = {
    default:
        "text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400",
    primary:
        "text-[#0d1f5c] hover:bg-[#0d1f5c]/10 hover:text-[#0d1f5c] focus-visible:ring-[#0d1f5c]/40",
    danger: "text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-400",
    success:
        "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-emerald-400",
    warning:
        "text-amber-600 hover:bg-amber-50 hover:text-amber-700 focus-visible:ring-amber-400",
};

const SIZES = {
    sm: "h-7 w-7",
    default: "h-8 w-8",
    lg: "h-10 w-10",
};

export function IconButton({
    label,
    hint,
    icon: Icon,
    tone = "default",
    size = "default",
    href,
    side = "top",
    className,
    children,
    disabled,
    ...props
}) {
    if (!label && process.env.NODE_ENV !== "production") {
        // A missed label is the whole problem this component exists to stop.
        console.warn("IconButton rendered without a label", props);
    }

    const shared = cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-40",
        TONES[tone] ?? TONES.default,
        SIZES[size] ?? SIZES.default,
        className,
    );

    const content = children ?? (Icon ? <Icon className="h-4 w-4" /> : null);

    const control = href ? (
        <Link href={href} aria-label={label} className={shared} {...props}>
            {content}
        </Link>
    ) : (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            className={shared}
            {...props}
        >
            {content}
        </button>
    );

    return (
        <Tooltip>
            {/* A disabled button swallows the hover that would open the
                tooltip, so it is wrapped in something that does not. */}
            <TooltipTrigger asChild>
                {disabled && !href ? (
                    <span className="inline-flex cursor-not-allowed">{control}</span>
                ) : (
                    control
                )}
            </TooltipTrigger>
            <TooltipContent side={side} className="max-w-[16rem]">
                <p className="font-semibold">{label}</p>
                {hint && <p className="mt-0.5 text-[11px] opacity-80">{hint}</p>}
            </TooltipContent>
        </Tooltip>
    );
}

/**
 * Explains something that is not a control: a status pill, a column heading,
 * an abbreviation the office uses. Renders as a dotted underline so it is
 * discoverable rather than hidden.
 */
export function Explain({ children, hint, side = "top", className, asChild = false }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild={asChild}>
                {asChild ? (
                    children
                ) : (
                    <span
                        tabIndex={0}
                        className={cn(
                            "cursor-help underline decoration-dotted decoration-from-font underline-offset-2",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1f5c]/40 rounded",
                            className,
                        )}
                    >
                        {children}
                    </span>
                )}
            </TooltipTrigger>
            <TooltipContent side={side} className="max-w-[18rem]">
                {hint}
            </TooltipContent>
        </Tooltip>
    );
}

/**
 * Wraps any existing control that already has its own styling, adding only
 * the tooltip and the accessible name. For the places where replacing the
 * markup with IconButton would mean losing a bespoke design.
 */
export function WithTooltip({ label, hint, side = "top", children }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent side={side} className="max-w-[16rem]">
                <p className="font-semibold">{label}</p>
                {hint && <p className="mt-0.5 text-[11px] opacity-80">{hint}</p>}
            </TooltipContent>
        </Tooltip>
    );
}

export default IconButton;
