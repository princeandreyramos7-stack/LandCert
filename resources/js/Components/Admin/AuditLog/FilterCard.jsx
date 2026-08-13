import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Filter, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { formatActionLabel } from "./utils";

export function FilterCard({
    showFilters,
    setShowFilters,
    localFilters,
    setLocalFilters,
    users = [],
    actions = [],
    modelTypes = [],
    onApplyFilters,
    onClearFilters,
}) {
    return (
        <Card className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
            <CardHeader
                className="bg-white border-b border-gray-100 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
            >
                <CardTitle className="text-base font-bold flex items-center justify-between text-[#0d1f5c]">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg" style={{background:"rgba(13,31,92,0.06)"}}>
                            <Filter className="h-4 w-4 text-[#0d1f5c]" />
                        </div>
                        Filters
                    </div>
                    {showFilters ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                </CardTitle>
            </CardHeader>
            {showFilters && (
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {/* Search */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search description, user, IP..."
                                    value={localFilters.search || ""}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            search: e.target.value,
                                        })
                                    }
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                        </div>

                        {/* User Filter */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                User
                            </label>
                            <Select
                                value={
                                    localFilters.user_id
                                        ? localFilters.user_id.toString()
                                        : "all"
                                }
                                onValueChange={(value) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        user_id: value === "all" ? "" : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="All users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All users
                                    </SelectItem>
                                    {users.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={user.id.toString()}
                                        >
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Filter */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Action
                            </label>
                            <Select
                                value={
                                    localFilters.action
                                        ? localFilters.action
                                        : "all"
                                }
                                onValueChange={(value) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        action: value === "all" ? "" : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="All actions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All actions
                                    </SelectItem>
                                    {actions.map((action) => (
                                        <SelectItem key={action} value={action}>
                                            {formatActionLabel(action)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Model Type Filter */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Model Type
                            </label>
                            <Select
                                value={
                                    localFilters.model_type
                                        ? localFilters.model_type
                                        : "all"
                                }
                                onValueChange={(value) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        model_type:
                                            value === "all" ? "" : value,
                                    })
                                }
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All types
                                    </SelectItem>
                                    {modelTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Date From
                            </label>
                            <Input
                                type="date"
                                value={localFilters.date_from || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        date_from: e.target.value,
                                    })
                                }
                                className="h-9 text-sm"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Date To
                            </label>
                            <Input
                                type="date"
                                value={localFilters.date_to || ""}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        date_to: e.target.value,
                                    })
                                }
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <Button
                            onClick={onApplyFilters}
                            className="bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                            size="sm"
                        >
                            <Filter className="mr-1.5 h-3.5 w-3.5" />
                            Apply Filters
                        </Button>
                        <Button
                            onClick={onClearFilters}
                            variant="outline"
                            size="sm"
                            className="h-9 text-sm"
                        >
                            <X className="mr-1.5 h-3.5 w-3.5" />
                            Clear
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
