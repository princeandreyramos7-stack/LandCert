import { useState } from "react";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The four locational clearance categories an applicant can file for.
 *
 * This choice sits at the top of the form rather than inside a step because it
 * decides which steps exist at all: picking ZC drops Project Details and Land
 * Use from the flow, so it cannot live inside one of the steps it removes.
 */
const CLEARANCE_TYPES = [
    {
        value: "CZC",
        label: "CZC",
        name: "Certificate of Zoning Compliance",
        hint: "Full application",
    },
    {
        value: "TUP",
        label: "TUP",
        name: "Temporary Use Permit",
        hint: "Full application",
    },
    {
        value: "SUP",
        label: "SUP",
        name: "Special Use Permit",
        hint: "Full application",
    },
    {
        value: "ZC",
        label: "ZC",
        name: "Zoning Certification",
        hint: "Short form — 5 documents",
    },
];

export function ClearanceTypeSelector({ value, error, onChange }) {
    const selected = String(value || "").toUpperCase();
    const selectedType = CLEARANCE_TYPES.find((t) => t.value === selected);

    // The grid only earns its vertical space while the applicant is choosing.
    // Once picked, it collapses to the choice itself — this component renders
    // above the step indicator, so it is on screen for the whole flow.
    const [isPicking, setIsPicking] = useState(!selectedType);
    const showGrid = isPicking || !selectedType;

    const handleSelect = (type) => {
        const isSelected = selected === type.value;
        onChange(isSelected ? "" : type.value);
        // Deselecting leaves nothing to collapse to, so keep the grid open.
        setIsPicking(isSelected);
    };

    return (
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                    Type of Locational Clearance
                </h3>
                <span className="text-xs text-gray-500">
                    Optional — an admin can set or change this later
                </span>
            </div>

            {showGrid ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4">
                    {CLEARANCE_TYPES.map((type) => {
                        const isSelected = selected === type.value;

                        return (
                            <button
                                key={type.value}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => handleSelect(type)}
                                className={cn(
                                    "group relative rounded-xl border-2 bg-white p-4 text-left transition-all duration-200",
                                    isSelected
                                        ? "border-blue-500 shadow-lg shadow-blue-200/50"
                                        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                                )}
                            >
                                {isSelected && (
                                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                                        <Check className="h-3 w-3 text-white" />
                                    </span>
                                )}

                                <span
                                    className={cn(
                                        "block text-lg font-bold tracking-tight transition-colors",
                                        isSelected
                                            ? "text-blue-600"
                                            : "text-gray-900 group-hover:text-blue-600"
                                    )}
                                >
                                    {type.label}
                                </span>
                                <span className="mt-1 block text-xs leading-snug text-gray-600">
                                    {type.name}
                                </span>
                                <span className="mt-2 block text-[11px] font-medium text-gray-400">
                                    {type.hint}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border-2 border-blue-500 bg-white p-4 shadow-lg shadow-blue-200/50">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                        <Check className="h-3 w-3 text-white" />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="text-lg font-bold tracking-tight text-blue-600">
                            {selectedType.label}
                        </span>
                        <span className="ml-2 text-xs text-gray-600">
                            {selectedType.name}
                        </span>
                        <span className="mt-0.5 block text-[11px] font-medium text-gray-400">
                            {selectedType.hint}
                        </span>
                    </span>

                    <button
                        type="button"
                        onClick={() => setIsPicking(true)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                    >
                        <Pencil className="h-3 w-3" />
                        Change
                    </button>
                </div>
            )}

            {selected === "ZC" && (
                <p className="mt-3 text-xs text-blue-700">
                    Zoning Certification only needs your applicant details and
                    five documents, so Project Details and Land Use are skipped.
                </p>
            )}

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>
    );
}
