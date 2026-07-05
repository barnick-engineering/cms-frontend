import { apiEndpoints } from "@/config/api"
import { axiosInstance } from "./axios"
import type {
  ProjectListResponse,
  ProjectDetailResponse,
  ProjectDetail,
  Project,
  ProjectFormInterface,
  ProjectCreateResponse,
} from "@/interface/projectInterface"

export const projectList = async (): Promise<ProjectListResponse> => {
  const res = await axiosInstance.get<ProjectListResponse>(apiEndpoints.project.projectList)
  return res.data
}

export const getProjectById = async (id: string | number): Promise<ProjectDetail> => {
  if (!id) throw new Error("Project ID is required")
  const res = await axiosInstance.get<ProjectDetailResponse>(
    `${apiEndpoints.project.getProjectById}${id}/`
  )
  return res.data.data
}

export const createProject = async (data: ProjectFormInterface): Promise<Project> => {
  const res = await axiosInstance.post<ProjectCreateResponse>(
    apiEndpoints.project.createProject,
    data
  )
  return res.data.data
}

export const updateProject = async (
  id: string | number,
  data: ProjectFormInterface
): Promise<Project> => {
  if (!id) throw new Error("Project ID is required")
  const res = await axiosInstance.put<ProjectCreateResponse>(
    `${apiEndpoints.project.updateProject}${id}/`,
    data
  )
  return res.data.data
}

export const deleteProject = async (id: string | number): Promise<void> => {
  if (!id) throw new Error("Project ID is required")
  await axiosInstance.delete(`${apiEndpoints.project.deleteProject}${id}/`)
}
