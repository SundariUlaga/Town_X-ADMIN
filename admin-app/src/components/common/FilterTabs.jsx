import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

export function FilterTabs({ tabs, activePath }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = activePath === tab.to || (tab.match && tab.match(activePath));
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-800"
            )}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 ? (
              <span
                className={cn(
                  "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold",
                  isActive ? "bg-white/20 text-white" : "bg-accent-100 text-accent-800"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
