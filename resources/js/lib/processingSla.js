/**
 * Days in stage, the way the office is measured (ARTA / Citizen's Charter):
 * working days since the application entered its current step, against the
 * limit for that step. Mirrors App\Support\ProcessingSla.
 */

export const STAGE_OF = {
    pending: "verification",
    for_verification: "verification",
    reviewed: "approval",
    pending_superadmin_approval: "approval",
    in_applicant: "applicant",
    returned: "applicant",
    approved: "applicant",
    for_payment: "applicant",
    pending_payment: "applicant",
    payment_confirmed: "release",
    certificate_preparing: "release",
    certificate_ready: "release",
    released: "closed",
    collected: "closed",
    completed: "closed",
    rejected: "closed",
};

export const STAGE_LABEL = {
    verification: "verification",
    approval: "approval",
    applicant: "with applicant",
    release: "issuance",
    closed: "closed",
};

export const DEFAULT_LIMITS = { verification: 3, approval: 2, release: 3 };

export const stageOf = (status) => STAGE_OF[String(status ?? "").toLowerCase()] || "verification";

/** Whole working days (Mon-Fri) from one moment to another. */
export function workingDaysBetween(from, to = new Date()) {
    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || end <= start) return 0;
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    let days = 0;
    while (cursor < last) {
        cursor.setDate(cursor.getDate() + 1);
        const dow = cursor.getDay();
        if (dow !== 0 && dow !== 6) days++;
    }
    return days;
}

/**
 * How an application is doing at its current step.
 *
 * @returns {{stage: string, days: number, limit: number|null, overdue: boolean, office: boolean} | null}
 *          null when the application is closed or has no stage timestamp.
 */
export function stageProgress(row, limits = DEFAULT_LIMITS) {
    const stage = stageOf(row.status);
    if (stage === "closed") return null;
    const since = row.stage_since || row.created_at;
    if (!since) return null;
    const days = workingDaysBetween(since);
    const limit = limits?.[stage] ?? DEFAULT_LIMITS[stage] ?? null;
    const office = stage !== "applicant";
    return { stage, days, limit: office ? limit : null, overdue: office && limit !== null && days > limit, office };
}
