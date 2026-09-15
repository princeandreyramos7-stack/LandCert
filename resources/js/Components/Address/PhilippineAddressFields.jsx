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

export function PhilippineAddressFields({
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

    const Row = ({ part, label, options, loadingLevel, placeholder, waitingFor, emptyText }) => (
        <div className="space-y-1.5">
            <Label htmlFor={field(part)} className="text-xs font-medium text-gray-700">
                {label} {star}
            </Label>
            <SearchableSelect
                id={field(part)}
                value={valueOf(part)}
                options={options}
                onChange={(v) => set(part, v)}
                disabled={disabled || Boolean(waitingFor)}
                loading={loading[loadingLevel]}
                placeholder={waitingFor ? `Select ${waitingFor} first` : placeholder}
                emptyText={emptyText}
                invalid={Boolean(err(part))}
            />
            {err(part) && <p className="text-xs text-red-500">{err(part)}</p>}
        </div>
    );

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
                <Row
                    part="region_code"
                    label="Region"
                    options={lists.regions.map((r) => ({
                        value: r.code,
                        label: r.name,
                        hint: r.long_name,
                    }))}
                    loadingLevel="regions"
                    placeholder="Select region"
                    emptyText="No regions available"
                />
                <Row
                    part="province_code"
                    label="Province"
                    options={lists.provinces.map((p) => ({
                        value: p.code,
                        label: p.name,
                        hint: [PROVINCE_LABEL[p.kind], p.region_name].filter(Boolean).join(" · "),
                    }))}
                    loadingLevel="provinces"
                    placeholder="Select province"
                    waitingFor={region ? null : "region"}
                    emptyText="No provinces available"
                />
                <Row
                    part="city_code"
                    label="Municipality / City"
                    options={lists.cities.map((c) => ({ value: c.code, label: c.name }))}
                    loadingLevel="cities"
                    placeholder="Select municipality or city"
                    waitingFor={province ? null : "province"}
                    emptyText="No municipalities or cities here"
                />
                <Row
                    part="barangay_code"
                    label="Barangay"
                    options={lists.barangays.map((b) => ({ value: b.code, label: b.name }))}
                    loadingLevel="barangays"
                    placeholder="Select barangay"
                    waitingFor={city ? null : "municipality or city"}
                    emptyText="No barangays listed here"
                />

                <div className="space-y-1.5">
                    <Label htmlFor={field("street")} className="text-xs font-medium text-gray-700">
                        Street / House No. {star}
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
