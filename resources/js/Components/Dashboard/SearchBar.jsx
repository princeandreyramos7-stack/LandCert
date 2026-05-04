import React from "react";
import { Input } from "@/Components/ui/input";
import { Search, XCircle } from "lucide-react";

export function SearchBar({ searchTerm, onSearchChange, onClearSearch }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
                type="text"
                placeholder="Search by applicant name, project type, location, or ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-6 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            />
            {searchTerm && (
                <button
                    onClick={onClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <XCircle className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
