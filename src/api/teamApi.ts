import { axiosInstance } from "./axios"
import { apiEndpoints } from "@/config/api"
import type { TeamListResponse } from "@/interface/teamInterface"

// Fetch team list
export const fetchTeamList = async (): Promise<TeamListResponse> => {
  const res = await axiosInstance.get<TeamListResponse>(apiEndpoints.team.teamList)
  return res.data
}
