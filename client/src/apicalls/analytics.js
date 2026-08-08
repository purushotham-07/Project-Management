import { apiRequest } from ".";

export const GetDashboardAnalytics = async () => apiRequest("post", "/api/analytics/get-dashboard-analytics");