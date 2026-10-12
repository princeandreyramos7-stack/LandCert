import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Eye, MapPin } from "lucide-react";

/*
 * The landing page hero: photographs of City of Ilagan landmarks
 * (public/images/hero) crossfading behind the call to apply online.
 */

const SLIDES = [
    { src: "/images/hero/ilagan-butaka.jpg", place: "World's Largest Butaka" },
    {
        src: "/images/hero/ilagan-capital-arena.jpg",
        place: "The Capital Arena",
    },
    {
        src: "/images/hero/ilagan-city-hall.jpg",
        place: "City of Ilagan City Hall",
    },
    {
        src: "/images/hero/ilagan-city-arch.jpg",
        place: "City of Ilagan Welcome Arch",
    },
];
const SLIDE_MS = 6000;

const fadeUp = (ms) => ({ animation: `hero-fade-up .8s ease ${ms}ms both` });

export default function HeroSlideshow() {
    const [active, setActive] = useState(0);
    useEffect(() => {
        const t = setInterval(
            () => setActive((i) => (i + 1) % SLIDES.length),
            SLIDE_MS,
        );
        return () => clearInterval(t);
    }, []);

    return (
        <section
            className="relative isolate flex items-center overflow-hidden bg-[#0d1f5c]"
            style={{ minHeight: "88vh" }}
        >
            {SLIDES.map((s, i) => (
                <img
                    key={s.src}
                    src={s.src}
                    alt=""
                    className="hero-kenburns absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-[1500ms]"
                    style={{ opacity: i === active ? 1 : 0 }}
                />
            ))}
            <div className="absolute inset-0 -z-10 bg-[#0d1f5c]/75" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(13,31,92,.7)_75%)]" />

            <div className="mx-auto w-full max-w-4xl px-6 py-20 text-center">
                <div style={fadeUp(100)} className="mb-6 flex justify-center">
                    <span className="inline-block h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-[#d4a017]/60 bg-white">
                        <img
                            src="/images/ilagan1.png"
                            alt="City of Ilagan seal"
                            className="h-full w-full object-cover"
                        />
                    </span>
                </div>
                <p
                    style={fadeUp(200)}
                    className="text-xs font-bold uppercase tracking-[0.3em] text-[#f5c842]"
                >
                    CPDO · City of Ilagan, Isabela
                </p>
                <h1
                    style={fadeUp(300)}
                    className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
                >
                    Apply for Your Locational Clearance Online
                </h1>
                <p
                    style={fadeUp(450)}
                    className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-blue-50/90 lg:text-lg"
                >
                    Zoning Certification, Zoning Compliance, Temporary and
                    Special Use Permits - filed, tracked and released without
                    the trip to City Hall.
                </p>
                <div
                    style={fadeUp(600)}
                    className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
                >
                    <Link
                        href={route("register")}
                        className="rounded-md bg-[#d4a017] px-6 py-3 text-center text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#b8880d]"
                    >
                        APPLY ONLINE NOW
                    </Link>
                    <Link
                        href={route("login")}
                        className="rounded-md border border-white/40 px-6 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-white/10"
                    >
                        Already Registered?
                    </Link>
                    <Link
                        href={route("verify.index")}
                        className="flex items-center justify-center gap-1.5 rounded-md border border-white/40 px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-white/10"
                    >
                        <Eye className="h-4 w-4" /> Verify Document
                    </Link>
                </div>
            </div>

            <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2">
                <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-white/80">
                    <MapPin className="h-3 w-3" /> {SLIDES[active].place}
                </p>
                <div className="flex gap-2">
                    {SLIDES.map((s, i) => (
                        <button
                            key={s.src}
                            type="button"
                            aria-label={`Show ${s.place}`}
                            onClick={() => setActive(i)}
                            className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-[#f5c842]" : "w-3 bg-white/50 hover:bg-white/80"}`}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes hero-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
                @keyframes hero-kenburns { from { transform: scale(1); } to { transform: scale(1.08); } }
                .hero-kenburns { animation: hero-kenburns 12s ease-out infinite alternate; }
                @media (prefers-reduced-motion: reduce) {
                    .hero-kenburns { animation: none; }
                    [style*="hero-fade-up"] { animation: none !important; }
                }
            `}</style>
        </section>
    );
}
