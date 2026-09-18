import axios from "axios";

const TOKEN_KEY = "townx_admin_token";
const REFRESH_KEY = "townx_admin_refresh";
const USER_KEY = "townx_admin_user";
const SESSION_EXPIRED_FLAG = "townx_admin_session_expired";
const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8024",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8024",
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
  withCredentials: true,
});

const AUTH_SKIP = ["/api/admin/auth/login", "/api/auth/refresh", "/api/auth/logout"];

let refreshInflight = null;

function persistTokens(data) {
  if (data?.access_token) localStorage.setItem(TOKEN_KEY, data.access_token);
  if (data?.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
  if (data?.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function markAdminSessionExpired() {
  try {
    sessionStorage.setItem(SESSION_EXPIRED_FLAG, "1");
  } catch {
    /* ignore */
  }
}

export function consumeAdminSessionExpired() {
  try {
    const flagged = sessionStorage.getItem(SESSION_EXPIRED_FLAG) === "1";
    sessionStorage.removeItem(SESSION_EXPIRED_FLAG);
    return flagged;
  } catch {
    return false;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function refreshAccessToken() {
  if (!refreshInflight) {
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    refreshInflight = refreshClient
      .post("/api/auth/refresh", refreshToken ? { refresh_token: refreshToken } : {})
      .then((res) => {
        persistTokens(res.data);
        return res.data;
      })
      .finally(() => {
        refreshInflight = null;
      });
  }
  return refreshInflight;
}

function forceLogin() {
  markAdminSessionExpired();
  clearAdminSession();
  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign("/login?reason=expired");
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config || {};
    const url = String(config.url || "");
    const skip = AUTH_SKIP.some((path) => url.includes(path));

    if (status !== 401 || config._retry || skip) {
      return Promise.reject(error);
    }

    config._retry = true;
    try {
      await refreshAccessToken();
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return api(config);
    } catch {
      if (localStorage.getItem(TOKEN_KEY) || localStorage.getItem(USER_KEY)) {
        forceLogin();
      }
      return Promise.reject(error);
    }
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
    return (
      detail
        .map((item) => (typeof item === "string" ? item : item?.msg))
        .filter(Boolean)
        .join("; ") || fallback
    );
  }
  if (detail && typeof detail === "object" && detail.msg) return detail.msg;
  if (error?.response?.status === 401) return SESSION_EXPIRED_MESSAGE;
  return error?.message || fallback;
}

export { TOKEN_KEY, REFRESH_KEY, USER_KEY, SESSION_EXPIRED_MESSAGE, persistTokens };
