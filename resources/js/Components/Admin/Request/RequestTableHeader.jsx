import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { FileText, Search, Download } from "lucide-react";

export function RequestTableHeader({
    filteredCount,
    searchTerm,
    onSearchChange,
    filterStatus,
    onClearFilter,
    onExport,
}) {
    return (
        <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            <CardHeader className="bg-white border-b border-gray-100 p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-[#0d1f5c]">
                        <div className="p-2 rounded-lg" style={{background:"rgba(13,31,92,0.06)"}}>
                            <FileText className="h-5 w-5 text-[#0d1f5c]" />
                        </div>
                        All Requests ({filteredCount})
                    </CardTitle>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onExport}
                            className="gap-2 border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] hover:text-[#d4a017] transition-all"
                        >
                            <Download className="h-4 w-4" />
                            Export PDF
                        </Button>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 border-gray-200 focus:border-[#d4a017]"
                            />
                        </div>
                        {filterStatus !== "all" && (
                            <Button
                                variant="outline"
                                onClick={onClearFilter}
                                className="border-gray-200 text-[#0d1f5c] hover:border-[#d4a017] transition-all"
                            >
                                Clear Filter
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Content will be passed as children */}
            </CardContent>
        </Card>
    );
}
