import React from "react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { PhilippineAddressFields } from "@/Components/Address/PhilippineAddressFields";
import { Info } from "lucide-react";

export function Step1ApplicantInfo({
    data,
    errors,
    hasRepresentative,
    onDataChange,
    onRepresentativeToggle,
    addressFromAccount = false,
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="applicant_name">
                    1. Name of Applicant <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="applicant_name"
                    value={data.applicant_name}
                    onChange={(e) => onDataChange("applicant_name", e.target.value)}
                    placeholder="Enter applicant name"
                />
                {errors.applicant_name && (
                    <p className="text-sm text-red-500">{errors.applicant_name}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="corporation_name">2. Name of Corporation</Label>
                <Input
                    id="corporation_name"
                    value={data.corporation_name}
                    onChange={(e) => onDataChange("corporation_name", e.target.value)}
                    placeholder="Enter corporation name or type N/A"
                />
                {errors.corporation_name && (
                    <p className="text-sm text-red-500">{errors.corporation_name}</p>
                )}
                <p className="text-xs text-gray-500">
                    Fill this in to enable the corporation address field below
                </p>
            </div>

            {/* 3. Address of Applicant — picked from the PSGC rather than
                typed, so the same barangay is written the same way every
                time and the office can count applications by place. */}
            <div className="space-y-2 md:col-span-2">
                <PhilippineAddressFields
                    legend="3. Address of Applicant"
                    prefix="applicant_address"
                    values={data}
                    errors={errors}
                    onChange={onDataChange}
                    currentText={data.applicant_address_legacy}
                />
                {/* Nothing typed here yet: the address is the one on the
                    applicant's account, and they are told so, since this
                    application may be for somewhere else. */}
                {addressFromAccount && (
                    <p className="flex items-start gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                            <span className="font-semibold">Filled in from your account.</span> Leave it if this is
                            your address, or change it above if this application needs a different one.
                        </span>
                    </p>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <PhilippineAddressFields
                    legend="4. Address of Corporation"
                    prefix="corporation_address"
                    values={data}
                    errors={errors}
                    onChange={onDataChange}
                    currentText={data.corporation_address_legacy}
                    note="Leave blank and type N/A if not applicable"
                    disabled={!data.corporation_name || data.corporation_name.trim() === '' || data.corporation_name.trim().toLowerCase() === 'n/a'}
                />
                {(!data.corporation_name || data.corporation_name.trim() === '' || data.corporation_name.trim().toLowerCase() === 'n/a') && (
                    <p className="flex items-start gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                            This field is locked. Fill in the <span className="font-semibold">Name of Corporation</span> field above to enable this address field.
                        </span>
                    </p>
                )}
            </div>

            {/* Has Authorized Representative Checkbox */}
            <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="has_representative"
                        checked={hasRepresentative}
                        onChange={(e) => onRepresentativeToggle(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                        htmlFor="has_representative"
                        className="font-medium cursor-pointer"
                    >
                        Do you have an Authorized Representative?
                    </Label>
                </div>
            </div>

            {/* Conditional Representative Fields */}
            {hasRepresentative && (
                <>
                    <div className="space-y-2 md:col-span-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800">
                                Please fill in the representative details and upload the
                                authorization letter.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="authorized_representative_name">
                            5. Name of Authorized Representative{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="authorized_representative_name"
                            value={data.authorized_representative_name}
                            onChange={(e) =>
                                onDataChange(
                                    "authorized_representative_name",
                                    e.target.value
                                )
                            }
                            placeholder="Enter representative name"
                            required={hasRepresentative}
                        />
                        {errors.authorized_representative_name && (
                            <p className="text-sm text-red-500">
                                {errors.authorized_representative_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="authorized_representative_email">
                            Email of Authorized Representative{" "}
                            <span className="text-xs font-normal text-gray-500">(optional)</span>
                        </Label>
                        <Input
                            id="authorized_representative_email"
                            type="email"
                            value={data.authorized_representative_email}
                            onChange={(e) =>
                                onDataChange(
                                    "authorized_representative_email",
                                    e.target.value
                                )
                            }
                            placeholder="representative@example.com"
                        />
                        {errors.authorized_representative_email && (
                            <p className="text-sm text-red-500">
                                {errors.authorized_representative_email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="authorization_letter">
                            Authorization Letter <span className="text-red-500">*</span>
                        </Label>
                        {/*
                          The native file input is hidden behind its own label and
                          the attached file is named from form state instead.
                          A bare <input type="file"> is uncontrolled: Step 1 is
                          unmounted when the applicant moves on, so coming back
                          remounted an empty input reading "No file chosen" even
                          though the File was still held in the form and still
                          went out with the submission. Applicants read that as
                          their upload having been lost and could not tell
                          whether it had. Naming the file from state means the
                          screen and the form agree on every visit.
                        */}
                        <input
                            id="authorization_letter"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="sr-only"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onDataChange("authorization_letter", file);
                                // Let the same file be picked again after a
                                // remove - the input would not fire change for a
                                // value it thinks it already holds.
                                e.target.value = "";
                            }}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Label
                                htmlFor="authorization_letter"
                                className="inline-flex cursor-pointer items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {data.authorization_letter ? "Replace file" : "Choose file"}
                            </Label>
                            {data.authorization_letter ? (
                                <span className="flex min-w-0 items-center gap-2 text-sm text-gray-700">
                                    <span className="truncate" title={data.authorization_letter.name}>
                                        {data.authorization_letter.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDataChange("authorization_letter", null)
                                        }
                                        className="shrink-0 text-red-600 underline hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </span>
                            ) : data.authorization_letter_on_file ? (
                                <span className="text-sm text-gray-700">
                                    On file: <span className="font-medium">{data.authorization_letter_on_file}</span>
                                    <span className="text-gray-500"> — choose a file only to replace it</span>
                                </span>
                            ) : (
                                <span className="text-sm text-gray-500">No file chosen</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            Accepted formats: PDF, JPG, PNG (Max 5MB)
                        </p>
                        {errors.authorization_letter && (
                            <p className="text-sm text-red-500">
                                {errors.authorization_letter}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <PhilippineAddressFields
                            legend="6. Address of Authorized Representative"
                            prefix="authorized_representative_address"
                            values={data}
                            errors={errors}
                            onChange={onDataChange}
                            currentText={data.authorized_representative_address_legacy}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
