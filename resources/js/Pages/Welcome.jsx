import { Head, Link } from "@inertiajs/react";
import PublicNavbar from "@/Components/PublicNavbar";
import PublicFooter from "@/Components/PublicFooter";
import {
    LayoutDashboard,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    MonitorSmartphone,
    ClipboardList,
    Landmark,
    Eye,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { MISSION, VISION } from "@/lib/officeInfo";

/* ── Scroll-reveal wrapper ────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const o = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setV(true);
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
                opacity: v ? 1 : 0,
                transform: v ? "translateY(0)" : "translateY(24px)",
            }}
        >
            {children}
        </div>
    );
}

/* ── Step pill ───────────────────────────────────────────────────────────── */
function Step({ n, label }) {
    return (
        <div className="flex flex-col items-center text-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-full border-2 border-[#1a3a8f] bg-[#e8eef8] flex items-center justify-center text-[#1a3a8f] font-black text-base shrink-0">
                {n}
            </div>
            <p className="text-[#1a3a8f] font-bold text-sm leading-snug">
                {label}
            </p>
        </div>
    );
}

export default function Welcome() {
    const [in_, setIn] = useState(false);
    useEffect(() => {
        setIn(true);
    }, []);

    // Back to top. Appears only once there is something to scroll back from,
    // so it never sits over the hero's calls to action.
    const [showTop, setShowTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <Head title="CPDO LC — City of Ilagan" />

            <PublicNavbar />

            {/* ═══════════════════════ HERO ═══════════════════════════════ */}
            <section
                className="relative overflow-hidden bg-[#0d1f5c]"
                style={{ minHeight: "92vh" }}
            >
                {/* Subtle grid */}
                <svg
                    className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="hg"
                            width="52"
                            height="52"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 52 0 L 0 0 0 52"
                                fill="none"
                                stroke="#93c5fd"
                                strokeWidth="0.7"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hg)" />
                </svg>

                {/* Glow orbs */}
                <div
                    className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-40"
                    style={{
                        background:
                            "radial-gradient(circle,#1d4ed8,transparent 70%)",
                    }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-30"
                    style={{
                        background:
                            "radial-gradient(circle,#d4a017,transparent 70%)",
                    }}
                />

                {/* Padding kept tight so the two calls to action clear the fold on
                    a laptop — at py-20/28 they sat below the viewport, which is
                    the one thing on this screen that has to be reachable without
                    scrolling. */}
                <div className="relative max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-10 lg:py-14">
                    {/* Left text */}
                    <div
                        className="lg:w-1/2 space-y-5 lg:space-y-6"
                        style={{
                            opacity: in_ ? 1 : 0,
                            transform: in_ ? "none" : "translateX(-20px)",
                            transition: "all .9s ease .3s",
                        }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/50 bg-[#d4a017]/10 text-[#d4a017] text-[11px] font-bold tracking-widest uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] animate-pulse" />
                            Official Digital Services Platform
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full border-2 border-[#d4a017]/40 overflow-hidden shrink-0">
                                <img
                                    src="/images/ilagan1.png"
                                    alt="City of Ilagan"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-blue-300 text-sm font-semibold">
                                    Welcome to
                                </p>
                                <p className="text-white font-black text-2xl lg:text-3xl leading-tight tracking-tight">
                                    CPDO LC
                                </p>
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-[1.05] tracking-tight text-white">
                            Apply for Land Use
                            <br />
                            <span
                                className="text-transparent bg-clip-text"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(90deg,#d4a017,#f5c842)",
                                }}
                            >
                                Certificates of Zoning Compliance
                            </span>
                            <br />
                            Online
                        </h1>

                        <p className="text-blue-100/85 text-base lg:text-lg leading-relaxed max-w-lg">
                            Enjoy a fast and convenient way of securing your
                            Zoning Compliance/Clearance, Special Use Permit, and
                            other land use certifications — with just a few
                            clicks, right from the comfort of your home.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Link
                                href={route("register")}
                                className="px-6 py-2.5 rounded-md bg-[#d4a017] hover:bg-[#b8880d] text-white font-bold text-sm shadow-lg transition-colors text-center"
                            >
                                APPLY ONLINE NOW
                            </Link>
                            <Link
                                href={route("login")}
                                className="px-6 py-2.5 rounded-md border border-blue-400/40 text-blue-200 hover:text-white hover:border-blue-300 hover:bg-white/5 font-bold text-sm transition-all text-center"
                            >
                                Already Registered?
                            </Link>
                            <Link
                                href={route("verify.index")}
                                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-md border border-[#d4a017]/60 text-[#d4a017] hover:text-white hover:border-[#d4a017] hover:bg-[#d4a017] font-bold text-sm transition-all text-center"
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Verify Document
                            </Link>
                        </div>
                    </div>

                    {/* Right — document mockup */}
                    <div
                        className="lg:w-1/2 flex justify-center"
                        style={{
                            opacity: in_ ? 1 : 0,
                            transform: in_ ? "none" : "translateX(20px)",
                            transition: "all .9s ease .5s",
                        }}
                    >
                        <div className="relative w-full max-w-md">
                            {/* Back card */}
                            <div className="absolute top-4 left-6 right-0 bottom-0 rounded-2xl border border-[#d4a017]/30 bg-[#1a3a8f]/40 backdrop-blur-sm shadow-2xl rotate-3" />
                            {/* Front card */}
                            <div className="relative rounded-2xl bg-white/95 shadow-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
                                    <div className="w-10 h-10 rounded-full border border-[#0d1f5c]/20 overflow-hidden shrink-0">
                                        <img
                                            src="/images/ilagan1.png"
                                            alt="City of Ilagan"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[#0d1f5c] font-black text-xs uppercase tracking-widest">
                                            Republic of the Philippines
                                        </p>
                                        <p className="text-[#0d1f5c] font-black text-sm">
                                            City of Ilagan, Isabela
                                        </p>
                                        <p className="text-[#d4a017] font-bold text-xs uppercase tracking-wide">
                                            City Planning &amp; Development
                                            Office
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold">
                                        Official Document
                                    </p>
                                    <h3 className="text-[#0d1f5c] font-black text-lg mt-1">
                                        CERTIFICATE OF ZONING COMPLIANCE
                                    </h3>
                                    <p className="text-[#d4a017] font-bold text-sm">
                                        No. CPDO-2026-000001
                                    </p>
                                </div>
                                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
                                    <div className="flex gap-2">
                                        <span className="font-bold text-gray-800 w-28 shrink-0">
                                            Applicant:
                                        </span>
                                        <span>Juan Dela Cruz</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold text-gray-800 w-28 shrink-0">
                                            Property:
                                        </span>
                                        <span>
                                            Lot 12, Blk 3, Brgy. Centro, City of
                                            Ilagan Isabela
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold text-gray-800 w-28 shrink-0">
                                            Purpose:
                                        </span>
                                        <span>Commercial Use</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold text-gray-800 w-28 shrink-0">
                                            Status:
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                            APPROVED
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold text-gray-800 w-28 shrink-0">
                                            Date Issued:
                                        </span>
                                        <span>August 13, 2026</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400">
                                        <LayoutDashboard
                                            className="w-8 h-8"
                                            strokeWidth={1}
                                        />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                            Authorized by
                                        </p>
                                        <p className="text-[#0d1f5c] font-black text-sm mt-1">
                                            City Planning Officer
                                        </p>
                                        <p className="text-gray-500 text-[11px]">
                                            City of Ilagan CPDO
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating badge */}
                            <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-[#d4a017] text-white text-xs font-bold shadow-lg flex items-center gap-2">
                                <CheckCircle2
                                    className="w-4 h-4"
                                    strokeWidth={2.5}
                                />
                                Digitally Verified
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll cue */}
                <div
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                    style={{ animation: "cpdo-bounce 2s ease-in-out infinite" }}
                >
                    <span className="text-blue-400/60 text-[10px] tracking-[0.3em] uppercase">
                        Scroll
                    </span>
                    <ChevronDown className="w-4 h-4 text-blue-400/60" />
                </div>
            </section>

            {/* ═══════════════════════ WHY SECTION ════════════════════════ */}
            <section id="why" className="py-24 bg-[#112068]">
                <div className="max-w-6xl mx-auto px-6 lg:px-12">
                    <Reveal className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-white">
                            Why use{" "}
                            <span className="text-[#d4a017]">CPDO LC</span>?
                        </h2>
                        <p className="text-blue-200/70 mt-3 text-base max-w-xl mx-auto">
                            Your one-stop digital platform for all city planning
                            and land use services in Ilagan City.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
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
                        ].map((item, i) => (
                            <Reveal key={i} delay={i * 100}>
                                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#0d1f5c]/60 border border-[#1a3a8f]/60 hover:border-[#d4a017]/50 hover:bg-[#0d1f5c]/80 transition-all duration-300 h-full">
                                    <div className="mb-5 w-16 h-16 rounded-2xl bg-[#d4a017]/15 border border-[#d4a017]/30 flex items-center justify-center">
                                        <item.icon
                                            className="w-8 h-8 text-[#d4a017]"
                                            strokeWidth={1.75}
                                        />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-blue-200/70 text-sm leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ HOW TO SECTION ═════════════════════ */}
            <section
                id="how"
                className="relative py-24 overflow-hidden"
                style={{
                    background:
                        "linear-gradient(180deg,#0d1f5c 0%,#112068 60%,#1a3a8f 100%)",
                }}
            >
                {/* Gold diagonal accents */}
                <div
                    className="absolute bottom-0 left-0 w-56 h-56 pointer-events-none opacity-70"
                    style={{
                        background: "linear-gradient(135deg,#d4a017,#f5c842)",
                        clipPath: "polygon(0 100%,0 40%,100% 100%)",
                    }}
                />
                <div
                    className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none opacity-60"
                    style={{
                        background: "linear-gradient(225deg,#0d1f5c,#112068)",
                        clipPath: "polygon(100% 100%,100% 0,0 100%)",
                    }}
                />

                <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
                    <Reveal className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-black text-white">
                            How to apply for a permit{" "}
                            <span className="text-[#d4a017]">online?</span>
                        </h2>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10">
                            {/* Steps row */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <Step
                                    n="1"
                                    label={"Create & verify\nyour account"}
                                />
                                {/* Arrow */}
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">
                                    ›
                                </div>
                                <Step
                                    n="2"
                                    label={"Fill out the\napplication form"}
                                />
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">
                                    ›
                                </div>
                                <Step
                                    n="3"
                                    label={"Submit your\nrequirements"}
                                />
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">
                                    ›
                                </div>
                                <Step
                                    n="4"
                                    label={
                                        "Officer review &\nAdministrator approval"
                                    }
                                />
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">
                                    ›
                                </div>
                                <Step
                                    n="5"
                                    label={"Pay the fee &\nupload your receipt"}
                                />
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">
                                    ›
                                </div>
                                <Step
                                    n="6"
                                    label={"Download your\nCertificate"}
                                />
                            </div>
                        </div>
                    </Reveal>

                    {/* CTA button */}
                    <Reveal delay={200} className="mt-14 flex justify-center">
                        <Link
                            href={route("register")}
                            className="px-12 py-4 rounded-full bg-white text-[#0d1f5c] font-black text-base tracking-wide hover:bg-[#f0f4ff] shadow-xl transition-colors uppercase"
                        >
                            APPLY FOR A PERMIT NOW!
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════ MISSION & VISION ═══════════════════════ */}
            <section id="mission" className="bg-white py-24">
                <div className="mx-auto max-w-6xl px-6 lg:px-12">
                    <Reveal className="mb-12 text-center">
                        <h2 className="text-3xl font-black text-[#0d1f5c] lg:text-4xl">
                            Mission &amp; Vision
                        </h2>
                        <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-[#d4a017]">
                            City Planning and Development Office
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Reveal>
                            <div className="flex h-full flex-col gap-4 rounded-2xl border-t-4 border-[#0d1f5c] bg-[#e8eef8] p-8">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d1f5c]">
                                        <Landmark className="h-5 w-5 text-white" />
                                    </span>
                                    <h3 className="text-xl font-black tracking-wide text-[#0d1f5c]">
                                        Mission
                                    </h3>
                                </div>
                                <p className="text-sm leading-relaxed text-[#1a3a8f]">
                                    {MISSION}
                                </p>
                            </div>
                        </Reveal>

                        <Reveal>
                            <div className="flex h-full flex-col gap-4 rounded-2xl border-t-4 border-[#d4a017] bg-[#e8eef8] p-8">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4a017]">
                                        <Eye className="h-5 w-5 text-white" />
                                    </span>
                                    <h3 className="text-xl font-black tracking-wide text-[#0d1f5c]">
                                        Vision
                                    </h3>
                                </div>
                                <p className="text-sm font-medium italic leading-relaxed text-[#1a3a8f]">
                                    &ldquo;{VISION}&rdquo;
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            <PublicFooter />

            {/* Back to top */}
            <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#d4a017] text-white shadow-lg transition-all duration-300 hover:bg-[#b8880d] focus:outline-none focus:ring-2 focus:ring-[#d4a017]/60 focus:ring-offset-2 ${
                    showTop
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-4 opacity-0"
                }`}
            >
                <ChevronUp className="h-6 w-6" strokeWidth={2.5} />
            </button>

            {/* Keyframes */}
            <style>{`
                @keyframes cpdo-bounce {
                    0%,100% { transform:translate(-50%,0); }
                    50%     { transform:translate(-50%,7px); }
                }
            `}</style>
        </>
    );
}
