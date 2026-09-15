import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { LoadingState } from "@/components/common/StateViews";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) return <LoadingState label="Checking session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
