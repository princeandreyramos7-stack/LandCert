import { Head, Link } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";

/* ── Scroll-reveal wrapper ────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: 0.08 });
        if (ref.current) o.observe(ref.current);
        return () => o.disconnect();
    }, []);
    return (
        <div ref={ref} className={className}
            style={{ transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)" }}>
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
            <p className="text-[#1a3a8f] font-bold text-sm leading-snug">{label}</p>
        </div>
    );
}

/* ── Review card ─────────────────────────────────────────────────────────── */
const reviews = [
    { text: "Very convenient! I submitted my locational clearance request from home and received my certificate within days. No more long queues.", author: "M. Santos" },
    { text: "The online tracking feature is great. I always knew the status of my application. Highly recommend to all property owners.", author: "R. Dela Cruz" },
    { text: "The CPDO portal made the process so much easier. The staff also respond quickly through the system. Excellent service!", author: "A. Reyes" },
    { text: "Smooth and fast. I got my Special Use Permit without hassle. This is the future of government services.", author: "J. Garcia" },
];

export default function Welcome({ auth }) {
    const [in_, setIn] = useState(false);
    const [reviewIdx, setReviewIdx] = useState(0);
    useEffect(() => { setIn(true); }, []);

    const prevReview = () => setReviewIdx(i => (i - 1 + reviews.length) % reviews.length);
    const nextReview = () => setReviewIdx(i => (i + 1) % reviews.length);

    /* visible 3 reviews (wrap-around) */
    const visible = [0, 1, 2].map(o => reviews[(reviewIdx + o) % reviews.length]);

    return (
        <>
            <Head title="CPDO — City of Ilagan" />

            {/* ═══════════════════════ NAVBAR ═════════════════════════════ */}
            <nav className="sticky top-0 z-50 bg-[#0d1f5c] border-b border-[#1a3a8f]/60 shadow-md">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3"
                        style={{ opacity: in_ ? 1 : 0, transform: in_ ? "none" : "translateX(-14px)", transition: "all .7s ease" }}>
                        <img src="/images/Ilagan.png" alt="CPDO Logo" className="w-9 h-9 object-contain"/>
                        <div className="leading-tight">
                            <p className="text-white font-black text-xs tracking-[0.15em] uppercase">Republic of the Philippines</p>
                            <p className="text-[#d4a017] font-black text-sm tracking-wide uppercase">City Planning &amp; Development Office</p>
                            <p className="text-blue-300 text-[10px] tracking-widest">Ilagan City, Isabela</p>
                        </div>
                    </div>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-7 text-sm font-semibold"
                        style={{ opacity: in_ ? 1 : 0, transition: "opacity .7s ease .2s" }}>
                        <a href="#why" className="text-blue-200 hover:text-white transition-colors">About</a>
                        <a href="#how" className="text-blue-200 hover:text-white transition-colors">How It Works</a>
                        <a href="#reviews" className="text-blue-200 hover:text-white transition-colors">Reviews</a>
                        <a href="#contact" className="text-blue-200 hover:text-white transition-colors">Contact</a>
                        {auth.user
                            ? <Link href={route("dashboard")} className="px-5 py-2 rounded-md bg-[#d4a017] hover:bg-[#b8880d] text-white font-bold transition-colors text-sm shadow">
                                Dashboard
                              </Link>
                            : <Link href={route("login")} className="px-5 py-2 rounded-md bg-[#d4a017] hover:bg-[#b8880d] text-white font-bold transition-colors text-sm shadow">
                                Login
                              </Link>
                        }
                    </div>

                    {/* Mobile login */}
                    <div className="md:hidden">
                        {auth.user
                            ? <Link href={route("dashboard")} className="px-4 py-2 rounded-md bg-[#d4a017] text-white font-bold text-sm">Dashboard</Link>
                            : <Link href={route("login")} className="px-4 py-2 rounded-md bg-[#d4a017] text-white font-bold text-sm">Login</Link>
                        }
                    </div>
                </div>
            </nav>

            {/* ═══════════════════════ HERO ═══════════════════════════════ */}
            <section className="relative overflow-hidden bg-[#0d1f5c]" style={{ minHeight: "92vh" }}>
                {/* Subtle grid */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="hg" width="52" height="52" patternUnits="userSpaceOnUse"><path d="M 52 0 L 0 0 0 52" fill="none" stroke="#93c5fd" strokeWidth="0.7"/></pattern></defs>
                    <rect width="100%" height="100%" fill="url(#hg)"/>
                </svg>

                {/* Glow orbs */}
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none opacity-40"
                    style={{ background: "radial-gradient(circle,#1d4ed8,transparent 70%)" }}/>
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-30"
                    style={{ background: "radial-gradient(circle,#d4a017,transparent 70%)" }}/>

                <div className="relative max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 py-20 lg:py-28">
                    {/* Left text */}
                    <div className="lg:w-1/2 space-y-7"
                        style={{ opacity: in_ ? 1 : 0, transform: in_ ? "none" : "translateX(-20px)", transition: "all .9s ease .3s" }}>

                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/50 bg-[#d4a017]/10 text-[#d4a017] text-[11px] font-bold tracking-widest uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] animate-pulse"/>
                            Official Digital Services Platform
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full border-2 border-[#d4a017]/40 bg-[#d4a017]/10 flex items-center justify-center shrink-0">
                                <img src="/images/Ilagan.png" alt="CPDO" className="w-9 h-9 object-contain"/>
                            </div>
                            <div>
                                <p className="text-blue-300 text-sm font-semibold">Welcome to</p>
                                <p className="text-white font-black text-2xl lg:text-3xl leading-tight tracking-tight">CPDO LandCert</p>
                            </div>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black leading-[1.05] tracking-tight text-white">
                            Apply for Land Use<br/>
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: "linear-gradient(90deg,#d4a017,#f5c842)" }}>
                                Permits &amp; Clearances
                            </span>
                            <br/>Online
                        </h1>

                        <p className="text-blue-100/85 text-base lg:text-lg leading-relaxed max-w-lg">
                            Enjoy a fast and convenient way of securing your Locational Clearance, Special Use Permit,
                            and other land use certifications — with just a few clicks, right from the comfort of your home.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            {!auth.user ? (<>
                                <Link href={route("register")}
                                    className="px-8 py-3.5 rounded-md bg-[#d4a017] hover:bg-[#b8880d] text-white font-bold text-base shadow-lg transition-colors text-center">
                                    APPLY ONLINE NOW
                                </Link>
                                <Link href={route("login")}
                                    className="px-8 py-3.5 rounded-md border border-blue-400/40 text-blue-200 hover:text-white hover:border-blue-300 hover:bg-white/5 font-bold text-base transition-all text-center">
                                    Already Registered?
                                </Link>
                            </>) : (
                                <Link href={route("dashboard")}
                                    className="px-8 py-3.5 rounded-md bg-[#d4a017] hover:bg-[#b8880d] text-white font-bold text-base shadow-lg transition-colors text-center">
                                    OPEN DASHBOARD
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right — document mockup */}
                    <div className="lg:w-1/2 flex justify-center"
                        style={{ opacity: in_ ? 1 : 0, transform: in_ ? "none" : "translateX(20px)", transition: "all .9s ease .5s" }}>
                        <div className="relative w-full max-w-md">
                            {/* Back card */}
                            <div className="absolute top-4 left-6 right-0 bottom-0 rounded-2xl border border-[#d4a017]/30 bg-[#1a3a8f]/40 backdrop-blur-sm shadow-2xl rotate-3"/>
                            {/* Front card */}
                            <div className="relative rounded-2xl bg-white/95 shadow-2xl p-6 border border-gray-100">
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4">
                                    <img src="/images/Ilagan.png" alt="Logo" className="w-10 h-10 object-contain"/>
                                    <div>
                                        <p className="text-[#0d1f5c] font-black text-xs uppercase tracking-widest">Republic of the Philippines</p>
                                        <p className="text-[#0d1f5c] font-black text-sm">City of Ilagan, Isabela</p>
                                        <p className="text-[#d4a017] font-bold text-xs uppercase tracking-wide">City Planning &amp; Development Office</p>
                                    </div>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="text-[11px] text-gray-500 uppercase tracking-[0.2em] font-semibold">Official Document</p>
                                    <h3 className="text-[#0d1f5c] font-black text-lg mt-1">LOCATIONAL CLEARANCE</h3>
                                    <p className="text-[#d4a017] font-bold text-sm">No. LC-2026-00001</p>
                                </div>
                                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
                                    <div className="flex gap-2"><span className="font-bold text-gray-800 w-28 shrink-0">Applicant:</span><span>Juan dela Cruz</span></div>
                                    <div className="flex gap-2"><span className="font-bold text-gray-800 w-28 shrink-0">Property:</span><span>Lot 12, Blk 3, Brgy. Centro, Ilagan City</span></div>
                                    <div className="flex gap-2"><span className="font-bold text-gray-800 w-28 shrink-0">Purpose:</span><span>Commercial Use</span></div>
                                    <div className="flex gap-2"><span className="font-bold text-gray-800 w-28 shrink-0">Status:</span>
                                        <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>APPROVED
                                        </span>
                                    </div>
                                    <div className="flex gap-2"><span className="font-bold text-gray-800 w-28 shrink-0">Date Issued:</span><span>August 13, 2026</span></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-gray-400">
                                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Authorized by</p>
                                        <p className="text-[#0d1f5c] font-black text-sm mt-1">City Planning Officer</p>
                                        <p className="text-gray-500 text-[11px]">Ilagan City CPDO</p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating badge */}
                            <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-[#d4a017] text-white text-xs font-bold shadow-lg flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                Digitally Verified
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1" style={{ animation: "cpdo-bounce 2s ease-in-out infinite" }}>
                    <span className="text-blue-400/60 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                    <svg className="w-4 h-4 text-blue-400/60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                </div>
            </section>

            {/* ═══════════════════════ WHY SECTION ════════════════════════ */}
            <section id="why" className="py-24 bg-[#112068]">
                <div className="max-w-6xl mx-auto px-6 lg:px-12">
                    <Reveal className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-white">
                            Why use <span className="text-[#d4a017]">CPDO LandCert</span>?
                        </h2>
                        <p className="text-blue-200/70 mt-3 text-base max-w-xl mx-auto">
                            Your one-stop digital platform for all city planning and land use services in Ilagan City.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                emoji: "🖥️",
                                title: "Apply Online, Anytime",
                                desc: "Submit your land use permit applications from anywhere — no need to visit the office. Available 24/7.",
                            },
                            {
                                emoji: "📋",
                                title: "Track Your Application",
                                desc: "Monitor the real-time status of your application from submission to approval, right on your dashboard.",
                            },
                            {
                                emoji: "🏛️",
                                title: "Official Government Certificates",
                                desc: "Receive 100% official and verifiable certificates issued directly by Ilagan City's CPDO.",
                            },
                        ].map((item, i) => (
                            <Reveal key={i} delay={i * 100}>
                                <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-[#0d1f5c]/60 border border-[#1a3a8f]/60 hover:border-[#d4a017]/50 hover:bg-[#0d1f5c]/80 transition-all duration-300 h-full">
                                    <div className="text-6xl mb-5 leading-none">{item.emoji}</div>
                                    <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
                                    <p className="text-blue-200/70 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ HOW TO SECTION ═════════════════════ */}
            <section id="how" className="relative py-24 overflow-hidden" style={{ background: "linear-gradient(180deg,#0d1f5c 0%,#112068 60%,#1a3a8f 100%)" }}>
                {/* Gold diagonal accents */}
                <div className="absolute bottom-0 left-0 w-56 h-56 pointer-events-none opacity-70"
                    style={{ background: "linear-gradient(135deg,#d4a017,#f5c842)", clipPath: "polygon(0 100%,0 40%,100% 100%)" }}/>
                <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none opacity-60"
                    style={{ background: "linear-gradient(225deg,#0d1f5c,#112068)", clipPath: "polygon(100% 100%,100% 0,0 100%)" }}/>

                <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
                    <Reveal className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-black text-white">
                            How to apply for a permit <span className="text-[#d4a017]">online?</span>
                        </h2>
                    </Reveal>

                    <Reveal delay={100}>
                        <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10">
                            {/* Steps row */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <Step n="1" label={"Create an\naccount"}/>
                                {/* Arrow */}
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">›</div>
                                <Step n="2" label={"Login your\naccount"}/>
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">›</div>
                                <Step n="3" label={"Select permit\ntype & fill form"}/>
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">›</div>
                                <Step n="4" label={"Submit\nDocuments"}/>
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">›</div>
                                <Step n="5" label={"Pay the\nFee"}/>
                                <div className="hidden sm:block text-gray-300 text-2xl font-thin shrink-0">›</div>
                                <Step n="6" label={"Receive your\nCertificate"}/>
                            </div>
                        </div>
                    </Reveal>

                    {/* CTA button */}
                    <Reveal delay={200} className="mt-14 flex justify-center">
                        {!auth.user ? (
                            <Link href={route("register")}
                                className="px-12 py-4 rounded-full bg-white text-[#0d1f5c] font-black text-base tracking-wide hover:bg-[#f0f4ff] shadow-xl transition-colors uppercase">
                                APPLY FOR A PERMIT NOW!
                            </Link>
                        ) : (
                            <Link href={route("dashboard")}
                                className="px-12 py-4 rounded-full bg-white text-[#0d1f5c] font-black text-base tracking-wide hover:bg-[#f0f4ff] shadow-xl transition-colors uppercase">
                                OPEN DASHBOARD
                            </Link>
                        )}
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════════ REVIEWS ════════════════════════════ */}
            <section id="reviews" className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 lg:px-12">
                    <Reveal className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-black text-[#0d1f5c]">Reviews</h2>
                    </Reveal>

                    <div className="relative flex items-center gap-4">
                        {/* Prev */}
                        <button onClick={prevReview}
                            className="shrink-0 w-10 h-10 rounded-full border-2 border-[#1a3a8f]/30 text-[#1a3a8f] hover:bg-[#0d1f5c] hover:text-white hover:border-[#0d1f5c] transition-all flex items-center justify-center shadow">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                        </button>

                        {/* Cards */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-5 overflow-hidden">
                            {visible.map((r, i) => (
                                <div key={i} className="bg-[#e8eef8] rounded-xl p-6 flex flex-col gap-3 min-h-[160px]">
                                    <div className="text-[#1a3a8f] text-3xl font-serif leading-none">"</div>
                                    <p className="text-[#1a3a8f] text-sm leading-relaxed flex-1">{r.text} <span className="text-[#1a3a8f]">"</span></p>
                                    <p className="text-[#0d1f5c] font-bold text-sm">— {r.author}</p>
                                </div>
                            ))}
                        </div>

                        {/* Next */}
                        <button onClick={nextReview}
                            className="shrink-0 w-10 h-10 rounded-full border-2 border-[#1a3a8f]/30 text-[#1a3a8f] hover:bg-[#0d1f5c] hover:text-white hover:border-[#0d1f5c] transition-all flex items-center justify-center shadow">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════ FOOTER ═════════════════════════════ */}
            <footer id="contact" className="bg-[#0d1f5c] border-t border-[#1a3a8f]/60">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <img src="/images/Ilagan.png" alt="Logo" className="w-9 h-9 object-contain"/>
                                <div>
                                    <p className="text-white font-black text-sm tracking-widest uppercase">CPDO</p>
                                    <p className="text-[#d4a017] text-xs font-semibold">City of Ilagan, Isabela</p>
                                </div>
                            </div>
                            <p className="text-blue-300/70 text-sm leading-relaxed max-w-xs">
                                Committed to responsible land use planning, sustainable development, and accessible government services for all Ilagan City residents.
                            </p>
                        </div>

                        {/* Quick links */}
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm tracking-wide">Quick Links</h4>
                            <ul className="space-y-2 text-blue-300/70 text-sm">
                                <li><a href="#why" className="hover:text-[#d4a017] transition-colors">About CPDO LandCert</a></li>
                                <li><a href="#how" className="hover:text-[#d4a017] transition-colors">How It Works</a></li>
                                <li>
                                    {!auth.user
                                        ? <Link href={route("register")} className="hover:text-[#d4a017] transition-colors">Create Account</Link>
                                        : <Link href={route("dashboard")} className="hover:text-[#d4a017] transition-colors">Dashboard</Link>
                                    }
                                </li>
                                <li><Link href={route("login")} className="hover:text-[#d4a017] transition-colors">Login</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-bold mb-4 text-sm tracking-wide">Contact Us</h4>
                            <ul className="space-y-3 text-blue-300/70 text-sm">
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 text-[#d4a017] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                                    Ground Floor, City Hall Bldg,<br/>Ilagan City, Isabela
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#d4a017] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                                    624-0009
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#d4a017] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                                    cpdo@cityofilagan.gov.ph
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#d4a017] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>
                                    Mon – Fri: 8:00 AM – 5:00 PM
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t border-[#1a3a8f]/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-blue-400/50 text-xs">
                            &copy; {new Date().getFullYear()} City Planning and Development Office — Ilagan City, Isabela. All rights reserved.
                        </p>
                        <div className="flex items-center gap-5 text-blue-400/50 text-xs">
                            <a href="#" className="hover:text-[#d4a017] transition-colors">FAQs</a>
                            <span>|</span>
                            <a href="#" className="hover:text-[#d4a017] transition-colors">Terms and Conditions</a>
                            <span>|</span>
                            <a href="#contact" className="hover:text-[#d4a017] transition-colors">Contact Us</a>
                        </div>
                    </div>
                </div>
            </footer>

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
