// Utility functions for Analytics component

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(amount || 0);
};

export const formatMonthlyData = (monthly_submissions) => {
    return monthly_submissions.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        submissions: item.count
    }));
};

export const formatRevenueData = (monthly_revenue) => {
    return monthly_revenue.map(item => ({
        month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: parseFloat(item.revenue || 0),
        count: item.count
    }));
};

export const formatPaymentMethodData = (payment_methods) => {
    return payment_methods.map(item => ({
        name: item.payment_method.replace('_', ' ').toUpperCase(),
        value: item.count
    }));
};

export const formatStatusData = (status_breakdown) => {
    return status_breakdown.map(item => ({
        name: item.evaluation.charAt(0).toUpperCase() + item.evaluation.slice(1),
        value: item.count
    }));
};

export const formatProjectTypeData = (project_types) => {
    return project_types.map(item => ({
        name: item.project_type || 'Other',
        value: item.count
    }));
};

export const CHART_COLORS = [
    '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
];

export const calculateApprovalRate = (statusData) => {
    if (statusData.length === 0) return 0;
    const approvedCount = statusData.find(s => s.name === 'Approved')?.value || 0;
    const totalCount = statusData.reduce((sum, s) => sum + s.value, 0);
    return Math.round((approvedCount / totalCount) * 100);
};

export const calculateVerificationRate = (payment_stats) => {
    const total = payment_stats.verified_payments + payment_stats.pending_payments;
    if (total === 0) return 0;
    return Math.round((payment_stats.verified_payments / total) * 100);
};

export const calculateCollectionRate = (certificate_stats) => {
    const total = certificate_stats?.total_issued ?? 0;
    const collected = certificate_stats?.collected ?? 0;
    if (total === 0) return 0;
    return Math.round((collected / total) * 100);
};

export const calculateAveragePerUser = (top_users) => {
    if (top_users.length === 0) return 0;
    const total = top_users.reduce((sum, u) => sum + u.count, 0);
    return (total / top_users.length).toFixed(1);
};
