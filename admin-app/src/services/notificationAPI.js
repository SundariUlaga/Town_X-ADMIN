import { api } from "./api";

export const adminNotificationAPI = {
  list: async ({ limit = 12 } = {}) => {
    const { data } = await api.get("/api/admin/notifications", { params: { limit } });
    return data;
  },
  markAllRead: async () => {
    const { data } = await api.post("/api/admin/notifications/read-all");
    return data;
  },
};
