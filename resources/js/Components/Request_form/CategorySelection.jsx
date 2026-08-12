import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { FileText, Clock, Shield, CheckCircle, ListChecks } from "lucide-react";

export function CategorySelection({ onSelectCategory }) {
    const [selectedRequirements, setSelectedRequirements] = useState(null);
    const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);

    const categories = [
        {
            id: "TUP",
            title: "TUP (Temporary Use Permit)",
            description: "Permit allowing temporary use of land, space, structure, stall, or area for a limited time only.",
            icon: Clock,
            color: "blue",
            requirements: [
                "Accomplished application form",
                "Letter request stating temporary use/purpose",
                "Valid ID of applicant",
                "Proof of ownership / authorization from owner",
                "Sketch plan / vicinity map",
                "Barangay clearance",
                "Business permit (if commercial activity)",
                "Photos of site/location (if required)",
                "Payment of processing fees"
            ]
        },
        {
            id: "Zoning Clearance",
            title: "Zoning Clearance",
            description: "Certificate stating that the property's intended use follows the city zoning ordinance and land-use classification.",
            icon: CheckCircle,
            color: "green",
            requirements: [
                "Duly accomplished and notarized APPLICATION FORM",
                "Any of the following requirements relative to RIGHT OVER LAND:",
                "  • Photocopy of the Cert. of Title in case registered in the name of the applicant & latest Tax declaration",
                "  • In the absence of any existing certification of title, submit (1) certified true copy of the latest tax declaration and (2) pro forma affidavit",
                "VICINITY MAP showing the existing land uses within the prescribed radius from the lot boundary of the project site",
                "SITE DEVELOPMENT PLAN showing the project site, lot area boundaries & dimension of proposed improvement",
                "ESTIMATED PROJECT COST / BILL OF MATERIALS",
                "Barangay clearance",
                "For projects in Tenanted Rice and/or Corn lands: Endorsement/recommendation from the Department of Agrarian Reform",
                "For manufacturing projects: DESCRIPTION OF INDUSTRY",
                "AFFIDAVIT OF NO OBJECTION",
                "ENVIRONMENTAL COMPLIANCE CERTIFICATE (ECC)/CERTIFICATE OF NON-COVERAGE(CNC)",
                "Certification of road right-of-way from DPWH (if the project is located within the National Road)"
            ]
        },
        {
            id: "SUP",
            title: "SUP (Special Use Permit)",
            description: "Permit required for specific land uses or businesses that need special approval because of their nature, impact, or location under zoning rules.",
            icon: Shield,
            color: "purple",
            requirements: [
                "Accomplished application form",
                "Letter request describing proposed special use",
                "Valid ID of applicant",
                "Land title / tax declaration / lease contract",
                "Site development plan / lot plan",
                "Zoning clearance or locational clearance request",
                "Barangay clearance / endorsement",
                "Environmental or safety clearances (if needed)",
                "Business documents (if company/applicant is business)",
                "Payment of fees"
            ]
        },
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: {
                bg: "bg-blue-50",
                border: "border-blue-200 hover:border-blue-400",
                icon: "bg-blue-100 text-blue-600",
                button: "bg-blue-600 hover:bg-blue-700",
            },
            green: {
                bg: "bg-green-50",
                border: "border-green-200 hover:border-green-400",
                icon: "bg-green-100 text-green-600",
                button: "bg-green-600 hover:bg-green-700",
            },
            purple: {
                bg: "bg-purple-50",
                border: "border-purple-200 hover:border-purple-400",
                icon: "bg-purple-100 text-purple-600",
                button: "bg-purple-600 hover:bg-purple-700",
            },
        };
        return colors[color];
    };

    const handleViewRequirements = (category) => {
        setSelectedRequirements(category);
        setIsRequirementsOpen(true);
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                        <FileText className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Select Application Category
                </h1>
                <p className="text-gray-600 text-lg">
                    Choose the type of permit or clearance you want to apply for
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {categories.map((category, index) => {
                    const Icon = category.icon;
                    const colors = getColorClasses(category.color);

                    return (
                        <div
                            key={category.id}
                            className="animate-fadeInUp"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <Card
                                className={`${colors.bg} ${colors.border} border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group flex flex-col h-full relative overflow-hidden`}
                            >
                                {/* Decorative gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                {/* Top corner accent */}
                                <div className={`absolute top-0 right-0 w-20 h-20 ${colors.icon} opacity-10 rounded-bl-full transform translate-x-8 -translate-y-8`} />
                                
                                <CardHeader className="relative z-10">
                                    <div className="flex justify-center mb-4">
                                        <div className={`relative p-4 ${colors.icon} rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                                            <Icon className="h-10 w-10" />
                                            {/* Animated ring around icon */}
                                            <div className={`absolute inset-0 ${colors.icon} rounded-2xl opacity-0 group-hover:opacity-30 group-hover:scale-125 transition-all duration-500`} />
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-center mb-2 group-hover:text-gray-900 transition-colors">
                                        {category.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col relative z-10">
                                    <CardDescription className="text-gray-700 text-center flex-1 flex items-center justify-center mb-4 text-sm leading-relaxed">
                                        {category.description}
                                    </CardDescription>
                                    <div className="flex gap-2 mt-auto">
                                        <Button
                                            onClick={() => onSelectCategory(category.id)}
                                            className={`flex-1 ${colors.button} text-white shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                            Select 
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleViewRequirements(category)}
                                            className="flex-1 hover:bg-gray-50 hover:border-gray-300 transform hover:scale-105 transition-all duration-300"
                                        >
                                            <ListChecks className="h-4 w-4 mr-2" />
                                            Requirements
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 text-center">
                    <strong>Note:</strong> Please select the appropriate category based on your intended use. 
                    If you're unsure which category applies to your situation, you may contact the CPDO office for guidance.
                </p>
            </div>

            {/* Requirements Dialog */}
            <Dialog open={isRequirementsOpen} onOpenChange={setIsRequirementsOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-slate-50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <ListChecks className="h-6 w-6 text-blue-600" />
                            </div>
                            Requirements for {selectedRequirements?.title}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Please prepare the following documents before submitting your application
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-6 space-y-3">
                        {selectedRequirements?.requirements.map((requirement, index) => (
                            <div 
                                key={index} 
                                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex items-start gap-4 animate-fadeInUp"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-800 leading-relaxed">{requirement}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 p-5 bg-white border-l-4 border-yellow-500 rounded-lg shadow-md">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">Important Notice</h4>
                                <p className="text-sm text-gray-700">
                                    All documents must be valid and up-to-date. Incomplete requirements may result in delays or rejection of your application. 
                                    Please ensure all documents are properly signed and notarized where required.
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            
            {/* Animation styles */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeInUp {
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}
