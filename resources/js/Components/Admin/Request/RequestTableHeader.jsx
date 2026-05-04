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
            <CardHeader className="bg-blue-600 border-b border-blue-700 p-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-white">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        All Requests ({filteredCount})
                    </CardTitle>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onExport}
                            className="gap-2 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                        >
                            <Download className="h-4 w-4" />
                            Export PDF
                        </Button>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                            <Input
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
                            />
                        </div>
                        {filterStatus !== "all" && (
                            <Button
                                variant="outline"
                                onClick={onClearFilter}
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300"
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
