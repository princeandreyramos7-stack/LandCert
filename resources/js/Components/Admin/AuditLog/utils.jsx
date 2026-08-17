// Utility functions for AuditLog component

export const getActionBadge = (action) => {
    const variants = {
        created:       "default",
        updated:       "secondary",
        deleted:       "destructive",
        viewed:        "outline",
        exported:      "secondary",
        login:         "default",
        logout:        "secondary",
        failed_login:  "destructive",
        bulk_created:  "default",
        bulk_updated:  "secondary",
        bulk_deleted:  "destructive",
        sms_broadcast: "default",
        approved:      "default",
        rejected:      "destructive",
    };
    return variants[action] || "outline";
};

export const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Manila",
    });
};

export const formatActionLabel = (action) => {
    const labels = {
        created:       "Created",
        updated:       "Updated",
        deleted:       "Deleted",
        viewed:        "Viewed",
        exported:      "Exported",
        login:         "Login",
        logout:        "Logout",
        failed_login:  "Failed Login",
        bulk_created:  "Bulk Create",
        bulk_updated:  "Bulk Update",
        bulk_deleted:  "Bulk Delete",
        sms_broadcast: "SMS Broadcast",
        approved:      "Approved",
        rejected:      "Rejected",
    };
    return labels[action] || action.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};
