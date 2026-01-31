import { fetchDashboardData, type DashboardParams } from "@/api/dashboardApi"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

export const useDashboardData = (params?: DashboardParams) => {
    return useQuery({
        queryKey: ["dashboard", params?.start_date, params?.end_date],
        queryFn: () => fetchDashboardData(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        placeholderData: keepPreviousData,
    })
}