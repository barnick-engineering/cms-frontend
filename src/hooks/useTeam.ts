import { useQuery } from "@tanstack/react-query"
import { fetchTeamList } from "@/api/teamApi"
import type { TeamMember } from "@/interface/teamInterface"

// Fetch team list
export const useTeamList = () => {
  return useQuery<TeamMember[]>({
    queryKey: ["teamList"],
    queryFn: async () => {
      const response = await fetchTeamList()
      return response.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
