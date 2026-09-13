/**
 * Whether the applicant's sidebar starts open.
 *
 * It starts collapsed to its icons - the applicant's pages are wide (the
 * form, the record) and the rail is enough to get around. Once the applicant
 * has opened or closed it themselves, the sidebar provider remembers that in
 * a cookie, and the choice is kept from page to page.
 *
 * Four applicant pages build their own SidebarProvider rather than going
 * through ApplicantLayout, so the rule lives here and each of them asks it.
 */
export function applicantSidebarStartsOpen() {
    if (typeof document === "undefined") return false;
    const remembered = document.cookie.match(/(?:^|;\s*)sidebar_state=(true|false)/);
    return remembered ? remembered[1] === "true" : false;
}
