import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authAPI } from "@/services/authAPI";
import { TOKEN_KEY } from "@/services/api";

const USER_KEY = "townx_admin_user";

const AdminAuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authAPI
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    const result = await authAPI.login(email, password);
    localStorage.setItem(TOKEN_KEY, result.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, isLoading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
