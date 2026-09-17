import React, { useEffect } from "react";
import { useToast } from "@/Components/ui/use-toast";
import { ApplicationsBoard } from "@/Components/Applications/ApplicationsBoard";

/**
 * All Applications for the Zoning Officer. The board itself is shared with the
 * administrator's page; this wrapper adds the officer's routes and the flash
 * messages the officer's actions come back with.
 */
export function AdminRequestList({ requests, flash = {}, archived = false, archivedCount = 0, sla }) {
    const { toast } = useToast();

    useEffect(() => {
        if (flash?.success) toast({ title: "Done", description: flash.success, duration: 5000 });
        if (flash?.error) toast({ variant: "destructive", title: "Something did not go through", description: flash.error, duration: 7000 });
    }, [flash, toast]);

    return (
        <ApplicationsBoard requests={requests} role="admin" exportRoute="admin.export.requests" listRoute="admin.requests" archived={archived} archivedCount={archivedCount} sla={sla} />
    );
}
