import { api } from "./api";

export const reportAPI = {
  list: async (params = {}) => {
    const { data } = await api.get("/api/admin/reports", { params });
    return data;
  },
  resolve: async (id, admin_notes) => {
    const { data } = await api.post(`/api/admin/reports/${id}/resolve`, { admin_notes });
    return data;
  },
  dismiss: async (id, admin_notes) => {
    const { data } = await api.post(`/api/admin/reports/${id}/dismiss`, { admin_notes });
    return data;
  },
};
