import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Award, Clock, PackageCheck } from "lucide-react";

/**
 * The counts above the certificate list, matching the cards on All Applications
 * so the two pages read the same way.
 *
 * A certificate is only ever in one of two states here — still being prepared,
 * or handed to the applicant — so there are three cards rather than the four on
 * the applications list. Inventing a middle state the system does not track
 * would give the office a card that could never move off zero.
 *
 * "Released" is decided by released_to_applicant_at, the same field the badge in
 * the table uses, so a card and the row it counts always agree.
 */
const CARDS = [
    {
        key: "all",
        label: "Total Certificates",
        sub: "All issued",
        bg: "bg-[#0d1f5c]/5",
        text: "text-[#0d1f5c]",
        icon: Award,
        iconBg: "bg-[#0d1f5c]",
    },
    {
        key: "preparing",
        label: "Preparing",
        sub: "Not yet released",
        bg: "bg-amber-50",
        text: "text-amber-900",
        icon: Clock,
        iconBg: "bg-amber-500",
    },
    {
        key: "released",
        label: "Released",
        sub: "Handed to applicant",
        bg: "bg-emerald-50",
        text: "text-emerald-900",
        icon: PackageCheck,
        iconBg: "bg-emerald-500",
    },
];

export function CertificateStats({ certificates = [], onFilterChange }) {
    const counts = React.useMemo(() => {
        const released = certificates.filter(
            (certificate) => Boolean(certificate.request?.released_to_applicant_at)
        ).length;

        return {
            all: certificates.length,
            preparing: certificates.length - released,
            released,
        };
    }, [certificates]);

    return (
        <div className="mb-5 grid grid-cols-3 gap-3 sm:gap-4">
            {CARDS.map((card) => (
                <Card
                    key={card.key}
                    role="button"
                    tabIndex={0}
                    aria-label={`Filter by ${card.label}`}
                    className={`cursor-pointer ${card.bg} border-0 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1f5c] focus-visible:ring-offset-2`}
                    onClick={() => onFilterChange?.(card.key)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onFilterChange?.(card.key);
                        }
                    }}
                >
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className={`mb-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs ${card.text} opacity-70`}>
                                    {card.label}
                                </p>
                                <p className={`text-xl font-black sm:text-2xl ${card.text}`}>
                                    {counts[card.key]}
                                </p>
                                <p className={`mt-0.5 hidden text-xs sm:block ${card.text} opacity-60`}>
                                    {card.sub}
                                </p>
                            </div>
                            <div className={`shrink-0 rounded-lg p-1.5 sm:p-2 ${card.iconBg}`}>
                                <card.icon className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
