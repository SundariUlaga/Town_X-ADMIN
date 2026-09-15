import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

export function PriorityCard({ to, label, description, count, icon: Icon, tone = "accent" }) {
  const tones = {
    accent: "border-accent-200 bg-accent-50/80 hover:bg-accent-50",
    secondary: "border-secondary-200 bg-secondary-50/80 hover:bg-secondary-50",
    primary: "border-brand-200 bg-brand-50/80 hover:bg-brand-50",
    rose: "border-rose-200 bg-rose-50/80 hover:bg-rose-50",
  };
  const iconTones = {
    accent: "bg-accent-100 text-accent-800",
    secondary: "bg-secondary-100 text-secondary-700",
    primary: "bg-brand-100 text-brand-700",
    rose: "bg-rose-100 text-rose-700",
  };

  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md",
        tones[tone]
      )}
    >
      <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", iconTones[tone])}>
        <Icon className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <p className="mt-1 text-3xl font-bold text-ink">{count ?? 0}</p>
        {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
      </div>
      <ArrowRight className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </Link>
  );
}
