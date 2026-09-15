import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/services/userAPI";
import { LoadingState, ErrorState, EmptyState } from "@/components/common/StateViews";
import { formatDate } from "@/utils/statusUtils";

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const role = searchParams.get("role") || undefined;
  const kyc_status = searchParams.get("kyc_status") || undefined;
  const page = Number(searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const query = useQuery({
    queryKey: ["admin-users", role, kyc_status, searchParams.get("search"), page],
    queryFn: () =>
      userAPI.list({
        skip,
        limit,
        role,
        kyc_status,
        search: searchParams.get("search") || undefined,
      }),
  });

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  };

  if (query.isLoading) return <LoadingState label="Loading users..." />;
  if (query.isError) return <ErrorState message="Failed to load users." onRetry={() => query.refetch()} />;

  const items = query.data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Users</h2>
        <p className="text-sm text-ink-muted">Browse registered buyers, owners, and admins</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["", "All"],
          ["buyer", "Buyer"],
          ["owner", "Owner"],
          ["admin", "Admin"],
        ].map(([value, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => setFilter("role", value)}
            className={`rounded-full px-3 py-1.5 text-sm ${role === value || (!role && !value) ? "bg-brand-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-brand-50"}`}
          >
            {label}
          </button>
        ))}
        {[
          ["verified", "KYC verified"],
          ["pending", "KYC pending"],
        ].map(([value, label]) => (
          <button
            key={label}
            type="button"
            onClick={() => setFilter("kyc_status", kyc_status === value ? "" : value)}
            className={`rounded-full px-3 py-1.5 text-sm ${kyc_status === value ? "bg-secondary-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-secondary-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFilter("search", searchInput.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, email, phone..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white">
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState title="No users found" />
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">KYC</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-900">{user.name}</td>
                  <td className="px-5 py-3 text-slate-600">{user.phone || "—"}</td>
                  <td className="px-5 py-3 capitalize text-slate-600">{user.role}</td>
                  <td className="px-5 py-3 capitalize text-slate-600">{user.kyc_status}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-3">
                    <Link to={`/users/${user.id}`} className="font-medium text-brand-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
