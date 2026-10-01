import { Fragment } from "react";
import { Link } from "@inertiajs/react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

/** The footer on every public (signed-out) page - see PublicNavbar for why this is shared. */
export default function PublicFooter() {
    return (
        <footer
            id="contact"
            className="bg-[#0d1f5c] border-t border-[#1a3a8f]/60"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden shrink-0">
                                <img
                                    src="/images/ilagan1.png"
                                    alt="City of Ilagan"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm tracking-widest uppercase">
                                    CPDO LC
                                </p>
                                <p className="text-[#d4a017] text-xs font-semibold">
                                    City of Ilagan, Isabela
                                </p>
                            </div>
                        </div>
                        <p className="text-blue-300/70 text-sm leading-relaxed max-w-xs">
                            Committed to responsible land use planning,
                            sustainable development, and accessible
                            government services for all City of Ilagan
                            residents.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm tracking-wide">
                            Quick Links
                        </h4>
                        <ul className="space-y-2 text-blue-300/70 text-sm">
                            <li>
                                <Link
                                    href={route("about")}
                                    className="hover:text-[#d4a017] transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("how-to-use")}
                                    className="hover:text-[#d4a017] transition-colors"
                                >
                                    How to Use
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("register")}
                                    className="hover:text-[#d4a017] transition-colors"
                                >
                                    Create Account
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={route("login")}
                                    className="hover:text-[#d4a017] transition-colors"
                                >
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-4 text-sm tracking-wide">
                            Contact Us
                        </h4>
                        <ul className="space-y-3 text-blue-300/70 text-sm">
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5 text-[#d4a017] shrink-0" />
                                Ground Floor, City Hall Bldg,
                                <br />
                                City of Ilagan, Isabela
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#d4a017] shrink-0" />
                                624-0009
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#d4a017] shrink-0" />
                                cpdo@cityofilagan.gov.ph
                            </li>
                            <li className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#d4a017] shrink-0" />
                                Mon – Fri: 8:00 AM – 5:00 PM
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-[#1a3a8f]/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-blue-400/50 text-xs">
                        &copy; {new Date().getFullYear()} City Planning and
                        Development Office — City of Ilagan, Isabela. All
                        rights reserved.
                    </p>
                    <nav
                        aria-label="Policies"
                        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-blue-400/60 text-xs"
                    >
                        {[
                            ["About Us", route("about")],
                            ["How to Use", route("how-to-use")],
                            ["Privacy Policy", "/legal/privacy"],
                            ["Terms and Conditions", "/legal/terms"],
                            ["Cookie Policy", "/legal/cookies"],
                            ["Refund Policy", "/legal/refund"],
                            ["Verify a Document", "/verify"],
                            ["Contact Us", "/#contact"],
                        ].map(([label, href], i) => (
                            <Fragment key={href}>
                                {i > 0 && <span aria-hidden="true">|</span>}
                                <a
                                    href={href}
                                    className="hover:text-[#d4a017] transition-colors"
                                >
                                    {label}
                                </a>
                            </Fragment>
                        ))}
                    </nav>
                </div>
            </div>
        </footer>
    );
}
