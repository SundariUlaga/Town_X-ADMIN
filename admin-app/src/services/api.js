import axios from "axios";

const TOKEN_KEY = "townx_admin_token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8024",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("townx_admin_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  if (error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "")) {
    return "Request timed out. Is the API server running on port 8024?";
  }
  if (error?.message === "Network Error") {
    return "Cannot reach the API. Check that the backend is running.";
  }
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail
      .map((item) => (typeof item === "string" ? item : item?.msg))
      .filter(Boolean)
      .join("; ") || fallback;
  }
  if (detail && typeof detail === "object" && detail.msg) return detail.msg;
  return error?.message || fallback;
}

export { TOKEN_KEY };
