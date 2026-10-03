// Shared status/magnitude color tokens for the v1 Operations Dashboard.
// Values mirror src/v2/theme.ts's v2Colors so v1 and v2 charts look identical.
export const dashboardColors = {
    info: '#007fff',
    infoTint: '#e2f0ff',
    warn: '#9a5b00',
    warnTint: '#fbead2',
    critical: '#bb0037',
    criticalTint: '#fbe6ea',
    good: '#3c9e09',
    goodTint: '#e6f4dd',
    slate: '#5b6572',
    slateTint: '#f7f8fa',
};

export const enquiryStatusColors: Record<string, string> = {
    'Open': dashboardColors.info,
    'In Progress': dashboardColors.warn,
    'Approved': dashboardColors.good,
    'Rejected': dashboardColors.critical,
};

export const orderStatusColors: Record<string, string> = {
    'Initiated': dashboardColors.slate,
    'In-Progress': dashboardColors.warn,
    'Assembly Completed': dashboardColors.good,
    'Order Closed': dashboardColors.slate,
};

export const assemblyStatusColors: Record<string, string> = {
    'Pending': dashboardColors.slate,
    'Ready to Assemble': dashboardColors.warn,
    'Assembly In-Progress': dashboardColors.info,
    'Assembly Completed': dashboardColors.good,
};
