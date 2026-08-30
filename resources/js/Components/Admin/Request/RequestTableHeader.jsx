import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { FileText, Download, Search } from "lucide-react";

export function RequestTableHeader({
    filteredCount,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    onClearFilter,
    onExport,
}) {
    return (
        <Card className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
            <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Title with icon and count */}
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#0d1f5c]" />
                        <h2 className="text-lg font-semibold text-[#0d1f5c]">
                            All Applications ({filteredCount})
                        </h2>
                    </div>

                    {/* Right: Export, Filter, Search */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={onExport}
                            className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </Button>
                        
                        <select
                            value={filterStatus}
                            onChange={(e) => onFilterChange(e.target.value)}
                            className="border border-gray-200 rounded-md px-3 py-2 pr-8 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0d1f5c] focus:border-[#0d1f5c] cursor-pointer min-w-[220px]"
                        >
                            <option value="all">All Status of Application</option>
                            <option value="pending">For Verification</option>
                            <option value="reviewed">For Approval</option>
                            <option value="approved">Approved — For Payment</option>
                            <option value="application_approved">Application Approved (paid)</option>
                            <option value="rejected">Application Denied</option>
                        </select>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search requests..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9 pr-4 py-2 w-64 bg-white border-gray-200 focus:border-[#0d1f5c] text-sm"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
