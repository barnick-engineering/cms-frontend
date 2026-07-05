import {
  createProject,
  deleteProject,
  getProjectById,
  projectList,
  updateProject,
} from "@/api/projectApi"
import type {
  ProjectFormInterface,
  ProjectListResponse,
  ProjectDetail,
} from "@/interface/projectInterface"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query"

const PROJECT_KEYS = {
  all: ["projects"] as const,
  detail: (id: string | number) => [...PROJECT_KEYS.all, id] as const,
}

export const useProjectList = (
  options?: { enabled?: boolean }
): UseQueryResult<ProjectListResponse, Error> =>
  useQuery({
    queryKey: PROJECT_KEYS.all,
    queryFn: () => projectList(),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  })

export const useProjectById = (
  id: string | number,
  options?: Partial<UseQueryOptions<ProjectDetail, Error>>
): UseQueryResult<ProjectDetail, Error> =>
  useQuery<ProjectDetail>({
    queryKey: PROJECT_KEYS.detail(id),
    queryFn: () => getProjectById(id),
    enabled: !!id && (options?.enabled ?? true),
    ...options,
  })

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectFormInterface) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all })
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: ProjectFormInterface }) =>
      updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.id) })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string | number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all })
    },
  })
}
