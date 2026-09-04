/**
 * Checks a set of attachments against what the server will actually accept.
 *
 * A POST larger than PHP's post_max_size is thrown away before the application
 * ever runs. On this host the connection is reset rather than answered, so the
 * browser surfaces nothing but "Failed to fetch" — the applicant sees a system
 * error, has no idea which file caused it, and a completed form is lost.
 *
 * Checking before sending turns that into something actionable. The message
 * names the offending file, or the total, in megabytes.
 */

const MB = 1024 * 1024;

/** Multipart framing and the text fields also count toward post_max_size. */
const OVERHEAD_BYTES = 512 * 1024;

function toMB(bytes) {
    return (bytes / MB).toFixed(1);
}

/** Every File the form is about to send, flattened. */
function collectFiles(requirementFiles, authorizationLetter) {
    const files = [];

    Object.values(requirementFiles || {}).forEach((entry) => {
        (Array.isArray(entry) ? entry : [entry])
            .filter((file) => file instanceof File)
            .forEach((file) => files.push(file));
    });

    if (authorizationLetter instanceof File) {
        files.push(authorizationLetter);
    }

    return files;
}

/**
 * @returns {string|null} A message to show the applicant, or null when the
 *                        upload is within every limit.
 */
export function describeOversizedUpload(requirementFiles, authorizationLetter, limits) {
    const files = collectFiles(requirementFiles, authorizationLetter);

    if (files.length === 0) {
        return null;
    }

    const postMax = Number(limits?.postMaxBytes) || 0;
    const fileMax = Number(limits?.fileMaxBytes) || 0;
    const maxFiles = Number(limits?.maxFiles) || 0;

    // A single file over the per-file limit is the clearest thing to report,
    // because there is exactly one thing to fix.
    if (fileMax > 0) {
        const oversized = files.find((file) => file.size > fileMax);
        if (oversized) {
            return `"${oversized.name}" is ${toMB(oversized.size)} MB, over the ${toMB(fileMax)} MB limit for a single file. Please replace it with a smaller scan or photo.`;
        }
    }

    if (maxFiles > 0 && files.length > maxFiles) {
        return `You have attached ${files.length} files, and this system accepts at most ${maxFiles} in one submission. Please submit the remaining documents from My Applications after this one goes through.`;
    }

    if (postMax > 0) {
        const total = files.reduce((sum, file) => sum + file.size, 0);

        if (total + OVERHEAD_BYTES > postMax) {
            const largest = files.reduce((a, b) => (a.size >= b.size ? a : b));

            return `Your attachments come to ${toMB(total)} MB in total, and this system accepts about ${toMB(postMax - OVERHEAD_BYTES)} MB in one submission. The largest is "${largest.name}" at ${toMB(largest.size)} MB — replacing the biggest files with smaller scans should bring it under.`;
        }
    }

    return null;
}
