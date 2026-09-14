import React from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { journeyOf, STAGES, TONES } from "@/lib/applicantJourney";
import { Check, X, Printer, ArrowRight, ExternalLink, AlertCircle } from "lucide-react";

const OUTLINE = { sky: "outline-sky-400", amber: "outline-amber-400", violet: "outline-violet-400", orange: "outline-orange-400", emerald: "outline-emerald-400", rose: "outline-rose-400" };

/** Five dots and the line between them: how far this application has come. */
export function JourneyTrack({ journey }) {
    const tone = TONES[journey.tone];
    return (
        <ol className="flex items-center" aria-label={`Stage ${Math.min(journey.stage + 1, 5)} of 5`}>
            {STAGES.map((name, i) => {
                const done = i < journey.stage;
                const current = i === journey.stage && journey.stage < 5;
                const stopped = journey.failed && current;
                return (
                    <li key={name} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center">
                            <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ring-2 ring-white ${
                                    done ? `${tone.bar} text-white` : stopped ? "bg-rose-500 text-white" : current ? `${tone.soft} ${tone.text} outline outline-2 ${OUTLINE[journey.tone]}` : "bg-gray-100 text-gray-400"
                                }`}
                            >
                                {done ? <Check className="h-3 w-3" /> : stopped ? <X className="h-3 w-3" /> : i + 1}
                            </span>
                            <span className={`mt-1 hidden text-[10px] font-semibold sm:block ${done || current ? "text-gray-700" : "text-gray-400"}`}>{name}</span>
                        </div>
                        {i < STAGES.length - 1 && (
                            <span className={`mx-1 h-0.5 flex-1 rounded sm:mb-4 ${i < journey.stage ? tone.bar : "bg-gray-100"}`} />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

/** Follows an action from the journey: a page, or a print view in a new tab. */
export function followAction(action, app, { onHere } = {}) {
    if (!action) return;
    if (action.route === "my-applications.show" && onHere) return onHere();
    const url = route(action.route, app.id);
    if (action.newTab) window.open(url, "_blank");
    else router.visit(url);
}

/**
 * The tracker plus "what happens next" and the button for it. On the
 * details page itself, an action that would open the details page instead
 * scrolls to the part of it that matters (onHere).
 */
export function JourneyPanel({ app, onHere, compact = false }) {
    const journey = journeyOf(app);
    const tone = TONES[journey.tone];
    const hereAlready = journey.action?.route === "my-applications.show" && !onHere;

    return (
        <div className={`rounded-2xl border bg-white ${journey.needsAction ? "border-[#d4a017]/50" : "border-gray-100"}`}>
            {journey.needsAction && (
                <div className={`flex items-center gap-2 rounded-t-2xl px-4 py-1.5 text-xs font-bold ${tone.soft} ${tone.text}`}>
                    <AlertCircle className="h-3.5 w-3.5" /> Action needed
                </div>
            )}
            <div className={compact ? "p-4" : "p-4 sm:p-5"}>
                <JourneyTrack journey={journey} />
                <div className={`mt-4 flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center ${journey.needsAction ? tone.soft : "bg-gray-50"}`}>
                    <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold ${journey.needsAction ? tone.text : "text-gray-800"}`}>{journey.headline}</p>
                        <p className="mt-0.5 text-xs text-gray-500">{journey.note}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                        {journey.secondary && (
                            <Button variant="outline" size="sm" onClick={() => followAction(journey.secondary, app)} className="h-9 gap-1.5 border-gray-200 bg-white text-xs font-semibold">
                                <Printer className="h-3.5 w-3.5" /> {journey.secondary.label}
                            </Button>
                        )}
                        {journey.action && !hereAlready && (
                            <Button size="sm" onClick={() => followAction(journey.action, app, { onHere })} className={`h-9 gap-1.5 text-xs font-bold ${journey.needsAction ? "bg-[#0d1f5c] text-white hover:bg-[#0d1f5c]/90" : "border border-gray-200 bg-white text-[#0d1f5c] hover:bg-gray-50"}`}>
                                {journey.action.label}
                                {journey.action.newTab ? <ExternalLink className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
