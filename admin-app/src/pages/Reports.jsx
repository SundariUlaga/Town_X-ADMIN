import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { reportAPI } from "@/services/reportAPI";
import { dashboardAPI } from "@/services/dashboardAPI";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { LoadingState, ErrorState, EmptyState } from "@/components/common/StateViews";
import { formatDate } from "@/utils/statusUtils";
import { getApiErrorMessage } from "@/services/api";

export default function Reports() {
  const queryClient = useQueryClient();
  const [action, setAction] = useState(null);
  const [notes, setNotes] = useState("");
  const [actionError, setActionError] = useState("");

  const statsQuery = useQuery({ queryKey: ["admin-stats"], queryFn: dashboardAPI.getStats, staleTime: 60_000 });

  const query = useQuery({
    queryKey: ["admin-reports", "OPEN"],
    queryFn: () => reportAPI.list({ status: "OPEN" }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => reportAPI.resolve(id, notes || undefined),
    onSuccess: () => {
      setAction(null);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => reportAPI.dismiss(id, notes || undefined),
    onSuccess: () => {
      setAction(null);
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  if (query.isLoading) return <LoadingState label="Loading reports..." />;
  if (query.isError) return <ErrorState message="Failed to load reports." onRetry={() => query.refetch()} />;

  const items = query.data || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Property reports"
        description={`${statsQuery.data?.open_reports ?? items.length} open report${items.length === 1 ? "" : "s"} from users.`}
      />

      {actionError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="p-10">
            <EmptyState title="All clear" description="No open reports — trust queue is empty." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full text-sm">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Reason</th>
                  <th>Details</th>
                  <th>Reported</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <Link
                        to={`/properties/${report.property_id}`}
                        className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline"
                      >
                        #{report.property_id}
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </td>
                    <td className="font-medium text-slate-800">{report.reason}</td>
                    <td className="max-w-xs truncate text-slate-600">{report.description || "—"}</td>
                    <td className="text-slate-500">{formatDate(report.created_at)}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setAction({ type: "resolve", id: report.id })}
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() => setAction({ type: "dismiss", id: report.id })}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(action)}
        title={action?.type === "resolve" ? "Resolve report" : "Dismiss report"}
        description="Optional notes are stored for audit purposes."
        onClose={() => {
          setAction(null);
          setNotes("");
          setActionError("");
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setAction(null);
                setNotes("");
              }}
              className="rounded-lg px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={resolveMutation.isPending || dismissMutation.isPending}
              onClick={() => {
                if (!action) return;
                if (action.type === "resolve") resolveMutation.mutate(action.id);
                else dismissMutation.mutate(action.id);
              }}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Confirm
            </button>
          </>
        }
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Optional admin notes"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
      </Modal>
    </div>
  );
}
