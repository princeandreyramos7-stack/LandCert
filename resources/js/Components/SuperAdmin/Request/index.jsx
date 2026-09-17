import React from "react";
import { ApplicationsBoard } from "@/Components/Applications/ApplicationsBoard";

/** All Applications for the Zoning Administrator: the shared board, with the administrator's routes. */
export function SuperAdminRequestList({ requests, archived = false, archivedCount = 0, sla }) {
    return <ApplicationsBoard requests={requests} role="super_admin" exportRoute="super-admin.export.requests" listRoute="super-admin.requests" archived={archived} archivedCount={archivedCount} sla={sla} />;
}
