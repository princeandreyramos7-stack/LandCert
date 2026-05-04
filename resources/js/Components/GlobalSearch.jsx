import React, { useState, useEffect, useRef } from "react";
import { Search, X, FileText, DollarSign, Users, Calendar } from "lucide-react";
import { router } from "@inertiajs/react";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";

export function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+K or Cmd+K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            // Escape to close
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const debounce = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(debounce);
    }, [query]);

    const performSearch = async () => {
        setLoading(true);
        try {
            const url = `/admin/search?q=${encodeURIComponent(query)}`;
            console.log("Searching:", url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Search results:", data);
            setResults(data);
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (result) => {
        router.visit(result.url);
        setIsOpen(false);
        setQuery("");
    };

    const getIcon = (type) => {
        switch (type) {
            case "request":
                return <FileText className="h-4 w-4 text-blue-600" />;
            case "payment":
                return <DollarSign className="h-4 w-4 text-green-600" />;
            case "user":
                return <Users className="h-4 w-4 text-purple-600" />;
            case "application":
                return <Calendar className="h-4 w-4 text-orange-600" />;
            default:
                return <FileText className="h-4 w-4 text-gray-600" />;
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all group"
            >
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Search</span>
                <kbd className="px-2 py-0.5 text-xs font-semibold text-white/60 bg-white/10 border border-white/20 rounded">
                    Ctrl K
                </kbd>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setIsOpen(false)}
            />

            {/* Search Modal */}
            <div className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 p-4 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <Search className="h-5 w-5 text-blue-600" />
                        <Input
                            ref={searchRef}
                            type="text"
                            placeholder="Search requests, payments, users..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-1 border-0 focus:ring-0 text-base font-medium text-gray-900 placeholder:text-gray-500 bg-transparent"
                            autoFocus
                        />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-white rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="max-h-96 overflow-y-auto bg-white">
                        {loading && (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="mt-3 text-sm font-medium text-gray-700">
                                    Searching...
                                </p>
                            </div>
                        )}

                        {!loading &&
                            query.length >= 2 &&
                            results.length === 0 && (
                                <div className="p-12 text-center">
                                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-900">
                                        No results found
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Try searching with different keywords
                                    </p>
                                </div>
                            )}

                        {!loading && results.length > 0 && (
                            <div className="py-2">
                                {results.map((result, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handleResultClick(result)
                                        }
                                        className="w-full px-4 py-3 hover:bg-blue-50 flex items-start gap-3 text-left transition-all border-l-4 border-transparent hover:border-blue-600"
                                    >
                                        <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                                            {getIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900">
                                                    {result.title}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs font-medium capitalize"
                                                >
                                                    {result.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 truncate">
                                                {result.description}
                                            </p>
                                            {result.meta && (
                                                <p className="text-xs font-medium text-gray-500 mt-1">
                                                    {result.meta}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 text-xs font-medium text-gray-700 flex items-center justify-between">
                        <span className="text-gray-900">
                            Search across all records
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm font-semibold">
                                    ↑↓
                                </kbd>
                                <span className="text-gray-900">Navigate</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm font-semibold">
                                    ↵
                                </kbd>
                                <span className="text-gray-900">Select</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded shadow-sm font-semibold">
                                    Esc
                                </kbd>
                                <span className="text-gray-900">Close</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
