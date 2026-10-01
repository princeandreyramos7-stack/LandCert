import { Head, Link } from "@inertiajs/react";
import PublicNavbar from "@/Components/PublicNavbar";
import PublicFooter from "@/Components/PublicFooter";
import { MISSION, VISION } from "@/lib/officeInfo";
import {
    Landmark,
    Eye,
    FileCheck2,
    ShieldCheck,
    Building2,
    ScrollText,
    Home,
} from "lucide-react";

const SERVICES = [
    {
        icon: FileCheck2,
        title: "Zoning Compliance / Clearance",
        desc: "Confirms that a proposed project agrees with the City's zoning ordinance and approved land use plan before it proceeds.",
    },
    {
        icon: Building2,
        title: "Special Use Permit",
        desc: "For a use of land that is not outright allowed in its zone but may be permitted under specific conditions the office sets.",
    },
    {
        icon: ScrollText,
        title: "Temporary Use Permit",
        desc: "For a short-term or provisional use of a property while it awaits, or does not require, a permanent zoning classification.",
    },
    {
        icon: ShieldCheck,
        title: "Other Land Use Certifications",
        desc: "Additional certifications the office issues in the course of administering zoning and land use within the City of Ilagan.",
    },
];

export default function AboutUs() {
    return (
        <>
            <Head title="About Us — CPDO LC, City of Ilagan" />

            <PublicNavbar />

            {/* Hero */}
            <section className="relative overflow-hidden bg-[#0d1f5c] py-20 lg:py-28">
                <div
                    className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none opacity-30"
                    style={{ background: "radial-gradient(circle,#d4a017,transparent 70%)" }}
                />
                <div className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/50 bg-[#d4a017]/10 text-[#d4a017] text-[11px] font-bold tracking-widest uppercase mb-6">
                        <Landmark className="h-3.5 w-3.5" />
                        About This Office & System
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                        About Us
                    </h1>
                    <p className="mt-5 text-blue-100/85 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
                        CPDO LC is the official online land certification system of the
                        City Planning and Development Office (CPDO), City of Ilagan,
                        Isabela — built so residents and businesses can apply for,
                        track and receive zoning and land use documents without
                        repeated trips to City Hall.
                    </p>
                </div>
            </section>

            {/* What the office does */}
            <section className="bg-white py-20">
                <div className="max-w-5xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                    <div className="lg:col-span-2">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8eef8] mb-4">
                            <Home className="h-6 w-6 text-[#0d1f5c]" />
                        </span>
                        <h2 className="text-2xl font-black text-[#0d1f5c]">
                            The City Planning and Development Office
                        </h2>
                    </div>
                    <div className="lg:col-span-3 space-y-4 text-sm leading-relaxed text-gray-600">
                        <p>
                            The CPDO is the office of the City Government of Ilagan
                            mandated to administer zoning and land use regulation
                            within the city — reviewing where and how land may be
                            developed against the City's zoning ordinance and
                            approved comprehensive land use plan, and issuing the
                            certificates and permits that record its decisions.
                        </p>
                        <p>
                            This system is the office's official digital channel for
                            that work, built in line with Republic Act No. 11032 (the
                            Ease of Doing Business and Efficient Government Service
                            Delivery Act of 2018). Every certificate it issues carries
                            a verification code and QR code that any holder — a bank,
                            another office, a buyer — can check on the{" "}
                            <Link href={route("verify.index")} className="font-semibold text-[#0d1f5c] hover:underline">
                                public verification page
                            </Link>{" "}
                            without needing an account.
                        </p>
                        <p>
                            The system does not decide on your behalf — every
                            certificate, clearance or denial remains the act of the
                            responsible Zoning Officer or the Zoning Administrator.
                            What it removes is the friction: the trips to the office
                            just to file a form, to ask for a status update, or to
                            collect a document once it is ready.
                        </p>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-20 bg-[#112068]">
                <div className="max-w-6xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-black text-white">
                            What we <span className="text-[#d4a017]">handle</span>
                        </h2>
                        <p className="text-blue-200/70 mt-3 text-sm max-w-xl mx-auto">
                            The certifications you can currently apply for through
                            this system.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {SERVICES.map((s, i) => (
                            <div
                                key={i}
                                className="flex gap-4 p-6 rounded-2xl bg-[#0d1f5c]/60 border border-[#1a3a8f]/60"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4a017]/15 border border-[#d4a017]/30">
                                    <s.icon className="h-5 w-5 text-[#d4a017]" strokeWidth={1.75} />
                                </span>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-1.5">{s.title}</h3>
                                    <p className="text-blue-200/70 text-xs leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="bg-white py-20">
                <div className="mx-auto max-w-6xl px-6 lg:px-12">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-black text-[#0d1f5c]">Mission &amp; Vision</h2>
                        <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-[#d4a017]">
                            City Planning and Development Office
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex h-full flex-col gap-4 rounded-2xl border-t-4 border-[#0d1f5c] bg-[#e8eef8] p-8">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d1f5c]">
                                    <Landmark className="h-5 w-5 text-white" />
                                </span>
                                <h3 className="text-xl font-black tracking-wide text-[#0d1f5c]">Mission</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-[#1a3a8f]">{MISSION}</p>
                        </div>
                        <div className="flex h-full flex-col gap-4 rounded-2xl border-t-4 border-[#d4a017] bg-[#e8eef8] p-8">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4a017]">
                                    <Eye className="h-5 w-5 text-white" />
                                </span>
                                <h3 className="text-xl font-black tracking-wide text-[#0d1f5c]">Vision</h3>
                            </div>
                            <p className="text-sm font-medium italic leading-relaxed text-[#1a3a8f]">&ldquo;{VISION}&rdquo;</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-[#0d1f5c] text-center">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-2xl font-black text-white mb-4">Ready to get started?</h2>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={route("register")}
                            className="px-8 py-3 rounded-md bg-[#d4a017] hover:bg-[#b8880d] text-white font-bold text-sm shadow-lg transition-colors"
                        >
                            APPLY ONLINE NOW
                        </Link>
                        <Link
                            href={route("how-to-use")}
                            className="px-8 py-3 rounded-md border border-blue-400/40 text-blue-200 hover:text-white hover:border-blue-300 hover:bg-white/5 font-bold text-sm transition-all"
                        >
                            See How to Use the System
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </>
    );
}
