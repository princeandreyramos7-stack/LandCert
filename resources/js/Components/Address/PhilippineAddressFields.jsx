import React, { useCallback, useEffect, useRef, useState } from "react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { SearchableSelect } from "@/Components/ui/searchable-select";
import { MapPin } from "lucide-react";

/**
 * Region → Province → Municipality/City → Barangay → Street.
 *
 * Each list is fetched only once its parent has been chosen, and choosing a
 * new parent clears everything under it, so an address can never be half of
 * one place and half of another. The street is the one part typed by hand:
 * no list has house numbers in it.
 *
 * The five values live in the form's own state under `${prefix}_region_code`,
 * `${prefix}_province_code` … `${prefix}_street`, so they post with the rest
 * of the form.
 */

// Lists are the same for everyone and change about once a year, so a list
// fetched for one address is reused for the next one and for the rest of the
// visit. Kept outside the component so it survives the steps unmounting.
const cache = new Map();

async function fetchList(url) {
    if (cache.has(url)) return cache.get(url);

    const promise = fetch(url, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
    })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((body) => body.data ?? [])
        .catch((error) => {
            // A failed fetch must not be remembered, or the list stays broken
            // for the rest of the visit with no way to retry.
            cache.delete(url);
            throw error;
        });

    cache.set(url, promise);
    return promise;
}

const PROVINCE_LABEL = {
    district: "District",
    standalone: "City",
};

/**
 * One region/province/city/barangay row. Module-level, not defined inside
 * PhilippineAddressFields: a component declared inside another component's
 * body is a new function - a new component *type* - on every render of the
 * parent, so React unmounts and remounts it (and the SearchableSelect inside
 * it, with its own open/search state and effects) instead of updating it in
 * place. That parent re-renders on every keystroke anywhere in the form
 * (Inertia's setData clones the whole form on each change), so every
 * dropdown here was being torn down and rebuilt on every keystroke typed
 * into *any* field, address-related or not - the main cause of the form
 * feeling laggy.
 */
function AddressRow({ id, label, star, value, options, onChange, disabled, loading, placeholder, waitingFor, emptyText, invalid, error }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs font-medium text-gray-700">
                {label} {star}
            </Label>
            <SearchableSelect
                id={id}
                value={value}
                options={options}
                onChange={onChange}
                disabled={disabled || Boolean(waitingFor)}
                loading={loading}
                placeholder={waitingFor ? `Select ${waitingFor} first` : placeholder}
                emptyText={emptyText}
                invalid={invalid}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

function PhilippineAddressFieldsBase({
    prefix,
    values = {},
    onChange,
    errors = {},
    required = true,
    legend,
    /** The address already on file, when it predates the picker. */
    currentText = "",
    /** A line under the heading, for when the address is not compulsory. */
    note = "",
    disabled = false,
}) {
    const field = (part) => `${prefix}_${part}`;
    const valueOf = (part) => values[field(part)] || "";

    const [lists, setLists] = useState({ regions: [], provinces: [], cities: [], barangays: [] });
    const [loading, setLoading] = useState({ regions: false, provinces: false, cities: false, barangays: false });
    const [failed, setFailed] = useState(null);

    // Guards against a slow reply for a parent the user has since changed.
    const latest = useRef({ regions: null, provinces: null, cities: null, barangays: null });

    const load = useCallback(async (level, url, key) => {
        if (level in latest.current) latest.current[level] = key;
        setLoading((l) => ({ ...l, [level]: true }));
        try {
            const data = await fetchList(url);
            if (level in latest.current && latest.current[level] !== key) return;
            setLists((s) => ({ ...s, [level]: data }));
            setFailed(null);
        } catch {
            if (level in latest.current && latest.current[level] !== key) return;
            setLists((s) => ({ ...s, [level]: [] }));
            setFailed(level);
        } finally {
            if (!(level in latest.current) || latest.current[level] === key) {
                setLoading((l) => ({ ...l, [level]: false }));
            }
        }
    }, []);

    useEffect(() => { load("regions", route("psgc.regions.index"), "all"); }, [load]);

    // Each level follows the one above it — on first render too, so an
    // address already filled in comes back with its lists populated.
    const region = valueOf("region_code");
    const province = valueOf("province_code");
    const city = valueOf("city_code");

    useEffect(() => {
        if (!region) { setLists((s) => ({ ...s, provinces: [], cities: [], barangays: [] })); return; }
        load("provinces", route("psgc.provinces.index") + `?region=${region}`, region);
    }, [region, load]);

    useEffect(() => {
        if (!province) { setLists((s) => ({ ...s, cities: [], barangays: [] })); return; }
        load("cities", route("psgc.cities", province), province);
    }, [province, load]);

    useEffect(() => {
        if (!city) { setLists((s) => ({ ...s, barangays: [] })); return; }
        load("barangays", route("psgc.barangays", city), city);
    }, [city, load]);

    // The address as one line, the way the server will compose it, kept in
    // the form as `<prefix>_preview` so the summary can show what was picked.
    // It is never sent: the server composes the stored line from the codes.
    const barangayCode = valueOf("barangay_code");
    const street = valueOf("street");
    // Debounced: `street` changes on every keystroke, and each commit here is
    // a second full-form update (Inertia's setData clones the whole form) on
    // top of the one the street input's own onChange already made. Picking a
    // dropdown value settles a beat later either way, so the extra delay is
    // never noticed there — only a fast typist stops noticing two clones per
    // letter.
    useEffect(() => {
        const timer = setTimeout(() => {
            const name = (list, code) => (list || []).find((item) => String(item.code) === String(code))?.name || "";
            const provinceRow = (lists.provinces || []).find((p) => String(p.code) === String(province));
            const line = barangayCode && city
                ? [
                    street.trim() || null,
                    name(lists.barangays, barangayCode) || null,
                    name(lists.cities, city) || null,
                    provinceRow ? (provinceRow.kind === "province" ? provinceRow.name : provinceRow.region_name) : null,
                ].filter(Boolean).join(", ")
                : "";
            if ((values[field("preview")] || "") !== line) onChange(field("preview"), line);
        }, 400);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [barangayCode, city, province, street, lists.barangays, lists.cities, lists.provinces]);

    /** Set one level and clear the ones below it. */
    const set = (part, value) => {
        const below = {
            region_code: ["province_code", "city_code", "barangay_code"],
            province_code: ["city_code", "barangay_code"],
            city_code: ["barangay_code"],
        }[part] || [];

        onChange(field(part), value);
        below.forEach((p) => onChange(field(p), ""));
    };

    const star = required ? <span className="text-red-500">*</span> : null;
    const err = (part) => errors[field(part)];

    return (
        <fieldset className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            {legend && (
                <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-gray-800">
                    <MapPin className="h-4 w-4 text-[#0d1f5c]" /> {legend} {star}
                </legend>
            )}

            {note && <p className="mb-3 px-1 text-xs text-gray-500">{note}</p>}

            {currentText && (
                <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <span className="font-semibold">Currently on file:</span> {currentText}
                    <br />
                    Please choose it again below so it can be matched to the official list.
                </p>
            )}

            {failed && (
                <p className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    The address list could not be loaded. Check your connection and pick the {failed.replace(/ies$/, "y").replace(/s$/, "")} again.
                </p>
            )}

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                <AddressRow
                    id={field("region_code")}
                    label="Region"
                    star={star}
                    value={valueOf("region_code")}
                    options={lists.regions.map((r) => ({
                        value: r.code,
                        label: r.name,
                        hint: r.long_name,
                    }))}
                    onChange={(v) => set("region_code", v)}
                    disabled={disabled}
                    loading={loading.regions}
                    placeholder="Select region"
                    emptyText="No regions available"
                    invalid={Boolean(err("region_code"))}
                    error={err("region_code")}
                />
                <AddressRow
                    id={field("province_code")}
                    label="Province"
                    star={star}
                    value={valueOf("province_code")}
                    options={lists.provinces.map((p) => ({
                        value: p.code,
                        label: p.name,
                        hint: [PROVINCE_LABEL[p.kind], p.region_name].filter(Boolean).join(" · "),
                    }))}
                    onChange={(v) => set("province_code", v)}
                    disabled={disabled}
                    loading={loading.provinces}
                    placeholder="Select province"
                    waitingFor={region ? null : "region"}
                    emptyText="No provinces available"
                    invalid={Boolean(err("province_code"))}
                    error={err("province_code")}
                />
                <AddressRow
                    id={field("city_code")}
                    label="Municipality / City"
                    star={star}
                    value={valueOf("city_code")}
                    options={lists.cities.map((c) => ({ value: c.code, label: c.name }))}
                    onChange={(v) => set("city_code", v)}
                    disabled={disabled}
                    loading={loading.cities}
                    placeholder="Select municipality or city"
                    waitingFor={province ? null : "province"}
                    emptyText="No municipalities or cities here"
                    invalid={Boolean(err("city_code"))}
                    error={err("city_code")}
                />
                <AddressRow
                    id={field("barangay_code")}
                    label="Barangay"
                    star={star}
                    value={valueOf("barangay_code")}
                    options={lists.barangays.map((b) => ({ value: b.code, label: b.name }))}
                    onChange={(v) => set("barangay_code", v)}
                    disabled={disabled}
                    loading={loading.barangays}
                    placeholder="Select barangay"
                    waitingFor={city ? null : "municipality or city"}
                    emptyText="No barangays listed here"
                    invalid={Boolean(err("barangay_code"))}
                    error={err("barangay_code")}
                />

                <div className="space-y-1.5">
                    {/* The picked parts are what the office needs; the house
                        number is welcome but never required (the rules leave
                        it nullable). The project location on Step 2 is a
                        different field with its own, required, street. */}
                    <Label htmlFor={field("street")} className="text-xs font-medium text-gray-700">
                        Street / House No. <span className="font-normal text-gray-400">(optional)</span>
                    </Label>
                    <Input
                        id={field("street")}
                        value={valueOf("street")}
                        onChange={(e) => onChange(field("street"), e.target.value)}
                        placeholder="e.g. 123 Rizal Street, Purok 2"
                        disabled={disabled}
                        className={err("street") ? "h-10 border-red-400" : "h-10"}
                    />
                    {err("street") && <p className="text-xs text-red-500">{err("street")}</p>}
                </div>
            </div>
        </fieldset>
    );
}

const ADDRESS_PART_KEYS = ["region_code", "province_code", "city_code", "barangay_code", "street", "preview"];

/** Do these two values/errors objects agree on everything this one prefix reads? */
function samePrefixSlice(prevObj, nextObj, prefix) {
    return ADDRESS_PART_KEYS.every((part) => (prevObj?.[`${prefix}_${part}`] ?? null) === (nextObj?.[`${prefix}_${part}`] ?? null));
}

/**
 * `values` and `errors` are whole-form objects, freshly built by the parent
 * on every render (Inertia's setData clones the form on each field change,
 * and `errors={{ ...stepErrors, ...errors }}` is a new object literal every
 * time regardless) - a plain shallow-prop memo would see a "changed" prop on
 * every keystroke anywhere in the form and re-render anyway. This instead
 * compares only the six keys this one address instance actually reads, so
 * typing in an unrelated field (or in a *different* PhilippineAddressFields
 * on the same page) does not re-render this one at all. `onChange` is
 * deliberately left out of the comparison: it is a fresh closure every
 * render too, and this component only ever calls it, never depends on its
 * identity.
 */
export const PhilippineAddressFields = React.memo(PhilippineAddressFieldsBase, (prev, next) => (
    prev.prefix === next.prefix &&
    prev.required === next.required &&
    prev.legend === next.legend &&
    prev.currentText === next.currentText &&
    prev.note === next.note &&
    prev.disabled === next.disabled &&
    samePrefixSlice(prev.values, next.values, prev.prefix) &&
    samePrefixSlice(prev.errors, next.errors, prev.prefix)
));
