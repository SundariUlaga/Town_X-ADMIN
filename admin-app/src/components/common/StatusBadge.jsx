import { cn } from "@/utils/cn";
import { AD_STATUS_LABELS, AD_STATUS_STYLES } from "@/utils/statusUtils";

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        AD_STATUS_STYLES[status] || "bg-slate-100 text-slate-700",
        className
      )}
    >
      {AD_STATUS_LABELS[status] || status}
    </span>
  );
}
