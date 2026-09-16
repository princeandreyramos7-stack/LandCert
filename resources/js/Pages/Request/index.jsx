import ApplicantLayout from "@/Layouts/ApplicantLayout";
import { Head } from "@inertiajs/react";
import RequestForm from "@/Components/Request_form";

/**
 * The application form, on the shared applicant chrome. The form itself
 * (Components/Request_form) is unchanged; this page used to draw its own
 * sidebar and a bare top bar, so it looked like a different system from the
 * dashboard the applicant had just left.
 */
export default function RequestPage({ isEditing = false, existingApplication = null }) {
    return (
        <ApplicantLayout title={isEditing ? "Edit Application" : "New Application"}>
            <Head title={isEditing ? "Edit Application" : "Application Form"} />
            {/* The form draws its own cards; nothing wraps them. */}
            <div className="mx-auto w-full max-w-6xl">
                <RequestForm isEditing={isEditing} existingApplication={existingApplication} />
            </div>
        </ApplicantLayout>
    );
}
