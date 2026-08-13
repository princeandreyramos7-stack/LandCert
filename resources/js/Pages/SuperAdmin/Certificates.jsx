/**
 * Super Admin Certificates page — delegates to the shared CertificatesIndex
 * component with userType="super_admin" to use SuperAdminLayout + super-admin routes.
 */
import CertificatesIndex from "@/Pages/Admin/Certificates/Index";

export default function SuperAdminCertificates(props) {
    return <CertificatesIndex {...props} userType="super_admin"/>;
}
