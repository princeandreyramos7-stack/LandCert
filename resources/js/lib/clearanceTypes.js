/**
 * The four locational clearance categories an application can be filed under.
 *
 * Item 7 on the CPD-001-0 form. The codes are what the database stores; the
 * names are what the office calls them, and both are shown in the filter so a
 * new officer does not have to know the abbreviations by heart.
 */
export const CLEARANCE_TYPES = [
    { value: "CZC", name: "Certificate of Zoning Compliance" },
    { value: "TUP", name: "Temporary Use Permit" },
    { value: "SUP", name: "Special Use Permit" },
    { value: "ZC", name: "Zoning Certification" },
];

/** Options for a clearance-type dropdown, "All" first. */
export const CLEARANCE_TYPE_FILTERS = [
    { value: "all", label: "All Clearance Types" },
    ...CLEARANCE_TYPES.map((type) => ({
        value: type.value,
        label: `${type.value} — ${type.name}`,
    })),
];

/**
 * Does an application's stored type match the chosen filter?
 *
 * Compared case-insensitively and trimmed: the column is free text that has
 * been written by several different screens over the life of the system, so a
 * stray "czc" or a trailing space should not hide an application from a filter.
 */
export function matchesClearanceType(projectType, filterValue) {
    if (!filterValue || filterValue === "all") return true;

    return (
        String(projectType ?? "").trim().toUpperCase() ===
        String(filterValue).trim().toUpperCase()
    );
}
