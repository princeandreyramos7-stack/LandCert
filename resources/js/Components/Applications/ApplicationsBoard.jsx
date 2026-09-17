import React, { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { matchesStatusFilter } from "@/lib/applicationStatus";
import { matchesClearanceType } from "@/lib/clearanceTypes";
import { useToast } from "@/Components/ui/use-toast";
import { TablePagination } from "@/Components/ui/table-pagination";
import { useLiveData, useNewItemCount } from "@/hooks/useLiveData";
import { LiveIndicator } from "@/Components/LiveIndicator";
import { ApplicationsStats } from "./ApplicationsStats";
import { ApplicationsToolbar } from "./ApplicationsToolbar";
import { ApplicationsTable } from "./ApplicationsTable";

// Props refreshed by the live poller. Declared outside the component so the
// array identity is stable and the polling effect is not re-created each render.
const LIVE_PROPS = ["requests"];
const PER_PAGE = 12;

const norm = (v) => String(v ?? "").toLowerCase();

/**
 * All Applications, for the officer and the administrator alike: the counts
 * that filter, the toolbar, the table, the pager. What differs by role is the
 * action on each row and where the export goes, and those come in as props.
 */
/**
 * @param archived  true when the rows are the archive (requests.archived_at
 *                  set) rather than the live board. The "Archived" filter is
 *                  served by the server so the archive never weighs on the
 *                  live list, which is what archiving is for.
 * @param sla       working days allowed per step (Citizen's Charter).
 */
export function ApplicationsBoard({ requests, role, exportRoute, listRoute, archived = false, archivedCount = 0, sla }) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(archived ? "archived" : "all");
    const [type, setType] = useState("all");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const { toast } = useToast();

    const all = requests?.data || requests || [];

    const { lastUpdated, isRefreshing, refreshNow } = useLiveData({ only: LIVE_PROPS });
    const { newCount, acknowledge } = useNewItemCount(all);

    const rows = useMemo(() => {
        const term = norm(search).trim();
        const list = all.filter((r) =>
            (status === "archived" || matchesStatusFilter(r.status, status))
            && matchesClearanceType(r.project_type, type)
            && (!term || [r.application_number, r.applicant_name, r.corporation_name, r.user_email, r.project_type, r.project_nature, r.project_location_barangay, r.project_location_street]
                .some((f) => norm(f).includes(term))));

        const time = (r) => new Date(r.created_at || 0).getTime();
        const sorted = [...list];
        if (sort === "oldest" || sort === "waiting") sorted.sort((a, b) => time(a) - time(b));
        else if (sort === "applicant") sorted.sort((a, b) => norm(a.applicant_name).localeCompare(norm(b.applicant_name)));
        else sorted.sort((a, b) => time(b) - time(a));
        return sorted;
    }, [all, search, status, type, sort]);

    useEffect(() => { setPage(1); }, [search, status, type, sort]);

    const pageRows = useMemo(() => rows.slice((page - 1) * PER_PAGE, page * PER_PAGE), [rows, page]);

    const exportExcel = () => {
        window.location.href = route(exportRoute, { status, format: "xlsx" });
        toast({ title: "Preparing your Excel file", description: "The download starts in a moment." });
    };

    // Switching to or from the archive is a different list from the
    // server; every other filter is applied to the rows already here.
    const changeStatus = (value) => {
        if (value === "archived" && !archived) {
            router.get(route(listRoute), { archived: 1 });
        } else if (value !== "archived" && archived) {
            router.get(route(listRoute));
        } else {
            setStatus(value);
        }
    };

    const clear = () => { setSearch(""); setType("all"); changeStatus("all"); };

    return (
        <div className="space-y-4 p-4 sm:p-6">
            <LiveIndicator
                isRefreshing={isRefreshing}
                lastUpdated={lastUpdated}
                newCount={newCount}
                onAcknowledge={acknowledge}
                onRefreshNow={refreshNow}
                label="applications"
                className="justify-end"
            />

            {archived ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    <span>
                        <span className="font-semibold">Archive.</span> Closed applications taken off the live board; they still open and print as before.
                    </span>
                    <button type="button" onClick={() => changeStatus("all")} className="font-semibold underline-offset-2 hover:underline">Back to the live board</button>
                </div>
            ) : (
                <ApplicationsStats requests={all} active={status} onSelect={(key) => changeStatus(key === status ? "all" : key)} role={role} />
            )}

            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
                    <ApplicationsToolbar
                        search={search} onSearch={setSearch}
                        status={status} onStatus={changeStatus}
                        archivedCount={archivedCount}
                        type={type} onType={setType}
                        sort={sort} onSort={setSort}
                        shown={rows.length} total={all.length}
                        onExport={exportExcel} onClear={clear}
                        role={role}
                    />
                </div>

                <ApplicationsTable requests={pageRows} role={role} sla={sla} archived={archived} filtered={Boolean(search) || (status !== "all" && !archived) || type !== "all"} />

                <div className="px-4 sm:px-5">
                    <TablePagination currentPage={page} totalItems={rows.length} perPage={PER_PAGE} onPageChange={setPage} label="applications" />
                </div>
            </div>
        </div>
    );
}
