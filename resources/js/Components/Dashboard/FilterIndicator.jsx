import React from "react";
import { Badge } from "@/Components/ui/badge";
import { Filter } from "lucide-react";
import { getStatusColor } from "./utils";

export function FilterIndicator({ filterStatus, onClearFilter }) {
    if (filterStatus === "all") return null;

    return (
        <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Showing:</span>
            <Badge className={getStatusColor(filterStatus)}>
                {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Badge>
            <button
                onClick={onClearFilter}
                className="text-primary hover:underline ml-2"
            >
                Clear filter
            </button>
        </div>
    );
}
