import { api } from "./api";

export const propertyAPI = {
  list: async (params = {}) => {
    const { data } = await api.get("/api/admin/properties", { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/api/admin/properties/${id}`);
    return data;
  },
  approve: async (id) => {
    const { data } = await api.post(`/api/admin/properties/${id}/approve`);
    return data;
  },
  reject: async (id, reason) => {
    const { data } = await api.post(`/api/admin/properties/${id}/reject`, { reason });
    return data;
  },
  requestChanges: async (id, notes) => {
    const { data } = await api.post(`/api/admin/properties/${id}/request-changes`, { notes });
    return data;
  },
  updateVerification: async (id, payload) => {
    const { data } = await api.patch(`/api/admin/properties/${id}/verification`, payload);
    return data;
  },
};
