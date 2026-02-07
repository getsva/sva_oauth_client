import { useQuery } from "@tanstack/react-query";
import { api, type DashboardUsageResponse } from "@/lib/api";

const DASHBOARD_USAGE_KEY = "dashboard-usage";

export function useDashboardUsage(range: string = "1 day") {
  const query = useQuery<DashboardUsageResponse>({
    queryKey: [DASHBOARD_USAGE_KEY, range],
    queryFn: () => api.getDashboardUsage(range),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
