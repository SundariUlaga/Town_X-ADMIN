import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { advertisementAPI } from "@/services/advertisementAPI";
import { dashboardAPI } from "@/services/dashboardAPI";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { LoadingState, ErrorState, EmptyState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/statusUtils";
import { AD_TABS } from "@/utils/navConfig";

const STATUS_BY_PATH = {
  "/advertisements/pending": "PENDING_REVIEW",
  "/advertisements/changes-requested": "CHANGES_REQUESTED",
  "/advertisements/scheduled": "APPROVED",
  "/advertisements/published": "PUBLISHED",
  "/advertisements/expired": "EXPIRED",
};

export default function Advertisements() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const page = Number(searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;
  const status = STATUS_BY_PATH[pathname] || searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: dashboardAPI.getStats, staleTime: 60_000 });

  const query = useQuery({
    queryKey: ["admin-ads", status, search, page],
    queryFn: () => advertisementAPI.list({ skip, limit, status, search }),
  });

  const totalPages = useMemo(() => {
    if (!query.data?.total) return 1;
    return Math.max(1, Math.ceil(query.data.total / limit));
  }, [query.data?.total]);

  const tabs = useMemo(
    () =>
      AD_TABS.map((tab) => ({
        ...tab,
        count: tab.status === "PENDING_REVIEW" ? statsQuery.data?.pending_advertisements : undefined,
        match: (path) => path === tab.to,
      })),
    [statsQuery.data?.pending_advertisements]
  );

  const activeTabPath = AD_TABS.find((t) => t.to === pathname)?.to || "/advertisements/all";

  const handleSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set("search", searchInput.trim());
    else next.delete("search");
    next.set("page", "1");
    setSearchParams(next);
  };

  if (query.isLoading) return <LoadingState label="Loading advertisements..." />;
  if (query.isError) return <ErrorState message="Failed to load advertisements." onRetry={() => query.refetch()} />;

  if (pathname === "/advertisements/pending" && !search && query.isSuccess && (query.data?.total ?? 0) === 0) {
    return <Navigate to="/advertisements/all" replace />;
  }

  const items = query.data?.items || [];
  const total = query.data?.total ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Advertisements" description="Review, schedule, and manage homepage promotions." />

      <FilterTabs tabs={tabs} activePath={activeTabPath} />

      <form onSubmit={handleSearch} className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search advertisements..."
            className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none"
          />
        </div>
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
          Search
        </button>
      </form>

      <p className="text-sm text-slate-500">
        Showing {items.length} of {total} ad{total === 1 ? "" : "s"}
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No advertisements found" description="Try another filter or search term." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full text-sm">
              <thead>
                <tr>
                  <th>Advertisement</th>
                  <th>Submitted by</th>
                  <th>Property</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((ad) => (
                  <tr key={ad.id} className="group">
                    <td className="font-medium text-slate-900">{ad.title}</td>
                    <td className="text-slate-600">{ad.submitter_name || "—"}</td>
                    <td className="text-slate-600">{ad.property_id ? `#${ad.property_id}` : "—"}</td>
                    <td>
                      <StatusBadge status={ad.status} />
                    </td>
                    <td className="text-slate-500">{formatDate(ad.created_at)}</td>
                    <td className="text-right">
                      <Link
                        to={`/advertisements/${ad.id}`}
                        className="inline-flex rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                      >
                        {ad.status === "PENDING_REVIEW" || ad.status === "CHANGES_REQUESTED" ? "Review" : "Open"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Page {page} of {totalPages} · {query.data.total} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(page - 1));
                setSearchParams(next);
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(page + 1));
                setSearchParams(next);
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
