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

export function Step2ProjectDetails({ data, errors, onDataChange }) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="project_type">
                    Project Type <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="project_type"
                    value={data.project_type}
                    onChange={(e) => onDataChange("project_type", e.target.value)}
                    placeholder="Enter project type"
                />
                {errors.project_type && (
                    <p className="text-sm text-red-500">{errors.project_type}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_nature">
                    Project Nature <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="project_nature"
                    value={data.project_nature}
                    onChange={(e) => onDataChange("project_nature", e.target.value)}
                    placeholder="Enter project nature"
                />
                {errors.project_nature && (
                    <p className="text-sm text-red-500">{errors.project_nature}</p>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label className="text-base font-semibold">Project Location</Label>
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
                        <SelectItem value="Aggasian">Aggasian</SelectItem>
                        <SelectItem value="Alibagu">Alibagu</SelectItem>
                        <SelectItem value="Alinguigan 1st">Alinguigan 1st</SelectItem>
                        <SelectItem value="Alinguigan 2nd">Alinguigan 2nd</SelectItem>
                        <SelectItem value="Alinguigan 3rd">Alinguigan 3rd</SelectItem>
                        <SelectItem value="Arusip">Arusip</SelectItem>
                        <SelectItem value="Baculud">Baculud</SelectItem>
                        <SelectItem value="Bagong Silang">Bagong Silang</SelectItem>
                        <SelectItem value="Bagumbayan">Bagumbayan</SelectItem>
                        <SelectItem value="Baligatan">Baligatan</SelectItem>
                        <SelectItem value="Ballacong">Ballacong</SelectItem>
                        <SelectItem value="Bangag">Bangag</SelectItem>
                        <SelectItem value="Batong-Labang">Batong-Labang</SelectItem>
                        <SelectItem value="Bigao">Bigao</SelectItem>
                        <SelectItem value="Cabannungan 1st">Cabannungan 1st</SelectItem>
                        <SelectItem value="Cabannungan 2nd">Cabannungan 2nd</SelectItem>
                        <SelectItem value="Cabeseria 2 (Dappat)">Cabeseria 2 (Dappat)</SelectItem>
                        <SelectItem value="Cabeseria 3 (San Fernando)">Cabeseria 3 (San Fernando)</SelectItem>
                        <SelectItem value="Cabeseria 4 (San Manuel)">Cabeseria 4 (San Manuel)</SelectItem>
                        <SelectItem value="Cabeseria 5 (Baribad)">Cabeseria 5 (Baribad)</SelectItem>
                        <SelectItem value="Cabeseria 6 and 24 (Villa Marcos)">Cabeseria 6 and 24 (Villa Marcos)</SelectItem>
                        <SelectItem value="Cabeseria 7 (Nangalisan)">Cabeseria 7 (Nangalisan)</SelectItem>
                        <SelectItem value="Cabeseria 9 and 11 (Capogotan)">Cabeseria 9 and 11 (Capogotan)</SelectItem>
                        <SelectItem value="Cabeseria 10 (Lupigui)">Cabeseria 10 (Lupigui)</SelectItem>
                        <SelectItem value="Cabeseria 14 and 16 (Casilagan)">Cabeseria 14 and 16 (Casilagan)</SelectItem>
                        <SelectItem value="Cabeseria 17 and 21 (San Rafael)">Cabeseria 17 and 21 (San Rafael)</SelectItem>
                        <SelectItem value="Cabeseria 19 (Villa Suerte)">Cabeseria 19 (Villa Suerte)</SelectItem>
                        <SelectItem value="Cabeseria 22 (Sablang)">Cabeseria 22 (Sablang)</SelectItem>
                        <SelectItem value="Cabeseria 23 (San Francisco)">Cabeseria 23 (San Francisco)</SelectItem>
                        <SelectItem value="Cabeseria 25 (Santa Lucia)">Cabeseria 25 (Santa Lucia)</SelectItem>
                        <SelectItem value="Cabeseria 27 (Abuan)">Cabeseria 27 (Abuan)</SelectItem>
                        <SelectItem value="Cadu">Cadu</SelectItem>
                        <SelectItem value="Calamagui 1st">Calamagui 1st</SelectItem>
                        <SelectItem value="Calamagui 2nd">Calamagui 2nd</SelectItem>
                        <SelectItem value="Camunatan">Camunatan</SelectItem>
                        <SelectItem value="Capellan">Capellan</SelectItem>
                        <SelectItem value="Capo">Capo</SelectItem>
                        <SelectItem value="Carikkikan Norte">Carikkikan Norte</SelectItem>
                        <SelectItem value="Carikkikan Sur">Carikkikan Sur</SelectItem>
                        <SelectItem value="Centro - San Antonio">Centro - San Antonio</SelectItem>
                        <SelectItem value="Centro Poblacion">Centro Poblacion</SelectItem>
                        <SelectItem value="Fugu">Fugu</SelectItem>
                        <SelectItem value="Fuyo">Fuyo</SelectItem>
                        <SelectItem value="Gayong-Gayong Norte">Gayong-Gayong Norte</SelectItem>
                        <SelectItem value="Gayong-Gayong Sur">Gayong-Gayong Sur</SelectItem>
                        <SelectItem value="Guinatan">Guinatan</SelectItem>
                        <SelectItem value="Imelda Bliss Village">Imelda Bliss Village</SelectItem>
                        <SelectItem value="Lullutan">Lullutan</SelectItem>
                        <SelectItem value="Malalam">Malalam</SelectItem>
                        <SelectItem value="Malasin (Angeles)">Malasin (Angeles)</SelectItem>
                        <SelectItem value="Manaring">Manaring</SelectItem>
                        <SelectItem value="Mangcuram">Mangcuram</SelectItem>
                        <SelectItem value="Marana I">Marana I</SelectItem>
                        <SelectItem value="Marana II">Marana II</SelectItem>
                        <SelectItem value="Marana III">Marana III</SelectItem>
                        <SelectItem value="Minabang">Minabang</SelectItem>
                        <SelectItem value="Morado">Morado</SelectItem>
                        <SelectItem value="Naguilian Norte">Naguilian Norte</SelectItem>
                        <SelectItem value="Naguilian Sur">Naguilian Sur</SelectItem>
                        <SelectItem value="Namnam">Namnam</SelectItem>
                        <SelectItem value="Nanaguan">Nanaguan</SelectItem>
                        <SelectItem value="Osmeña (Sinippil)">Osmeña (Sinippil)</SelectItem>
                        <SelectItem value="Paliueg">Paliueg</SelectItem>
                        <SelectItem value="Pasa">Pasa</SelectItem>
                        <SelectItem value="Pilar">Pilar</SelectItem>
                        <SelectItem value="Quimalabasa">Quimalabasa</SelectItem>
                        <SelectItem value="Rang-ayan (Bintacan)">Rang-ayan (Bintacan)</SelectItem>
                        <SelectItem value="Rugao">Rugao</SelectItem>
                        <SelectItem value="Salindingan">Salindingan</SelectItem>
                        <SelectItem value="San Andres (Angarilla)">San Andres (Angarilla)</SelectItem>
                        <SelectItem value="San Felipe">San Felipe</SelectItem>
                        <SelectItem value="San Ignacio (Canapi)">San Ignacio (Canapi)</SelectItem>
                        <SelectItem value="San Isidro">San Isidro</SelectItem>
                        <SelectItem value="San Juan">San Juan</SelectItem>
                        <SelectItem value="San Lorenzo">San Lorenzo</SelectItem>
                        <SelectItem value="San Pablo">San Pablo</SelectItem>
                        <SelectItem value="San Rodrigo">San Rodrigo</SelectItem>
                        <SelectItem value="San Vicente">San Vicente</SelectItem>
                        <SelectItem value="Santa Barbara">Santa Barbara</SelectItem>
                        <SelectItem value="Santa Catalina">Santa Catalina</SelectItem>
                        <SelectItem value="Santa Isabel Norte">Santa Isabel Norte</SelectItem>
                        <SelectItem value="Santa Isabel Sur">Santa Isabel Sur</SelectItem>
                        <SelectItem value="Santa Maria">Santa Maria</SelectItem>
                        <SelectItem value="Santa Victoria">Santa Victoria</SelectItem>
                        <SelectItem value="Santo Tomas">Santo Tomas</SelectItem>
                        <SelectItem value="Siffu">Siffu</SelectItem>
                        <SelectItem value="Sindon Bayabo">Sindon Bayabo</SelectItem>
                        <SelectItem value="Sindon Maride">Sindon Maride</SelectItem>
                        <SelectItem value="Sipay">Sipay</SelectItem>
                        <SelectItem value="Tangcul">Tangcul</SelectItem>
                        <SelectItem value="Villa Imelda (Maplas)">Villa Imelda (Maplas)</SelectItem>
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

            <div className="space-y-2">
                <Label htmlFor="project_area_sqm">
                    Project Area (sqm) <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="project_area_sqm"
                    type="number"
                    step="0.01"
                    value={data.project_area_sqm}
                    onChange={(e) => onDataChange("project_area_sqm", e.target.value)}
                    placeholder="0.00"
                />
                {errors.project_area_sqm && (
                    <p className="text-sm text-red-500">{errors.project_area_sqm}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="lot_area_sqm">
                    Lot (sqm) <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="lot_area_sqm"
                    type="number"
                    step="0.01"
                    value={data.lot_area_sqm}
                    onChange={(e) => onDataChange("lot_area_sqm", e.target.value)}
                    placeholder="0.00"
                />
                {errors.lot_area_sqm && (
                    <p className="text-sm text-red-500">{errors.lot_area_sqm}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="bldg_improvement_sqm">Bldg. Improvement (sqm)</Label>
                <Input
                    id="bldg_improvement_sqm"
                    type="number"
                    step="0.01"
                    value={data.bldg_improvement_sqm}
                    onChange={(e) => onDataChange("bldg_improvement_sqm", e.target.value)}
                    placeholder="0.00"
                />
                {errors.bldg_improvement_sqm && (
                    <p className="text-sm text-red-500">{errors.bldg_improvement_sqm}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="right_over_land">
                    Right Over Land <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={data.right_over_land}
                    onValueChange={(value) => onDataChange("right_over_land", value)}
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
                    <p className="text-sm text-red-500">{errors.right_over_land}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project_nature_duration">
                    Project Nature <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={data.project_nature_duration}
                    onValueChange={(value) =>
                        onDataChange("project_nature_duration", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Temporary">Temporary</SelectItem>
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
                <Label htmlFor="project_cost">
                    Project Cost/Capitalization (in Pesos){" "}
                    <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="project_cost"
                    type="number"
                    step="0.01"
                    value={data.project_cost}
                    onChange={(e) => onDataChange("project_cost", e.target.value)}
                    placeholder="e.g., 5000000.00"
                />
                {errors.project_cost && (
                    <p className="text-sm text-red-500">{errors.project_cost}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="existing_land_use">
                    Existing Land Uses of Project Use{" "}
                    <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={data.existing_land_use}
                    onValueChange={(value) => onDataChange("existing_land_use", value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select existing land use" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Institutional">Institutional</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Tenanted">Tenanted</SelectItem>
                        <SelectItem value="Vacant">Vacant</SelectItem>
                        <SelectItem value="Agricultural">Agricultural</SelectItem>
                        <SelectItem value="Not Tenanted">Not Tenanted</SelectItem>
                    </SelectContent>
                </Select>
                {errors.existing_land_use && (
                    <p className="text-sm text-red-500">{errors.existing_land_use}</p>
                )}
            </div>
        </div>
    );
}
