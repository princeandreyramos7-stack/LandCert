import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A select you can type into, styled as the form's other selects.
 *
 * The plain Select is fine for a dozen options and hopeless for the lists
 * here: 1,600 cities and, for the City of Manila alone, 897 barangays. This
 * keeps the same trigger — same height, border and chevron — and opens a
 * panel with a filter box, so a barangay is found by typing three letters
 * rather than by scrolling.
 *
 * Only the first `limit` matches are drawn. Rendering 897 rows on every
 * keystroke is what makes a list like this feel broken; a note tells the
 * reader to keep typing when there are more.
 *
 * @param options  [{ value, label, hint }]
 * @param value    the selected `value`, or ""
 * @param loading  list still being fetched: shown, but not openable
 * @param emptyText what to say when there is nothing to choose from
 */
export function SearchableSelect({
    options = [],
    value = "",
    onChange,
    placeholder = "Select…",
    disabled = false,
    loading = false,
    emptyText = "Nothing to choose from",
    id,
    name,
    invalid = false,
    limit = 200,
    className,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const rootRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const selected = useMemo(() => options.find((o) => String(o.value) === String(value)) || null, [options, value]);

    const matches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        // Anything containing the text, but a name that starts with it first:
        // typing "san" should offer San Fernando before Dasmariñas.
        const starts = [];
        const contains = [];
        for (const o of options) {
            const label = String(o.label).toLowerCase();
            if (label.startsWith(q)) starts.push(o);
            else if (label.includes(q)) contains.push(o);
        }
        return starts.concat(contains);
    }, [options, query]);

    const shown = matches.slice(0, limit);

    // Close when the click lands outside, and reset the filter for next time.
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    useEffect(() => {
        if (open) {
            setQuery("");
            setActive(Math.max(0, shown.findIndex((o) => String(o.value) === String(value))));
            // Focus after the panel exists, or the caret lands nowhere.
            const t = setTimeout(() => inputRef.current?.focus(), 0);
            return () => clearTimeout(t);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => { setActive(0); }, [query]);

    // Keep the highlighted row in view while arrowing through a long list.
    useEffect(() => {
        if (!open || !listRef.current) return;
        const el = listRef.current.querySelector(`[data-index="${active}"]`);
        el?.scrollIntoView({ block: "nearest" });
    }, [active, open]);

    const pick = (option) => {
        onChange?.(option.value, option);
        setOpen(false);
    };

    const onKeyDown = (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, shown.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); if (shown[active]) pick(shown[active]); }
        else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    };

    const isDisabled = disabled || loading;

    return (
        <div ref={rootRef} className={cn("relative", className)}>
            <button
                type="button"
                id={id}
                name={name}
                disabled={isDisabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => !isDisabled && setOpen((o) => !o)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    invalid && "border-red-400 focus:ring-red-400",
                    !selected && "text-muted-foreground"
                )}
            >
                <span className="truncate text-left">
                    {loading ? "Loading…" : selected ? selected.label : placeholder}
                </span>
                {loading
                    ? <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-60" />
                    : <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />}
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                    <div className="flex items-center gap-2 border-b border-gray-100 px-3">
                        <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Type to search…"
                            aria-label="Search options"
                            className="h-9 w-full border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>

                    <ul ref={listRef} role="listbox" className="max-h-60 overflow-y-auto py-1">
                        {options.length === 0 && (
                            <li className="px-3 py-6 text-center text-sm text-gray-400">{emptyText}</li>
                        )}
                        {options.length > 0 && shown.length === 0 && (
                            <li className="px-3 py-6 text-center text-sm text-gray-400">No match for “{query}”</li>
                        )}
                        {shown.map((o, i) => {
                            const isSelected = String(o.value) === String(value);
                            return (
                                <li key={o.value} data-index={i}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        onMouseEnter={() => setActive(i)}
                                        onClick={() => pick(o)}
                                        className={cn(
                                            "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm",
                                            i === active ? "bg-[#0d1f5c]/5" : "bg-transparent",
                                            isSelected && "font-semibold text-[#0d1f5c]"
                                        )}
                                    >
                                        <span className="truncate">
                                            {o.label}
                                            {o.hint && <span className="ml-2 text-xs font-normal text-gray-400">{o.hint}</span>}
                                        </span>
                                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                                    </button>
                                </li>
                            );
                        })}
                        {matches.length > shown.length && (
                            <li className="px-3 py-2 text-center text-xs text-gray-400">
                                {matches.length - shown.length} more — keep typing to narrow it down
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
