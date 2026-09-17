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

/**
 * The printed positions when the record carries none. The office sets the
 * real ones in User Management; these only cover an account made before
 * that existed.
 */
export const DEFAULT_OFFICER_POSITION = 'Zoning Officer IV';
export const DEFAULT_ADMINISTRATOR_POSITION = 'City Planning & Development Coordinator / Zoning Administrator';

/**
 * A signer's position as the documents print it: the one on the record as of
 * the document's date (Signatories::signer), or the default. Split at "/"
 * into lines, the way the paper forms stack a two-part title.
 *
 * @returns {string[]} one line per part
 */
export function positionLines(signer, fallback) {
    const text = String(signer?.position || fallback || '').trim();
    if (!text) return [];
    return text.split('/').map((part) => part.trim()).filter(Boolean);
}
