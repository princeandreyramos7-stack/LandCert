import { Head, Link } from "@inertiajs/react";
import PublicNavbar from "@/Components/PublicNavbar";
import PublicFooter from "@/Components/PublicFooter";
import {
    UserPlus,
    FileEdit,
    UploadCloud,
    ClipboardList,
    Banknote,
    Download,
    ShieldCheck,
    Smartphone,
    Bell,
    HelpCircle,
} from "lucide-react";

const STEPS = [
    {
        icon: UserPlus,
        title: "1. Create your account",
        body: "Register with your true name, a working email address and mobile number. A one-time code is sent to your mobile to verify it's really you before your account is activated.",
    },
    {
        icon: FileEdit,
        title: "2. Fill out your application",
        body: "Sign in and start a New Application. Choose the certificate you need — Zoning Compliance/Clearance, Special Use Permit, or another land use certification — then fill in your project, property and location details.",
    },
    {
        icon: UploadCloud,
        title: "3. Upload your requirements",
        body: "Upload clear photos or PDFs of the documents your application needs. The system checks each image on the spot and asks you to retake it if it's too blurry to read — better to catch that now than after review.",
    },
    {
        icon: ClipboardList,
        title: "4. Track your application",
        body: "Your dashboard shows exactly where your application stands — verification, officer review, administrator approval — and how long each step is taking, in line with the office's Citizen's Charter.",
    },
    {
        icon: Banknote,
        title: "5. Pay the assessed fee",
        body: "Once approved, you'll receive an Order of Payment. Pay the stated amount at the City Treasurer's Office, then upload a photo of your official receipt so the office can confirm it.",
    },
    {
        icon: Download,
        title: "6. Download your certificate",
        body: "Once payment is confirmed, your digitally signed certificate is ready to download from your dashboard — carrying a verification code and QR code, exactly like the paper original.",
    },
];

const EXTRAS = [
    {
        icon: ShieldCheck,
        title: "Verifying a document",
        body: (
            <>
                Anyone holding a printed certificate — a bank, another office, a
                buyer — can confirm it's genuine at the{" "}
                <Link href={route("verify.index")} className="font-semibold text-[#0d1f5c] hover:underline">
                    public verification page
                </Link>
                , either by scanning the QR code on the document or by typing in its
                verification code. No account is needed.
            </>
        ),
    },
    {
        icon: Smartphone,
        title: "Installing this system as an app",
        body: "Look for the “Install” button on the sign-in page or the top navigation bar. Installing puts CPDO LC on your home screen like a regular app, so you can open it in one tap without going through a browser.",
    },
    {
        icon: Bell,
        title: "Getting notified of updates",
        body: "From your Profile page, you can turn on push notifications to be alerted the moment your application moves to a new stage, instead of having to check the dashboard yourself.",
    },
    {
        icon: HelpCircle,
        title: "Still need help?",
        body: "Visit the City Planning and Development Office at the City Hall Building, or reach out through the contact details in the footer below — office staff can walk you through any step in person.",
    },
];

export default function HowToUse() {
    return (
        <>
            <Head title="How to Use the System — CPDO LC" />

            <PublicNavbar />

            {/* Hero */}
            <section className="relative overflow-hidden bg-[#0d1f5c] py-20 lg:py-28">
                <div
                    className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none opacity-30"
                    style={{ background: "radial-gradient(circle,#1d4ed8,transparent 70%)" }}
                />
                <div className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4a017]/50 bg-[#d4a017]/10 text-[#d4a017] text-[11px] font-bold tracking-widest uppercase mb-6">
                        Step-by-Step Guide
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                        How to Use the System
                    </h1>
                    <p className="mt-5 text-blue-100/85 text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
                        From creating an account to downloading your certificate —
                        here's exactly what to expect at every step.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="bg-white py-20">
                <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-6">
                    {STEPS.map((step, i) => (
                        <div
                            key={i}
                            className="flex gap-5 p-6 rounded-2xl border border-gray-100 bg-[#f7f9fd] hover:border-[#d4a017]/40 transition-colors"
                        >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d1f5c]">
                                <step.icon className="h-6 w-6 text-[#d4a017]" strokeWidth={1.75} />
                            </span>
                            <div>
                                <h3 className="text-[#0d1f5c] font-black text-base mb-1.5">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-gray-600">{step.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Extras */}
            <section className="py-20 bg-[#112068]">
                <div className="max-w-5xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-black text-white">
                            A few more <span className="text-[#d4a017]">things to know</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {EXTRAS.map((e, i) => (
                            <div
                                key={i}
                                className="flex gap-4 p-6 rounded-2xl bg-[#0d1f5c]/60 border border-[#1a3a8f]/60"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4a017]/15 border border-[#d4a017]/30">
                                    <e.icon className="h-5 w-5 text-[#d4a017]" strokeWidth={1.75} />
                                </span>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-1.5">{e.title}</h3>
                                    <p className="text-blue-200/70 text-xs leading-relaxed">{e.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-white text-center">
                <div className="max-w-2xl mx-auto px-6">
                    <h2 className="text-2xl font-black text-[#0d1f5c] mb-4">Ready to apply?</h2>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href={route("register")}
                            className="px-8 py-3 rounded-md bg-[#d4a017] hover:bg-[#b8880d] text-white font-bold text-sm shadow-lg transition-colors"
                        >
                            APPLY ONLINE NOW
                        </Link>
                        <Link
                            href={route("login")}
                            className="px-8 py-3 rounded-md border border-[#0d1f5c]/30 text-[#0d1f5c] hover:bg-[#0d1f5c]/5 font-bold text-sm transition-all"
                        >
                            Already Registered?
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </>
    );
}
