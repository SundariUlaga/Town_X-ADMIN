import { api } from "./api";

export const userAPI = {
  list: async (params = {}) => {
    const { data } = await api.get("/api/admin/users", { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/api/admin/users/${id}`);
    return data;
  },
};
