import { api, persistTokens, refreshAccessToken } from "./api";

export const authAPI = {
  login: async (email, password) => {
    const { data } = await api.post("/api/admin/auth/login", { email, password });
    persistTokens(data);
    return data;
  },
  me: async () => {
    const { data } = await api.get("/api/admin/auth/me");
    return data;
  },
  refresh: refreshAccessToken,
  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* still clear client cache */
    }
  },
};
