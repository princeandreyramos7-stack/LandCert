/**
 * The Zoning Administrator signs official documents under their professional
 * credentials — "Engr. <name>, EnP" — but the account only stores the plain
 * name, so the credentials are added at print time.
 *
 * Both parts are added only when they are not already spelled out, so an account
 * that does carry them is printed exactly as entered rather than doubled up.
 */
export function zoningAdministratorName(name) {
    const plain = String(name || '').trim();

    if (!plain) {
        return 'ENGR. CRISANTA D. CONCEPCION, EnP';
    }

    const withPrefix = /^engr\.?\s/i.test(plain) ? plain : `ENGR. ${plain}`;

    return /,\s*enp\b/i.test(withPrefix) ? withPrefix : `${withPrefix}, EnP`;
}
