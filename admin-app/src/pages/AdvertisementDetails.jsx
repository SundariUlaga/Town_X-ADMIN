import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { advertisementAPI } from "@/services/advertisementAPI";
import { LoadingState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/statusUtils";
import { getApiErrorMessage } from "@/services/api";
import { MarkdownContent } from "@/components/common/MarkdownContent";

function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultApproveForm(ad) {
  const start = new Date();
  const end = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    display_position: ad?.display_position || 1,
    show_on_homepage: ad?.show_on_homepage !== false,
    start_date: toDatetimeLocalValue(start),
    end_date: toDatetimeLocalValue(end),
  };
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdvertisementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [changeNotes, setChangeNotes] = useState("");
  const [approveForm, setApproveForm] = useState(() => defaultApproveForm());
  const [actionError, setActionError] = useState("");

  const query = useQuery({
    queryKey: ["admin-ad", id],
    queryFn: () => advertisementAPI.getById(id),
    enabled: Boolean(id),
    retry: 1,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-ad", id] });
    queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const openApproveModal = () => {
    setActionError("");
    setApproveForm(defaultApproveForm(query.data));
    setApproveOpen(true);
  };

  const rejectMutation = useMutation({
    mutationFn: () => advertisementAPI.reject(id, rejectReason),
    onSuccess: () => {
      setRejectOpen(false);
      invalidate();
      navigate("/advertisements");
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const changesMutation = useMutation({
    mutationFn: () => advertisementAPI.requestChanges(id, changeNotes),
    onSuccess: () => {
      setChangesOpen(false);
      invalidate();
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: () => {
      const start = new Date(approveForm.start_date);
      const end = new Date(approveForm.end_date);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new Error("Enter valid start and end dates.");
      }
      if (end <= start) {
        throw new Error("End date must be after start date.");
      }
      return advertisementAPI.approve(id, {
        display_position: Number(approveForm.display_position) || 1,
        show_on_homepage: approveForm.show_on_homepage,
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      });
    },
    onSuccess: () => {
      setApproveOpen(false);
      setActionError("");
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      navigate("/advertisements");
    },
    onError: (err) => setActionError(getApiErrorMessage(err, "Could not approve advertisement")),
  });

  if (query.isPending) return <LoadingState label="Loading advertisement..." />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        message={getApiErrorMessage(query.error, "Advertisement not found.")}
        onRetry={() => query.refetch()}
      />
    );
  }

  const ad = query.data;
  const canReview = ["PENDING_REVIEW", "CHANGES_REQUESTED"].includes(ad.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/advertisements" className="text-sm text-brand-600 hover:underline">
            ← Back to list
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-ink">{ad.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={ad.status} />
            <span className="text-sm text-slate-500">Submitted {formatDate(ad.created_at)}</span>
          </div>
        </div>
        {canReview ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRejectOpen(true)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
              Reject
            </button>
            <button type="button" onClick={() => setChangesOpen(true)} className="rounded-lg border border-accent-300 px-4 py-2 text-sm font-medium text-accent-800 hover:bg-accent-50">
              Request changes
            </button>
            <button type="button" onClick={openApproveModal} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Approve
            </button>
          </div>
        ) : null}
      </div>

      {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {ad.banner_url ? (
            <img src={ad.banner_url} alt={ad.title} className="h-56 w-full object-cover" />
          ) : (
            <div className="flex h-56 items-center justify-center bg-slate-100 text-slate-400">No banner</div>
          )}
          <div className="space-y-3 p-5">
            <MarkdownContent content={ad.description} />
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <p>
                <span className="text-slate-500">Location:</span> {ad.location}
              </p>
              <p>
                <span className="text-slate-500">Price:</span> {ad.price_text || "—"}
              </p>
              <p>
                <span className="text-slate-500">Submitted by:</span> {ad.submitter_name || "—"}
              </p>
              <p>
                <span className="text-slate-500">Property ID:</span> {ad.property_id ? `#${ad.property_id}` : "—"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">Schedule</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Start:</span> {formatDate(ad.start_date)}
              </p>
              <p>
                <span className="text-slate-500">End:</span> {formatDate(ad.end_date)}
              </p>
              <p>
                <span className="text-slate-500">Slider position:</span> {ad.display_position}
              </p>
              <p>
                <span className="text-slate-500">Homepage:</span> {ad.show_on_homepage ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {ad.admin_notes ? (
            <div className="rounded-xl border border-accent-200 bg-accent-50 p-5">
              <h3 className="font-semibold text-accent-900">Admin notes</h3>
              <p className="mt-2 text-sm text-accent-800">{ad.admin_notes}</p>
            </div>
          ) : null}

          {ad.property_id ? (
            <Link
              to={`/properties/${ad.property_id}`}
              className="block rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-brand-600 shadow-sm hover:bg-brand-50"
            >
              View linked property →
            </Link>
          ) : null}
        </section>
      </div>

      <Modal open={rejectOpen} title="Reject advertisement" onClose={() => setRejectOpen(false)}>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="Reason for rejection"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setRejectOpen(false)} className="rounded-lg px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={rejectReason.trim().length < 3 || rejectMutation.isPending}
            onClick={() => rejectMutation.mutate()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Reject advertisement
          </button>
        </div>
      </Modal>

      <Modal open={changesOpen} title="Request changes" onClose={() => setChangesOpen(false)}>
        <textarea
          value={changeNotes}
          onChange={(e) => setChangeNotes(e.target.value)}
          rows={5}
          placeholder="Explain what the user should update"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setChangesOpen(false)} className="rounded-lg px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={changeNotes.trim().length < 3 || changesMutation.isPending}
            onClick={() => changesMutation.mutate()}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-ink"
          >
            Send to user
          </button>
        </div>
      </Modal>

      <Modal open={approveOpen} title="Approve advertisement" onClose={() => setApproveOpen(false)}>
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Set the live window. Prefills start now and end in 30 days.</p>
          <div>
            <label className="text-sm font-medium text-slate-700">Start date & time</label>
            <input
              type="datetime-local"
              value={approveForm.start_date}
              onChange={(e) => setApproveForm((prev) => ({ ...prev, start_date: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">End date & time</label>
            <input
              type="datetime-local"
              value={approveForm.end_date}
              onChange={(e) => setApproveForm((prev) => ({ ...prev, end_date: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Homepage slider position</label>
            <input
              type="number"
              min={1}
              max={50}
              value={approveForm.display_position}
              onChange={(e) => setApproveForm((prev) => ({ ...prev, display_position: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={approveForm.show_on_homepage}
              onChange={(e) => setApproveForm((prev) => ({ ...prev, show_on_homepage: e.target.checked }))}
            />
            Display on homepage
          </label>
          {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => setApproveOpen(false)} className="rounded-lg px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={!approveForm.start_date || !approveForm.end_date || approveMutation.isPending}
            onClick={() => {
              setActionError("");
              approveMutation.mutate();
            }}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {approveMutation.isPending ? "Scheduling…" : "Approve & schedule"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
