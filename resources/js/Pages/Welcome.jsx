import { Head, Link } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";

/* ── Shared grid overlay ──────────────────────────────────────────────────── */
function Grid() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.09] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="g" width="56" height="56" patternUnits="userSpaceOnUse">
                    <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#3b82f6" strokeWidth="0.6"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
        </svg>
    );
}

/* ── Scroll-reveal wrapper ────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
    const ref = useRef(null);
    const [v, setV] = useState(false);
    useEffect(() => {
        const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: 0.1 });
        if (ref.current) o.observe(ref.current);
        return () => o.disconnect();
    }, []);
    return (
        <div ref={ref} className={className} style={{ transition: `opacity .8s ease ${delay}ms, transform .8s ease ${delay}ms`, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(28px)" }}>
            {children}
        </div>
    );
}

/* ── Animated counter ────────────────────────────────────────────────────── */
function Count({ end, suffix = "", label }) {
    const [n, setN] = useState(0);
    const ref = useRef(null); const started = useRef(false);
    useEffect(() => {
        const o = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                let c = 0; const step = Math.ceil(end / 60);
                const t = setInterval(() => { c += step; if (c >= end) { setN(end); clearInterval(t); } else setN(c); }, 20);
            }
        }, { threshold: 0.3 });
        if (ref.current) o.observe(ref.current);
        return () => o.disconnect();
    }, [end]);
    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl font-black text-white tabular-nums">{n.toLocaleString()}{suffix}</div>
            <div className="text-blue-300 text-xs font-semibold tracking-wide mt-1 uppercase">{label}</div>
        </div>
    );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function Welcome({ auth }) {
    const [in_, setIn] = useState(false);
    useEffect(() => { setIn(true); }, []);

    /* services */
    const services = [
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>,
            title: "Zoning Clearance",
            desc: "Verify that your property's intended use is consistent with our Comprehensive Land Use Plan and zoning ordinance.",
        },
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"/></svg>,
            title: "Special Use Permit (SUP)",
            desc: "Secure permits for specific land uses that require special approval due to their nature, impact, or location.",
        },
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
            title: "Temporary Use Permit (TUP)",
            desc: "Obtain permits for temporary land uses or activities limited to a specific duration within the city.",
        },
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"/></svg>,
            title: "Land Use Compliance",
            desc: "Ensure your development projects are fully compliant with national and local land use regulations.",
        },
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
            title: "Application Tracking",
            desc: "Monitor your application status in real time — from submission to certificate release.",
        },
        {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
            title: "Digital Certificates",
            desc: "Receive official, verifiable digital certificates electronically — no need to visit the office repeatedly.",
        },
    ];

    /* particles */
    const pts = Array.from({ length: 24 }, (_, i) => ({
        w: `${4 + (i % 4) * 2}px`,
        left: `${(i * 41 + 7) % 100}%`,
        top: `${(i * 59 + 11) % 100}%`,
        dur: `${4 + (i % 4)}s`,
        del: `${(i * 0.35) % 5}s`,
    }));

    return (
        <>
            <Head title="CPDO — City of Ilagan" />

            {/* ═══════════════════ HERO ═══════════════════════════════════ */}
            <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "linear-gradient(135deg,#0c2461 0%,#1034a6 40%,#1034a6 100%)" }}>
                <Grid />

                {/* Orbs */}
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-50 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#1d4ed8,transparent 70%)" }}/>
                <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle,#2563eb,transparent 70%)" }}/>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-35 blur-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse,#3b82f6,transparent 70%)" }}/>

                {/* Particles */}
                {pts.map((p, i) => (
                    <div key={i} className="absolute rounded-full bg-blue-400 opacity-0 pointer-events-none"
                        style={{ width: p.w, height: p.w, left: p.left, top: p.top, animation: `cpdo-pt ${p.dur} ${p.del} infinite ease-in` }}/>
                ))}

                {/* Nav */}
                <nav className="relative z-20 flex items-center justify-between px-6 lg:px-14 py-5 border-b border-blue-600/40 backdrop-blur-sm">
                    <div className="flex items-center gap-3" style={{ opacity: in_ ? 1 : 0, transform: in_ ? "none" : "translateX(-16px)", transition: "all .8s ease" }}>
                        <div className="relative w-11 h-11 rounded-full border border-blue-500/40 bg-blue-800/60 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-[pulse_3s_ease-in-out_infinite]"/>
                            <img src="/images/Ilagan.png" alt="Logo" className="w-8 h-8 object-contain relative z-10"/>
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-[0.15em] uppercase">CPDO</p>
                            <p className="text-blue-400 text-[11px] tracking-widest">City of Ilagan, Isabela</p>
                        </div>
                    </div>
                    <div style={{ opacity: in_ ? 1 : 0, transform: in_ ? "none" : "translateX(16px)", transition: "all .8s ease .3s" }}>
                        {auth.user
                            ? <Link href={route("dashboard")} className="px-5 py-2 text-sm font-semibold text-blue-200 border border-blue-600/50 rounded-full hover:bg-blue-600/20 hover:text-white transition-all">Dashboard →</Link>
                            : <Link href={route("login")} className="px-5 py-2 text-sm font-semibold text-blue-200 border border-blue-600/50 rounded-full hover:bg-blue-600/20 hover:text-white transition-all">Sign In →</Link>
                        }
                    </div>
                </nav>

                {/* Hero content */}
                <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
                    <div className="text-center max-w-5xl mx-auto space-y-9">

                        {/* Badge */}
                        <div style={{ opacity: in_ ? 1 : 0, transition: "opacity 1s ease .2s" }}>
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/40 bg-blue-800/60 text-blue-300 text-[11px] font-bold tracking-[0.25em] uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[pulse_2s_ease-in-out_infinite]"/>
                                City Planning &amp; Land Use Digital Platform
                            </span>
                        </div>

                        {/* Heading */}
                        <div style={{ opacity: in_ ? 1 : 0, transform: in_ ? "none" : "translateY(20px)", transition: "all 1s ease .45s" }}>
                            <h1 className="text-5xl sm:text-6xl lg:text-[82px] font-black leading-[1.04] tracking-tight">
                                <span className="text-white">City Planning and</span><br/>
                                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#93c5fd,#3b82f6,#1d4ed8)" }}>
                                    Development Office
                                </span>
                                <br/>
                                <span className="text-blue-100">Ilagan City</span>
                            </h1>
                        </div>

                        {/* Sub */}
                        <div style={{ opacity: in_ ? 1 : 0, transform: in_ ? "none" : "translateY(16px)", transition: "all 1s ease .7s" }}>
                            <p className="text-blue-100/90 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                                The City Planning and Development Office is your trusted partner in land use certification,
                                zoning compliance, and sustainable urban development for Ilagan City, Isabela.
                            </p>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ opacity: in_ ? 1 : 0, transform: in_ ? "none" : "translateY(12px)", transition: "all 1s ease .95s" }}>
                            {!auth.user ? (<>
                                <Link href={route("register")} className="group relative px-9 py-4 rounded-full text-base font-bold text-white overflow-hidden shadow-xl shadow-blue-900/50">
                                    <span className="absolute inset-0 transition-all duration-300" style={{ background: "linear-gradient(90deg,#1d4ed8,#2563eb)" }}/>
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg,#2563eb,#3b82f6)" }}/>
                                    <span className="relative flex items-center gap-2">
                                        Apply Online Now
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                                    </span>
                                </Link>
                                <Link href={route("login")} className="px-9 py-4 rounded-full text-base font-bold text-blue-200 hover:text-white border border-blue-600/40 hover:border-blue-400 hover:bg-blue-700/45 transition-all backdrop-blur-sm">
                                    Already Registered?
                                </Link>
                            </>) : (
                                <Link href={route("dashboard")} className="group relative px-9 py-4 rounded-full text-base font-bold text-white overflow-hidden shadow-xl shadow-blue-900/50">
                                    <span className="absolute inset-0 transition-all duration-300" style={{ background: "linear-gradient(90deg,#1d4ed8,#2563eb)" }}/>
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg,#2563eb,#3b82f6)" }}/>
                                    <span className="relative flex items-center gap-2">
                                        Open Dashboard
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                                    </span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scroll caret */}
                <div className="relative z-10 pb-8 flex justify-center">
                    <div className="flex flex-col items-center gap-1.5" style={{ animation: "cpdo-bounce 2s ease-in-out infinite" }}>
                        <span className="text-blue-300/70 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
                        <svg className="w-4 h-4 text-blue-300/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                    </div>
                </div>
            </section>

            {/* ═══════════════════ SERVICES ════════════════════════════════ */}
            <section className="relative overflow-hidden py-28" style={{ background: "#0c2461" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%,rgba(59,130,246,.45),transparent)" }}/>
                <Grid/>
                <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
                    <Reveal className="text-center mb-20">
                        <span className="text-blue-400 text-[11px] font-black tracking-[0.3em] uppercase">Our Services</span>
                        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mt-3">
                            Land Use &amp; Zoning<br/>
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#93c5fd,#3b82f6)" }}>Certification Services</span>
                        </h2>
                        <p className="text-blue-100/80 mt-4 max-w-xl mx-auto text-base">Everything you need to comply with Ilagan City's land use regulations — digitally and efficiently.</p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((s, i) => (
                            <Reveal key={i} delay={i * 70}>
                                <div className="group relative p-7 rounded-2xl border border-blue-500/40 bg-blue-800/30 hover:bg-blue-700/35 hover:border-blue-500/50 transition-all duration-400 overflow-hidden cursor-default h-full">
                                    <div className="absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle,rgba(59,130,246,.15),transparent)", transform: "translate(30%,-30%)" }}/>
                                    <div className="w-14 h-14 rounded-xl border border-blue-500/50 bg-blue-700/55 flex items-center justify-center text-blue-300 group-hover:text-blue-200 group-hover:border-blue-500 transition-all duration-300 mb-5 relative">
                                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(59,130,246,.1)" }}/>
                                        {s.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">{s.title}</h3>
                                    <p className="text-blue-100/75 text-sm leading-relaxed">{s.desc}</p>
                                    <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(90deg,transparent,rgba(59,130,246,.4),transparent)" }}/>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════ CTA ═════════════════════════════════════ */}
            <section className="relative overflow-hidden py-28" style={{ background: "linear-gradient(180deg,#0c2461 0%,#1034a6 100%)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%,rgba(59,130,246,.45),transparent)" }}/>
                <Grid/>
                <div className="relative max-w-3xl mx-auto px-6 text-center">
                    <Reveal>
                        <span className="text-blue-400 text-[11px] font-black tracking-[0.3em] uppercase">Get Started</span>
                        <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight mt-3 mb-5">
                            Ready to Apply for Your<br/>
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#93c5fd,#3b82f6,#60a5fa)" }}>Land Use Certificate?</span>
                        </h2>
                        <p className="text-blue-100/80 text-lg mb-10 leading-relaxed">
                            Join Ilagan City's digital transformation. Submit your application online, track it in real time,
                            and receive your official certificate without leaving your home.
                        </p>
                        {!auth.user ? (
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href={route("register")} className="group relative px-10 py-4 rounded-full text-base font-bold text-white overflow-hidden shadow-2xl shadow-blue-900/60">
                                    <span className="absolute inset-0 transition-all duration-300" style={{ background: "linear-gradient(90deg,#1d4ed8,#2563eb)" }}/>
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg,#2563eb,#3b82f6)" }}/>
                                    <span className="relative flex items-center justify-center gap-2">
                                        Create Free Account
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                                    </span>
                                </Link>
                                <Link href={route("login")} className="px-10 py-4 rounded-full text-base font-bold text-blue-300 hover:text-white border border-blue-600/40 hover:border-blue-400 hover:bg-blue-700/45 transition-all">
                                    Sign In Instead
                                </Link>
                            </div>
                        ) : (
                            <Link href={route("dashboard")} className="group relative inline-flex px-10 py-4 rounded-full text-base font-bold text-white overflow-hidden shadow-2xl shadow-blue-900/60">
                                <span className="absolute inset-0 transition-all duration-300" style={{ background: "linear-gradient(90deg,#1d4ed8,#2563eb)" }}/>
                                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg,#2563eb,#3b82f6)" }}/>
                                <span className="relative flex items-center gap-2">
                                    Open Dashboard
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                                </span>
                            </Link>
                        )}
                    </Reveal>
                </div>
            </section>

            {/* ═══════════════════ FOOTER ══════════════════════════════════ */}
            <footer className="relative border-t border-blue-600/40 py-14" style={{ background: "#0c2461" }}>
                <Grid/>
                <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full border border-blue-500/50 bg-blue-900 flex items-center justify-center overflow-hidden">
                                    <img src="/images/Ilagan.png" alt="Logo" className="w-7 h-7 object-contain"/>
                                </div>
                                <div>
                                    <p className="text-white font-black text-sm tracking-widest">CPDO</p>
                                    <p className="text-blue-500 text-xs">City of Ilagan, Isabela</p>
                                </div>
                            </div>
                            <p className="text-blue-200/75 text-sm leading-relaxed max-w-xs">
                                Committed to responsible land use planning, sustainable development, and accessible government services for all residents of Ilagan City.
                            </p>
                        </div>
                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-bold mb-4 tracking-wide text-sm">Contact Us</h4>
                            <ul className="space-y-3 text-blue-400/65 text-sm">
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
                                    Ground Floor, City Hall Bldg,<br/>City of Ilagan, Isabela
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                                    624-0009
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
                                    cpdo@cityofilagan.gov.ph
                                </li>
                            </ul>
                        </div>
                        {/* Hours */}
                        <div>
                            <h4 className="text-white font-bold mb-4 tracking-wide text-sm">Office Hours</h4>
                            <ul className="space-y-2.5 text-blue-400/65 text-sm">
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>
                                    Monday – Friday: 8:00 AM – 5:00 PM
                                </li>
                                <li className="text-blue-700/60 pl-6 text-xs">Except public holidays</li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-900/60 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></svg>
                                    Saturday – Sunday: Closed
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-blue-900/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-blue-300/55 text-xs">&copy; {new Date().getFullYear()} City Planning and Development Office — Ilagan City. All rights reserved.</p>
                        <div className="flex items-center gap-2 text-blue-300/55 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-[pulse_2s_ease-in-out_infinite]"/>
                            System Online
                        </div>
                    </div>
                </div>
            </footer>

            {/* Keyframes */}
            <style>{`
                @keyframes cpdo-pt {
                    0%   { opacity:0; transform:translateY(0) scale(1); }
                    20%  { opacity:.45; }
                    80%  { opacity:.15; }
                    100% { opacity:0; transform:translateY(-70px) scale(.4); }
                }
                @keyframes cpdo-bounce {
                    0%,100% { transform:translateY(0); }
                    50%     { transform:translateY(7px); }
                }
                @keyframes cpdo-ring {
                    0%,100% { opacity:.4; transform:scale(1); }
                    50%     { opacity:.8; transform:scale(1.08); }
                }
            `}</style>
        </>
    );
}
