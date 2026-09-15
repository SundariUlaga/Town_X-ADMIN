import { Navigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/services/dashboardAPI";
import { LoadingState } from "@/components/common/StateViews";

export function defaultPropertyPath(pendingCount) {
  return pendingCount > 0 ? "/properties/pending" : "/properties/all";
}

export function defaultAdPath(pendingCount) {
  return pendingCount > 0 ? "/advertisements/pending" : "/advertisements/all";
}

export function QueueLanding({ type }) {
  const [searchParams] = useSearchParams();
  const statsQuery = useQuery({
    queryKey: ["admin-stats"],
    queryFn: dashboardAPI.getStats,
    staleTime: 60_000,
  });

  if (statsQuery.isLoading) {
    return <LoadingState label={type === "ads" ? "Loading advertisements..." : "Loading properties..."} />;
  }

  const pending =
    type === "ads"
      ? statsQuery.data?.pending_advertisements || 0
      : statsQuery.data?.pending_properties || 0;

  const base = type === "ads" ? defaultAdPath(pending) : defaultPropertyPath(pending);
  const qs = searchParams.toString();
  return <Navigate to={qs ? `${base}?${qs}` : base} replace />;
}
