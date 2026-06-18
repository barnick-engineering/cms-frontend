import { apiEndpoints } from '@/config/api'
import type {
  KanbanBoardParams,
  KanbanBoardResponse,
  KanbanMovePayload,
  KanbanTask,
  KanbanTaskEnvelope,
  KanbanTaskFormInterface,
} from '@/interface/kanbanInterface'
import { axiosInstance } from './axios'

function appendKanbanBoardParams(
  params: URLSearchParams,
  filters: KanbanBoardParams
) {
  if (filters.customer_id != null) {
    params.append('customer_id', String(filters.customer_id))
  }
  if (filters.work_order_id != null) {
    params.append('work_order_id', String(filters.work_order_id))
  }
  if (filters.search) params.append('search', filters.search)
  if (filters.overdue) params.append('overdue', 'true')
}

export const kanbanBoard = async (
  filters: KanbanBoardParams = {}
): Promise<KanbanBoardResponse> => {
  const searchParams = new URLSearchParams()
  appendKanbanBoardParams(searchParams, filters)

  const queryString = searchParams.toString()
  const url = queryString
    ? `${apiEndpoints.kanban.board}?${queryString}`
    : apiEndpoints.kanban.board

  const res = await axiosInstance.get<KanbanBoardResponse>(url)
  return res.data
}

export const getKanbanTaskById = async (id: string | number): Promise<KanbanTask> => {
  if (!id) throw new Error('Task ID is required')

  const res = await axiosInstance.get<KanbanTaskEnvelope>(
    `${apiEndpoints.kanban.getTaskById}${id}/`
  )
  return res.data.data
}

export const createKanbanTask = async (
  data: KanbanTaskFormInterface
): Promise<KanbanTask> => {
  const res = await axiosInstance.post<KanbanTaskEnvelope>(
    apiEndpoints.kanban.createTask,
    data
  )
  return res.data.data
}

export const updateKanbanTask = async (
  id: string | number,
  data: Partial<KanbanTaskFormInterface>
): Promise<KanbanTask> => {
  if (!id) throw new Error('Task ID is required')

  const res = await axiosInstance.put<KanbanTaskEnvelope>(
    `${apiEndpoints.kanban.updateTask}${id}/`,
    data
  )
  return res.data.data
}

export const deleteKanbanTask = async (id: string | number) => {
  if (!id) throw new Error('Task ID is required')

  const res = await axiosInstance.delete(
    `${apiEndpoints.kanban.deleteTask}${id}/`
  )
  return res.data
}

export const moveKanbanTask = async (
  id: string | number,
  payload: KanbanMovePayload
): Promise<KanbanTask> => {
  if (!id) throw new Error('Task ID is required')

  const res = await axiosInstance.patch<KanbanTaskEnvelope>(
    `${apiEndpoints.kanban.moveTask}${id}/move/`,
    payload
  )
  return res.data.data
}
