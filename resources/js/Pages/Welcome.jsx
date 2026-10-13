import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import PublicNavbar from "@/Components/PublicNavbar";
import PublicFooter from "@/Components/PublicFooter";
import HeroSlideshow from "@/Components/Welcome/HeroSlideshow";
import BentoSections from "@/Components/Welcome/BentoSections";

export default function Welcome() {
    // Back to top. Appears only once there is something to scroll back from,
    // so it never sits over the hero's calls to action.
    const [showTop, setShowTop] = useState(false);
    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            <Head title="CPDO LC - City of Ilagan" />

            <PublicNavbar />

            {/* Landmark slideshow behind the office's brand headline */}
            <HeroSlideshow />

            {/* Why use CPDO LC, How to apply, Mission & Vision */}
            <BentoSections />

            <PublicFooter />

            {/* Back to top */}
            <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#d4a017] text-white shadow-lg transition-all duration-300 hover:bg-[#b8880d] focus:outline-none focus:ring-2 focus:ring-[#d4a017]/60 focus:ring-offset-2 ${
                    showTop ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
                }`}
            >
                <ChevronUp className="h-6 w-6" strokeWidth={2.5} />
            </button>
        </>
    );
}
