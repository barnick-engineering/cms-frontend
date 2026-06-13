import { fetchDashboardData, type DashboardParams } from "@/api/dashboardApi"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

export const useDashboardData = (
  params?: DashboardParams,
  options?: { enabled?: boolean }
) => {
    return useQuery({
        queryKey: ["dashboard", params?.start_date, params?.end_date],
        queryFn: () => fetchDashboardData(params),
        enabled: options?.enabled ?? true,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        placeholderData: keepPreviousData,
    })
}