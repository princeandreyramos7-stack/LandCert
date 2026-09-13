import React from "react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

/**
 * Every barangay of the City of Ilagan, in one alphabetical list.
 *
 * These used to be grouped under the four district headings (Poblacion,
 * Eastern, Western, San Antonio). An applicant looking for their own barangay
 * does not necessarily know which district it falls under, so finding it meant
 * scanning all four groups. One A-Z list is scanned once.
 *
 * The numbered Cabeserias are ordered 2, 3, ... 10, 14 & 16 rather than by
 * digit, so 10 does not land between 1 and 2.
 */
const BARANGAYS = [
    "Aggasian",
    "Alibagu",
    "Alinguigan 1st",
    "Alinguigan 2nd",
    "Alinguigan 3rd",
    "Arusip",
    "Baculud",
    "Bagong Silang",
    "Bagumbayan",
    "Baligatan",
    "Ballacong",
    "Bangag",
    "Baraoan",
    "Batong-Labang",
    "Cabannungan 1st",
    "Cabannungan 2nd",
    "Cabeseria 2",
    "Cabeseria 3",
    "Cabeseria 4",
    "Cabeseria 5",
    "Cabeseria 6 & 24",
    "Cabeseria 7",
    "Cabeseria 8",
    "Cabeseria 9 & 11",
    "Cabeseria 10",
    "Cabeseria 14 & 16",
    "Cabeseria 17 & 21",
    "Cabeseria 19",
    "Cabeseria 22",
    "Cabeseria 23",
    "Cabeseria 25",
    "Cabeseria 27",
    "Cadu",
    "Calamagui 1st",
    "Calamagui 2nd",
    "Camunatan",
    "Capellan",
    "Capo",
    "Carikkikan Norte",
    "Carikkikan Sur",
    "Centro Poblacion",
    "Centro-San Antonio",
    "Fugu",
    "Fuyo",
    "Gayong-gayong Norte",
    "Gayong-gayong Sur",
    "Guinatan",
    "Hantas",
    "Imelda Bliss Village",
    "Indagan",
    "Ipalao",
    "Lullutan",
    "Malalam",
    "Malasin",
    "Manaring",
    "Mangcuram",
    "Marana I",
    "Marana II",
    "Marana III",
    "Minabang",
    "Morado",
    "Naguilian Norte",
    "Naguilian Sur",
    "Namnama",
    "Nanaguan",
    "Osmeña",
    "Paliueg",
    "Pasa",
    "Piñares",
    "Quimalabasa",
    "Rang-ayan",
    "Rugao",
    "Saguiguilid del Norte",
    "Saguiguilid del sur",
    "Salindingan",
    "San Andres",
    "San Felipe",
    "San Ignacio (Canapi)",
    "San Isidro",
    "San Juan",
    "San Lorenzo",
    "San Pablo",
    "San Rodrigo",
    "San Vicente",
    "Santa Barbara",
    "Santa Catalina",
    "Santa Isabel Norte",
    "Santa Isabel Sur",
    "Santa Victoria",
    "Santo Tomas",
    "Siffu",
    "Sindon Bayabo",
    "Sindon Maride",
    "Sipay",
    "Tangcul",
    "Tegge",
    "Valleyan",
    "Vanutas",
    "Villa Imelda",
    "Villa Jesusa",
];

/**
 * Display-only formatting for the project cost field.
 * Adds thousand separators while keeping any decimal point the user is typing.
 * The raw (unformatted) value is what stays in state and gets submitted.
 */
const formatCostForDisplay = (rawValue) => {
    if (rawValue === null || rawValue === undefined || rawValue === "")
        return "";

    const raw = String(rawValue);
    const [integerPart, ...decimalParts] = raw.split(".");
    const hasDecimalPoint = raw.includes(".");

    // Group the whole-number part: 1000000 -> 1,000,000
    const groupedInteger =
        integerPart === "" ? "" : Number(integerPart).toLocaleString("en-US");

    return hasDecimalPoint
        ? `${groupedInteger}.${decimalParts.join("")}`
        : groupedInteger;
};

/**
 * Strips the display formatting back down to a plain number string,
 * allowing a single decimal point and at most 2 decimal places.
 */
const parseCostInput = (displayValue) => {
    // Drop commas and anything that isn't a digit or a dot
    let cleaned = String(displayValue).replace(/[^\d.]/g, "");

    const firstDot = cleaned.indexOf(".");
    if (firstDot !== -1) {
        // Keep only the first dot, then cap the decimals at 2 digits
        const integerPart = cleaned.slice(0, firstDot);
        const decimalPart = cleaned
            .slice(firstDot + 1)
            .replace(/\./g, "")
            .slice(0, 2);
        cleaned = `${integerPart}.${decimalPart}`;
    }

    return cleaned;
};

/**
 * Item 8 on the paper form offers New Const., Improvement or Others, where
 * Others is written in by hand. There is no separate column for that write-in:
 * `project_nature` holds either one of the two fixed choices or whatever the
 * applicant typed. Anything else on file therefore *is* an "Others" value,
 * which is how an existing application reopens on the right option.
 */
const PROJECT_NATURE_OPTIONS = ["New Const.", "Improvement"];

/**
 * A Temporary Use Permit is, by definition, temporary and for one year — the
 * permit itself is issued for a year (see TupClearanceLetter). The tenure
 * fields say so and are not editable for one.
 */
const isTemporaryUsePermit = (data) => String(data.project_type || "").toUpperCase() === "TUP";

export function Step2ProjectDetails({ data, errors, onDataChange }) {
    const tup = isTemporaryUsePermit(data);
    const [natureChoice, setNatureChoice] = React.useState(() => {
        const current = String(data.project_nature || "");
        if (!current) return "";
        return PROJECT_NATURE_OPTIONS.includes(current) ? current : "Others";
    });

    const handleNatureChange = (value) => {
        setNatureChoice(value);
        // Others starts blank so the applicant writes it in; the two fixed
        // choices are stored as-is.
        onDataChange("project_nature", value === "Others" ? "" : value);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="project_nature">8. Project Nature</Label>
                <Select value={natureChoice} onValueChange={handleNatureChange}>
                    <SelectTrigger id="project_nature">
                        <SelectValue placeholder="Select project nature" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="New Const.">New Const.</SelectItem>
                        <SelectItem value="Improvement">Improvement</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                </Select>

                {natureChoice === "Others" && (
                    <Input
                        id="project_nature_other"
                        value={data.project_nature}
                        onChange={(e) =>
                            onDataChange("project_nature", e.target.value)
                        }
                        placeholder="Please specify the project nature"
                    />
                )}

                {errors.project_nature && (
                    <p className="text-sm text-red-500">
                        {errors.project_nature}
                    </p>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label className="text-base font-semibold">
                    9. Project Location
                </Label>
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_location_number">Number</Label>
                <Input
                    id="project_location_number"
                    value={data.project_location_number}
                    onChange={(e) =>
                        onDataChange("project_location_number", e.target.value)
                    }
                    placeholder="House/Building number"
                />
                {errors.project_location_number && (
                    <p className="text-sm text-red-500">
                        {errors.project_location_number}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_location_street">
                    Street <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="project_location_street"
                    value={data.project_location_street}
                    onChange={(e) =>
                        onDataChange("project_location_street", e.target.value)
                    }
                    placeholder="Street name"
                />
                {errors.project_location_street && (
                    <p className="text-sm text-red-500">
                        {errors.project_location_street}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_location_barangay">
                    Barangay <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={data.project_location_barangay}
                    onValueChange={(value) =>
                        onDataChange("project_location_barangay", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select barangay" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {BARANGAYS.map((barangay) => (
                            <SelectItem key={barangay} value={barangay}>
                                {barangay}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.project_location_barangay && (
                    <p className="text-sm text-red-500">
                        {errors.project_location_barangay}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_location_municipality">
                    Municipality/City <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="project_location_municipality"
                    value="City of Ilagan"
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                />
                {errors.project_location_municipality && (
                    <p className="text-sm text-red-500">
                        {errors.project_location_municipality}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_location_province">
                    Province <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="project_location_province"
                    value="Isabela"
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                />
                {errors.project_location_province && (
                    <p className="text-sm text-red-500">
                        {errors.project_location_province}
                    </p>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label className="text-base font-semibold">
                    10. Project Area (in square meters)
                </Label>
            </div>

            <div className="space-y-2">
                <Label htmlFor="lot_area_sqm">
                    Lot <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="lot_area_sqm"
                    type="number"
                    step="0.01"
                    value={data.lot_area_sqm}
                    onChange={(e) =>
                        onDataChange("lot_area_sqm", e.target.value)
                    }
                    placeholder="0.00"
                />
                {errors.lot_area_sqm && (
                    <p className="text-sm text-red-500">
                        {errors.lot_area_sqm}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="bldg_improvement_sqm">Bldg. Improvement</Label>
                <Input
                    id="bldg_improvement_sqm"
                    type="number"
                    step="0.01"
                    value={data.bldg_improvement_sqm}
                    onChange={(e) =>
                        onDataChange("bldg_improvement_sqm", e.target.value)
                    }
                    placeholder="0.00"
                />
                {errors.bldg_improvement_sqm && (
                    <p className="text-sm text-red-500">
                        {errors.bldg_improvement_sqm}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="right_over_land">
                    11. Right Over Land <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={data.right_over_land}
                    onValueChange={(value) =>
                        onDataChange("right_over_land", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select right over land" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Lessee">Lessee</SelectItem>
                    </SelectContent>
                </Select>
                {errors.right_over_land && (
                    <p className="text-sm text-red-500">
                        {errors.right_over_land}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_nature_duration">
                    12. Project Tenure <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={tup ? "Temporary" : data.project_nature_duration}
                    onValueChange={(value) =>
                        onDataChange("project_nature_duration", value)
                    }
                    disabled={tup}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Temporary">
                            Temporary (Specify Years)
                        </SelectItem>
                    </SelectContent>
                </Select>
                {tup && (
                    <p className="text-xs text-gray-500">
                        A Temporary Use Permit is issued for one year, so the tenure is set for you.
                    </p>
                )}
                {errors.project_nature_duration && (
                    <p className="text-sm text-red-500">
                        {errors.project_nature_duration}
                    </p>
                )}
            </div>

            {(tup || data.project_nature_duration === "Temporary") && (
                <div className="space-y-2">
                    <Label htmlFor="project_nature_years">Specify Years</Label>
                    <Input
                        id="project_nature_years"
                        type="number"
                        min={1}
                        value={tup ? 1 : data.project_nature_years}
                        onChange={(e) =>
                            onDataChange("project_nature_years", e.target.value)
                        }
                        placeholder="Number of years"
                        readOnly={tup}
                        className={tup ? "bg-gray-50 text-gray-700" : undefined}
                    />
                    {errors.project_nature_years && (
                        <p className="text-sm text-red-500">
                            {errors.project_nature_years}
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="existing_land_use">
                    13. Existing Land Uses of Project Use{" "}
                    <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={data.existing_land_use}
                    onValueChange={(value) =>
                        onDataChange("existing_land_use", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select existing land use" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Institutional">
                            Institutional
                        </SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Tenanted">Tenanted</SelectItem>
                        <SelectItem value="Vacant">Vacant</SelectItem>
                        <SelectItem value="Agricultural">
                            Agricultural
                        </SelectItem>
                        <SelectItem value="Not Tenanted">
                            Not Tenanted
                        </SelectItem>
                    </SelectContent>
                </Select>
                {errors.existing_land_use && (
                    <p className="text-sm text-red-500">
                        {errors.existing_land_use}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_cost">
                    14. Project Cost/Capitalization (in Pesos){" "}
                    <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    {/* Visual-only peso indicator - not part of the submitted value */}
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 select-none text-base font-semibold text-gray-500"
                    >
                        ₱
                    </span>
                    <Input
                        id="project_cost"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        // Commas are display-only; state keeps the plain number
                        value={formatCostForDisplay(data.project_cost)}
                        onChange={(e) =>
                            onDataChange(
                                "project_cost",
                                parseCostInput(e.target.value),
                            )
                        }
                        placeholder="e.g., 5,000,000.00"
                        className="pl-8 pr-16"
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500"
                    >
                        PHP
                    </span>
                </div>
                {errors.project_cost && (
                    <p className="text-sm text-red-500">
                        {errors.project_cost}
                    </p>
                )}
            </div>
        </div>
    );
}
