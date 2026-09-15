export const AD_STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending",
  CHANGES_REQUESTED: "Changes required",
  APPROVED: "Scheduled",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
};

export const AD_STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_REVIEW: "bg-accent-100 text-accent-900",
  CHANGES_REQUESTED: "bg-accent-50 text-accent-800 ring-1 ring-accent-200",
  APPROVED: "bg-secondary-100 text-secondary-800",
  PUBLISHED: "bg-brand-100 text-brand-800",
  REJECTED: "bg-red-100 text-red-800",
  EXPIRED: "bg-slate-100 text-slate-600",
};

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
