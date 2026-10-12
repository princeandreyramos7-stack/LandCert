import { Fragment } from "react";
import { Link } from "@inertiajs/react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const QUICK_LINKS = [
    ["About Us", () => route("about")],
    ["How to Use", () => route("how-to-use")],
    ["Create Account", () => route("register")],
    ["Login", () => route("login")],
];

const CONTACT = [
    { icon: MapPin, lines: ["Ground Floor, City Hall Bldg,", "City of Ilagan, Isabela"] },
    { icon: Phone, lines: ["624-0009"] },
    { icon: Mail, lines: ["cpdo@cityofilagan.gov.ph"] },
    { icon: Clock, lines: ["Mon – Fri: 8:00 AM – 5:00 PM"] },
];

const POLICY_LINKS = [
    ["About Us", () => route("about")],
    ["How to Use", () => route("how-to-use")],
    ["Privacy Policy", () => "/legal/privacy"],
    ["Terms and Conditions", () => "/legal/terms"],
    ["Cookie Policy", () => "/legal/cookies"],
    ["Payment and Refund Policy", () => "/legal/refund"],
    ["Verify a Document", () => "/verify"],
    ["Contact Us", () => "/#contact"],
];

/**
 * The footer on every public (signed-out) page - see PublicNavbar for why
 * this is shared. A rounded navy card on the light page background, matching
 * the tiles of the landing page above it.
 */
export default function PublicFooter() {
    return (
        <footer id="contact" className="bg-[#f4f6fb] px-4 pb-4 pt-4 sm:px-6 sm:pt-6">
            <div className="mx-auto max-w-7xl rounded-3xl bg-[#0d1f5c] px-6 py-12 lg:px-12">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                    {/* Brand */}
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <span className="inline-block h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#d4a017]/60 bg-white">
                                <img src="/images/ilagan1.png" alt="City of Ilagan" className="h-full w-full object-cover" />
                            </span>
                            <div>
                                <p className="text-sm font-black uppercase tracking-widest text-white">CPDO LC</p>
                                <p className="text-xs font-semibold text-[#d4a017]">City of Ilagan, Isabela</p>
                            </div>
                        </div>
                        <p className="max-w-xs text-sm leading-relaxed text-blue-100/70">
                            Committed to responsible land use planning, sustainable development, and accessible
                            government services for all City of Ilagan residents.
                        </p>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold tracking-wide text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-blue-100/70">
                            {QUICK_LINKS.map(([label, href]) => (
                                <li key={label}>
                                    <Link href={href()} className="transition-colors hover:text-[#d4a017]">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold tracking-wide text-white">Contact Us</h4>
                        <ul className="space-y-3 text-sm text-blue-100/70">
                            {CONTACT.map(({ icon: Icon, lines }) => (
                                <li key={lines[0]} className="flex items-start gap-2">
                                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#d4a017]" />
                                    <span>
                                        {lines.map((line, i) => (
                                            <Fragment key={line}>
                                                {i > 0 && <br />}
                                                {line}
                                            </Fragment>
                                        ))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-blue-200/60 lg:flex-row">
                    <p className="text-xs">
                        &copy; {new Date().getFullYear()} City Planning and Development Office — City of Ilagan, Isabela. All
                        rights reserved.
                    </p>
                    <nav aria-label="Policies" className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs">
                        {POLICY_LINKS.map(([label, href], i) => (
                            <Fragment key={label}>
                                {i > 0 && (
                                    <span aria-hidden="true" className="opacity-50">
                                        |
                                    </span>
                                )}
                                <a href={href()} className="transition-colors hover:text-[#f5c842]">
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
