import React from "react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

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

export function Step2ProjectDetails({ data, errors, onDataChange }) {
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
                        <SelectGroup>
                            <SelectLabel>Poblacion</SelectLabel>
                            <SelectItem value="Alibagu">Alibagu</SelectItem>
                            <SelectItem value="Baculud">Baculud</SelectItem>
                            <SelectItem value="Bagumbayan">Bagumbayan</SelectItem>
                            <SelectItem value="Baligatan">Baligatan</SelectItem>
                            <SelectItem value="Calamagui 1st">Calamagui 1st</SelectItem>
                            <SelectItem value="Calamagui 2nd">Calamagui 2nd</SelectItem>
                            <SelectItem value="Camunatan">Camunatan</SelectItem>
                            <SelectItem value="Centro Poblacion">Centro Poblacion</SelectItem>
                            <SelectItem value="Fugu">Fugu</SelectItem>
                            <SelectItem value="Guinatan">Guinatan</SelectItem>
                            <SelectItem value="Imelda Bliss Village">Imelda Bliss Village</SelectItem>
                            <SelectItem value="Malalam">Malalam</SelectItem>
                            <SelectItem value="Osmeña">Osmeña</SelectItem>
                            <SelectItem value="San Felipe">San Felipe</SelectItem>
                            <SelectItem value="San Vicente">San Vicente</SelectItem>
                            <SelectItem value="Santa Barbara">Santa Barbara</SelectItem>
                            <SelectItem value="Santo Tomas">Santo Tomas</SelectItem>
                            <SelectItem value="Saguiguilid del sur">Saguiguilid del sur</SelectItem>
                            <SelectItem value="Saguiguilid del Norte">Saguiguilid del Norte</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Eastern</SelectLabel>
                            <SelectItem value="Alinguigan 1st">Alinguigan 1st</SelectItem>
                            <SelectItem value="Alinguigan 2nd">Alinguigan 2nd</SelectItem>
                            <SelectItem value="Alinguigan 3rd">Alinguigan 3rd</SelectItem>
                            <SelectItem value="Ballacong">Ballacong</SelectItem>
                            <SelectItem value="Bangag">Bangag</SelectItem>
                            <SelectItem value="Batong-Labang">Batong-Labang</SelectItem>
                            <SelectItem value="Cadu">Cadu</SelectItem>
                            <SelectItem value="Capellan">Capellan</SelectItem>
                            <SelectItem value="Capo">Capo</SelectItem>
                            <SelectItem value="Fuyo">Fuyo</SelectItem>
                            <SelectItem value="Manaring">Manaring</SelectItem>
                            <SelectItem value="Marana I">Marana I</SelectItem>
                            <SelectItem value="Marana II">Marana II</SelectItem>
                            <SelectItem value="Marana III">Marana III</SelectItem>
                            <SelectItem value="Minabang">Minabang</SelectItem>
                            <SelectItem value="Morado">Morado</SelectItem>
                            <SelectItem value="Nanaguan">Nanaguan</SelectItem>
                            <SelectItem value="Pasa">Pasa</SelectItem>
                            <SelectItem value="Quimalabasa">Quimalabasa</SelectItem>
                            <SelectItem value="Rang-ayan">Rang-ayan</SelectItem>
                            <SelectItem value="Rugao">Rugao</SelectItem>
                            <SelectItem value="San Andres">San Andres</SelectItem>
                            <SelectItem value="San Isidro">San Isidro</SelectItem>
                            <SelectItem value="San Juan">San Juan</SelectItem>
                            <SelectItem value="San Lorenzo">San Lorenzo</SelectItem>
                            <SelectItem value="San Pablo">San Pablo</SelectItem>
                            <SelectItem value="San Rodrigo">San Rodrigo</SelectItem>
                            <SelectItem value="Santa Catalina">Santa Catalina</SelectItem>
                            <SelectItem value="Santa Victoria">Santa Victoria</SelectItem>
                            <SelectItem value="Sipay">Sipay</SelectItem>
                            <SelectItem value="Tangcul">Tangcul</SelectItem>
                            <SelectItem value="Tegge">Tegge</SelectItem>
                            <SelectItem value="Vanutas">Vanutas</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>Western</SelectLabel>
                            <SelectItem value="Arusip">Arusip</SelectItem>
                            <SelectItem value="Bagong Silang">Bagong Silang</SelectItem>
                            <SelectItem value="Baraoan">Baraoan</SelectItem>
                            <SelectItem value="Cabannungan 1st">Cabannungan 1st</SelectItem>
                            <SelectItem value="Cabannungan 2nd">Cabannungan 2nd</SelectItem>
                            <SelectItem value="Carikkikan Norte">Carikkikan Norte</SelectItem>
                            <SelectItem value="Carikkikan Sur">Carikkikan Sur</SelectItem>
                            <SelectItem value="Hantas">Hantas</SelectItem>
                            <SelectItem value="Ipalao">Ipalao</SelectItem>
                            <SelectItem value="Indagan">Indagan</SelectItem>
                            <SelectItem value="Lullutan">Lullutan</SelectItem>
                            <SelectItem value="Malasin">Malasin</SelectItem>
                            <SelectItem value="Mangcuram">Mangcuram</SelectItem>
                            <SelectItem value="Naguilian Norte">Naguilian Norte</SelectItem>
                            <SelectItem value="Naguilian Sur">Naguilian Sur</SelectItem>
                            <SelectItem value="Piñares">Piñares</SelectItem>
                            <SelectItem value="San Ignacio (Canapi)">San Ignacio (Canapi)</SelectItem>
                            <SelectItem value="Santa Isabel Norte">Santa Isabel Norte</SelectItem>
                            <SelectItem value="Santa Isabel Sur">Santa Isabel Sur</SelectItem>
                            <SelectItem value="Siffu">Siffu</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                            <SelectLabel>San Antonio</SelectLabel>
                            <SelectItem value="Aggasian">Aggasian</SelectItem>
                            <SelectItem value="Cabeseria 10">Cabeseria 10</SelectItem>
                            <SelectItem value="Cabeseria 14 & 16">Cabeseria 14 &amp; 16</SelectItem>
                            <SelectItem value="Cabeseria 17 & 21">Cabeseria 17 &amp; 21</SelectItem>
                            <SelectItem value="Cabeseria 19">Cabeseria 19</SelectItem>
                            <SelectItem value="Cabeseria 22">Cabeseria 22</SelectItem>
                            <SelectItem value="Cabeseria 23">Cabeseria 23</SelectItem>
                            <SelectItem value="Cabeseria 25">Cabeseria 25</SelectItem>
                            <SelectItem value="Cabeseria 27">Cabeseria 27</SelectItem>
                            <SelectItem value="Cabeseria 2">Cabeseria 2</SelectItem>
                            <SelectItem value="Cabeseria 3">Cabeseria 3</SelectItem>
                            <SelectItem value="Cabeseria 4">Cabeseria 4</SelectItem>
                            <SelectItem value="Cabeseria 5">Cabeseria 5</SelectItem>
                            <SelectItem value="Cabeseria 6 & 24">Cabeseria 6 &amp; 24</SelectItem>
                            <SelectItem value="Cabeseria 7">Cabeseria 7</SelectItem>
                            <SelectItem value="Cabeseria 8">Cabeseria 8</SelectItem>
                            <SelectItem value="Cabeseria 9 & 11">Cabeseria 9 &amp; 11</SelectItem>
                            <SelectItem value="Centro-San Antonio">Centro-San Antonio</SelectItem>
                            <SelectItem value="Gayong-gayong Norte">Gayong-gayong Norte</SelectItem>
                            <SelectItem value="Gayong-gayong Sur">Gayong-gayong Sur</SelectItem>
                            <SelectItem value="Namnama">Namnama</SelectItem>
                            <SelectItem value="Paliueg">Paliueg</SelectItem>
                            <SelectItem value="Salindingan">Salindingan</SelectItem>
                            <SelectItem value="Sindon Bayabo">Sindon Bayabo</SelectItem>
                            <SelectItem value="Sindon Maride">Sindon Maride</SelectItem>
                            <SelectItem value="Villa Imelda">Villa Imelda</SelectItem>
                            <SelectItem value="Valleyan">Valleyan</SelectItem>
                        </SelectGroup>
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
                    value={data.project_nature_duration}
                    onValueChange={(value) =>
                        onDataChange("project_nature_duration", value)
                    }
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
                {errors.project_nature_duration && (
                    <p className="text-sm text-red-500">
                        {errors.project_nature_duration}
                    </p>
                )}
            </div>

            {data.project_nature_duration === "Temporary" && (
                <div className="space-y-2">
                    <Label htmlFor="project_nature_years">Specify Years</Label>
                    <Input
                        id="project_nature_years"
                        type="number"
                        value={data.project_nature_years}
                        onChange={(e) =>
                            onDataChange("project_nature_years", e.target.value)
                        }
                        placeholder="Number of years"
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
