import React from "react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";

export function Step1ApplicantInfo({
    data,
    errors,
    hasRepresentative,
    onDataChange,
    onRepresentativeToggle,
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="applicant_name">
                    Name of Applicant <span className="text-red-500">*</span>
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
                <Label htmlFor="corporation_name">Name of Corporation</Label>
                <Input
                    id="corporation_name"
                    value={data.corporation_name}
                    onChange={(e) => onDataChange("corporation_name", e.target.value)}
                    placeholder="Enter corporation name or type N/A"
                />
                {errors.corporation_name && (
                    <p className="text-sm text-red-500">{errors.corporation_name}</p>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="applicant_address">
                    Address of Applicant <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="applicant_address"
                    value={data.applicant_address}
                    onChange={(e) => onDataChange("applicant_address", e.target.value)}
                    placeholder="Enter applicant address"
                />
                {errors.applicant_address && (
                    <p className="text-sm text-red-500">{errors.applicant_address}</p>
                )}
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="corporation_address">Address of Corporation</Label>
                <Textarea
                    id="corporation_address"
                    value={data.corporation_address}
                    onChange={(e) => onDataChange("corporation_address", e.target.value)}
                    placeholder="Enter corporation address or type N/A"
                />
                {errors.corporation_address && (
                    <p className="text-sm text-red-500">{errors.corporation_address}</p>
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
                            Name of Authorized Representative{" "}
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
                            <span className="text-red-500">*</span>
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
                            required={hasRepresentative}
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
                        <Input
                            id="authorization_letter"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                                onDataChange("authorization_letter", e.target.files[0])
                            }
                            className="cursor-pointer"
                            required={hasRepresentative}
                        />
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
                        <Label htmlFor="authorized_representative_address">
                            Address of Authorized Representative{" "}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="authorized_representative_address"
                            value={data.authorized_representative_address}
                            onChange={(e) =>
                                onDataChange(
                                    "authorized_representative_address",
                                    e.target.value
                                )
                            }
                            placeholder="Enter representative address"
                            required={hasRepresentative}
                        />
                        {errors.authorized_representative_address && (
                            <p className="text-sm text-red-500">
                                {errors.authorized_representative_address}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
