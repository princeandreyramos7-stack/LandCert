import { Link } from "@inertiajs/react";
import { Eye } from "lucide-react";

/*
 * The landing hero's brand headline - the "Crest": the city seal enthroned,
 * the CPDO logo and the Ilagan 2030 mark at its sides, and the office's name
 * as the page's h1.
 *
 * The name is set in the site's own font (Figtree, black, tight) in plain
 * white; the two small lines are Josefin Sans capitals, from fonts.bunny.net
 * (already used by the site and allowed by its Content-Security-Policy),
 * linked in the <head> of the welcome page only (resources/views/app.blade.php)
 * so they arrive with the page rather than flashing in a stand-in font.
 */

const fadeUp = (ms) => ({ animation: `hero-fade-up .8s ease ${ms}ms both` });

const face = (family, fallback = "serif") => ({ fontFamily: `'${family}', ${fallback}` });

/** The face and size of the "Republic" line, the office's name and the city. */
const TYPE = {
    republic: { style: face("Josefin Sans", "sans-serif"), className: "text-[10px] font-semibold uppercase tracking-[0.4em] sm:text-xs" },
    name: { style: undefined, className: "text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl" },
    city: { style: face("Josefin Sans", "sans-serif"), className: "text-[10px] font-bold uppercase tracking-[0.3em] sm:text-xs" },
};

/* ── the marks ─────────────────────────────────────────────────────────── */

/** The CPDO logo is a tall panel with its own lettering: shown whole, never cropped. */
function CpdoMark({ className = "h-16" }) {
    return (
        <img
            src="/images/CPDO_LOGO.jpg"
            alt="City Planning and Development Office"
            className={`w-auto shrink-0 rounded-lg border-2 border-[#d4a017]/70 object-contain shadow-xl shadow-black/30 ${className}`}
        />
    );
}

function SealMark({ className = "h-16 w-16", ring = "border-2 border-[#d4a017]/70" }) {
    return (
        <span className={`inline-block shrink-0 overflow-hidden rounded-full bg-white shadow-xl shadow-black/30 ${ring} ${className}`}>
            <img src="/images/ilagan1.png" alt="Seal of the City of Ilagan" className="h-full w-full object-cover" />
        </span>
    );
}

function VisionMark({ className = "h-16 w-16", ring = "border-2 border-[#d4a017]/70" }) {
    return (
        <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-xl shadow-black/30 ${ring} ${className}`}>
            <img src="/images/Ilagan Logo2.png" alt="City of Ilagan 2030 - Towards a liveable city" className="h-full w-full object-contain" />
        </span>
    );
}

/** The three actions under the headline. */
function Actions({ className = "" }) {
    const ghost = "border-white/40 text-white hover:bg-white/10";
    return (
        <div className={`flex flex-col gap-3 sm:flex-row sm:justify-center ${className}`}>
            <Link href={route("register")} className="rounded-md bg-[#d4a017] px-6 py-3 text-center text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#b8880d]">
                APPLY ONLINE NOW
            </Link>
            <Link href={route("login")} className={`rounded-md border px-6 py-3 text-center text-sm font-bold transition-colors ${ghost}`}>
                Already Registered?
            </Link>
            <Link href={route("verify.index")} className={`flex items-center justify-center gap-1.5 rounded-md border px-5 py-3 text-center text-sm font-bold transition-colors ${ghost}`}>
                <Eye className="h-4 w-4" /> Verify Document
            </Link>
        </div>
    );
}

/** A thin gold rule with a diamond at its centre. */
function Ornament({ className = "" }) {
    return (
        <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4a017] sm:w-24" />
            <span className="h-2 w-2 rotate-45 bg-[#f5c842]" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4a017] sm:w-24" />
        </div>
    );
}

/* ══ The Crest ═══════════════════════════════════════════════════════════ */
export function HeroCrest() {
    const type = TYPE;
    return (
        <div className="mx-auto w-full max-w-5xl px-6 py-24 text-center">
            <div style={fadeUp(100)} className="flex items-center justify-center gap-4 sm:gap-8">
                <CpdoMark className="h-16 sm:h-24" />
                <span className="hidden h-px w-10 bg-gradient-to-r from-transparent to-[#d4a017] sm:block" aria-hidden="true" />
                <SealMark className="h-24 w-24 sm:h-32 sm:w-32" ring="border-4 border-[#f5c842] ring-8 ring-[#f5c842]/15" />
                <span className="hidden h-px w-10 bg-gradient-to-l from-transparent to-[#d4a017] sm:block" aria-hidden="true" />
                <VisionMark className="h-16 w-16 sm:h-24 sm:w-24" />
            </div>
            <p style={{ ...fadeUp(250), ...type.republic.style }} className={`mt-8 text-blue-100/80 ${type.republic.className}`}>
                Republic of the Philippines
            </p>
            <h1 style={{ ...fadeUp(350), ...type.name.style }} className={`mt-3 text-white ${type.name.className}`}>
                City Planning and
                <span className="block">Development Office</span>
            </h1>
            <Ornament className="mt-6" />
            <p style={{ ...fadeUp(450), ...type.city.style }} className={`mt-4 text-[#f5c842] ${type.city.className}`}>
                City of Ilagan, Isabela
            </p>
            <div style={fadeUp(600)}><Actions className="mt-10" /></div>
        </div>
    );
}
