import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authAPI } from "@/services/authAPI";
import { TOKEN_KEY, USER_KEY, clearAdminSession, markAdminSessionExpired, persistTokens } from "@/services/api";

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
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY) || readStoredUser()));

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const cached = readStoredUser();
    if (!token && !cached) {
      setIsLoading(false);
      return;
    }

    const hydrate = async () => {
      try {
        const freshUser = await authAPI.me();
        setUser(freshUser);
        localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
      } catch {
        markAdminSessionExpired();
        clearAdminSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void hydrate();
  }, []);

  const login = async (email, password) => {
    const result = await authAPI.login(email, password);
    persistTokens(result);
    setUser(result.user);
    return result.user;
  };

  const logout = () => {
    void authAPI.logout();
    clearAdminSession();
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
