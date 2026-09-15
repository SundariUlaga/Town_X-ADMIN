import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditLogAPI } from "@/services/auditLogAPI";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState, ErrorState, EmptyState } from "@/components/common/StateViews";
import { formatDate } from "@/utils/statusUtils";

function DiffBlock({ label, value }) {
  const [open, setOpen] = useState(false);
  if (!value || Object.keys(value).length === 0) return null;
  return (
    <div className="mt-2">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-brand-600 hover:underline">
        {open ? "Hide" : "Show"} {label}
      </button>
      {open ? (
        <pre className="mt-1 max-h-40 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-100">
          {JSON.stringify(value, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

export default function AuditLogs() {
  const [entityType, setEntityType] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const query = useQuery({
    queryKey: ["admin-audit-logs", entityType, actionFilter],
    queryFn: () =>
      auditLogAPI.list({
        limit: 50,
        entity_type: entityType || undefined,
        action: actionFilter || undefined,
      }),
  });

  if (query.isLoading) return <LoadingState label="Loading audit logs..." />;
  if (query.isError) return <ErrorState message="Failed to load audit logs." onRetry={() => query.refetch()} />;

  const items = query.data?.items || [];

  return (
    <div className="space-y-5">
      <PageHeader title="Audit logs" description="Read-only history of admin actions with expandable change details." />

      <div className="flex flex-wrap gap-3">
        <input
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          placeholder="Filter entity type (e.g. property)"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <input
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter action"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => query.refetch()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
        >
          Apply
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No audit entries" description="Try adjusting your filters." />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((entry) => (
              <div key={entry.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{entry.action}</p>
                    <p className="text-sm text-slate-600">
                      {entry.entity_type} #{entry.entity_id} · {entry.admin_name || `Admin #${entry.admin_user_id}`}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">{formatDate(entry.created_at)}</span>
                </div>
                <DiffBlock label="previous value" value={entry.old_value} />
                <DiffBlock label="new value" value={entry.new_value} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
