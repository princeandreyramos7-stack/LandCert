import { Link } from "@inertiajs/react";
import { Activity, Award, Globe } from "lucide-react";
import { Toaster } from "@/Components/ui/toaster";

/*
 * The frame around every signed-out form - sign in, sign up, the sign-up
 * code, password reset, email verification. A formal left panel (City Hall
 * and the Capital Arena tinted blue, the seal between gold rules) beside the
 * form; on phones the panel gives way to a small brand header.
 */

const POLICIES = [
    ["Privacy", "/legal/privacy"],
    ["Terms", "/legal/terms"],
    ["Cookies", "/legal/cookies"],
    ["Payments & Refunds", "/legal/refund"],
    ["Verify a document", "/verify"],
];

const BENEFITS = [
    [Globe, "Apply online, any time of day"],
    [Activity, "Follow your application at every step"],
    [Award, "Receive official, QR-verifiable certificates"],
];

function Seal({ size }) {
    return (
        <span className={`inline-block shrink-0 overflow-hidden rounded-full border-2 border-[#d4a017]/60 bg-white ${size}`}>
            <img src="/images/ilagan1-192.png" alt="City of Ilagan" className="h-full w-full object-cover" />
        </span>
    );
}

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-[#0a1748]">
            {/* ── Left panel (desktop only) ─────────────────────────── */}
            <aside className="relative isolate hidden overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[44%] lg:self-start">
                <div className="absolute inset-0 -z-20 grid grid-rows-2">
                    <img src="/images/hero/ilagan-city-hall.jpg" alt="" className="h-full w-full object-cover grayscale" />
                    <img src="/images/hero/ilagan-capital-arena.jpg" alt="" className="h-full w-full object-cover grayscale" />
                </div>
                <div className="absolute inset-0 -z-10 bg-[#1a3a8f] mix-blend-multiply" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0a1748]/40 via-[#0a1748]/70 to-[#0a1748]" />

                <div className="flex w-full flex-col items-center justify-center p-12 text-center text-white">
                    <Link href="/" className="flex items-center gap-4" aria-label="CPDO LC home">
                        <span className="h-px w-16 bg-[#d4a017]" />
                        <Seal size="h-20 w-20" />
                        <span className="h-px w-16 bg-[#d4a017]" />
                    </Link>
                    <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.35em] text-blue-200">Republic of the Philippines</p>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#f5c842]">City of Ilagan, Isabela</p>
                    <h2 className="mt-6 font-serif text-4xl font-bold leading-tight">City Planning and Development Office</h2>
                    <div className="mx-auto my-6 h-px w-20 bg-[#d4a017]" />
                    <ul className="space-y-3 text-left text-sm text-blue-50/90">
                        {BENEFITS.map(([Icon, text]) => (
                            <li key={text} className="flex items-center gap-3">
                                <Icon className="h-4 w-4 shrink-0 text-[#f5c842]" /> {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* ── Right panel (form area) ───────────────────────────── */}
            <main className="flex flex-1 flex-col items-center justify-center bg-[#fbfaf6] p-6 sm:p-10">
                {/* Mobile brand */}
                <div className="mb-8 w-full max-w-md lg:hidden">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <img src="/images/CPDO_LOGO.jpg" alt="City Planning and Development Office" className="h-11 w-auto shrink-0 rounded border border-[#d4a017]/40 object-contain" />
                        <span className="leading-tight">
                            <span className="block text-[11px] font-black uppercase tracking-[0.15em] text-[#0d1f5c]">Republic of the Philippines</span>
                            <span className="block text-base font-black tracking-wide text-[#d4a017]">CPDO LC</span>
                            <span className="block text-[11px] tracking-widest text-gray-500">City of Ilagan, Isabela</span>
                        </span>
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    {/* Form card */}
                    <div className="w-full border-t-4 border-t-[#d4a017] bg-white p-7 shadow-lg sm:p-10">{children}</div>

                    {/* The published notices, on every guest screen */}
                    <nav aria-label="Policies" className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs">
                        {POLICIES.map(([label, href], i) => (
                            <span key={href} className="flex items-center gap-3">
                                {i > 0 && (
                                    <span aria-hidden="true" className="text-gray-300">
                                        ·
                                    </span>
                                )}
                                <a href={href} className="text-gray-400 underline-offset-2 hover:text-[#0d1f5c] hover:underline">
                                    {label}
                                </a>
                            </span>
                        ))}
                    </nav>
                    <p className="mt-3 text-center text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} CPDO City of Ilagan. All rights reserved.
                    </p>
                </div>
            </main>

            <Toaster />
        </div>
    );
}
