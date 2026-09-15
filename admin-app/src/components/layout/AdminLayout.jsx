import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AdminBreadcrumbs } from "@/components/layout/AdminBreadcrumbs";

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 bg-surface p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <AdminBreadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
