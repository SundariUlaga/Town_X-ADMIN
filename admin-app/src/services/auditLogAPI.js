import { api } from "./api";

export const auditLogAPI = {
  list: async (params = {}) => {
    const { data } = await api.get("/api/admin/audit-logs", { params });
    return data;
  },
};
