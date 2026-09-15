import { api } from "./api";

export const advertisementAPI = {
  list: async (params = {}) => {
    const { data } = await api.get("/api/admin/advertisements", { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/api/admin/advertisements/${id}`);
    return data;
  },
  approve: async (id, payload) => {
    const { data } = await api.post(`/api/admin/advertisements/${id}/approve`, payload);
    return data;
  },
  reject: async (id, reason) => {
    const { data } = await api.post(`/api/admin/advertisements/${id}/reject`, { reason });
    return data;
  },
  requestChanges: async (id, notes) => {
    const { data } = await api.post(`/api/admin/advertisements/${id}/request-changes`, { notes });
    return data;
  },
};
