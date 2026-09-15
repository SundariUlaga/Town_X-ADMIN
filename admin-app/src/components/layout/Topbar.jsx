import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { dashboardAPI } from "@/services/dashboardAPI";
import { adminNotificationAPI } from "@/services/notificationAPI";
import { defaultAdPath, defaultPropertyPath } from "@/components/common/QueueLanding";

export function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAdminAuth();
  const [search, setSearch] = useState("");
  const [inboxOpen, setInboxOpen] = useState(false);
  const inboxRef = useRef(null);

  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: dashboardAPI.getStats,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const inboxQuery = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => adminNotificationAPI.list({ limit: 8 }),
    staleTime: 20_000,
    refetchInterval: 45_000,
  });

  const pendingProperties = statsQuery.data?.pending_properties || 0;
  const pendingAds = statsQuery.data?.pending_advertisements || 0;
  const openReports = statsQuery.data?.open_reports || 0;
  const unread = inboxQuery.data?.unread_count || 0;
  const badge = pendingProperties + pendingAds + openReports + unread;

  useEffect(() => {
    const onClick = (event) => {
      if (!inboxRef.current?.contains(event.target)) setInboxOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/properties/all?search=${encodeURIComponent(q)}`);
  };

  const openInboxItem = async (item) => {
    setInboxOpen(false);
    const path = item?.payload?.path;
    if (path) navigate(path);
    else navigate("/dashboard");
  };

  const markAllRead = async () => {
    await adminNotificationAPI.markAllRead();
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-brand-50 hover:text-brand-700 lg:hidden"
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <form onSubmit={handleSearch} className="relative hidden min-w-0 flex-1 sm:block sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties by city, locality..."
              className="w-full rounded-xl border border-slate-200 bg-surface py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
          </form>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative" ref={inboxRef}>
            <button
              type="button"
              onClick={() => setInboxOpen((open) => !open)}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-brand-700"
              aria-label="Review updates"
              title="Review updates"
            >
              <Bell className="size-5" />
              {badge > 0 ? (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-secondary-500 text-[10px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              ) : null}
            </button>

            {inboxOpen ? (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                  <p className="text-sm font-semibold text-ink">Updates</p>
                  {unread > 0 ? (
                    <button type="button" onClick={markAllRead} className="text-xs font-medium text-brand-600 hover:underline">
                      Mark all read
                    </button>
                  ) : null}
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 text-center">
                  <Link to={defaultPropertyPath(pendingProperties)} onClick={() => setInboxOpen(false)} className="px-2 py-2 hover:bg-brand-50">
                    <p className="text-base font-bold text-ink">{pendingProperties}</p>
                    <p className="text-[10px] text-slate-500">Listings</p>
                  </Link>
                  <Link to={defaultAdPath(pendingAds)} onClick={() => setInboxOpen(false)} className="px-2 py-2 hover:bg-brand-50">
                    <p className="text-base font-bold text-ink">{pendingAds}</p>
                    <p className="text-[10px] text-slate-500">Ads</p>
                  </Link>
                  <Link to="/reports" onClick={() => setInboxOpen(false)} className="px-2 py-2 hover:bg-brand-50">
                    <p className="text-base font-bold text-ink">{openReports}</p>
                    <p className="text-[10px] text-slate-500">Reports</p>
                  </Link>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {(inboxQuery.data?.items || []).length === 0 ? (
                    <p className="px-3 py-6 text-center text-xs text-slate-500">No new listing or ad alerts.</p>
                  ) : (
                    inboxQuery.data.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openInboxItem(item)}
                        className={`block w-full px-3 py-2.5 text-left hover:bg-slate-50 ${item.is_read ? "" : "bg-brand-50/50"}`}
                      >
                        <p className="text-xs font-semibold text-ink">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{item.body}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden text-right md:block">
            <p className="text-sm font-medium text-ink">{user?.name}</p>
            <p className="text-xs text-brand-700">Administrator</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white shadow-sm">
            {user?.name?.charAt(0) || "A"}
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
            aria-label="Logout"
            title="Sign out"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
