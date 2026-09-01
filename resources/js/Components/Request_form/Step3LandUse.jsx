import React from "react";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";

export function Step3LandUse({
    data,
    errors,
    hasRepresentative,
    onDataChange,
    onToast,
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-3">
                    <Label className="text-base">
                        15. Is the project applied for the subject of written notice(s) from
                        this office and/or its zoning administrator to effect requiring
                        for presentation of locational clearance/certificate of zoning
                        compliance (LC/CZC) or to apply for LC/CZC?{" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="has_written_notice"
                                value="yes"
                                checked={data.has_written_notice === "yes"}
                                onChange={(e) =>
                                    onDataChange("has_written_notice", e.target.value)
                                }
                                className="w-4 h-4"
                            />
                            <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="has_written_notice"
                                value="no"
                                checked={data.has_written_notice === "no"}
                                onChange={(e) =>
                                    onDataChange("has_written_notice", e.target.value)
                                }
                                className="w-4 h-4"
                            />
                            <span>No</span>
                        </label>
                    
                    </div>
                    {errors.has_written_notice && (
                        <p className="text-sm text-red-500">
                            {errors.has_written_notice}
                        </p>
                    )}
                </div>

                {data.has_written_notice === "yes" && (
                    <div className="grid gap-4 md:grid-cols-2 pl-6 border-l-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notice_officer_name">
                                a) Name of HSRC officer or zoning administrator who issued
                                the notice(s)
                            </Label>
                            <Input
                                id="notice_officer_name"
                                value={data.notice_officer_name}
                                onChange={(e) =>
                                    onDataChange("notice_officer_name", e.target.value)
                                }
                                placeholder="Enter officer/administrator name"
                            />
                            {errors.notice_officer_name && (
                                <p className="text-sm text-red-500">
                                    {errors.notice_officer_name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="notice_dates">b) Date(s) of notice(s)</Label>
                            <Input
                                id="notice_dates"
                                type="date"
                                value={data.notice_dates}
                                onChange={(e) =>
                                    onDataChange("notice_dates", e.target.value)
                                }
                            />
                            {errors.notice_dates && (
                                <p className="text-sm text-red-500">
                                    {errors.notice_dates}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 border-t pt-4">
                <div className="space-y-3">
                    <Label className="text-base">
                        16. Is the project applied for subject of similar application(s) with
                        other offices of the commission and/or deputized zoning
                        administrator? <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="has_similar_application"
                                value="yes"
                                checked={data.has_similar_application === "yes"}
                                onChange={(e) =>
                                    onDataChange("has_similar_application", e.target.value)
                                }
                                className="w-4 h-4"
                            />
                            <span>Yes</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="has_similar_application"
                                value="no"
                                checked={data.has_similar_application === "no"}
                                onChange={(e) =>
                                    onDataChange("has_similar_application", e.target.value)
                                }
                                className="w-4 h-4"
                            />
                            <span>No</span>
                        </label>
                    </div>
                    {errors.has_similar_application && (
                        <p className="text-sm text-red-500">
                            {errors.has_similar_application}
                        </p>
                    )}
                </div>

                {data.has_similar_application === "yes" && (
                    <div className="grid gap-4 md:grid-cols-2 pl-6 border-l-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="similar_application_offices">
                                a) Other HSRC office(s) where similar application(s)
                                was/were filed
                            </Label>
                            <Textarea
                                id="similar_application_offices"
                                value={data.similar_application_offices}
                                onChange={(e) =>
                                    onDataChange(
                                        "similar_application_offices",
                                        e.target.value
                                    )
                                }
                                placeholder="List the office(s)"
                                rows={2}
                            />
                            {errors.similar_application_offices && (
                                <p className="text-sm text-red-500">
                                    {errors.similar_application_offices}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="similar_application_dates">
                                b) Date(s) filed
                            </Label>
                            <Input
                                id="similar_application_dates"
                                type="date"
                                value={data.similar_application_dates}
                                onChange={(e) =>
                                    onDataChange(
                                        "similar_application_dates",
                                        e.target.value
                                    )
                                }
                            />
                            {errors.similar_application_dates && (
                                <p className="text-sm text-red-500">
                                    {errors.similar_application_dates}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 border-t pt-4">
                <div className="space-y-3">
                    <Label className="text-base">
                        17. Preferred mode of release of decision{" "}
                        <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                name="preferred_release_mode"
                                value="pickup"
                                checked={data.preferred_release_mode === "pickup"}
                                onChange={(e) =>
                                    onDataChange("preferred_release_mode", e.target.value)
                                }
                                className="w-4 h-4"
                            />
                            <span>Pickup</span>
                        </label>
                    </div>
                    {errors.preferred_release_mode && (
                        <p className="text-sm text-red-500">
                            {errors.preferred_release_mode}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
