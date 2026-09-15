import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/services/userAPI";
import { LoadingState, ErrorState } from "@/components/common/StateViews";
import { formatDate } from "@/utils/statusUtils";

export default function UserDetails() {
  const { id } = useParams();
  const query = useQuery({ queryKey: ["admin-user", id], queryFn: () => userAPI.getById(id) });

  if (query.isLoading) return <LoadingState label="Loading user..." />;
  if (query.isError || !query.data) return <ErrorState message="User not found." />;

  const user = query.data;

  return (
    <div className="space-y-6">
      <Link to="/users" className="text-sm text-brand-600 hover:underline">
        ← Back to users
      </Link>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-ink">{user.name}</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-900">{user.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Role</dt>
            <dd className="font-medium capitalize text-slate-900">{user.role}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">KYC status</dt>
            <dd className="font-medium capitalize text-slate-900">{user.kyc_status}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Created</dt>
            <dd className="font-medium text-slate-900">{formatDate(user.created_at)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
