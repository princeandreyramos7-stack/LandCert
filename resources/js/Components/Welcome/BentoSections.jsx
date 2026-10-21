import { useEffect, useRef, useState } from "react";
import { Link } from "@inertiajs/react";
import {
    ArrowRight,
    BadgeCheck,
    ClipboardList,
    Download,
    Eye,
    FileText,
    Landmark,
    MapPin,
    MonitorSmartphone,
    Upload,
    UserPlus,
} from "lucide-react";
import PesoReceipt from "@/Components/icons/PesoReceipt";
import { MISSION, VISION } from "@/lib/officeInfo";

/*
 * The landing page below the hero - Why use CPDO LC, How to apply and
 * Mission & Vision - laid out as tiles of text and landmark photographs.
 * The section ids (why, how, mission) are what the navbar links to.
 */

const IMG = {
    hall: "/images/hero/ilagan-city-hall.jpg",
    butaka: "/images/hero/ilagan-butaka.jpg",
};

const WHY = [
    {
        icon: MonitorSmartphone,
        title: "Apply Online, Anytime",
        desc: "Submit your land use permit applications from anywhere — no need to visit the office. Available 24/7.",
    },
    {
        icon: ClipboardList,
        title: "Track Your Application",
        desc: "Monitor the real-time status of your application from submission to approval, right on your dashboard.",
    },
    {
        icon: Landmark,
        title: "Official Government Certificates",
        desc: "Receive 100% official and verifiable certificates issued directly by City of Ilagan CPDO.",
    },
];

const STEPS = [
    { icon: UserPlus, label: "Create & verify your account" },
    { icon: FileText, label: "Fill out the application form" },
    { icon: Upload, label: "Submit your requirements" },
    { icon: BadgeCheck, label: "Officer review & Administrator approval" },
    { icon: PesoReceipt, label: "Pay the fee & upload your receipt" },
    { icon: Download, label: "Download your Certificate" },
];

/* ── Scroll-reveal wrapper ────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);
    useEffect(() => {
        const o = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setShown(true);
                    o.disconnect();
                }
            },
            { threshold: 0.08 },
        );
        if (ref.current) o.observe(ref.current);
        return () => o.disconnect();
    }, []);
    return (
        <div
            ref={ref}
            className={className}
            style={{
                transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`,
                opacity: shown ? 1 : 0,
                transform: shown ? "none" : "translateY(24px)",
            }}
        >
            {children}
        </div>
    );
}

/** "CPDO · ..." style eyebrow over each heading, as on the hero. */
function Eyebrow({ children, light = false }) {
    return (
        <p className={`text-xs font-bold uppercase tracking-[0.3em] ${light ? "text-[#f5c842]" : "text-[#d4a017]"}`}>
            {children}
        </p>
    );
}

export default function BentoSections() {
    return (
        <>
            {/* ═══════════════════════ WHY ════════════════════════════════ */}
            <section id="why" className="bg-[#0d1f5c] py-20">
                <div className="mx-auto max-w-6xl px-6 lg:px-12">
                    <Reveal className="mb-10">
                        <Eyebrow light>Why CPDO LC</Eyebrow>
                        <h2 className="mt-3 text-3xl font-black text-white lg:text-4xl">
                            Why use <span className="text-[#f5c842]">CPDO LC</span>?
                        </h2>
                        <p className="mt-3 max-w-xl text-base text-blue-100/80">
                            Your one-stop digital platform for all city planning and development office services in Ilagan City.
                        </p>
                    </Reveal>
                    <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
                        <Reveal className="md:col-span-2 md:row-span-2">
                            <div className="relative h-full min-h-[260px] overflow-hidden rounded-3xl">
                                <img src={IMG.hall} alt="City of Ilagan City Hall" className="absolute inset-0 h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f5c] via-[#0d1f5c]/30 to-transparent" />
                                <div className="absolute bottom-0 p-6">
                                    <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-white/80">
                                        <MapPin className="h-3 w-3" /> City of Ilagan City Hall
                                    </p>
                                    <p className="mt-2 text-2xl font-black text-white">Services of City Hall, from wherever you are.</p>
                                </div>
                            </div>
                        </Reveal>
                        {WHY.map((item, i) => (
                            <Reveal key={item.title} delay={i * 80} className={i === 2 ? "md:col-span-2" : ""}>
                                <div
                                    className={`flex h-full flex-col justify-between rounded-3xl p-6 ${
                                        i === 1 ? "bg-[#d4a017] text-white" : "border border-white/10 bg-white/[0.06] text-white"
                                    }`}
                                >
                                    <item.icon className={`h-8 w-8 ${i === 1 ? "text-white" : "text-[#f5c842]"}`} strokeWidth={1.75} />
                                    <div className="mt-6">
                                        <h3 className="text-lg font-bold">{item.title}</h3>
                                        <p className={`mt-1 text-sm leading-relaxed ${i === 1 ? "text-white/90" : "text-blue-100/75"}`}>{item.desc}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ HOW TO APPLY ═══════════════════════ */}
            <section id="how" className="bg-[#f4f6fb] py-20">
                <div className="mx-auto max-w-6xl px-6 lg:px-12">
                    <Reveal className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                        <div>
                            <Eyebrow>Six steps</Eyebrow>
                            <h2 className="mt-3 text-3xl font-black text-[#0d1f5c] lg:text-4xl">
                                How to apply for a permit <span className="text-[#d4a017]">online?</span>
                            </h2>
                        </div>
                        <Link
                            href={route("register")}
                            className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-[#d4a017] px-8 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-xl transition-colors hover:bg-[#b8880d] md:self-auto"
                        >
                            Apply for a Permit Now! <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Reveal>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {STEPS.map((s, i) => {
                            const last = i === STEPS.length - 1;
                            return (
                                <Reveal key={s.label} delay={i * 60} className={i === 0 || last ? "col-span-2" : ""}>
                                    <div
                                        className={`flex h-full flex-col justify-between rounded-3xl p-5 ${
                                            last ? "bg-[#0d1f5c] text-white" : "bg-white text-[#0d1f5c] shadow-sm"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-3xl font-black ${last ? "text-[#f5c842]" : "text-[#d4a017]"}`}>
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <s.icon className={`h-5 w-5 ${last ? "text-[#f5c842]" : "text-[#0d1f5c]/60"}`} />
                                        </div>
                                        <p className="mt-6 text-sm font-bold leading-snug">{s.label}</p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ MISSION & VISION ═══════════════════ */}
            <section id="mission" className="bg-white py-20">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 md:grid-cols-3 lg:px-12">
                    <Reveal className="md:col-span-3">
                        <Eyebrow>City Planning and Development Office</Eyebrow>
                        <h2 className="mt-3 text-3xl font-black text-[#0d1f5c] lg:text-4xl">Mission &amp; Vision</h2>
                    </Reveal>
                    <Reveal className="md:col-span-2">
                        <div className="h-full rounded-3xl bg-[#f4f6fb] p-8">
                            <div className="flex items-center gap-3">
                                <Landmark className="h-6 w-6 text-[#0d1f5c]" />
                                <h3 className="text-xl font-black text-[#0d1f5c]">Mission</h3>
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-[#1a3a8f]">{MISSION}</p>
                        </div>
                    </Reveal>
                    <Reveal delay={100} className="md:row-span-2">
                        <div className="relative h-full min-h-[280px] overflow-hidden rounded-3xl">
                            <img
                                src={IMG.butaka}
                                alt="World's Largest Butaka, City of Ilagan"
                                className="absolute inset-0 h-full w-full object-cover object-[50%_60%]"
                            />
                            <span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                                <MapPin className="h-3 w-3" /> World's Largest Butaka
                            </span>
                        </div>
                    </Reveal>
                    <Reveal delay={150} className="md:col-span-2">
                        <div className="h-full rounded-3xl bg-[#0d1f5c] p-8">
                            <div className="flex items-center gap-3">
                                <Eye className="h-6 w-6 text-[#f5c842]" />
                                <h3 className="text-xl font-black text-white">Vision</h3>
                            </div>
                            <p className="mt-4 text-base italic leading-relaxed text-blue-50">&ldquo;{VISION}&rdquo;</p>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
