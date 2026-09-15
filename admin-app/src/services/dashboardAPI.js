import { api } from "./api";

export const dashboardAPI = {
  getStats: async () => {
    const { data } = await api.get("/api/admin/dashboard/stats");
    return data;
  },
  getRecentAds: async () => {
    const { data } = await api.get("/api/admin/dashboard/recent-advertisements");
    return data;
  },
};
