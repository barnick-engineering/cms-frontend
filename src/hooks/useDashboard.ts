import { fetchDashboardData } from "@/api/dashboardApi"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

export const useDashboardData = () => {
    return useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboardData,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        placeholderData: keepPreviousData,
    })
}