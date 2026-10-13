import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { HeroCrest } from "./HeroBrands";

/*
 * The landing page hero: photographs of City of Ilagan landmarks
 * (public/images/hero) crossfading behind the office's brand headline -
 * its logo, the city seal and the Ilagan 2030 mark (HeroBrands' Crest), with
 * the three actions under it.
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

            <HeroCrest />

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
