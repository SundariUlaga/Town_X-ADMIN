import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { BREADCRUMB_LABELS } from "@/utils/navConfig";

export function AdminBreadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 0) return null;

  const crumbs = parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    const isNumeric = /^\d+$/.test(part);
    const label = isNumeric ? `#${part}` : BREADCRUMB_LABELS[part] || part.replace(/-/g, " ");
    return { href, label, isLast: index === parts.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-ink-muted">
      <Link to="/dashboard" className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-brand-50 hover:text-brand-700">
        <Home className="size-3.5" />
        <span className="sr-only sm:not-sr-only">Home</span>
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="inline-flex items-center gap-1">
          <ChevronRight className="size-3.5 text-slate-300" />
          {crumb.isLast ? (
            <span className="font-medium capitalize text-ink">{crumb.label}</span>
          ) : (
            <Link to={crumb.href} className="capitalize hover:text-brand-600">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
