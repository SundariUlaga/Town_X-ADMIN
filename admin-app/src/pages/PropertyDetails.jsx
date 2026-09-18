import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { propertyAPI } from "@/services/propertyAPI";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { LoadingState, ErrorState } from "@/components/common/StateViews";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/utils/statusUtils";
import { getApiErrorMessage } from "@/services/api";
import { MarkdownContent } from "@/components/common/MarkdownContent";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [changesOpen, setChangesOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [changeNotes, setChangeNotes] = useState("");
  const [actionError, setActionError] = useState("");
  const [verificationTier, setVerificationTier] = useState("unverified");
  const [surveyParcel, setSurveyParcel] = useState("");
  const [encumbranceStatus, setEncumbranceStatus] = useState("");

  const [verifySaved, setVerifySaved] = useState(false);

  const query = useQuery({
    queryKey: ["admin-property", id],
    queryFn: () => propertyAPI.getById(id),
  });

  useEffect(() => {
    if (!query.data) return;
    setVerificationTier(query.data.verification_tier || "unverified");
    setSurveyParcel(query.data.survey_parcel_number || "");
    setEncumbranceStatus(query.data.encumbrance_certificate_status || "");
  }, [query.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-property", id] });
    queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const rejectMutation = useMutation({
    mutationFn: () => propertyAPI.reject(id, rejectReason),
    onSuccess: () => {
      setRejectOpen(false);
      invalidate();
      navigate("/properties");
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const changesMutation = useMutation({
    mutationFn: () => propertyAPI.requestChanges(id, changeNotes),
    onSuccess: () => {
      setChangesOpen(false);
      invalidate();
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const approveMutation = useMutation({
    mutationFn: () => propertyAPI.approve(id),
    onSuccess: () => invalidate(),
    onError: (err) => setActionError(getApiErrorMessage(err)),
  });

  const verificationMutation = useMutation({
    mutationFn: () =>
      propertyAPI.updateVerification(id, {
        verification_tier: verificationTier,
        survey_parcel_number: surveyParcel || null,
        encumbrance_certificate_status: encumbranceStatus || null,
      }),
    onSuccess: () => {
      setActionError("");
      setVerifySaved(true);
      invalidate();
    },
    onError: (err) => {
      setVerifySaved(false);
      setActionError(getApiErrorMessage(err));
    },
  });

  if (query.isLoading) return <LoadingState label="Loading property..." />;
  if (query.isError || !query.data) return <ErrorState message="Property not found." />;

  const property = query.data;
  const canReview = ["PENDING_REVIEW", "CHANGES_REQUESTED"].includes(property.status);
  const reviewNotes = property.review_notes || [];
  const images = property.images || [];

  return (
    <div className={canReview ? "pb-24" : ""}>
      <Link
        to="/properties"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to queue
      </Link>

      <PageHeader
        title={`${property.bhk_type} · ${property.property_type}`}
        description={`${property.locality}, ${property.city} · ₹${property.expected_price.toLocaleString("en-IN")}`}
      >
        <StatusBadge status={property.status} />
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            property.verification_tier === "verified"
              ? "bg-emerald-100 text-emerald-800"
              : property.verification_tier === "pending"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {property.verification_tier === "verified"
            ? "Docs verified"
            : property.verification_tier === "pending"
              ? "Docs pending"
              : "Docs not verified"}
        </span>
      </PageHeader>

      {actionError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      ) : null}

      {canReview ? (
        <div className="mt-4 rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-900">
          This listing needs a decision — approve to publish, request changes to send back to the owner, or reject.
        </div>
      ) : property.status === "PUBLISHED" ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircle2 className="size-4" />
          Live on the marketplace since {formatDate(property.published_at || property.updated_at)}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {images.length > 0 ? (
            <div className="grid gap-1 sm:grid-cols-2">
              {images.slice(0, 4).map((img, index) => (
                <img
                  key={img.public_id || index}
                  src={img.url}
                  alt=""
                  className={`h-44 w-full object-cover ${index === 0 && images.length > 1 ? "sm:col-span-2 sm:h-56" : ""}`}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center bg-slate-100 text-slate-400">No images</div>
          )}
          <div className="space-y-4 p-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Description</h3>
              <div className="mt-2">
                <MarkdownContent content={property.description} />
              </div>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-slate-500">Listing type</dt>
                <dd className="font-medium text-slate-900">{property.property_for}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-slate-500">Furnishing</dt>
                <dd className="font-medium text-slate-900">{property.furnishing_status}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <dt className="text-slate-500">Address</dt>
                <dd className="font-medium text-slate-900">{property.address}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-slate-500">Owner ID</dt>
                <dd className="font-medium text-slate-900">{property.owner_id || "—"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <dt className="text-slate-500">Submitted</dt>
                <dd className="font-medium text-slate-900">{formatDate(property.created_at)}</dd>
              </div>
            </dl>
          </div>
        </section>

        <aside className="space-y-4">
          {property.admin_notes ? (
            <div className="rounded-2xl border border-accent-200 bg-accent-50 p-5">
              <h3 className="font-semibold text-accent-900">Latest feedback to owner</h3>
              <p className="mt-2 text-sm text-accent-800">{property.admin_notes}</p>
            </div>
          ) : null}

          {reviewNotes.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Review history</h3>
              <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto">
                {reviewNotes.map((note) => (
                  <li key={note.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium capitalize text-slate-800">{note.note_type.replace("_", " ")}</span>
                      <span className="text-xs text-slate-500">{formatDate(note.created_at)}</span>
                    </div>
                    {note.admin_name ? <p className="mt-1 text-xs text-slate-500">By {note.admin_name}</p> : null}
                    <p className="mt-2 text-slate-700">{note.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">Document verification</h3>
            <p className="mt-1 text-xs text-slate-500">
              Independent of publish status. You can mark documents verified after the listing is live.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Verification tier</label>
                <select
                  value={verificationTier}
                  onChange={(e) => setVerificationTier(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="unverified">Unverified</option>
                  <option value="pending">Pending review</option>
                  <option value="verified">Verified</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Survey / parcel number</label>
                <input
                  type="text"
                  value={surveyParcel}
                  onChange={(e) => setSurveyParcel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Encumbrance certificate</label>
                <input
                  type="text"
                  value={encumbranceStatus}
                  onChange={(e) => setEncumbranceStatus(e.target.value)}
                  placeholder="e.g. clear, pending, not provided"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
              <button
                type="button"
                disabled={verificationMutation.isPending}
                onClick={() => {
                  setVerifySaved(false);
                  verificationMutation.mutate();
                }}
                className="w-full rounded-xl bg-secondary-600 py-2.5 text-sm font-medium text-white hover:bg-secondary-700 disabled:opacity-60"
              >
                {verificationMutation.isPending ? "Saving..." : "Save verification"}
              </button>
              {verifySaved ? (
                <p className="text-center text-xs font-medium text-emerald-700">
                  Saved. This listing will show as {verificationTier === "verified" ? "verified" : verificationTier === "pending" ? "pending review" : "not verified"} on Town-X.
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {canReview ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:pl-72">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => setChangesOpen(true)}
              className="rounded-xl border border-accent-300 px-4 py-2.5 text-sm font-medium text-accent-800 hover:bg-accent-50"
            >
              Request changes
            </button>
            <button
              type="button"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {approveMutation.isPending ? "Publishing..." : "Approve & publish"}
            </button>
          </div>
        </div>
      ) : null}

      <Modal
        open={rejectOpen}
        title="Reject property"
        description="The owner will be notified with your reason."
        onClose={() => setRejectOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setRejectOpen(false)} className="rounded-lg px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={rejectReason.trim().length < 3 || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Reject listing
            </button>
          </>
        }
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="Reason for rejection (min 3 characters)"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </Modal>

      <Modal
        open={changesOpen}
        title="Request changes"
        description="Explain what the owner should update before resubmitting."
        onClose={() => setChangesOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setChangesOpen(false)} className="rounded-lg px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={changeNotes.trim().length < 3 || changesMutation.isPending}
              onClick={() => changesMutation.mutate()}
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-ink disabled:opacity-60"
            >
              Send to owner
            </button>
          </>
        }
      >
        <textarea
          value={changeNotes}
          onChange={(e) => setChangeNotes(e.target.value)}
          rows={5}
          placeholder="What should the owner fix or add?"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </Modal>
    </div>
  );
}
