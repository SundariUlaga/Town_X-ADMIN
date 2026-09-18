import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Quote,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Modal } from "@/components/common/Modal";
import { LoadingState, ErrorState, EmptyState } from "@/components/common/StateViews";
import { testimonialAPI } from "@/services/testimonialAPI";
import { getApiErrorMessage } from "@/services/api";
import { cn } from "@/utils/cn";

const OUTCOMES = ["Found a home", "Listed a property", "Used EMI calculator", "Found a rental"];
const CATEGORIES = [
  { value: "buyer", label: "Buyer" },
  { value: "owner", label: "Owner" },
  { value: "renter", label: "Renter" },
];

const EMPTY_FORM = {
  name: "",
  role: "Buyer",
  location: "",
  quote: "",
  rating: 5,
  category: "buyer",
  outcome: "Found a home",
  is_verified: true,
  is_featured: true,
  status: "approved",
  avatar: null,
};

const STATUS_STYLES = {
  pending: "bg-accent-100 text-accent-900",
  approved: "bg-brand-100 text-brand-800",
  rejected: "bg-red-100 text-red-800",
};

function initials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function TestimonialForm({ form, setForm }) {
  return (
    <div className="max-h-[min(70vh,32rem)] space-y-3 overflow-y-auto pr-1">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Name</span>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Role</span>
          <input
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Location</span>
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Quote</span>
        <textarea
          value={form.quote}
          onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          required
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Category</span>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {CATEGORIES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Outcome tag</span>
          <input
            list="testimonial-outcomes"
            value={form.outcome}
            onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <datalist id="testimonial-outcomes">
            {OUTCOMES.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Rating</span>
          <select
            value={form.rating}
            onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.files?.[0] || null }))}
            className="w-full text-sm"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-4 pt-1 text-sm">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_verified}
            onChange={(e) => setForm((f) => ({ ...f, is_verified: e.target.checked }))}
          />
          Verified transaction
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
          />
          Feature on homepage
        </label>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [dragId, setDragId] = useState(null);

  const query = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: () => testimonialAPI.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });

  const saveMutation = useMutation({
    mutationFn: () =>
      editing ? testimonialAPI.update(editing.id, form) : testimonialAPI.create(form),
    onSuccess: () => {
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      setFormError("");
      invalidate();
    },
    onError: (err) => setFormError(getApiErrorMessage(err)),
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, is_featured }) => testimonialAPI.feature(id, is_featured),
    onSuccess: invalidate,
  });
  const approveMutation = useMutation({
    mutationFn: (id) => testimonialAPI.approve(id),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (id) => testimonialAPI.reject(id),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => testimonialAPI.remove(id),
    onSuccess: invalidate,
  });
  const reorderMutation = useMutation({
    mutationFn: (ordered_ids) => testimonialAPI.reorder(ordered_ids),
    onSuccess: invalidate,
  });

  const items = query.data || [];
  const visible = useMemo(() => {
    if (filter === "featured") return items.filter((item) => item.is_featured);
    if (filter === "pending") return items.filter((item) => item.status === "pending");
    if (filter === "hidden") return items.filter((item) => item.status === "rejected");
    return items;
  }, [items, filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      role: item.role || "Buyer",
      location: item.location || "",
      quote: item.quote,
      rating: item.rating || 5,
      category: item.category || "buyer",
      outcome: item.outcome || "",
      is_verified: Boolean(item.is_verified),
      is_featured: Boolean(item.is_featured),
      status: item.status || "approved",
      avatar: null,
    });
    setFormError("");
    setFormOpen(true);
  };

  const move = (index, delta) => {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    reorderMutation.mutate(next.map((item) => item.id));
  };

  const onDrop = (targetId) => {
    if (dragId == null || dragId === targetId) return;
    const next = [...items];
    const from = next.findIndex((item) => item.id === dragId);
    const to = next.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    setDragId(null);
    reorderMutation.mutate(next.map((item) => item.id));
  };

  if (query.isLoading) return <LoadingState label="Loading testimonials..." />;
  if (query.isError) return <ErrorState message="Failed to load testimonials." onRetry={() => query.refetch()} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Testimonials"
        description="Quotes on the homepage. User notes from closed enquiries land in Pending until you approve, then feature them."
      >
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="size-4" />
          Add testimonial
        </button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["featured", "On homepage"],
          ["pending", "Pending"],
          ["hidden", "Hidden"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm",
              filter === value ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-brand-50"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {visible.length === 0 ? (
          <div className="p-10">
            <EmptyState title="No testimonials" description="Add a quote or approve a pending submission." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-full text-sm">
              <thead>
                <tr>
                  <th className="w-16">Order</th>
                  <th>Person</th>
                  <th>Outcome</th>
                  <th>Quote</th>
                  <th>Status</th>
                  <th>Homepage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const index = items.findIndex((row) => row.id === item.id);
                  return (
                    <tr
                      key={item.id}
                      draggable
                      onDragStart={() => setDragId(item.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(item.id)}
                      className={cn(dragId === item.id && "opacity-60")}
                    >
                      <td>
                        <div className="flex items-center gap-1 text-slate-400">
                          <GripVertical className="size-4 cursor-grab" />
                          <button type="button" onClick={() => move(index, -1)} className="rounded p-0.5 hover:bg-slate-100" aria-label="Move up">
                            <ChevronUp className="size-4" />
                          </button>
                          <button type="button" onClick={() => move(index, 1)} className="rounded p-0.5 hover:bg-slate-100" aria-label="Move down">
                            <ChevronDown className="size-4" />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt="" className="size-9 rounded-full object-cover" />
                          ) : (
                            <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
                              {initials(item.name)}
                            </span>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">
                              {item.role}
                              {item.location ? ` · ${item.location}` : ""}
                            </p>
                            {item.source_enquiry_id ? (
                              <p className="mt-0.5 text-[11px] font-medium text-brand-700">From closed enquiry</p>
                            ) : null}
                            <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-amber-600">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              {item.rating || 5}
                              {item.is_verified ? <span className="text-teal-700"> · Verified</span> : null}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {item.outcome ? (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">
                            {item.outcome}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="max-w-xs">
                        <p className="line-clamp-2 text-slate-600">
                          <Quote className="mr-1 inline size-3 text-brand-400" />
                          {item.quote}
                        </p>
                      </td>
                      <td>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold capitalize", STATUS_STYLES[item.status] || STATUS_STYLES.approved)}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => featureMutation.mutate({ id: item.id, is_featured: !item.is_featured })}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            item.is_featured ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          {item.is_featured ? "Featured" : "Off"}
                        </button>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openEdit(item)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                            Edit
                          </button>
                          {item.status !== "approved" ? (
                            <button type="button" onClick={() => approveMutation.mutate(item.id)} className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700">
                              Approve
                            </button>
                          ) : null}
                          {item.status !== "rejected" ? (
                            <button type="button" onClick={() => rejectMutation.mutate(item.id)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                              Hide
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete quote from ${item.name}?`)) deleteMutation.mutate(item.id);
                            }}
                            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? "Edit testimonial" : "Add testimonial"}
        description="Featured + approved quotes appear on the homepage."
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          setFormError("");
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
              }}
              className="rounded-lg px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saveMutation.isPending || !form.name.trim() || !form.quote.trim()}
              onClick={() => saveMutation.mutate()}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        {formError ? <p className="mb-3 text-sm text-red-700">{formError}</p> : null}
        <TestimonialForm form={form} setForm={setForm} />
      </Modal>
    </div>
  );
}
