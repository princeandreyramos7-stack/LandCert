import { Link } from '@inertiajs/react';
import { Toaster } from '@/Components/ui/toaster';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen" style={{ background: "#f0f4ff" }}>

            {/* ── Left panel (desktop only) ─────────────────────────── */}
            <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative overflow-hidden flex-col"
                style={{ background: "linear-gradient(160deg,#0a1848 0%,#0d1f5c 45%,#112068 100%)" }}>

                {/* Grid overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="lg" width="52" height="52" patternUnits="userSpaceOnUse">
                        <path d="M 52 0 L 0 0 0 52" fill="none" stroke="#93c5fd" strokeWidth="0.7"/>
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#lg)"/>
                </svg>

                {/* Glow orbs */}
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
                    style={{ background: "radial-gradient(circle,#1d4ed8,transparent 70%)" }}/>
                <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30"
                    style={{ background: "radial-gradient(circle,#d4a017,transparent 70%)" }}/>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between h-full p-12 text-white">

                    {/* Logo */}
                    <Link href="/" className="inline-flex items-center gap-4 group">
                        <div className="w-14 h-14 rounded-full border-2 border-[#d4a017]/40 bg-[#d4a017]/10 flex items-center justify-center shrink-0">
                            <img src="/images/Ilagan.png" alt="CPDO Logo" className="w-9 h-9 object-contain"/>
                        </div>
                        <div>
                            <p className="text-white font-black text-sm tracking-[0.15em] uppercase leading-tight">
                                Republic of the Philippines
                            </p>
                            <p className="text-[#d4a017] font-black text-base tracking-wide leading-tight">
                                CPDO LandCert
                            </p>
                            <p className="text-blue-300 text-[11px] tracking-widest">Ilagan City, Isabela</p>
                        </div>
                    </Link>

                    {/* Main pitch */}
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d4a017]/40 bg-[#d4a017]/10 text-[#d4a017] text-[11px] font-bold tracking-widest uppercase mb-5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] animate-pulse"/>
                                Official Digital Platform
                            </div>
                            <h2 className="text-4xl font-black leading-tight mb-4">
                                Your Land Use<br/>
                                <span className="text-transparent bg-clip-text"
                                    style={{ backgroundImage: "linear-gradient(90deg,#d4a017,#f5c842)" }}>
                                    Permits &amp; Clearances
                                </span><br/>
                                Made Simple
                            </h2>
                            <p className="text-blue-200/80 text-base leading-relaxed">
                                Apply for Locational Clearances, Special Use Permits, and more — entirely online.
                                Track your application status in real time.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div className="space-y-4">
                            {[
                                { icon: "🖥️", title: "Apply Online, Anytime", desc: "Submit applications 24/7 from anywhere" },
                                { icon: "📋", title: "Real-time Tracking", desc: "Monitor your application at every stage" },
                                { icon: "🏛️", title: "Official Certificates", desc: "Receive government-issued digital documents" },
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-2xl">{f.icon}</span>
                                    <div>
                                        <p className="font-bold text-white text-sm">{f.title}</p>
                                        <p className="text-blue-200/70 text-xs">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-blue-400/50 text-xs">
                        &copy; {new Date().getFullYear()} City Planning and Development Office — Ilagan City, Isabela
                    </p>
                </div>
            </div>

            {/* ── Right panel (form area) ───────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-y-auto">

                {/* Mobile logo */}
                <div className="lg:hidden w-full max-w-md mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/images/Ilagan.png" alt="CPDO" className="w-10 h-10 object-contain"/>
                        <div>
                            <p className="text-[#0d1f5c] font-black text-sm tracking-wide">CPDO LandCert</p>
                            <p className="text-[#d4a017] text-xs font-semibold">Ilagan City, Isabela</p>
                        </div>
                    </Link>
                </div>

                {/* Form card */}
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
                        {children}
                    </div>

                    {/* Mobile footer */}
                    <div className="lg:hidden mt-6 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} CPDO Ilagan City. All rights reserved.
                    </div>
                </div>
            </div>

            <Toaster />
        </div>
    );
}
