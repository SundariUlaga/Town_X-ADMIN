import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { propertyAPI } from "@/services/propertyAPI";
import { dashboardAPI } from "@/services/dashboardAPI";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterTabs } from "@/components/common/FilterTabs";
import { LoadingState, ErrorState, EmptyState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/statusUtils";
import { PROPERTY_TABS } from "@/utils/navConfig";

const STATUS_BY_PATH = {
  "/properties/pending": "PENDING_REVIEW",
  "/properties/changes-requested": "CHANGES_REQUESTED",
  "/properties/published": "PUBLISHED",
  "/properties/rejected": "REJECTED",
};

export default function Properties() {
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
    queryKey: ["admin-properties", status, search, page],
    queryFn: () => propertyAPI.list({ skip, limit, status, search }),
  });

  const tabs = useMemo(
    () =>
      PROPERTY_TABS.map((tab) => ({
        ...tab,
        count:
          tab.status === "PENDING_REVIEW"
            ? statsQuery.data?.pending_properties
            : tab.status === "CHANGES_REQUESTED"
              ? undefined
              : undefined,
        match: (path) => path === tab.to,
      })),
    [statsQuery.data?.pending_properties]
  );

  const totalPages = useMemo(() => {
    if (!query.data?.total) return 1;
    return Math.max(1, Math.ceil(query.data.total / limit));
  }, [query.data?.total]);

  const activeTabPath = PROPERTY_TABS.find((t) => t.to === pathname)?.to || "/properties/all";

  if (pathname === "/properties/pending" && !search && query.isSuccess && (query.data?.total ?? 0) === 0) {
    return <Navigate to="/properties/all" replace />;
  }

  if (query.isLoading) return <LoadingState label="Loading properties..." />;
  if (query.isError) return <ErrorState message="Failed to load properties." onRetry={() => query.refetch()} />;

  const items = query.data?.items || [];
  const total = query.data?.total ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Properties" description="Review listings, set verification tier, and manage publish status." />

      <FilterTabs tabs={tabs} activePath={activeTabPath} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const next = new URLSearchParams(searchParams);
          if (searchInput.trim()) next.set("search", searchInput.trim());
          else next.delete("search");
          next.set("page", "1");
          setSearchParams(next);
        }}
        className="flex gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search city, locality, address..."
            className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-9 pr-3 text-sm outline-none"
          />
        </div>
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
          Search
        </button>
      </form>

      <p className="text-sm text-slate-500">
        Showing {items.length} of {total} listing{total === 1 ? "" : "s"}
        {search ? ` matching “${search}”` : ""}
      </p>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No properties found" description="Try another filter or search term." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full text-sm">
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Docs</th>
                  <th>Owner</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((property) => (
                  <tr key={property.id} className="group">
                    <td className="font-medium text-slate-900">
                      {property.bhk_type} · {property.property_type}
                    </td>
                    <td className="text-slate-600">
                      {property.locality}, {property.city}
                    </td>
                    <td className="text-slate-600">₹{property.expected_price.toLocaleString("en-IN")}</td>
                    <td>
                      <StatusBadge status={property.status} />
                    </td>
                    <td className="capitalize text-slate-600">
                      {property.verification_tier === "verified"
                        ? "Verified"
                        : property.verification_tier === "pending"
                          ? "Pending"
                          : "Not verified"}
                    </td>
                    <td className="text-slate-600">{property.owner_name || "—"}</td>
                    <td className="text-slate-500">{formatDate(property.created_at)}</td>
                    <td className="text-right">
                      <Link
                        to={`/properties/${property.id}`}
                        className="inline-flex rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 opacity-90 transition group-hover:opacity-100 hover:bg-brand-100"
                      >
                        Open
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
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(page - 1));
                setSearchParams(next);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
