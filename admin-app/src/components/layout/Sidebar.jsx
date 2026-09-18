import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldAlert,
  Users,
  Quote,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { TownXLogo } from "@/components/brand/TownXLogo";
import { dashboardAPI } from "@/services/dashboardAPI";
import { AD_TABS, PROPERTY_TABS } from "@/utils/navConfig";
import { defaultAdPath, defaultPropertyPath } from "@/components/common/QueueLanding";

function CountBadge({ count, urgent }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "ml-auto min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold",
        urgent ? "bg-secondary-500 text-white" : "bg-slate-200 text-slate-700"
      )}
    >
      {count}
    </span>
  );
}

function NavLink({ to, label, icon: Icon, count, onClose, urgent }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(`${to}/`));

  return (
    <Link
      to={to}
      onClick={onClose}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-brand-50 hover:text-brand-800"
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0 opacity-90" /> : null}
      <span className="truncate">{label}</span>
      <CountBadge count={count} urgent={urgent && !active} />
    </Link>
  );
}

function NavGroup({ label, icon: Icon, children, defaultOpen }) {
  const { pathname } = useLocation();
  const sectionRoot = children[0]?.to.match(/^\/[^/]+/)?.[0];
  const isChildActive = sectionRoot
    ? pathname === sectionRoot || pathname.startsWith(`${sectionRoot}/`)
    : children.some((c) => pathname === c.to || pathname.startsWith(`${c.to}/`));
  const [open, setOpen] = useState(defaultOpen || isChildActive);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600"
      >
        <Icon className="size-4" />
        <span className="flex-1">{label}</span>
        <ChevronDown className={cn("size-4 transition-transform", open ? "rotate-180" : "")} />
      </button>
      {open ? (
        <div className="mt-1 space-y-0.5 pl-2">
          {children.map((child) => (
            <SubLink key={child.to} {...child} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SubLink({ to, label, count }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 rounded-lg py-2 pl-7 pr-3 text-sm font-medium transition-colors",
        active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-brand-50/70"
      )}
    >
      <span className="truncate">{label}</span>
      {count > 0 ? (
        <span className="ml-auto rounded-full bg-accent-100 px-2 py-0.5 text-[10px] font-semibold text-accent-800">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar({ open, onClose }) {
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: dashboardAPI.getStats,
    staleTime: 60_000,
  });
  const stats = statsQuery.data || {};

  const propertyChildren = useMemo(
    () =>
      PROPERTY_TABS.map((tab) => ({
        ...tab,
        count:
          tab.status === "PENDING_REVIEW"
            ? stats.pending_properties
            : tab.status === "CHANGES_REQUESTED"
              ? undefined
              : undefined,
      })),
    [stats.pending_properties]
  );

  const adChildren = useMemo(
    () =>
      AD_TABS.map((tab) => ({
        ...tab,
        count: tab.status === "PENDING_REVIEW" ? stats.pending_advertisements : undefined,
      })),
    [stats.pending_advertisements]
  );

  const totalAttention =
    (stats.pending_properties || 0) +
    (stats.pending_advertisements || 0) +
    (stats.open_reports || 0) +
    (stats.pending_testimonials || 0);

  return (
    <>
      {open ? (
        <button type="button" className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={onClose} aria-label="Close sidebar" />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center gap-3">
            <TownXLogo size={40} variant="full" className="rounded-lg" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-600">TOWN-X</p>
              <h1 className="font-display text-lg font-semibold leading-tight text-ink">Admin Console</h1>
            </div>
          </div>
          {totalAttention > 0 ? (
            <p className="mt-3 rounded-lg bg-accent-50 px-3 py-2 text-xs font-medium text-accent-800 ring-1 ring-accent-200">
              {totalAttention} item{totalAttention === 1 ? "" : "s"} need your attention
            </p>
          ) : (
            <p className="mt-3 text-xs text-slate-500">All queues clear</p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Overview</p>
          <NavLink to="/dashboard" label="Dashboard" icon={LayoutDashboard} onClose={onClose} />

          <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Work queue</p>
          <div className="space-y-1">
            <NavLink
              to={defaultPropertyPath(stats.pending_properties)}
              label="Review properties"
              icon={Building2}
              count={stats.pending_properties}
              urgent
              onClose={onClose}
            />
            <NavLink
              to={defaultAdPath(stats.pending_advertisements)}
              label="Review ads"
              icon={Megaphone}
              count={stats.pending_advertisements}
              urgent
              onClose={onClose}
            />
            <NavLink
              to="/reports"
              label="Open reports"
              icon={ShieldAlert}
              count={stats.open_reports}
              urgent
              onClose={onClose}
            />
          </div>

          <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Manage</p>
          <NavGroup label="Advertisements" icon={Megaphone} children={adChildren} />
          <NavGroup label="Properties" icon={Building2} children={propertyChildren} />
          <div className="space-y-1">
            <NavLink to="/users" label="Users" icon={Users} onClose={onClose} />
            <NavLink
              to="/testimonials"
              label="Testimonials"
              icon={Quote}
              count={stats.pending_testimonials}
              urgent
              onClose={onClose}
            />
            <NavLink to="/audit-logs" label="Audit logs" icon={ClipboardList} onClose={onClose} />
            <NavLink to="/settings" label="Settings" icon={Settings} onClose={onClose} />
          </div>
        </nav>
      </aside>
    </>
  );
}
