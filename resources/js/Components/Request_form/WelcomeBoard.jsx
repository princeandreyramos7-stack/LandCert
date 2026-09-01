import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { FileText, Clock, Shield, Building2, ListChecks, ArrowRight, Sparkles } from "lucide-react";

/**
 * Hierarchical requirements per category, matching the same content used in
 * MyApplicationsList.jsx / UploadRequirements.jsx (HLURB Annex B format) so
 * requirements read consistently everywhere in the app.
 */
const CATEGORIES = [
    {
        id: "Zoning",
        projectType: "CZC",
        title: "CZC (Certificate of Zoning Compliance)",
        description: "Certificate of Zoning Compliance for land use, construction, or business establishment projects.",
        icon: Building2,
        color: "blue",
        requirements: [
            "1. Accomplished and notarized APPLICATION FORM",
            "2. Right Over Land Documentation",
            "   Upload all three: Title, Tax Declaration, Tax Receipt",
            "   a. Photocopy of Certificate of Title registered in applicant's name & latest Tax Declaration",
            "   b. If title is NOT in applicant's name, submit:",
            "      - Certified true copy of latest Tax Declaration",
            "      - Pro forma affidavit stating:",
            "         • Applicant is the owner of the property",
            "         • Reason why property is not yet titled",
            "         • Property is within alienable and disposable land",
            "         • Property is free from liens and encumbrances",
            "         • Property is not tenanted (for rice/corn lands)",
            "   c. For unregistered properties, submit deed of sale, donation, lease, or authorization to use land plus owner's title or tax declaration and affidavit per item b",
            "3. VICINITY MAP",
            "   Showing existing land uses within prescribed radius:",
            "   a. Local significance projects: minimum 100 meters radius (may be drawn not to scale)",
            "   b. National significance projects: minimum 1 kilometer radius (must be drawn to scale)",
            "4. SITE DEVELOPMENT PLAN",
            "   Showing project site, lot area boundaries & dimension of proposed improvements",
            "   - For local significance projects: need not be drawn to scale",
            "5. ESTIMATED PROJECT COST / BILL OF MATERIALS",
            "Additional Requirements",
            "   1. For Tenanted Rice/Corn Lands:",
            "      - Endorsement/recommendation from Department of Agrarian Reform",
            "   2. For Manufacturing Projects - DESCRIPTION OF INDUSTRY:",
            "      2.1 Type and volume of raw materials used",
            "      2.2 Products manufactured or stored",
            "      2.3 Average daily output/capacity per day/week/month",
            "      2.4 Industrial waste & pollution control plans",
            "      2.5 Description of manufacturing processes",
            "   3. SWORN SPECIAL POWER OF ATTORNEY (if filed by authorized representative)",
            "   4. AFFIDAVIT OF NO OBJECTION",
            "   5. ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC) / CERTIFICATE OF NON-COVERAGE (CNC)",
            "   6. Certification of road right-of-way from DPWH (if project is within National Road)",
            "   7. Barangay Clearance",
        ],
    },
    {
        id: "TUP",
        projectType: "TUP",
        title: "TUP (Temporary Use Permit)",
        description: "Permit allowing temporary use of land, space, structure, stall, or area for a limited time only.",
        icon: Clock,
        color: "amber",
        requirements: [
            "1. Accomplished and notarized APPLICATION FORM",
            "2. Right Over Land Documentation",
            "   Upload all three: Title, Tax Declaration, Tax Receipt",
            "   a. Photocopy of Certificate of Title registered in applicant's name & latest Tax Declaration",
            "   b. If title is NOT in applicant's name, submit:",
            "      - Certified true copy of latest Tax Declaration",
            "      - Pro forma affidavit stating:",
            "         • Applicant is the owner of the property",
            "         • Reason why property is not yet titled",
            "         • Property is within alienable and disposable land",
            "         • Property is free from liens and encumbrances",
            "         • Property is not tenanted (for rice/corn lands)",
            "   c. For unregistered properties, submit deed of sale, donation, lease, or authorization to use land plus owner's title or tax declaration and affidavit per item b",
            "3. VICINITY MAP",
            "   Showing existing land uses within prescribed radius:",
            "   a. Local significance projects: minimum 100 meters radius (may be drawn not to scale)",
            "   b. National significance projects: minimum 1 kilometer radius (must be drawn to scale)",
            "4. SITE DEVELOPMENT PLAN",
            "   Showing project site, lot area boundaries & dimension of proposed improvements",
            "   - For local significance projects: need not be drawn to scale",
            "5. ESTIMATED PROJECT COST / BILL OF MATERIALS",
            "Additional Requirements",
            "   1. For Tenanted Rice/Corn Lands:",
            "      - Endorsement/recommendation from Department of Agrarian Reform",
            "   2. For Manufacturing Projects - DESCRIPTION OF INDUSTRY:",
            "      2.1 Type and volume of raw materials used",
            "      2.2 Products manufactured or stored",
            "      2.3 Average daily output/capacity per day/week/month",
            "      2.4 Industrial waste & pollution control plans",
            "      2.5 Description of manufacturing processes",
            "   3. SWORN SPECIAL POWER OF ATTORNEY (if filed by authorized representative)",
            "   4. AFFIDAVIT OF NO OBJECTION",
            "   5. ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC) / CERTIFICATE OF NON-COVERAGE (CNC)",
            "   6. Certification of road right-of-way from DPWH (if project is within National Road)",
            "   7. Barangay Clearance",
        ],
    },
    {
        id: "SUP",
        projectType: "SUP",
        title: "SUP (Special Use Permit)",
        description: "Permit required for specific land uses or businesses that need special approval because of their nature, impact, or location under zoning rules.",
        icon: Shield,
        color: "purple",
        requirements: [
            "1. Accomplished and notarized APPLICATION FORM",
            "2. Right Over Land Documentation",
            "   Upload all three: Title, Tax Declaration, Tax Receipt",
            "   a. Photocopy of Certificate of Title registered in applicant's name & latest Tax Declaration",
            "   b. If title is NOT in applicant's name, submit:",
            "      - Certified true copy of latest Tax Declaration",
            "      - Pro forma affidavit stating:",
            "         • Applicant is the owner of the property",
            "         • Reason why property is not yet titled",
            "         • Property is within alienable and disposable land",
            "         • Property is free from liens and encumbrances",
            "         • Property is not tenanted (for rice/corn lands)",
            "   c. For unregistered properties, submit deed of sale, donation, lease, or authorization to use land plus owner's title or tax declaration and affidavit per item b",
            "3. VICINITY MAP",
            "   Showing existing land uses within prescribed radius:",
            "   a. Local significance projects: minimum 100 meters radius (may be drawn not to scale)",
            "   b. National significance projects: minimum 1 kilometer radius (must be drawn to scale)",
            "4. SITE DEVELOPMENT PLAN",
            "   Showing project site, lot area boundaries & dimension of proposed improvements",
            "   - For local significance projects: need not be drawn to scale",
            "5. ESTIMATED PROJECT COST / BILL OF MATERIALS",
            "Additional Requirements",
            "   1. For Tenanted Rice/Corn Lands:",
            "      - Endorsement/recommendation from Department of Agrarian Reform",
            "   2. For Manufacturing Projects - DESCRIPTION OF INDUSTRY:",
            "      2.1 Type and volume of raw materials used",
            "      2.2 Products manufactured or stored",
            "      2.3 Average daily output/capacity per day/week/month",
            "      2.4 Industrial waste & pollution control plans",
            "      2.5 Description of manufacturing processes",
            "   3. SWORN SPECIAL POWER OF ATTORNEY (if filed by authorized representative)",
            "   4. AFFIDAVIT OF NO OBJECTION",
            "   5. ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC) / CERTIFICATE OF NON-COVERAGE (CNC)",
            "   6. Certification of road right-of-way from DPWH (if project is within National Road)",
            "   7. Barangay Clearance",
        ],
    },
    {
        id: "ZC",
        projectType: "ZC",
        title: "ZC (Zoning Certification)",
        description: "Certification of the zoning classification of a property, issued on the strength of its title and tax records.",
        icon: FileText,
        color: "emerald",
        requirements: [
            "1. Title",
            "2. Tax Declaration",
            "3. VICINITY MAP",
            "4. Latest Tax Receipt",
            "5. Sketch Plan with signature of Geodetic Engr.",
        ],
    },
];

const COLOR_STYLES = {
    blue: {
        bg: "bg-blue-50",
        border: "border-blue-200 hover:border-blue-400",
        icon: "bg-blue-100 text-blue-600",
        button: "text-blue-700 border-blue-300 hover:bg-blue-50",
        ring: "hover:shadow-blue-200/60",
    },
    amber: {
        bg: "bg-amber-50",
        border: "border-amber-200 hover:border-amber-400",
        icon: "bg-amber-100 text-amber-600",
        button: "text-amber-700 border-amber-300 hover:bg-amber-50",
        ring: "hover:shadow-amber-200/60",
    },
    purple: {
        bg: "bg-purple-50",
        border: "border-purple-200 hover:border-purple-400",
        icon: "bg-purple-100 text-purple-600",
        button: "text-purple-700 border-purple-300 hover:bg-purple-50",
        ring: "hover:shadow-purple-200/60",
    },
    emerald: {
        bg: "bg-emerald-50",
        border: "border-emerald-200 hover:border-emerald-400",
        icon: "bg-emerald-100 text-emerald-600",
        button: "text-emerald-700 border-emerald-300 hover:bg-emerald-50",
        ring: "hover:shadow-emerald-200/60",
    },
};

export function WelcomeBoard({ onContinue }) {
    const [activeCategory, setActiveCategory] = useState(null);
    const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);

    const handleViewRequirements = (category) => {
        setActiveCategory(category);
        setIsRequirementsOpen(true);
    };

    return (
        <div className="w-full animate-welcomeFadeIn">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10 px-3 sm:px-0">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-40 animate-pulse-slow" />
                        <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                    </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Welcome to CPDO Online Application
                </h1>
                <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
                    Before you begin, take a moment to review the requirements for each certificate type below.
                    You can view them anytime — your application category will be confirmed by our office during review.
                </p>
            </div>

            {/* Category Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-3 sm:px-0">
                {CATEGORIES.map((category, index) => {
                    const Icon = category.icon;
                    const colors = COLOR_STYLES[category.color];

                    return (
                        <div
                            key={category.id}
                            className="animate-cardFadeInUp"
                            style={{ animationDelay: `${index * 120}ms` }}
                        >
                            <Card
                                className={`${colors.bg} ${colors.border} border-2 transition-all duration-300 hover:shadow-xl ${colors.ring} hover:-translate-y-1.5 group flex flex-col h-full relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <CardHeader className="relative z-10 pb-3">
                                    <div className="flex justify-center mb-3">
                                        <div className={`relative p-3 sm:p-4 ${colors.icon} rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md`}>
                                            <Icon className="h-7 w-7 sm:h-8 sm:w-8" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-base sm:text-lg text-center leading-snug">
                                        {category.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col relative z-10 pt-0">
                                    <CardDescription className="text-gray-700 text-center flex-1 mb-4 text-xs sm:text-sm leading-relaxed">
                                        {category.description}
                                    </CardDescription>
                                    <div className="mt-auto space-y-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => handleViewRequirements(category)}
                                            className={`w-full h-10 ${colors.button} transform hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-xs sm:text-sm font-medium`}
                                        >
                                            <ListChecks className="h-4 w-4 mr-2" />
                                            View Requirements
                                        </Button>
                                        <Button
                                            onClick={() => onContinue(category.projectType)}
                                            className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold gap-1.5"
                                        >
                                            Apply for this
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* Continue to Application */}
            <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 animate-cardFadeInUp" style={{ animationDelay: "420ms" }}>
                <Button
                    variant="outline"
                    onClick={() => onContinue(null)}
                    className="h-12 px-8 transform hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 text-sm sm:text-base font-semibold gap-2"
                >
                    I'm not sure — continue anyway
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <p className="text-xs sm:text-sm text-gray-500 text-center max-w-md">
                    Not sure which certificate applies to your project? You can still proceed — CPDO staff will help
                    confirm the correct category once you submit your application.
                </p>
            </div>

            {/* Requirements Dialog */}
            <Dialog open={isRequirementsOpen} onOpenChange={setIsRequirementsOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-slate-50">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-2xl flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full shrink-0">
                                <ListChecks className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                            </div>
                            <span className="text-sm sm:text-xl">Requirements for {activeCategory?.title}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">
                            Please prepare the following documents. You'll upload softcopies after submitting your application.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-3 sm:mt-4 space-y-2">
                        {activeCategory?.requirements.map((requirement, index) => {
                            const leadingSpaces = requirement.match(/^ */)[0].length;
                            const indentLevel = Math.floor(leadingSpaces / 3);
                            const trimmed = requirement.trim();
                            const isHeader = /^Additional requirements/i.test(trimmed);

                            return (
                                <div
                                    key={index}
                                    className={`animate-reqFadeIn ${
                                        isHeader
                                            ? "text-xs sm:text-sm font-semibold text-gray-700 pt-2"
                                            : "bg-white p-2.5 sm:p-3 rounded-lg shadow-sm border border-gray-200 text-gray-800 text-xs sm:text-sm leading-relaxed"
                                    }`}
                                    style={{
                                        animationDelay: `${index * 40}ms`,
                                        marginLeft: isHeader ? 0 : `${indentLevel * 16}px`,
                                    }}
                                >
                                    {trimmed}
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter className="mt-4 sm:mt-6 flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsRequirementsOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                setIsRequirementsOpen(false);
                                onContinue();
                            }}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 transform hover:scale-[1.02] transition-all duration-300"
                        >
                            Continue to Application
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Animations */}
            <style>{`
                @keyframes welcomeFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes cardFadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes reqFadeIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.55; }
                }
                .animate-welcomeFadeIn {
                    animation: welcomeFadeIn 0.5s ease-out;
                }
                .animate-cardFadeInUp {
                    animation: cardFadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }
                .animate-reqFadeIn {
                    animation: reqFadeIn 0.35s ease-out forwards;
                    opacity: 0;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
