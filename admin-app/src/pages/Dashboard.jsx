import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, Megaphone, ShieldAlert, Users } from "lucide-react";
import { dashboardAPI } from "@/services/dashboardAPI";
import { propertyAPI } from "@/services/propertyAPI";
import { PageHeader } from "@/components/common/PageHeader";
import { PriorityCard } from "@/components/common/PriorityCard";
import { LoadingState, ErrorState, EmptyState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/statusUtils";
import { defaultAdPath, defaultPropertyPath } from "@/components/common/QueueLanding";

function StatChip({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">{value ?? "—"}</p>
    </div>
  );
}

export default function Dashboard() {
  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: dashboardAPI.getStats });
  const recentQuery = useQuery({ queryKey: ["admin-recent-ads"], queryFn: dashboardAPI.getRecentAds });
  const pendingPropsQuery = useQuery({
    queryKey: ["admin-properties", "PENDING_REVIEW", "dashboard"],
    queryFn: () => propertyAPI.list({ status: "PENDING_REVIEW", limit: 5 }),
    enabled: Boolean(statsQuery.data?.pending_properties),
  });

  if (statsQuery.isLoading) return <LoadingState label="Loading dashboard..." />;
  if (statsQuery.isError) {
    return <ErrorState message="Failed to load dashboard stats." onRetry={() => statsQuery.refetch()} />;
  }

  const stats = statsQuery.data;
  const pendingProperties = pendingPropsQuery.data?.items || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Good to see you"
        description="Start with items in your work queue, then review platform metrics below."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <PriorityCard
          to={defaultPropertyPath(stats.pending_properties)}
          label="Properties awaiting review"
          description="Approve, reject, or request changes"
          count={stats.pending_properties}
          icon={Building2}
          tone="accent"
        />
        <PriorityCard
          to={defaultAdPath(stats.pending_advertisements)}
          label="Ads awaiting review"
          description="Schedule promotions for the homepage"
          count={stats.pending_advertisements}
          icon={Megaphone}
          tone="secondary"
        />
        <PriorityCard
          to="/reports"
          label="Open listing reports"
          description="User-submitted trust & safety flags"
          count={stats.open_reports}
          icon={ShieldAlert}
          tone="rose"
        />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatChip label="Total users" value={stats.total_users} />
        <StatChip label="All properties" value={stats.total_properties} />
        <StatChip label="Published listings" value={stats.published_properties} />
        <StatChip label="Published ads" value={stats.published_advertisements} />
        <StatChip label="Scheduled ads" value={stats.scheduled_advertisements} />
        <StatChip label="Expired ads" value={stats.expired_advertisements} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="font-semibold text-ink">Property review queue</h3>
              <p className="text-xs text-slate-500">Newest pending listings first</p>
            </div>
            <Link to={defaultPropertyPath(stats.pending_properties)} className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {pendingPropsQuery.isLoading ? (
            <LoadingState label="Loading queue..." />
          ) : pendingProperties.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No pending properties" description="New owner submissions will show up here." />
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingProperties.map((property) => (
                <li key={property.id}>
                  <Link
                    to={`/properties/${property.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {property.bhk_type} · {property.property_type}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {property.locality}, {property.city} · {property.owner_name || "Unknown owner"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-brand-600">Review →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="font-semibold text-ink">Recent ad submissions</h3>
              <p className="text-xs text-slate-500">Latest promotion requests</p>
            </div>
            <Link to={defaultAdPath(stats.pending_advertisements)} className="text-sm font-medium text-brand-600 hover:underline">
              Review ads
            </Link>
          </div>
          {recentQuery.isLoading ? (
            <LoadingState label="Loading recent ads..." />
          ) : recentQuery.data?.length ? (
            <ul className="divide-y divide-slate-100">
              {recentQuery.data.map((ad) => (
                <li key={ad.id}>
                  <Link
                    to={`/advertisements/${ad.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{ad.title}</p>
                      <p className="text-sm text-slate-500">{ad.submitter_name || "—"} · {formatDate(ad.created_at)}</p>
                    </div>
                    <StatusBadge status={ad.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6">
              <EmptyState title="No recent advertisements" description="New submissions will appear here." />
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-ink">Shortcuts</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/users" className="flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800">
            <Users className="size-4 text-brand-600" />
            Manage users
          </Link>
          <Link to="/properties/changes-requested" className="rounded-xl bg-surface px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800">
            Properties — changes requested
          </Link>
          <Link to="/advertisements/scheduled" className="rounded-xl bg-surface px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800">
            Scheduled ads
          </Link>
          <Link to="/audit-logs" className="rounded-xl bg-surface px-4 py-3 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-800">
            View audit logs
          </Link>
        </div>
      </section>
    </div>
  );
}
