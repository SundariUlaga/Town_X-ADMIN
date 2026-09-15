import { api } from "./api";

export const authAPI = {
  login: async (email, password) => {
    const { data } = await api.post("/api/admin/auth/login", { email, password });
    return data;
  },
  me: async () => {
    const { data } = await api.get("/api/admin/auth/me");
    return data;
  },
};
