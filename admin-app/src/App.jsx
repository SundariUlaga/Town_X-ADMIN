import { Navigate, Route, Routes } from "react-router-dom";
import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthContext";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Advertisements from "@/pages/Advertisements";
import AdvertisementDetails from "@/pages/AdvertisementDetails";
import Users from "@/pages/Users";
import UserDetails from "@/pages/UserDetails";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import Reports from "@/pages/Reports";
import Testimonials from "@/pages/Testimonials";
import AuditLogs from "@/pages/AuditLogs";
import Settings from "@/pages/Settings";
import { QueueLanding } from "@/components/common/QueueLanding";

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/advertisements" element={<QueueLanding type="ads" />} />
            <Route path="/advertisements/all" element={<Advertisements />} />
            <Route path="/advertisements/pending" element={<Advertisements />} />
            <Route path="/advertisements/changes-requested" element={<Advertisements />} />
            <Route path="/advertisements/scheduled" element={<Advertisements />} />
            <Route path="/advertisements/published" element={<Advertisements />} />
            <Route path="/advertisements/expired" element={<Advertisements />} />
            <Route path="/advertisements/:id" element={<AdvertisementDetails />} />
            <Route path="/properties" element={<QueueLanding type="properties" />} />
            <Route path="/properties/all" element={<Properties />} />
            <Route path="/properties/pending" element={<Properties />} />
            <Route path="/properties/changes-requested" element={<Properties />} />
            <Route path="/properties/published" element={<Properties />} />
            <Route path="/properties/rejected" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
