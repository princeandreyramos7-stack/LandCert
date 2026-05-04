import React from "react";
import { Card, CardContent } from "@/Components/ui/card";

export function LogoDisplay() {
    return (
        <div className="mb-8">
            <Card className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 backdrop-blur-sm border-0 shadow-2xl rounded-3xl animate-in fade-in zoom-in duration-700">
                <CardContent className="p-12">
                    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-8">
                        <div className="relative group">
                            {/* Animated background rings */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 opacity-20 animate-pulse"></div>
                            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-400 via-blue-500 to-purple-600 opacity-30 animate-pulse delay-75"></div>
                            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-600 opacity-40 animate-pulse delay-150"></div>

                            {/* Logo container */}
                            <div className="relative w-80 h-80 mx-auto group-hover:scale-110 transition-transform duration-700 ease-out">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 rounded-full shadow-2xl backdrop-blur-sm"></div>
                                <div className="absolute inset-4 rounded-full overflow-hidden shadow-xl">
                                    <img
                                        src="/images/ilagan.png"
                                        alt="Ilagan City Logo"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>

                                {/* Floating particles */}
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                                <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-300"></div>
                                <div className="absolute top-1/4 -right-6 w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-500"></div>
                                <div className="absolute bottom-1/3 -left-6 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-700"></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
