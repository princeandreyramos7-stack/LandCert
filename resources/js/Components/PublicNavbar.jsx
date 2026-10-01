import { Link } from "@inertiajs/react";
import InstallAppButton from "@/Components/InstallAppButton";
import { useState, useEffect } from "react";

/**
 * The sticky top bar on every public (signed-out) page - the landing page,
 * About Us, How to Use. Kept as one component so a nav change (a new link, a
 * relabel, today's "LC" tweak) happens once instead of drifting across pages.
 *
 * Mission & Vision and Contact stay as sections on the landing page itself,
 * so their links are a real "/#anchor" href - a plain browser navigation
 * that lands on "/" and then jumps to the section - rather than something
 * only the landing page's own in-page scroll code understands.
 */
export default function PublicNavbar() {
    const [in_, setIn] = useState(false);
    useEffect(() => {
        setIn(true);
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-[#0d1f5c] border-b border-[#1a3a8f]/60 shadow-md">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-3"
                    style={{
                        opacity: in_ ? 1 : 0,
                        transform: in_ ? "none" : "translateX(-14px)",
                        transition: "all .7s ease",
                    }}
                >
                    <div className="w-10 h-10 rounded-full border-2 border-[#d4a017]/40 overflow-hidden shrink-0">
                        <img
                            src="/images/ilagan1.png"
                            alt="City of Ilagan"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="leading-tight">
                        <p className="text-white font-black text-xs tracking-[0.15em] uppercase">
                            Republic of the Philippines
                        </p>
                        <p className="text-[#d4a017] font-black text-sm tracking-wide uppercase">
                            CPDO LC
                        </p>
                        <p className="text-blue-300 text-[10px] tracking-widest">
                            City of Ilagan, Isabela
                        </p>
                    </div>
                </Link>

                {/* Nav links */}
                <div
                    className="hidden md:flex items-center gap-7 text-sm font-semibold"
                    style={{
                        opacity: in_ ? 1 : 0,
                        transition: "opacity .7s ease .2s",
                    }}
                >
                    <Link
                        href={route("about")}
                        className="text-blue-200 hover:text-white transition-colors"
                    >
                        About Us
                    </Link>
                    <Link
                        href={route("how-to-use")}
                        className="text-blue-200 hover:text-white transition-colors"
                    >
                        How to Use
                    </Link>
                    <a
                        href="/#mission"
                        className="text-blue-200 hover:text-white transition-colors"
                    >
                        Mission & Vision
                    </a>
                    <a
                        href="/#contact"
                        className="text-blue-200 hover:text-white transition-colors"
                    >
                        Contact
                    </a>
                    <InstallAppButton
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#d4a017]/50 px-4 py-2 text-sm font-bold text-[#d4a017] transition-colors hover:bg-[#d4a017]/10"
                    />
                    {/* Login only - registration is disabled for public access */}
                    <Link
                        href={route("login")}
                        className="rounded-md bg-[#d4a017] px-5 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-[#b8880d]"
                    >
                        Login
                    </Link>
                </div>

                {/* Mobile */}
                <div className="flex items-center gap-2 md:hidden">
                    <InstallAppButton
                        className="inline-flex items-center gap-1 rounded-md border border-[#d4a017]/50 px-2.5 py-2 text-xs font-bold text-[#d4a017]"
                        label="Install"
                    />
                    <Link
                        href={route("login")}
                        className="rounded-md bg-[#d4a017] px-3 py-2 text-sm font-bold text-white"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </nav>
    );
}
